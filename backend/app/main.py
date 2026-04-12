from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
from app.routers import auth, models, variables, scenarios, compute, analysis, profile, chat


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup (use alembic in production)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
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
    return {
        "status": "ok",
        "claude_api": has_key and has_sdk,
        "cors_origins": settings.CORS_ORIGINS,
    }
