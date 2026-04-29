"""Add room_id to wishlist_items for room-level favourites

Revision ID: 20260429_0007
Revises: 20260428_0006
Create Date: 2026-04-29 00:07:00.000000
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20260429_0007"
down_revision: Union[str, None] = "20260428_0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Make hotel_id nullable so rows can be room-only
    op.alter_column("wishlist_items", "hotel_id", nullable=True)

    # Add room_id column
    op.add_column(
        "wishlist_items",
        sa.Column("room_id", sa.Integer(), sa.ForeignKey("rooms.id", ondelete="CASCADE"), nullable=True),
    )

    # Unique constraint for room-level favourites
    op.create_unique_constraint("uq_wishlist_user_room", "wishlist_items", ["user_id", "room_id"])

    # Index for fast lookups
    op.create_index("ix_wishlist_items_room_id", "wishlist_items", ["room_id"])


def downgrade() -> None:
    op.drop_index("ix_wishlist_items_room_id", table_name="wishlist_items")
    op.drop_constraint("uq_wishlist_user_room", "wishlist_items", type_="unique")
    op.drop_column("wishlist_items", "room_id")
    op.alter_column("wishlist_items", "hotel_id", nullable=False)
