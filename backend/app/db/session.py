from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from ..core.config import settings


def _get_connect_args(database_url: str) -> dict:
    # SQLite needs this for multithreaded access (typical in dev).
    if database_url.startswith("sqlite"):
        return {"check_same_thread": False}
    # For hosted Postgres (e.g., Neon), idle connections can be dropped.
    # TCP keepalives help prevent unexpected disconnects.
    return {
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
    }


def _get_engine_kwargs(database_url: str) -> dict:
    if database_url.startswith("sqlite"):
        return {}
    # Pre-ping replaces dead connections; recycle avoids long-lived idle conns.
    return {
        "pool_pre_ping": True,
        "pool_recycle": 300,
        "pool_timeout": 30,
        "pool_use_lifo": True,
    }

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=_get_connect_args(settings.DATABASE_URL),
    **_get_engine_kwargs(settings.DATABASE_URL),
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
