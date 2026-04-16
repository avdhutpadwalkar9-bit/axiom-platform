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
from app.services.email_service import send_welcome_email
from app.services.verification_service import (
    can_resend,
    generate_and_send_code,
    verify_code,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(data: UserCreate, db: AsyncSession = Depends(get_db)):
    # Distinguish real duplicate-email from other failures. Historically we
    # caught any Exception and surfaced "Email already registered", which made
    # DB/schema issues look like duplicates to the user. Do the pre-check
    # explicitly and let other failures bubble up as 500 (visible in logs).
    from sqlalchemy import func, select
    from app.models.user import User
    from app.services.auth_service import normalize_email

    normalized = normalize_email(data.email)
    existing = await db.execute(
        select(User.id).where(func.lower(User.email) == normalized)
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    try:
        user = await create_user(db, data.email, data.password, data.name)
    except Exception as e:
        # Log full traceback so we can diagnose DB/schema issues instead of
        # blaming them on duplicate emails.
        import traceback
        print(f"[AUTH] Signup create_user failed for {data.email!r}: {e}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Signup failed: {type(e).__name__}: {str(e)[:200]}",
        )

    # Send verification code (gated email)
    try:
        await generate_and_send_code(db, user.id, user.email)
    except Exception as e:
        # Verification email failure is non-fatal — user is created, they
        # can request a resend. Log so we can see if Resend is broken.
        import traceback
        print(f"[AUTH] Verification email failed for {user.email}: {e}")
        print(traceback.format_exc())

    # Fire the welcome/onboarding email alongside the verification code.
    # Non-fatal — a Resend failure here must not block signup.
    try:
        send_welcome_email(user.email, user.name)
    except Exception as e:  # pragma: no cover — best-effort delivery
        print(f"[AUTH] Welcome email failed for {user.email}: {e}")

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
