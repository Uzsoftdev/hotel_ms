"""Fix rooms.is_active — add server default and backfill NULLs

Without server_default, rooms inserted via raw SQL (or early migrations) could
have is_active=NULL. The occupancy report filtered Room.is_active == True which
excluded those rows, causing total_rooms to appear lower than expected.

Revision ID: 20260518_0009
Revises: 20260517_0008
Create Date: 2026-05-18 00:09:00.000000
"""

from typing import Sequence, Union

from alembic import op

revision: str = "20260518_0009"
down_revision: Union[str, None] = "20260517_0008"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Backfill any NULL values to true (rooms default to active)
    op.execute("UPDATE rooms SET is_active = true WHERE is_active IS NULL")
    # Set the column-level default so future raw inserts also get true
    op.execute("ALTER TABLE rooms ALTER COLUMN is_active SET DEFAULT true")


def downgrade() -> None:
    op.execute("ALTER TABLE rooms ALTER COLUMN is_active DROP DEFAULT")
