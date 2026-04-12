import uuid
from datetime import datetime

from pydantic import BaseModel


class ProfileCreate(BaseModel):
    # Personal
    full_name: str
    phone: str | None = None
    role: str  # founder/cfo/ca/investor/other

    # Business
    company_name: str
    gstin: str | None = None
    pan: str | None = None
    cin: str | None = None
    industry: str | None = None
    entity_type: str | None = None
    services_description: str | None = None
    website_url: str | None = None
    year_founded: int | None = None
    had_pivot: bool = False
    pivot_description: str | None = None
    turnover_range: str | None = None
    employee_count: str | None = None
    accounting_software: str | None = None

    # Onboarding
    onboarding_completed: bool = False
    is_demo_mode: bool = False

    model_config = {"protected_namespaces": ()}


class ProfileUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    role: str | None = None

    company_name: str | None = None
    gstin: str | None = None
    pan: str | None = None
    cin: str | None = None
    industry: str | None = None
    entity_type: str | None = None
    services_description: str | None = None
    website_url: str | None = None
    year_founded: int | None = None
    had_pivot: bool | None = None
    pivot_description: str | None = None
    turnover_range: str | None = None
    employee_count: str | None = None
    accounting_software: str | None = None

    onboarding_completed: bool | None = None
    is_demo_mode: bool | None = None

    model_config = {"protected_namespaces": ()}


class ProfileResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID

    full_name: str
    phone: str | None
    role: str

    company_name: str
    gstin: str | None
    pan: str | None
    cin: str | None
    industry: str | None
    entity_type: str | None
    services_description: str | None
    website_url: str | None
    year_founded: int | None
    had_pivot: bool
    pivot_description: str | None
    turnover_range: str | None
    employee_count: str | None
    accounting_software: str | None

    onboarding_completed: bool
    is_demo_mode: bool

    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True, "protected_namespaces": ()}


class OnboardingStatusResponse(BaseModel):
    completed: bool
    step: int
