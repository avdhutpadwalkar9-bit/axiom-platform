"""Password-reset token model.

Mirrors the EmailVerification pattern — one row per request, single-use
via `used` flag, expires_at enforced server-side, indexed on token so
validation is O(1).

Tokens themselves are url-safe random strings (see
``password_reset_service._generate_token``), not 6-digit codes — these
travel in the URL of the reset email, not in a re-keyable input.
"""

import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base, utc_now_naive


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), nullable=False, index=True
    )
    # 43-char url-safe base64 (32 random bytes). Stored as-is so we can
    # do an O(1) indexed lookup on incoming reset links. The token IS
    # the secret — anyone with it can reset the password (within the
    # expiry window), exactly like a magic link.
    token: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(nullable=False)
    used: Mapped[bool] = mapped_column(default=False)
    # Timestamp of consumption — useful for forensics if a reset is
    # disputed ("when exactly was my password changed?").
    used_at: Mapped[datetime | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=utc_now_naive)
