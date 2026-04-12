import uuid
from datetime import date, datetime

from pydantic import BaseModel


class ModelCreate(BaseModel):
    name: str
    description: str | None = None
    start_date: date
    period_count: int = 36
    period_type: str = "monthly"


class ModelUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    start_date: date | None = None
    period_count: int | None = None


class ModelResponse(BaseModel):
    id: uuid.UUID
    workspace_id: uuid.UUID
    name: str
    description: str | None
    start_date: date
    period_count: int
    period_type: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SectionCreate(BaseModel):
    name: str
    section_type: str | None = None
    statement: str | None = None
    sort_order: int = 0


class SectionUpdate(BaseModel):
    name: str | None = None
    section_type: str | None = None
    sort_order: int | None = None


class SectionResponse(BaseModel):
    id: uuid.UUID
    model_id: uuid.UUID
    name: str
    section_type: str | None
    sort_order: int
    statement: str | None
    created_at: datetime

    model_config = {"from_attributes": True, "protected_namespaces": ()}
