"""Add room_id to wishlist_items for room-level favourites

Revision ID: 20260429_0007
Revises: 20260428_0006
Create Date: 2026-04-29 00:07:00.000000
"""

from typing import Sequence, Union

from alembic import op

revision: str = "20260429_0007"
down_revision: Union[str, None] = "20260428_0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Make hotel_id nullable — safe to re-run (DROP NOT NULL is a no-op if already nullable)
    op.execute("ALTER TABLE wishlist_items ALTER COLUMN hotel_id DROP NOT NULL")

    # Add room_id column
    op.execute("""
        ALTER TABLE wishlist_items
            ADD COLUMN IF NOT EXISTS room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE
    """)

    # Unique constraint — only create if it doesn't already exist
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint WHERE conname = 'uq_wishlist_user_room'
            ) THEN
                ALTER TABLE wishlist_items
                    ADD CONSTRAINT uq_wishlist_user_room UNIQUE (user_id, room_id);
            END IF;
        END $$
    """)

    # Index
    op.execute("CREATE INDEX IF NOT EXISTS ix_wishlist_items_room_id ON wishlist_items (room_id)")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_wishlist_items_room_id")
    op.execute("""
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM pg_constraint WHERE conname = 'uq_wishlist_user_room'
            ) THEN
                ALTER TABLE wishlist_items DROP CONSTRAINT uq_wishlist_user_room;
            END IF;
        END $$
    """)
    op.execute("ALTER TABLE wishlist_items DROP COLUMN IF EXISTS room_id")
    op.execute("ALTER TABLE wishlist_items ALTER COLUMN hotel_id SET NOT NULL")
