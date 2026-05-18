"""Add guest intelligence fields and guest_notes table

Adds risk_score and segment columns to users table.
Creates guest_notes table for structured per-guest notes with author tracking.

Revision ID: 20260518_0010
Revises: 20260518_0009
Create Date: 2026-05-18 00:10:00.000000
"""

from typing import Sequence, Union

from alembic import op

revision: str = "20260518_0010"
down_revision: Union[str, None] = "20260518_0009"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── users: add risk_score and segment ────────────────────────────────────
    op.execute(
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS risk_score INTEGER NOT NULL DEFAULT 0"
    )
    op.execute(
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS segment VARCHAR"
    )

    # ── guest_notes table ────────────────────────────────────────────────────
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS guest_notes (
            id          SERIAL PRIMARY KEY,
            user_id     INTEGER NOT NULL
                            REFERENCES users(id) ON DELETE CASCADE,
            author_id   INTEGER
                            REFERENCES users(id) ON DELETE SET NULL,
            content     TEXT NOT NULL,
            note_type   VARCHAR NOT NULL DEFAULT 'general',
            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        """
    )

    # ── index on guest_notes(user_id) ─────────────────────────────────────
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_indexes
                WHERE tablename = 'guest_notes'
                  AND indexname = 'ix_guest_notes_user_id'
            ) THEN
                CREATE INDEX ix_guest_notes_user_id ON guest_notes(user_id);
            END IF;
        END
        $$;
        """
    )


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS guest_notes")
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS segment")
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS risk_score")
