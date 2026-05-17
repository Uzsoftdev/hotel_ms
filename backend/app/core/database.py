from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

_sync_url = settings.DATABASE_URL_SYNC or settings.DATABASE_URL.replace(
    "postgresql+asyncpg://", "postgresql://"
)

# Write engine — goes through PgBouncer to the primary when DATABASE_URL_PRIMARY
# is set; falls back to the direct primary URL for local dev.
_write_url = settings.DATABASE_URL_PRIMARY or _sync_url
engine = create_engine(
    _write_url,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

# Read engine — routes to the replica(s) via PgBouncer when DATABASE_URL_REPLICA
# is set; falls back to the write engine so local dev needs no extra config.
_read_url = settings.DATABASE_URL_REPLICA or _write_url
read_engine = create_engine(
    _read_url,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
ReadSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=read_engine)


class Base(DeclarativeBase):
    pass


def get_session() -> Session:
    return SessionLocal()
