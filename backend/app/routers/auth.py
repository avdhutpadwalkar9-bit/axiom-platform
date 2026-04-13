import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.user import (
    MessageResponse,
    RefreshRequest,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
    VerifyEmailRequest,
)
from app.services.auth_service import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    create_user,
    decode_token,
    get_user_by_id,
)
from app.services.verification_service import (
    can_resend,
    generate_and_send_code,
    verify_code,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(data: UserCreate, db: AsyncSession = Depends(get_db)):
    try:
        user = await create_user(db, data.email, data.password, data.name)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    # Send verification code
    await generate_and_send_code(db, user.id, user.email)

    return user


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(db, data.email, data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    payload = decode_token(data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user = await get_user_by_id(db, uuid.UUID(payload["sub"]))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/verify-email", response_model=MessageResponse)
async def verify_email(
    data: VerifyEmailRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Verify email with 6-digit code."""
    if current_user.is_email_verified:
        return MessageResponse(message="Email already verified")

    success = await verify_code(db, current_user.id, data.code)
    if not success:
        raise HTTPException(status_code=400, detail="Invalid or expired code. Please try again or request a new code.")

    return MessageResponse(message="Email verified successfully")


@router.post("/resend-verification", response_model=MessageResponse)
async def resend_verification(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Resend verification code to user's email."""
    if current_user.is_email_verified:
        raise HTTPException(status_code=400, detail="Email already verified")

    if not await can_resend(db, current_user.id):
        raise HTTPException(status_code=429, detail="Please wait 60 seconds before requesting a new code")

    await generate_and_send_code(db, current_user.id, current_user.email)
    return MessageResponse(message="Verification code sent")
