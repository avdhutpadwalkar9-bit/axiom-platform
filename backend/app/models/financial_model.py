import uuid
from datetime import date, datetime

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base, utc_now_naive


class FinancialModel(Base):
    __tablename__ = "financial_models"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("workspaces.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    start_date: Mapped[date] = mapped_column(nullable=False)
    period_count: Mapped[int] = mapped_column(Integer, default=36)
    period_type: Mapped[str] = mapped_column(String(20), default="monthly")
    created_at: Mapped[datetime] = mapped_column(default=utc_now_naive)
    updated_at: Mapped[datetime] = mapped_column(
        default=utc_now_naive,
        onupdate=utc_now_naive,
    )

    workspace = relationship("Workspace", back_populates="models")
    sections = relationship("Section", back_populates="model", cascade="all, delete-orphan", order_by="Section.sort_order")
    variables = relationship("Variable", back_populates="model", cascade="all, delete-orphan")
    scenarios = relationship("Scenario", back_populates="model", cascade="all, delete-orphan")
