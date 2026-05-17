"""Add guest/staff extended fields to users table

Revision ID: 20260517_0008
Revises: 20260429_0007
Create Date: 2026-05-17 12:00:00.000000
"""
from typing import Sequence, Union
from alembic import op

revision: str = "20260517_0008"
down_revision: Union[str, None] = "20260429_0007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT false")
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_reason VARCHAR")
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS vip_status BOOLEAN NOT NULL DEFAULT false")
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS loyalty_points INTEGER NOT NULL DEFAULT 0")
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS loyalty_tier VARCHAR NOT NULL DEFAULT 'bronze'")
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS notes VARCHAR")
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR")


def downgrade() -> None:
    for col in ["is_banned", "ban_reason", "vip_status", "loyalty_points", "loyalty_tier", "notes", "department"]:
        op.drop_column("users", col)
