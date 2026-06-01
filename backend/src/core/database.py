import sqlite3
from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from .config import get_settings

settings = get_settings()

# 優先用 PostgreSQL；如果連接失敗自動降級到 SQLite
DB_URL = settings.database_url

_USE_SQLITE = False

if "sqlite" in DB_URL or ":memory:" in DB_URL:
    _USE_SQLITE = True

engine = create_async_engine(DB_URL, echo=settings.debug, connect_args={"check_same_thread": False} if _USE_SQLITE else {})

async_session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db():
    await engine.dispose()
