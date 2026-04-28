"""Assign hotel_id to existing admin and staff users who have none

Revision ID: 20260428_0004
Revises: 20260428_0003
Create Date: 2026-04-28 00:04:00.000000
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import text

revision: str = "20260428_0004"
down_revision: Union[str, None] = "20260428_0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    # Get the first hotel id
    result = conn.execute(text("SELECT id FROM hotels ORDER BY id LIMIT 1"))
    row = result.fetchone()
    if row is None:
        return  # No hotel yet — seed hasn't run
    hotel_id = row[0]
    # Assign hotel to admin/staff users that have no hotel_id
    conn.execute(text(
        "UPDATE users SET hotel_id = :hotel_id "
        "WHERE hotel_id IS NULL AND role IN ('super_admin', 'hotel_admin', 'staff')"
    ), {"hotel_id": hotel_id})


def downgrade() -> None:
    pass
