import logging
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Explicitly load .env from the backend root
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(str(_env_path), override=True)

logger = logging.getLogger(__name__)

# Sentinel used as the default for SECRET_KEY. In production we refuse to start
# with this value — see _enforce_production_guards below.
_DEFAULT_SECRET_KEY = "change-me-in-production-use-a-real-secret-key"


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/fpanda"
    SECRET_KEY: str = _DEFAULT_SECRET_KEY
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "https://axiom-platform.vercel.app"]
    ANTHROPIC_API_KEY: str = ""
    RESEND_API_KEY: str = ""
    FROM_EMAIL: str = "CortexCFO <onboarding@resend.dev>"
    VERIFICATION_CODE_EXPIRE_MINUTES: int = 10

    # "development" | "production". Drives the production guards below.
    ENVIRONMENT: str = "development"

    model_config = {"extra": "ignore"}


def _is_production(env_value: str) -> bool:
    return env_value.lower().strip() in {"production", "prod"}


def _enforce_production_guards(s: Settings) -> None:
    """Fail fast if we are about to run in production with insecure defaults.

    We refuse to sign JWTs with the well-known default SECRET_KEY, and we
    refuse to run at all without Resend configured (email verification is
    a hard dependency of the auth flow).
    """
    # Treat any non-development environment, or an explicit RENDER/VERCEL
    # deployment signal, as production even if ENVIRONMENT is unset.
    render_hint = os.getenv("RENDER") or os.getenv("RENDER_EXTERNAL_URL")
    in_prod = _is_production(s.ENVIRONMENT) or bool(render_hint)

    if not in_prod:
        if s.SECRET_KEY == _DEFAULT_SECRET_KEY:
            logger.warning(
                "SECRET_KEY is set to the default placeholder. This is fine for local "
                "development but MUST be replaced before deploying to production."
            )
        return

    errors: list[str] = []

    if s.SECRET_KEY == _DEFAULT_SECRET_KEY or len(s.SECRET_KEY) < 32:
        errors.append(
            "SECRET_KEY is missing, still the default placeholder, or shorter than "
            "32 characters. Generate one with `python -c \"import secrets; "
            "print(secrets.token_urlsafe(48))\"` and set it in the deployment environment."
        )

    if not s.RESEND_API_KEY:
        errors.append(
            "RESEND_API_KEY is not set. Email verification will fail; refusing to boot. "
            "Set it in the deployment environment."
        )

    if errors:
        banner = "\n  - ".join(errors)
        message = (
            "Refusing to start: production configuration is unsafe.\n  - " + banner
        )
        # Print to stderr so it shows up in the platform's log viewer even if
        # the logger isn't configured yet.
        print(message, file=sys.stderr, flush=True)
        raise RuntimeError(message)


settings = Settings()
_enforce_production_guards(settings)
