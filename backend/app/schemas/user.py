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
    """Payload for POST /api/auth/forgot-password.

    Only the email — the route's response never depends on whether
    the email is registered, so attackers can't enumerate accounts.
    """
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Payload for POST /api/auth/reset-password.

    The token comes from the link the user received in their inbox;
    the new password is the plain text they typed (the server hashes
    it). Password rules (length / letter / digit) are validated in
    the service layer for parity with signup.
    """
    token: str
    new_password: str


class MessageResponse(BaseModel):
    message: str
