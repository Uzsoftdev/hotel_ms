"""Add email verification and password reset tables; add is_email_verified to users

Existing users get is_email_verified=True so they are not locked out after deploy.

Revision ID: 20260428_0006
Revises: 20260428_0005
Create Date: 2026-04-28 00:06:00.000000
"""

from typing import Sequence, Union

from alembic import op

revision: str = "20260428_0006"
down_revision: Union[str, None] = "20260428_0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── users.is_email_verified ───────────────────────────────────────────────
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN NOT NULL DEFAULT true")

    # ── email_verifications ───────────────────────────────────────────────────
    op.execute("""
        CREATE TABLE IF NOT EXISTS email_verifications (
            id         SERIAL PRIMARY KEY,
            user_id    INTEGER NOT NULL REFERENCES users(id),
            token      VARCHAR NOT NULL UNIQUE,
            expires_at TIMESTAMPTZ NOT NULL,
            used_at    TIMESTAMPTZ
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_email_verifications_user_id ON email_verifications (user_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_email_verifications_token   ON email_verifications (token)")

    # ── password_resets ───────────────────────────────────────────────────────
    op.execute("""
        CREATE TABLE IF NOT EXISTS password_resets (
            id         SERIAL PRIMARY KEY,
            user_id    INTEGER NOT NULL REFERENCES users(id),
            token      VARCHAR NOT NULL UNIQUE,
            expires_at TIMESTAMPTZ NOT NULL,
            used_at    TIMESTAMPTZ
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_password_resets_user_id ON password_resets (user_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_password_resets_token   ON password_resets (token)")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_password_resets_token")
    op.execute("DROP INDEX IF EXISTS ix_password_resets_user_id")
    op.execute("DROP TABLE IF EXISTS password_resets")
    op.execute("DROP INDEX IF EXISTS ix_email_verifications_token")
    op.execute("DROP INDEX IF EXISTS ix_email_verifications_user_id")
    op.execute("DROP TABLE IF EXISTS email_verifications")
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS is_email_verified")
