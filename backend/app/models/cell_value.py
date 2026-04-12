import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CellValue(Base):
    __tablename__ = "cell_values"
    __table_args__ = (
        UniqueConstraint("variable_id", "scenario_id", "period_index", name="uq_cell_value"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    variable_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("variables.id", ondelete="CASCADE"), index=True)
    scenario_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("scenarios.id", ondelete="CASCADE"), index=True)
    period_index: Mapped[int] = mapped_column(Integer, nullable=False)
    value: Mapped[float | None] = mapped_column(Numeric, nullable=True)
    is_override: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))

    variable = relationship("Variable", back_populates="cell_values")
    scenario = relationship("Scenario", back_populates="cell_values")
