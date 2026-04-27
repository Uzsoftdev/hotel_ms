"""Add guest count + cancellation policy to bookings and room_types

Revision ID: 20260427_0002
Revises: 20260415_0001
Create Date: 2026-04-27 00:02:00.000000
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "20260427_0002"
down_revision: Union[str, None] = "20260415_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add guest count columns to bookings
    op.add_column("bookings", sa.Column("adults",   sa.Integer(), nullable=False, server_default="1"))
    op.add_column("bookings", sa.Column("children", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("bookings", sa.Column("special_requests", sa.Text(), nullable=True))

    # Add cancellation policy to room_types
    op.add_column(
        "room_types",
        sa.Column(
            "cancellation_policy",
            sa.String(length=30),
            nullable=False,
            server_default="free_cancellation",
        ),
    )
    op.create_check_constraint(
        "ck_room_types_cancellation_policy",
        "room_types",
        "cancellation_policy IN ('free_cancellation', 'non_refundable', 'partial_refund')",
    )

    # Index for guest count queries
    op.create_index("ix_bookings_adults", "bookings", ["adults"])


def downgrade() -> None:
    op.drop_index("ix_bookings_adults", table_name="bookings")
    op.drop_constraint("ck_room_types_cancellation_policy", "room_types", type_="check")
    op.drop_column("room_types", "cancellation_policy")
    op.drop_column("bookings", "special_requests")
    op.drop_column("bookings", "children")
    op.drop_column("bookings", "adults")
