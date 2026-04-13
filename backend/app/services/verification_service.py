"""Verification code generation, validation, and rate limiting."""

import secrets
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.email_verification import EmailVerification
from app.models.user import User
from app.services.email_service import send_verification_email


def _generate_code() -> str:
    """Generate a cryptographically secure 6-digit code."""
    return "".join(secrets.choice("0123456789") for _ in range(6))


async def generate_and_send_code(db: AsyncSession, user_id: uuid.UUID, email: str) -> str:
    """Generate a verification code, invalidate old ones, send email, return code."""
    # Invalidate any existing unused codes for this user
    await db.execute(
        update(EmailVerification)
        .where(EmailVerification.user_id == user_id, EmailVerification.used == False)
        .values(used=True)
    )

    code = _generate_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.VERIFICATION_CODE_EXPIRE_MINUTES)

    verification = EmailVerification(
        user_id=user_id,
        code=code,
        expires_at=expires_at,
    )
    db.add(verification)
    await db.commit()

    # Send the email
    send_verification_email(email, code)

    return code


async def verify_code(db: AsyncSession, user_id: uuid.UUID, code: str) -> bool:
    """Verify a code. Returns True if valid, False otherwise."""
    now = datetime.now(timezone.utc)

    result = await db.execute(
        select(EmailVerification).where(
            EmailVerification.user_id == user_id,
            EmailVerification.code == code,
            EmailVerification.used == False,
            EmailVerification.expires_at > now,
        )
    )
    verification = result.scalar_one_or_none()

    if not verification:
        return False

    # Mark code as used
    verification.used = True

    # Mark user as verified
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if user:
        user.is_email_verified = True

    await db.commit()
    return True


async def can_resend(db: AsyncSession, user_id: uuid.UUID) -> bool:
    """Check if enough time has passed since the last code was sent (60s cooldown)."""
    now = datetime.now(timezone.utc)
    cooldown = now - timedelta(seconds=60)

    result = await db.execute(
        select(EmailVerification)
        .where(
            EmailVerification.user_id == user_id,
            EmailVerification.created_at > cooldown,
        )
        .limit(1)
    )

    return result.scalar_one_or_none() is None
