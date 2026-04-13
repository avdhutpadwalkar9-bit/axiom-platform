from pathlib import Path

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Explicitly load .env from the backend root
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(str(_env_path), override=True)


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/fpanda"
    SECRET_KEY: str = "change-me-in-production-use-a-real-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "https://axiom-platform.vercel.app"]
    ANTHROPIC_API_KEY: str = ""
    RESEND_API_KEY: str = ""
    FROM_EMAIL: str = "CortexCFO <onboarding@resend.dev>"
    VERIFICATION_CODE_EXPIRE_MINUTES: int = 10

    model_config = {"extra": "ignore"}


settings = Settings()
