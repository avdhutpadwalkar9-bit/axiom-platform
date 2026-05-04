"""Password reset tokens.

Mirrors the EmailVerification table structure but stores a URL-safe
random token (32 chars) instead of a 6-digit code, and uses a longer
expiry window (60 minutes) since the user has to leave their inbox,
click the link, and finish the reset on the web.

Tokens are single-use: once consumed, ``used=True`` is set and the same
token can never reset another password. Requesting a fresh reset
invalidates all prior unused tokens for that user (handled in the
service layer).
"""

import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base, utc_now_naive


class PasswordReset(Base):
    __tablename__ = "password_resets"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )
    # URL-safe token from secrets.token_urlsafe(32) — yields ~43 chars,
    # so 64 leaves headroom for any future scheme changes without a migration.
    token: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(nullable=False)
    used: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(default=utc_now_naive)
