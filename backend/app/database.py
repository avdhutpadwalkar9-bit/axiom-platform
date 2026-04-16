from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def utc_now_naive() -> datetime:
    """Current UTC time as a naive datetime (tzinfo stripped).

    SQLAlchemy's default mapping for `Mapped[datetime]` produces Postgres
    ``TIMESTAMP WITHOUT TIME ZONE`` columns. asyncpg rejects tz-aware values
    into naive columns with "can't subtract offset-naive and offset-aware
    datetimes" — SQLite was permissive, Postgres is not.

    Convention: every timestamp in our DB is UTC, stored naive. Use this
    helper for defaults and for "now" comparisons against these columns.
    If we migrate columns to TIMESTAMPTZ later, swap the body of this
    function to ``datetime.now(timezone.utc)``.
    """
    return datetime.now(timezone.utc).replace(tzinfo=None)


async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
