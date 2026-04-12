from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.business_profile import BusinessProfile
from app.models.user import User
from app.schemas.profile import (
    OnboardingStatusResponse,
    ProfileCreate,
    ProfileResponse,
    ProfileUpdate,
)

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.post("", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_profile(
    data: ProfileCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Check if profile already exists
    result = await db.execute(
        select(BusinessProfile).where(BusinessProfile.user_id == current_user.id)
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already exists. Use PUT to update.",
        )

    profile = BusinessProfile(user_id=current_user.id, **data.model_dump())
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


@router.get("", response_model=ProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BusinessProfile).where(BusinessProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )
    return profile


@router.put("", response_model=ProfileResponse)
async def update_profile(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BusinessProfile).where(BusinessProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)
    return profile


@router.get("/onboarding-status", response_model=OnboardingStatusResponse)
async def onboarding_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BusinessProfile).where(BusinessProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        return OnboardingStatusResponse(completed=False, step=0)

    if profile.onboarding_completed:
        return OnboardingStatusResponse(completed=True, step=4)

    # Determine current step based on filled fields
    step = 1  # Personal info submitted (profile exists)
    if profile.company_name and profile.industry:
        step = 2  # Business basics done
    if profile.turnover_range and profile.employee_count:
        step = 3  # Financial details done

    return OnboardingStatusResponse(completed=False, step=step)
