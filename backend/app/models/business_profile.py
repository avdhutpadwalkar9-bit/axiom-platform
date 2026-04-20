import uuid
from datetime import datetime

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base, utc_now_naive


class BusinessProfile(Base):
    __tablename__ = "business_profiles"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False, index=True)

    # Personal info
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    role: Mapped[str] = mapped_column(String(50), nullable=False)  # founder/cfo/ca/investor/other

    # Business info
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    # Region drives AI voice + FAQ filter ("US" | "IN"). Today derived
    # from `currency` (INR → IN, else US) but kept as its own column so
    # we can decouple once we author EU/UK/JP regulatory FAQs.
    region: Mapped[str | None] = mapped_column(String(4), nullable=True, default="US")
    # User-selected reporting currency — one of USD, EUR, GBP, INR, JPY.
    # Drives currency symbol, number formatting, live FX strip on the
    # dashboard, and (via derived region) the AI voice. ISO-4217 3-letter.
    currency: Mapped[str | None] = mapped_column(String(3), nullable=True, default="USD")
    gstin: Mapped[str | None] = mapped_column(String(15), nullable=True)
    pan: Mapped[str | None] = mapped_column(String(10), nullable=True)
    cin: Mapped[str | None] = mapped_column(String(21), nullable=True)
    industry: Mapped[str | None] = mapped_column(String(100), nullable=True)
    entity_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    services_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    website_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    year_founded: Mapped[int | None] = mapped_column(Integer, nullable=True)
    had_pivot: Mapped[bool] = mapped_column(Boolean, default=False)
    pivot_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    turnover_range: Mapped[str | None] = mapped_column(String(50), nullable=True)
    employee_count: Mapped[str | None] = mapped_column(String(50), nullable=True)
    accounting_software: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Onboarding state
    onboarding_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    is_demo_mode: Mapped[bool] = mapped_column(Boolean, default=False)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(default=utc_now_naive)
    updated_at: Mapped[datetime] = mapped_column(
        default=utc_now_naive,
        onupdate=utc_now_naive,
    )

    user = relationship("User", backref="business_profile", uselist=False)
