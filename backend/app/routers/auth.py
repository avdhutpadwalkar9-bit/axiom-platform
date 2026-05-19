import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.user import (
    DeleteAccountRequest,
    ForgotPasswordRequest,
    MessageResponse,
    RefreshRequest,
    ResetPasswordRequest,
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
    delete_user_account,
    get_user_by_id,
    verify_password,
)
from app.services.email_service import send_welcome_email
from app.services.password_reset_service import (
    request_password_reset,
    reset_password as reset_password_service,
)
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
    # Compose the response so has_ai_access reflects the allowlist at
    # this moment. ORM objects don't carry that field; we compute it per
    # request so a newly-added email in the env var takes effect on the
    # next /auth/me poll without any DB write.
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        is_email_verified=current_user.is_email_verified,
        created_at=current_user.created_at,
        has_ai_access=settings.user_has_ai_access(current_user.email),
    )


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


# ─── Password reset ────────────────────────────────────────────────
# The forgot-password / reset-password pair powers the "Forgot?" link
# on /login. See app/services/password_reset_service.py for the full
# rationale. tl;dr — single-use url-safe token, 30-minute expiry,
# 60-second per-email cooldown, identical UI response regardless of
# whether the email is registered (no account enumeration).

# Generic message returned for EVERY forgot-password call so attackers
# can't tell whether an email exists in our database.
_FORGOT_GENERIC_MESSAGE = (
    "If an account exists for that email, we've sent a reset link. "
    "It works once and expires in 30 minutes."
)


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    data: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Issue a password-reset link.

    Always returns 200 with the same generic message, regardless of
    whether the email maps to a real user. Leaking that signal would
    let an attacker enumerate registered accounts one form-submission
    at a time. The service layer logs internally so we can still see
    delivery metrics.

    Rate-limiting is per-user (60s between requests). When the user
    doesn't exist OR the cooldown is active, ``request_password_reset``
    returns False — we still emit the same generic 200.
    """
    try:
        await request_password_reset(db, data.email)
    except Exception as e:  # pragma: no cover — defensive
        # An unhandled exception here would still leak signal via 500.
        # Catch everything, log, return the same generic 200.
        import traceback
        print(f"[AUTH] forgot-password failed for {data.email!r}: {e}")
        print(traceback.format_exc())

    return MessageResponse(message=_FORGOT_GENERIC_MESSAGE)


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    data: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Complete the reset flow.

    Returns 400 on invalid / expired / already-used tokens — those
    failures are NOT account-enumeration vectors (the user already
    holds the link), so a precise error message is fine and actually
    useful UX.

    Returns 400 on weak passwords (mirrors the signup rules — at
    least 8 chars, with one letter and one digit). The frontend
    enforces the same rules, but the server is the source of truth.

    A successful reset also flips ``is_email_verified=True`` because
    consuming the reset link proves the user controls the inbox just
    as well as the 6-digit verify code does — saves them a follow-up
    /verify-email round-trip.
    """
    user = await reset_password_service(db, data.token, data.new_password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Reset link is invalid, expired, or already used — request a "
                "new one. Password must be at least 8 characters with a "
                "letter and a digit."
            ),
        )

    return MessageResponse(message="Password updated. Please sign in with your new password.")


# Exact literal the client must type to confirm deletion. Anything else
# (case, whitespace, trimming) is rejected — raising the bar on typos.
DELETE_ACCOUNT_CONFIRMATION = "DELETE MY ACCOUNT"


@router.post("/delete-account", response_model=MessageResponse)
async def delete_account(
    data: DeleteAccountRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Permanently delete the current user and all associated data.

    Requires two guards:

    1. Re-authentication — the caller must send the current password.
       JWT alone isn't enough because a stolen token shouldn't be able
       to nuke the account.
    2. Exact confirmation string — "DELETE MY ACCOUNT", case-sensitive.
       Protects against click-through / autofill.

    POST (not DELETE) so that the request body travels through every
    proxy and HTTP client without surprises — some middleware strips
    bodies from DELETE requests.
    """
    if data.confirmation != DELETE_ACCOUNT_CONFIRMATION:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Confirmation must be exactly: {DELETE_ACCOUNT_CONFIRMATION}",
        )
    if not verify_password(data.password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
        )

    await delete_user_account(db, current_user.id)
    return MessageResponse(message="Account and all associated data deleted")
