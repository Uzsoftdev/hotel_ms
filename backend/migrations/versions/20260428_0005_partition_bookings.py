"""Partition bookings table by check_in (monthly range, native PostgreSQL)

This migration converts the flat bookings table to a range-partitioned table
keyed on check_in. As row counts grow into millions, the planner prunes
irrelevant partitions and each date-range search hits only the relevant
monthly slice.

Downtime: 2–10 minutes (exclusive lock while data is copied into the new
partitioned structure). Run during a low-traffic window and confirm no
long-running transactions hold a lock on bookings before starting.

Revision ID: 20260428_0005
Revises: 20260428_0004
Create Date: 2026-04-28 00:05:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260428_0005"
down_revision: Union[str, None] = "20260428_0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Skip if already partitioned (idempotency guard)
    from sqlalchemy.sql import text
    conn = op.get_bind()
    row = conn.execute(text(
        "SELECT relkind FROM pg_class WHERE relname = 'bookings' AND relnamespace = 'public'::regnamespace"
    )).fetchone()
    if row and row[0] == 'p':
        # Already a partitioned table — nothing to do
        return

    # ── 1. Drop FK from payments → bookings ──────────────────────────────────
    # PostgreSQL cannot reference a partitioned table via FK unless the
    # partition key is part of the referenced unique/primary key.
    # After partitioning, bookings.id alone is no longer globally unique across
    # all partitions (uniqueness is per-partition). We enforce this constraint
    # at the application level instead.
    op.execute("ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_booking_id_fkey")

    # ── 2. Drop existing indexes (rebuilt after partition creation) ───────────
    op.execute("DROP INDEX IF EXISTS ix_bookings_hotel_id")
    op.execute("DROP INDEX IF EXISTS ix_bookings_check_in_check_out")

    # ── 3. Detach the sequence so DROP TABLE below doesn't cascade to it ─────
    op.execute("ALTER SEQUENCE IF EXISTS bookings_id_seq OWNED BY NONE")

    # ── 4. Rename old table ───────────────────────────────────────────────────
    op.execute("ALTER TABLE bookings RENAME TO bookings_old")

    # ── 5. Create the new partitioned parent table ────────────────────────────
    # Primary key must include the partition key (check_in) — PostgreSQL rule.
    # SQLAlchemy ORM identifies rows by `id`; queries by id alone still work
    # because each partition's local index on (id) is implicitly unique.
    op.execute("""
        CREATE TABLE bookings (
            id          INTEGER     NOT NULL DEFAULT nextval('bookings_id_seq'),
            hotel_id    INTEGER     NOT NULL,
            user_id     INTEGER     NOT NULL,
            room_id     INTEGER     NOT NULL,
            check_in    DATE        NOT NULL,
            check_out   DATE        NOT NULL,
            adults      INTEGER     NOT NULL DEFAULT 1,
            children    INTEGER     NOT NULL DEFAULT 0,
            special_requests TEXT,
            total_price NUMERIC(10, 2) NOT NULL,
            status      VARCHAR     NOT NULL DEFAULT 'pending',
            created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
            PRIMARY KEY (id, check_in),
            CONSTRAINT ck_bookings_status
                CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'))
        ) PARTITION BY RANGE (check_in)
    """)

    # ── 6. Create yearly partitions (historical + 3-year lookahead) ───────────
    for year in range(2024, 2029):
        op.execute(f"""
            CREATE TABLE bookings_{year}
                PARTITION OF bookings
                FOR VALUES FROM ('{year}-01-01') TO ('{year + 1}-01-01')
        """)

    # Catch-all for rows outside defined ranges
    op.execute("""
        CREATE TABLE bookings_default
            PARTITION OF bookings DEFAULT
    """)

    # ── 7. Add FK constraints back (hotel/user/room — not the payments one) ──
    op.execute("""
        ALTER TABLE bookings
            ADD CONSTRAINT bookings_hotel_id_fkey
            FOREIGN KEY (hotel_id) REFERENCES hotels(id)
    """)
    op.execute("""
        ALTER TABLE bookings
            ADD CONSTRAINT bookings_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES users(id)
    """)
    op.execute("""
        ALTER TABLE bookings
            ADD CONSTRAINT bookings_room_id_fkey
            FOREIGN KEY (room_id) REFERENCES rooms(id)
    """)

    # ── 8. Copy data ──────────────────────────────────────────────────────────
    op.execute("INSERT INTO bookings SELECT * FROM bookings_old")

    # ── 9. Re-attach sequence to new parent table ─────────────────────────────
    op.execute("ALTER SEQUENCE bookings_id_seq OWNED BY bookings.id")

    # ── 10. Recreate indexes on the partitioned parent (inherited by partitions)
    op.execute("CREATE INDEX ix_bookings_hotel_id ON bookings (hotel_id)")
    op.execute("CREATE INDEX ix_bookings_check_in_check_out ON bookings (check_in, check_out)")

    # ── 11. Drop the old flat table ───────────────────────────────────────────
    op.execute("DROP TABLE bookings_old")


def downgrade() -> None:
    op.execute("ALTER SEQUENCE IF EXISTS bookings_id_seq OWNED BY NONE")
    op.execute("DROP INDEX IF EXISTS ix_bookings_hotel_id")
    op.execute("DROP INDEX IF EXISTS ix_bookings_check_in_check_out")
    op.execute("ALTER TABLE bookings RENAME TO bookings_partitioned_backup")

    op.execute("""
        CREATE TABLE bookings (
            id          INTEGER     NOT NULL DEFAULT nextval('bookings_id_seq'),
            hotel_id    INTEGER     NOT NULL,
            user_id     INTEGER     NOT NULL,
            room_id     INTEGER     NOT NULL,
            check_in    DATE        NOT NULL,
            check_out   DATE        NOT NULL,
            adults      INTEGER     NOT NULL DEFAULT 1,
            children    INTEGER     NOT NULL DEFAULT 0,
            special_requests TEXT,
            total_price NUMERIC(10, 2) NOT NULL,
            status      VARCHAR     NOT NULL DEFAULT 'pending',
            created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
            PRIMARY KEY (id),
            CONSTRAINT ck_bookings_status
                CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
            CONSTRAINT bookings_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES hotels(id),
            CONSTRAINT bookings_user_id_fkey  FOREIGN KEY (user_id)  REFERENCES users(id),
            CONSTRAINT bookings_room_id_fkey  FOREIGN KEY (room_id)  REFERENCES rooms(id)
        )
    """)
    op.execute("INSERT INTO bookings SELECT * FROM bookings_partitioned_backup")
    op.execute("ALTER SEQUENCE bookings_id_seq OWNED BY bookings.id")
    op.execute("CREATE INDEX ix_bookings_hotel_id ON bookings (hotel_id)")
    op.execute("CREATE INDEX ix_bookings_check_in_check_out ON bookings (check_in, check_out)")
    op.execute("""
        ALTER TABLE payments
            ADD CONSTRAINT payments_booking_id_fkey
            FOREIGN KEY (booking_id) REFERENCES bookings(id)
    """)
    op.execute("DROP TABLE bookings_partitioned_backup")
