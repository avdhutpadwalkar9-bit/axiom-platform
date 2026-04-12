import uuid
from datetime import datetime

from pydantic import BaseModel


class ScenarioCreate(BaseModel):
    name: str
    color: str | None = None


class ScenarioUpdate(BaseModel):
    name: str | None = None
    color: str | None = None


class ScenarioResponse(BaseModel):
    id: uuid.UUID
    model_id: uuid.UUID
    name: str
    is_base: bool
    color: str | None
    created_at: datetime

    model_config = {"from_attributes": True, "protected_namespaces": ()}
