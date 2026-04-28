"""
Integration test infrastructure.

Real Postgres + Redis instances are spun up via testcontainers for each test
session. The key challenge is that DBSessionMiddleware calls SessionLocal()
directly (bypassing FastAPI's dependency_overrides), so we monkeypatch
SessionLocal at the module level in addition to overriding get_db.

APScheduler is disabled during tests via the TESTING env flag to avoid
background jobs opening extra DB connections.
"""

import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from testcontainers.postgres import PostgresContainer
from testcontainers.redis import RedisContainer

# Must be set before any app module is imported so config picks it up.
os.environ.setdefault("TESTING", "true")


# ── Containers (session-scoped — start once, shared across all tests) ─────────

@pytest.fixture(scope="session")
def pg_container():
    with PostgresContainer("postgres:15") as pg:
        yield pg


@pytest.fixture(scope="session")
def redis_container():
    with RedisContainer("redis:7-alpine") as r:
        yield r


# ── DB engine + schema (session-scoped) ───────────────────────────────────────

@pytest.fixture(scope="session")
def db_engine(pg_container):
    engine = create_engine(pg_container.get_connection_url())

    # Patch the app's config before importing models / Base so Alembic and
    # SQLAlchemy point at the test DB.
    from app.core import config as cfg
    cfg.settings.DATABASE_URL_SYNC = pg_container.get_connection_url()

    from app.core.database import Base
    import app.models.activity_log    # noqa: F401 — ensure all models are registered
    import app.models.amenity         # noqa: F401
    import app.models.blackout_date   # noqa: F401
    import app.models.booking         # noqa: F401
    import app.models.facility        # noqa: F401
    import app.models.hotel           # noqa: F401
    import app.models.hotel_facility  # noqa: F401
    import app.models.hotel_image     # noqa: F401
    import app.models.notification    # noqa: F401
    import app.models.payment         # noqa: F401
    import app.models.pricing_rule    # noqa: F401
    import app.models.review          # noqa: F401
    import app.models.room            # noqa: F401
    import app.models.room_amenity    # noqa: F401
    import app.models.room_image      # noqa: F401
    import app.models.room_type       # noqa: F401
    import app.models.user            # noqa: F401
    import app.models.wishlist        # noqa: F401

    Base.metadata.create_all(engine)
    yield engine
    Base.metadata.drop_all(engine)


# ── Per-test DB session (function-scoped — rolled back after each test) ───────

@pytest.fixture()
def db_session(db_engine) -> Session:
    TestSession = sessionmaker(bind=db_engine)
    session = TestSession()
    yield session
    session.rollback()
    session.close()


# ── TestClient with patched DB + Redis ────────────────────────────────────────

@pytest.fixture()
def client(db_session, monkeypatch, redis_container):
    """
    HTTP test client wired to the real test containers.

    Two patches are needed:
    1. dependency_overrides[get_db] — overrides the Depends(get_db) on endpoints
    2. monkeypatch on app.core.database.SessionLocal — overrides the direct
       SessionLocal() call inside DBSessionMiddleware (which bypasses DI)
    """
    # Patch Redis URL so cache.get_redis() and token_blacklist connect to the
    # test Redis instance.
    monkeypatch.setattr(
        "app.core.config.settings.REDIS_URL",
        redis_container.get_connection_url(),
    )
    # Reset the module-level Redis client so it reconnects to the patched URL.
    import app.services.cache as cache_mod
    monkeypatch.setattr(cache_mod, "_redis_client", None)

    # Patch SessionLocal used by DBSessionMiddleware.
    import app.core.database as db_mod
    test_session_factory = sessionmaker(bind=db_session.bind)
    monkeypatch.setattr(db_mod, "SessionLocal", test_session_factory)
    monkeypatch.setattr(db_mod, "ReadSessionLocal", test_session_factory)

    from app.main import app
    from app.dependencies import get_db, get_read_db

    app.dependency_overrides[get_db] = lambda: db_session
    app.dependency_overrides[get_read_db] = lambda: db_session

    with TestClient(app, raise_server_exceptions=True) as c:
        yield c

    app.dependency_overrides.clear()
