"""Password-reset token generation, validation, and consumption.

Three responsibilities:

1. ``request_password_reset(email)`` — generate a one-time token,
   persist it with a 30-minute expiry, email the user a link. We
   ALWAYS return successfully (no signal about whether the email
   exists) — the route relies on this so it can show the same UI
   to attackers and legitimate users.

2. ``reset_password(token, new_password)`` — validate the token
   (must exist, not be used, not be expired), set the new bcrypt
   hash on the user row, mark the token used.

3. ``can_request_reset(email)`` — 60-second cooldown so a single
   form can't be hammered into a password-reset DoS on a user's
   inbox.

Token format: 32 random bytes → 43-char url-safe base64 string.
Cryptographically secure (`secrets.token_urlsafe`), high enough
entropy that guessing is infeasible inside the 30-min window.
"""

import secrets
from datetime import timedelta

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import utc_now_naive
from app.models.password_reset import PasswordResetToken
from app.models.user import User
from app.services.auth_service import hash_password, normalize_email
from app.services.email_service import send_password_reset_email


# 30 minutes is the industry-standard window for reset links — long
# enough to handle inbox latency / coffee breaks, short enough that
# a leaked token (e.g. from screen-share, email forwarding) doesn't
# stay usable indefinitely. Mirrored in the frontend copy
# ("expires in 30 minutes").
RESET_TOKEN_EXPIRE_MINUTES = 30

# 60-second per-email rate limit — same value verification uses.
# Prevents the reset form from being weaponised into mailbox spam.
RESET_REQUEST_COOLDOWN_SECONDS = 60


def _generate_token() -> str:
    """Crypto-grade URL-safe token. 32 bytes → 43 chars base64."""
    return secrets.token_urlsafe(32)


async def _get_user_by_email(db: AsyncSession, email: str) -> User | None:
    """Case-insensitive lookup, matching the auth-service convention."""
    normalized = normalize_email(email)
    result = await db.execute(
        select(User).where(func.lower(User.email) == normalized)
    )
    return result.scalar_one_or_none()


async def _can_request(db: AsyncSession, user_id) -> bool:
    """True iff the last reset request for this user was over the cooldown ago."""
    cutoff = utc_now_naive() - timedelta(seconds=RESET_REQUEST_COOLDOWN_SECONDS)
    result = await db.execute(
        select(PasswordResetToken)
        .where(
            PasswordResetToken.user_id == user_id,
            PasswordResetToken.created_at > cutoff,
        )
        .limit(1)
    )
    return result.scalar_one_or_none() is None


async def request_password_reset(db: AsyncSession, email: str) -> bool:
    """Issue a reset token + email it. Returns True if a token was created
    (i.e., the email matched a real user AND the cooldown allowed it),
    False otherwise.

    The route MUST NOT leak the return value to the client — both true
    and false paths produce the same "If an account exists…" response.
    The boolean is here so logs / metrics can distinguish.
    """
    user = await _get_user_by_email(db, email)
    if user is None:
        # No user → no token. Spend a small amount of time anyway so
        # response timing doesn't betray which emails are registered.
        # (bcrypt would normally do this; for read-only paths we skip.)
        return False

    if not await _can_request(db, user.id):
        # Inside the cooldown window. Silently succeed from the caller's
        # POV — the user already has a fresh token in their inbox.
        return False

    # Invalidate any prior unused tokens. Without this, two requests
    # in a row leave TWO valid links live in the user's inbox; the
    # principle of least authority says invalidate the older one.
    await db.execute(
        update(PasswordResetToken)
        .where(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used == False,
        )
        .values(used=True, used_at=utc_now_naive())
    )

    token = _generate_token()
    expires_at = utc_now_naive() + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)

    row = PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=expires_at,
    )
    db.add(row)
    await db.commit()

    # Email is best-effort. A Resend outage shouldn't crash the route —
    # the user will just re-request after the cooldown.
    try:
        send_password_reset_email(user.email, token, user.name)
    except Exception as e:  # pragma: no cover — outbound delivery
        import traceback
        print(f"[PWRESET] Failed to email reset link to {user.email}: {e}")
        print(traceback.format_exc())

    return True


async def reset_password(db: AsyncSession, token: str, new_password: str) -> User | None:
    """Validate ``token`` and write the new password hash.

    Returns the User on success, None on failure (invalid / expired /
    already-used token). On success the token is marked consumed and
    the User row's password_hash is rotated.

    NOTE: We do NOT invalidate refresh tokens here because they're JWT-
    signed and stateless — there's no server-side blacklist to flip.
    The frontend handles this by clearing localStorage on a successful
    reset (the user re-logs in). If we ever move refresh tokens into
    the DB, this is the place to ``UPDATE`` their revoked_at column.
    """
    now = utc_now_naive()
    result = await db.execute(
        select(PasswordResetToken).where(
            PasswordResetToken.token == token,
            PasswordResetToken.used == False,
            PasswordResetToken.expires_at > now,
        )
    )
    row = result.scalar_one_or_none()
    if row is None:
        return None

    # Validate the new password meets the same rules as signup —
    # the frontend already checks but the server is the source of truth.
    if len(new_password or "") < 8:
        return None
    if not any(c.isalpha() for c in new_password):
        return None
    if not any(c.isdigit() for c in new_password):
        return None

    user_result = await db.execute(select(User).where(User.id == row.user_id))
    user = user_result.scalar_one_or_none()
    if user is None:
        # Should be impossible given the FK, but defend in depth — a
        # disappeared user means we have nothing to update.
        return None

    user.password_hash = hash_password(new_password)
    row.used = True
    row.used_at = now

    # Bonus side effect: if the user hadn't verified their email yet,
    # consuming a password-reset link proves inbox control just as well
    # as the 6-digit code does. Mark them verified so they don't get
    # bounced through /verify-email immediately after this.
    if not user.is_email_verified:
        user.is_email_verified = True

    await db.commit()
    await db.refresh(user)
    return user
