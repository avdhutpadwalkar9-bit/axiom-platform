from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.config import settings
from app.database import engine, Base
from app.routers import auth, models, variables, scenarios, compute, analysis, profile, chat


async def _normalize_user_emails(conn) -> None:
    """Idempotent: lowercase+trim every user.email that isn't already normalized.

    Backfills historical mixed-case rows so the new case-insensitive login
    lookup has a single canonical copy. Runs on every boot but is a no-op
    once clean. Collisions (two rows that collapse to the same normalized
    email) are skipped and logged — never merged silently.
    """
    try:
        rows = (
            await conn.execute(
                text(
                    "SELECT id, email FROM users "
                    "WHERE email <> lower(btrim(email))"
                )
            )
        ).fetchall()
    except Exception as e:  # pragma: no cover — table may not exist on first boot
        print(f"[STARTUP] Email normalization skipped: {e}")
        return

    for row in rows:
        user_id, original = row[0], row[1]
        normalized = original.strip().lower()
        existing = (
            await conn.execute(
                text("SELECT id FROM users WHERE email = :e AND id <> :id"),
                {"e": normalized, "id": user_id},
            )
        ).first()
        if existing:
            print(
                f"[STARTUP] Skipping email normalize for user {user_id}: "
                f"{original!r} collides with existing {normalized!r}"
            )
            continue
        await conn.execute(
            text("UPDATE users SET email = :e WHERE id = :id"),
            {"e": normalized, "id": user_id},
        )
        print(f"[STARTUP] Normalized email for user {user_id}: {original!r} -> {normalized!r}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup (use alembic in production)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await _normalize_user_emails(conn)
    yield
    await engine.dispose()


app = FastAPI(title="FP&A Platform", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(models.router)
app.include_router(variables.router)
app.include_router(scenarios.router)
app.include_router(compute.router)
app.include_router(analysis.router)
app.include_router(profile.router)
app.include_router(chat.router)


@app.get("/api/health")
async def health():
    has_key = bool(settings.ANTHROPIC_API_KEY)
    try:
        import anthropic
        has_sdk = True
    except ImportError:
        has_sdk = False

    from app.services.email_service import check_resend_configured
    resend_status = check_resend_configured()

    return {
        "status": "ok",
        "claude_api": has_key and has_sdk,
        "resend": resend_status,
        "cors_origins": settings.CORS_ORIGINS,
    }
