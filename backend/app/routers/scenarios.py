import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.cell_value import CellValue
from app.models.financial_model import FinancialModel
from app.models.scenario import Scenario
from app.models.user import User
from app.models.workspace import WorkspaceMember
from app.schemas.scenario import ScenarioCreate, ScenarioResponse, ScenarioUpdate

router = APIRouter(tags=["scenarios"])


async def _verify_model_access(db: AsyncSession, model_id: uuid.UUID, user: User) -> FinancialModel:
    result = await db.execute(
        select(WorkspaceMember.workspace_id).where(WorkspaceMember.user_id == user.id).limit(1)
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
    return model


@router.get("/api/models/{model_id}/scenarios", response_model=list[ScenarioResponse])
async def list_scenarios(
    model_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _verify_model_access(db, model_id, current_user)
    result = await db.execute(
        select(Scenario).where(Scenario.model_id == model_id).order_by(Scenario.created_at)
    )
    return result.scalars().all()


@router.post("/api/models/{model_id}/scenarios", response_model=ScenarioResponse, status_code=status.HTTP_201_CREATED)
async def create_scenario(
    model_id: uuid.UUID,
    data: ScenarioCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _verify_model_access(db, model_id, current_user)
    scenario = Scenario(model_id=model_id, name=data.name, color=data.color)
    db.add(scenario)
    await db.commit()
    await db.refresh(scenario)
    return scenario


@router.put("/api/scenarios/{scenario_id}", response_model=ScenarioResponse)
async def update_scenario(
    scenario_id: uuid.UUID,
    data: ScenarioUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Scenario).where(Scenario.id == scenario_id))
    scenario = result.scalar_one_or_none()
    if not scenario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scenario not found")
    await _verify_model_access(db, scenario.model_id, current_user)

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(scenario, key, value)
    await db.commit()
    await db.refresh(scenario)
    return scenario


@router.delete("/api/scenarios/{scenario_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scenario(
    scenario_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Scenario).where(Scenario.id == scenario_id))
    scenario = result.scalar_one_or_none()
    if not scenario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scenario not found")
    if scenario.is_base:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete base scenario")
    await _verify_model_access(db, scenario.model_id, current_user)
    await db.delete(scenario)
    await db.commit()


@router.post("/api/scenarios/{scenario_id}/clone", response_model=ScenarioResponse)
async def clone_scenario(
    scenario_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Scenario).where(Scenario.id == scenario_id))
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scenario not found")
    await _verify_model_access(db, source.model_id, current_user)

    new_scenario = Scenario(
        model_id=source.model_id,
        name=f"{source.name} (Copy)",
        is_base=False,
        color=source.color,
    )
    db.add(new_scenario)
    await db.flush()

    # Copy all cell values
    result = await db.execute(select(CellValue).where(CellValue.scenario_id == scenario_id))
    for cell in result.scalars().all():
        new_cell = CellValue(
            variable_id=cell.variable_id,
            scenario_id=new_scenario.id,
            period_index=cell.period_index,
            value=cell.value,
            is_override=cell.is_override,
        )
        db.add(new_cell)

    await db.commit()
    await db.refresh(new_scenario)
    return new_scenario
