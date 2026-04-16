import uuid
from datetime import datetime

from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base, utc_now_naive


class Variable(Base):
    __tablename__ = "variables"
    __table_args__ = (UniqueConstraint("model_id", "slug", name="uq_variable_model_slug"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    model_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("financial_models.id", ondelete="CASCADE"), index=True)
    section_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("sections.id", ondelete="SET NULL"), nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), nullable=False)
    variable_type: Mapped[str] = mapped_column(String(50), nullable=False)  # input, formula, summary
    data_type: Mapped[str] = mapped_column(String(50), default="currency")  # currency, number, percentage
    formula: Mapped[str | None] = mapped_column(Text, nullable=True)
    default_value: Mapped[float | None] = mapped_column(Numeric, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_cumulative: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(default=utc_now_naive)

    model = relationship("FinancialModel", back_populates="variables")
    section = relationship("Section", back_populates="variables")
    cell_values = relationship("CellValue", back_populates="variable", cascade="all, delete-orphan")
