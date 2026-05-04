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
    can_request_reset,
    request_reset,
)
from app.services.password_reset_service import reset_password as do_reset_password
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


# ── Password reset ────────────────────────────────────────────────────
#
# Two endpoints, both public (no JWT). Together they implement the
# standard "click the link in the email, type a new password" flow:
#
#   POST /api/auth/forgot-password   accepts email, sends reset email
#   POST /api/auth/reset-password    accepts token + new password
#
# Important defenses baked in:
#
#   1. Email enumeration — both endpoints return generic success
#      messages regardless of whether the email is registered or the
#      token is valid. An attacker cannot tell which addresses exist.
#
#   2. Rate limiting — the request endpoint rejects requests within
#      60 seconds of the previous one for the same email. Cooldown is
#      tracked by inspecting the most recent PasswordReset row.
#
#   3. Single-use tokens — each token is invalidated after use, and
#      requesting a new token invalidates all prior unused tokens for
#      the same user.
#
#   4. Password length — minimum 8 characters enforced server-side.
#      The frontend has its own validation but should not be trusted.

# Generic success copy used for BOTH paths (email exists, email doesn't,
# Resend succeeds, Resend fails). Identical text + identical HTTP status
# means a network observer cannot infer registration state.
_FORGOT_GENERIC_MESSAGE = (
    "If an account with that email exists, a password reset link has been sent."
)


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    data: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Issue a password-reset token + email it to the user.

    Always returns the same generic success message regardless of input —
    do not change this behavior without thinking through the enumeration
    implications. The 429 cooldown is still emitted because legitimate
    clients have already proved they own the email by the time they hit
    this twice in 60 seconds.
    """
    if not await can_request_reset(db, data.email):
        raise HTTPException(
            status_code=429,
            detail="Please wait 60 seconds before requesting another reset email.",
        )

    # Best-effort issuance. request_reset() returns False for unknown
    # emails (no work done) and True for known emails (token + email
    # attempted). Either way the user sees the same response.
    try:
        await request_reset(db, data.email)
    except Exception as e:  # pragma: no cover — log + swallow
        import traceback
        print(f"[AUTH] forgot_password failed for {data.email}: {e}")
        print(traceback.format_exc())

    return MessageResponse(message=_FORGOT_GENERIC_MESSAGE)


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    data: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Validate the reset token and update the password.

    All token-validation failures (expired / used / unknown) collapse to
    the same 400 to avoid leaking which one occurred. Password length is
    checked here so the frontend can be more permissive in its UI
    without allowing a 1-char password.
    """
    if len(data.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters.",
        )

    success = await do_reset_password(db, data.token, data.password)
    if not success:
        raise HTTPException(
            status_code=400,
            detail=(
                "This reset link is invalid or has expired. "
                "Request a new one from the Forgot password page."
            ),
        )

    return MessageResponse(message="Password reset. Sign in with your new password.")


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
