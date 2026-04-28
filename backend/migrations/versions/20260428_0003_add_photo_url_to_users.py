"""Add photo_url to users table

Revision ID: 20260428_0003
Revises: 20260427_0002
Create Date: 2026-04-28 00:03:00.000000
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "20260428_0003"
down_revision: Union[str, None] = "20260427_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url VARCHAR")


def downgrade() -> None:
    op.drop_column("users", "photo_url")
