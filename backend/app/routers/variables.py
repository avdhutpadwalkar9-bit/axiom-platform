import re
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.cell_value import CellValue
from app.models.financial_model import FinancialModel
from app.models.section import Section
from app.models.user import User
from app.models.variable import Variable
from app.models.workspace import WorkspaceMember
from app.schemas.model import SectionCreate, SectionResponse, SectionUpdate
from app.schemas.variable import (
    BulkCellUpdate,
    CellValueResponse,
    CellValueUpdate,
    VariableCreate,
    VariableResponse,
    VariableUpdate,
)

router = APIRouter(tags=["variables"])


def _slugify(name: str) -> str:
    slug = name.lower().strip()
    slug = re.sub(r"[^a-z0-9]+", "_", slug)
    slug = slug.strip("_")
    return slug


async def _verify_model_access(db: AsyncSession, model_id: uuid.UUID, user: User) -> FinancialModel:
    result = await db.execute(
        select(WorkspaceMember.workspace_id).where(WorkspaceMember.user_id == user.id).limit(1)
    )
    workspace_id = result.scalar_one_or_none()
    if not workspace_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No workspace")

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


# --- Sections ---

@router.get("/api/models/{model_id}/sections", response_model=list[SectionResponse])
async def list_sections(
    model_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _verify_model_access(db, model_id, current_user)
    result = await db.execute(
        select(Section).where(Section.model_id == model_id).order_by(Section.sort_order)
    )
    return result.scalars().all()


@router.post("/api/models/{model_id}/sections", response_model=SectionResponse, status_code=status.HTTP_201_CREATED)
async def create_section(
    model_id: uuid.UUID,
    data: SectionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _verify_model_access(db, model_id, current_user)
    section = Section(model_id=model_id, name=data.name, section_type=data.section_type, statement=data.statement, sort_order=data.sort_order)
    db.add(section)
    await db.commit()
    await db.refresh(section)
    return section


@router.put("/api/sections/{section_id}", response_model=SectionResponse)
async def update_section(
    section_id: uuid.UUID,
    data: SectionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Section).where(Section.id == section_id))
    section = result.scalar_one_or_none()
    if not section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
    await _verify_model_access(db, section.model_id, current_user)

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(section, key, value)
    await db.commit()
    await db.refresh(section)
    return section


@router.delete("/api/sections/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_section(
    section_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Section).where(Section.id == section_id))
    section = result.scalar_one_or_none()
    if not section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
    await _verify_model_access(db, section.model_id, current_user)
    await db.delete(section)
    await db.commit()


# --- Variables ---

@router.get("/api/models/{model_id}/variables", response_model=list[VariableResponse])
async def list_variables(
    model_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _verify_model_access(db, model_id, current_user)
    result = await db.execute(
        select(Variable).where(Variable.model_id == model_id).order_by(Variable.sort_order)
    )
    return result.scalars().all()


@router.post("/api/models/{model_id}/variables", response_model=VariableResponse, status_code=status.HTTP_201_CREATED)
async def create_variable(
    model_id: uuid.UUID,
    data: VariableCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _verify_model_access(db, model_id, current_user)

    slug = _slugify(data.name)
    # Ensure slug uniqueness within model
    existing = await db.execute(
        select(Variable).where(Variable.model_id == model_id, Variable.slug == slug)
    )
    if existing.scalar_one_or_none():
        slug = f"{slug}_{uuid.uuid4().hex[:6]}"

    variable = Variable(
        model_id=model_id,
        section_id=data.section_id,
        name=data.name,
        slug=slug,
        variable_type=data.variable_type,
        data_type=data.data_type,
        formula=data.formula,
        default_value=data.default_value,
        sort_order=data.sort_order,
        is_cumulative=data.is_cumulative,
    )
    db.add(variable)
    await db.commit()
    await db.refresh(variable)
    return variable


@router.put("/api/variables/{variable_id}", response_model=VariableResponse)
async def update_variable(
    variable_id: uuid.UUID,
    data: VariableUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Variable).where(Variable.id == variable_id))
    variable = result.scalar_one_or_none()
    if not variable:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Variable not found")
    await _verify_model_access(db, variable.model_id, current_user)

    update_data = data.model_dump(exclude_unset=True)
    if "name" in update_data:
        update_data["slug"] = _slugify(update_data["name"])
    for key, value in update_data.items():
        setattr(variable, key, value)

    await db.commit()
    await db.refresh(variable)
    return variable


@router.delete("/api/variables/{variable_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_variable(
    variable_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Variable).where(Variable.id == variable_id))
    variable = result.scalar_one_or_none()
    if not variable:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Variable not found")
    await _verify_model_access(db, variable.model_id, current_user)
    await db.delete(variable)
    await db.commit()


# --- Cell Values ---

@router.put("/api/cells", response_model=CellValueResponse)
async def update_cell(
    data: CellValueUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify access through variable -> model
    result = await db.execute(select(Variable).where(Variable.id == data.variable_id))
    variable = result.scalar_one_or_none()
    if not variable:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Variable not found")
    await _verify_model_access(db, variable.model_id, current_user)

    # Upsert cell value
    result = await db.execute(
        select(CellValue).where(
            CellValue.variable_id == data.variable_id,
            CellValue.scenario_id == data.scenario_id,
            CellValue.period_index == data.period_index,
        )
    )
    cell = result.scalar_one_or_none()
    if cell:
        cell.value = data.value
        cell.is_override = True
    else:
        cell = CellValue(
            variable_id=data.variable_id,
            scenario_id=data.scenario_id,
            period_index=data.period_index,
            value=data.value,
            is_override=True,
        )
        db.add(cell)

    await db.commit()
    await db.refresh(cell)
    return cell


@router.put("/api/cells/bulk")
async def bulk_update_cells(
    data: BulkCellUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not data.updates:
        return {"updated": 0}

    # Verify access for the first variable (assumes all are in same model)
    result = await db.execute(select(Variable).where(Variable.id == data.updates[0].variable_id))
    variable = result.scalar_one_or_none()
    if not variable:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Variable not found")
    await _verify_model_access(db, variable.model_id, current_user)

    for update in data.updates:
        result = await db.execute(
            select(CellValue).where(
                CellValue.variable_id == update.variable_id,
                CellValue.scenario_id == update.scenario_id,
                CellValue.period_index == update.period_index,
            )
        )
        cell = result.scalar_one_or_none()
        if cell:
            cell.value = update.value
            cell.is_override = True
        else:
            cell = CellValue(
                variable_id=update.variable_id,
                scenario_id=update.scenario_id,
                period_index=update.period_index,
                value=update.value,
                is_override=True,
            )
            db.add(cell)

    await db.commit()
    return {"updated": len(data.updates)}
