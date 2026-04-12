import uuid
from datetime import datetime

from pydantic import BaseModel


class VariableCreate(BaseModel):
    name: str
    section_id: uuid.UUID | None = None
    variable_type: str = "input"  # input, formula, summary
    data_type: str = "currency"  # currency, number, percentage
    formula: str | None = None
    default_value: float | None = None
    sort_order: int = 0
    is_cumulative: bool = False


class VariableUpdate(BaseModel):
    name: str | None = None
    section_id: uuid.UUID | None = None
    variable_type: str | None = None
    data_type: str | None = None
    formula: str | None = None
    default_value: float | None = None
    sort_order: int | None = None
    is_cumulative: bool | None = None


class VariableResponse(BaseModel):
    id: uuid.UUID
    model_id: uuid.UUID
    section_id: uuid.UUID | None
    name: str
    slug: str
    variable_type: str
    data_type: str
    formula: str | None
    default_value: float | None
    sort_order: int
    is_cumulative: bool
    created_at: datetime

    model_config = {"from_attributes": True, "protected_namespaces": ()}


class CellValueUpdate(BaseModel):
    variable_id: uuid.UUID
    scenario_id: uuid.UUID
    period_index: int
    value: float | None


class BulkCellUpdate(BaseModel):
    updates: list[CellValueUpdate]


class CellValueResponse(BaseModel):
    variable_id: uuid.UUID
    scenario_id: uuid.UUID
    period_index: int
    value: float | None
    is_override: bool

    model_config = {"from_attributes": True}
