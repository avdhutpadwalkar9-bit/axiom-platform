import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    name: str | None
    is_email_verified: bool
    created_at: datetime
    # Set by the server based on the AI_ASSISTANT_ALLOWED_EMAILS env var.
    # Frontend uses this to decide whether to render <AIChatPanel />.
    # Defaults to True so local / dev environments without the gate set
    # don't accidentally hide the chat. Real authority is the backend
    # 403 on /api/chat/*.
    has_ai_access: bool = True

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class VerifyEmailRequest(BaseModel):
    code: str


class DeleteAccountRequest(BaseModel):
    # The literal confirmation string protects against accidental or
    # click-through deletion. We check the exact text on the server so
    # the frontend can't lower the bar by accident.
    password: str
    confirmation: str


class ForgotPasswordRequest(BaseModel):
    """Initial request — user types their email on /forgot-password.

    Server always returns generic success to prevent email enumeration —
    we never confirm whether an email is registered.
    """
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Final reset — user clicks the email link, types new password.

    The token comes from the email URL; the password is the new password
    the user entered. Length validation is permissive here (>=8 chars) and
    matches the signup contract.
    """
    token: str
    password: str


class MessageResponse(BaseModel):
    message: str
