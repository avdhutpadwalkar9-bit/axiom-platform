import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.financial_model import FinancialModel
from app.models.scenario import Scenario
from app.models.user import User
from app.models.workspace import WorkspaceMember
from app.schemas.model import ModelCreate, ModelResponse, ModelUpdate

router = APIRouter(prefix="/api/models", tags=["models"])


async def _get_workspace_id(db: AsyncSession, user: User) -> uuid.UUID:
    result = await db.execute(
        select(WorkspaceMember.workspace_id).where(WorkspaceMember.user_id == user.id).limit(1)
    )
    workspace_id = result.scalar_one_or_none()
    if not workspace_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No workspace found")
    return workspace_id


@router.get("", response_model=list[ModelResponse])
async def list_models(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workspace_id = await _get_workspace_id(db, current_user)
    result = await db.execute(
        select(FinancialModel)
        .where(FinancialModel.workspace_id == workspace_id)
        .order_by(FinancialModel.updated_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=ModelResponse, status_code=status.HTTP_201_CREATED)
async def create_model(
    data: ModelCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workspace_id = await _get_workspace_id(db, current_user)
    model = FinancialModel(
        workspace_id=workspace_id,
        name=data.name,
        description=data.description,
        start_date=data.start_date,
        period_count=data.period_count,
        period_type=data.period_type,
    )
    db.add(model)
    await db.flush()

    # Create a default "Base Case" scenario
    base_scenario = Scenario(model_id=model.id, name="Base Case", is_base=True, color="#3B82F6")
    db.add(base_scenario)

    await db.commit()
    await db.refresh(model)
    return model


@router.get("/{model_id}", response_model=ModelResponse)
async def get_model(
    model_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workspace_id = await _get_workspace_id(db, current_user)
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


@router.put("/{model_id}", response_model=ModelResponse)
async def update_model(
    model_id: uuid.UUID,
    data: ModelUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workspace_id = await _get_workspace_id(db, current_user)
    result = await db.execute(
        select(FinancialModel).where(
            FinancialModel.id == model_id,
            FinancialModel.workspace_id == workspace_id,
        )
    )
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(model, key, value)

    await db.commit()
    await db.refresh(model)
    return model


@router.delete("/{model_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_model(
    model_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workspace_id = await _get_workspace_id(db, current_user)
    result = await db.execute(
        select(FinancialModel).where(
            FinancialModel.id == model_id,
            FinancialModel.workspace_id == workspace_id,
        )
    )
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model not found")

    await db.delete(model)
    await db.commit()
