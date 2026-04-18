"""
chat_feedback model — persists every thumbs-up / thumbs-down on an AI
reply so we can grow the FAQ corpus from real data instead of guessing.

Storage philosophy:
  - Keep raw question + raw response verbatim. We need them to curate
    new FAQs from downvoted questions. No PII beyond user_id FK.
  - `source` + `faq_id` let us split feedback between "FAQ was served"
    vs "AI generated". Downvotes on FAQs signal template bugs; downvotes
    on AI answers signal curation opportunities.
  - `mode` tells us whether the user was in Quick vs Deep when they
    voted — lets us measure whether Deep mode's higher latency
    actually earns its keep (thumbs-up rate should be materially
    higher for Deep to justify the ~10x latency cost).
  - `page` helps us see which surfaces produce the worst answers
    (QoE page vs Dashboard, etc.).
  - Indexes on user_id + created_at and (helpful, created_at) because
    the two dominant queries are "my feedback" and "recent downvotes".

NO migration file — we rely on Base.metadata.create_all on startup
(the same pattern the rest of the app uses). A real alembic migration
can be generated later if the schema becomes more complex.
"""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, ForeignKey, String, Text, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base, utc_now_naive


class ChatFeedback(Base):
    __tablename__ = "chat_feedback"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # The original user question. Stored as Text because answers/questions
    # can be long; VARCHAR(N) creates a hard truncation cliff we don't want.
    question: Mapped[str] = mapped_column(Text, nullable=False)
    response: Mapped[str] = mapped_column(Text, nullable=False)
    helpful: Mapped[bool] = mapped_column(Boolean, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    # "faq" | "ai" — kept as a simple String so we don't have to maintain
    # a Postgres enum migration for two values.
    source: Mapped[str | None] = mapped_column(String(16), nullable=True)
    faq_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    mode: Mapped[str | None] = mapped_column(String(16), nullable=True)
    page: Mapped[str | None] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=utc_now_naive, index=True)

    # Composite index on (user_id, created_at desc) — primary query shape
    # for "show me my recent feedback". Postgres reads desc with a single
    # index reverse scan.
    __table_args__ = (
        Index("ix_chat_feedback_user_created", "user_id", "created_at"),
        Index("ix_chat_feedback_helpful_created", "helpful", "created_at"),
    )
