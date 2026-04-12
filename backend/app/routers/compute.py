import uuid
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.cell_value import CellValue
from app.models.financial_model import FinancialModel
from app.models.scenario import Scenario
from app.models.user import User
from app.models.variable import Variable
from app.models.workspace import WorkspaceMember
from app.services.formula_engine import VariableInfo, compute_model

router = APIRouter(prefix="/api/models", tags=["compute"])


@router.get("/{model_id}/compute")
async def compute(
    model_id: uuid.UUID,
    scenario_id: uuid.UUID | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify access
    result = await db.execute(
        select(WorkspaceMember.workspace_id).where(WorkspaceMember.user_id == current_user.id).limit(1)
    )
    workspace_id = result.scalar_one_or_none()
    if not workspace_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    result = await db.execute(
        select(FinancialModel).where(
            FinancialModel.id == model_id,
            FinancialModel.workspace_id == workspace_id,
        )
    )
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model not found")

    # Get scenario (default to base)
    if scenario_id:
        result = await db.execute(
            select(Scenario).where(Scenario.id == scenario_id, Scenario.model_id == model_id)
        )
        scenario = result.scalar_one_or_none()
        if not scenario:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scenario not found")
    else:
        result = await db.execute(
            select(Scenario).where(Scenario.model_id == model_id, Scenario.is_base == True)
        )
        scenario = result.scalar_one_or_none()
        if not scenario:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No base scenario found")
        scenario_id = scenario.id

    # Load variables
    result = await db.execute(
        select(Variable).where(Variable.model_id == model_id).order_by(Variable.sort_order)
    )
    db_variables = result.scalars().all()

    variable_infos = [
        VariableInfo(
            id=str(v.id),
            slug=v.slug,
            variable_type=v.variable_type,
            formula=v.formula,
            default_value=float(v.default_value) if v.default_value is not None else None,
        )
        for v in db_variables
    ]

    # Load cell overrides for this scenario
    result = await db.execute(
        select(CellValue).where(
            CellValue.scenario_id == scenario_id,
            CellValue.variable_id.in_([v.id for v in db_variables]),
        )
    )
    cell_values = result.scalars().all()

    cell_overrides: dict[str, dict[int, float]] = {}
    for cv in cell_values:
        var_id = str(cv.variable_id)
        if var_id not in cell_overrides:
            cell_overrides[var_id] = {}
        val = float(cv.value) if cv.value is not None else 0.0
        cell_overrides[var_id][cv.period_index] = val

    # Compute
    computed = compute_model(variable_infos, cell_overrides, model.period_count)

    return {
        "scenario_id": str(scenario_id),
        "period_count": model.period_count,
        "start_date": model.start_date.isoformat(),
        "values": computed,
    }
