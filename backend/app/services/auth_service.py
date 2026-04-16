import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember


def normalize_email(email: str) -> str:
    """Lowercase + strip so 'Foo@Bar.com ' and 'foo@bar.com' match the same row.

    Historically we stored email exactly as typed, which caused login failures
    when users signed up with one casing and logged in with another. All new
    writes go through this, and reads use func.lower() so legacy mixed-case
    rows still resolve.
    """
    return (email or "").strip().lower()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_access_token(user_id: uuid.UUID) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "exp": expire, "type": "access"}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(user_id: uuid.UUID) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {"sub": str(user_id), "exp": expire, "type": "refresh"}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


async def create_user(db: AsyncSession, email: str, password: str, name: str | None = None) -> User:
    normalized = normalize_email(email)
    user = User(email=normalized, password_hash=hash_password(password), name=name)
    db.add(user)
    await db.flush()

    # Create a default workspace for the user
    workspace = Workspace(name=f"{name or normalized}'s Workspace", owner_id=user.id)
    db.add(workspace)
    await db.flush()

    member = WorkspaceMember(workspace_id=workspace.id, user_id=user.id, role="owner")
    db.add(member)

    await db.commit()
    await db.refresh(user)
    return user


async def authenticate_user(db: AsyncSession, email: str, password: str) -> User | None:
    # Case-insensitive lookup so historical rows stored with mixed casing still
    # match what the user types at login. func.lower() is indexable with a
    # functional index; for our traffic volume a seq scan is fine.
    normalized = normalize_email(email)
    result = await db.execute(
        select(User).where(func.lower(User.email) == normalized)
    )
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.password_hash):
        return None
    return user


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()
