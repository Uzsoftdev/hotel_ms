"""create hotel-related tables

Revision ID: 20260415_0001
Revises:
Create Date: 2026-04-15 00:01:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260415_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "hotels",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("city", sa.String(), nullable=True),
        sa.Column("country", sa.String(), nullable=True),
        sa.Column("country_code", sa.String(length=5), nullable=True),
        sa.Column("phone", sa.String(), nullable=True),
        sa.Column("email", sa.String(), nullable=True),
        sa.Column("latitude", sa.Numeric(precision=10, scale=6), nullable=True),
        sa.Column("longitude", sa.Numeric(precision=10, scale=6), nullable=True),
        sa.Column("rating", sa.Numeric(precision=3, scale=2), nullable=False, server_default="0.0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_hotels_id", "hotels", ["id"], unique=False)
    op.create_index("ix_hotels_city_country", "hotels", ["city", "country"], unique=False)
    op.create_index(
        "ix_hotels_latitude_longitude",
        "hotels",
        ["latitude", "longitude"],
        unique=False,
    )

    op.create_table(
        "facilities",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_facilities_id", "facilities", ["id"], unique=False)

    op.create_table(
        "hotel_images",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("hotel_id", sa.Integer(), nullable=False),
        sa.Column("image_url", sa.Text(), nullable=False),
        sa.Column("is_primary", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.ForeignKeyConstraint(["hotel_id"], ["hotels.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_hotel_images_id", "hotel_images", ["id"], unique=False)

    op.create_table(
        "hotel_facilities",
        sa.Column("hotel_id", sa.Integer(), nullable=False),
        sa.Column("facility_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["facility_id"], ["facilities.id"]),
        sa.ForeignKeyConstraint(["hotel_id"], ["hotels.id"]),
        sa.PrimaryKeyConstraint("hotel_id", "facility_id"),
    )


def downgrade() -> None:
    op.drop_table("hotel_facilities")

    op.drop_index("ix_hotel_images_id", table_name="hotel_images")
    op.drop_table("hotel_images")

    op.drop_index("ix_facilities_id", table_name="facilities")
    op.drop_table("facilities")

    op.drop_index("ix_hotels_latitude_longitude", table_name="hotels")
    op.drop_index("ix_hotels_city_country", table_name="hotels")
    op.drop_index("ix_hotels_id", table_name="hotels")
    op.drop_table("hotels")
