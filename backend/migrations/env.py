"""Alembic environment — auto-migration against SQLAlchemy metadata."""

import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.core.config import settings  # noqa: E402
from app.core.database import Base    # noqa: E402

# Import every model so Alembic sees the full metadata
import app.models.activity_log    # noqa: F401
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

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Use sync URL for Alembic; fall back to stripping +asyncpg from DATABASE_URL
_sync_url = settings.DATABASE_URL_SYNC or settings.DATABASE_URL.replace(
    "postgresql+asyncpg://", "postgresql://"
)
config.set_main_option("sqlalchemy.url", _sync_url)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
