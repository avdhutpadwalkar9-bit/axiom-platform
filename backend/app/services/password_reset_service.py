"""Password reset — token issuance, validation, and credential update.

Two public entry points used by `routers/auth.py`:

  - request_reset(db, email)
        Issues a token if the email matches a real user. Returns True on
        delivery, False otherwise. The router translates BOTH outcomes
        into a generic success response so attackers can't tell whether
        an email is registered.

  - reset_password(db, token, new_password)
        Validates the token, updates the user's password hash, marks the
        token used. Returns True on success, False on any failure
        (expired, used, unknown). All failures map to a single 400 in
        the router, again to avoid leaking enumeration signals.

The token format is ``secrets.token_urlsafe(32)`` — 256 bits of entropy,
encoded URL-safe so it lives cleanly in a query string. Single-use,
60-minute expiry. Issuing a new token invalidates all prior unused
tokens for the same user (so a stale link can't be combined with a
fresh one).
"""

import secrets
import uuid
from datetime import timedelta

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import utc_now_naive
from app.models.password_reset import PasswordReset
from app.models.user import User
from app.services.auth_service import hash_password, normalize_email
from app.services.email_service import send_password_reset_email


# Window is generous because the user has to leave the inbox, click the
# link, type a new password, retype it. 60 minutes is the SaaS norm.
RESET_TOKEN_EXPIRE_MINUTES = 60


def _build_reset_url(token: str) -> str:
    """Pick the base URL the email link points at.

    Order of precedence:
      1. settings.FRONTEND_URL (when we have a custom domain)
      2. First non-localhost CORS_ORIGINS entry (the deployed frontend)
      3. Hardcoded prod URL as last-resort fallback
    """
    explicit = getattr(settings, "FRONTEND_URL", "")
    if explicit:
        base = explicit.rstrip("/")
    else:
        base = next(
            (o.rstrip("/") for o in settings.CORS_ORIGINS if "localhost" not in o),
            "https://axiom-platform.vercel.app",
        )
    return f"{base}/reset-password?token={token}"


async def request_reset(db: AsyncSession, email: str) -> bool:
    """Issue a reset token for the user matching ``email`` and email it.

    Returns True if the user existed and the email was attempted (regardless
    of Resend delivery success — we don't make the attacker wait on SMTP).
    Returns False if no user matches the email.

    The router masks the True/False distinction from the client.
    """
    normalized = normalize_email(email)
    result = await db.execute(
        select(User).where(func.lower(User.email) == normalized)
    )
    user = result.scalar_one_or_none()
    if user is None:
        return False

    # Invalidate any prior unused tokens for this user so the new token
    # is the only valid one. Prevents accumulation of live tokens if the
    # user clicks "forgot" repeatedly.
    await db.execute(
        update(PasswordReset)
        .where(PasswordReset.user_id == user.id, PasswordReset.used == False)
        .values(used=True)
    )

    token = secrets.token_urlsafe(32)
    expires_at = utc_now_naive() + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)

    record = PasswordReset(user_id=user.id, token=token, expires_at=expires_at)
    db.add(record)
    await db.commit()

    # Best-effort delivery. Resend errors should not block — a failure here
    # would be diagnosed via logs, never surfaced to the requesting client.
    send_password_reset_email(
        user.email,
        _build_reset_url(token),
        expires_minutes=RESET_TOKEN_EXPIRE_MINUTES,
    )
    return True


async def reset_password(db: AsyncSession, token: str, new_password: str) -> bool:
    """Validate the token and update the user's password hash.

    Single-use: the token is marked ``used=True`` whether the password
    update succeeds or not, so a leaked token can't be replayed if
    something else fails.
    """
    if not token or not new_password:
        return False

    now = utc_now_naive()
    result = await db.execute(
        select(PasswordReset).where(
            PasswordReset.token == token,
            PasswordReset.used == False,
            PasswordReset.expires_at > now,
        )
    )
    record = result.scalar_one_or_none()
    if record is None:
        return False

    user_result = await db.execute(select(User).where(User.id == record.user_id))
    user = user_result.scalar_one_or_none()
    if user is None:
        # Edge case: the user was deleted between issue and redemption.
        # Burn the token anyway and bail.
        record.used = True
        await db.commit()
        return False

    user.password_hash = hash_password(new_password)
    record.used = True

    # Invalidate every other unused token for this user too — defensive,
    # in case the user issued multiple before completing one.
    await db.execute(
        update(PasswordReset)
        .where(
            PasswordReset.user_id == user.id,
            PasswordReset.used == False,
            PasswordReset.id != record.id,
        )
        .values(used=True)
    )

    await db.commit()
    return True


async def _can_request_reset(db: AsyncSession, email: str) -> bool:
    """60-second cooldown per email, lookup-only.

    Used by the router to throttle the public endpoint. Returns True if
    no PasswordReset row was created for this email in the last 60s.
    """
    normalized = normalize_email(email)
    user_result = await db.execute(
        select(User.id).where(func.lower(User.email) == normalized)
    )
    user_id = user_result.scalar_one_or_none()
    if user_id is None:
        # Unknown emails: pretend cooldown is fine. The route returns
        # generic success anyway and won't actually do work.
        return True

    cooldown = utc_now_naive() - timedelta(seconds=60)
    recent = await db.execute(
        select(PasswordReset)
        .where(
            PasswordReset.user_id == user_id,
            PasswordReset.created_at > cooldown,
        )
        .limit(1)
    )
    return recent.scalar_one_or_none() is None


# Re-export under the public name so the router doesn't have to import
# the underscore-prefixed helper.
can_request_reset = _can_request_reset
