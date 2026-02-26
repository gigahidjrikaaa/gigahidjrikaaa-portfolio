"""Add page_visits analytics table.

Revision ID: 20260226_add_analytics
Revises: 20260226_add_testimonial_submission
Create Date: 2026-02-26
"""

from alembic import op
import sqlalchemy as sa

revision = "20260226_add_analytics"
down_revision = "20260226_add_testimonial_submission"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "page_visits",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("session_id", sa.String(64), nullable=False, index=True),
        sa.Column("ip_hash", sa.String(64), nullable=False),
        sa.Column("country_code", sa.String(5), nullable=True),
        sa.Column("country_name", sa.String(100), nullable=True),
        sa.Column("region", sa.String(100), nullable=True),
        sa.Column("city", sa.String(100), nullable=True),
        sa.Column("lat", sa.Float(), nullable=True),
        sa.Column("lon", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("last_seen", sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index("ix_page_visits_created_at", "page_visits", ["created_at"])
    op.create_index("ix_page_visits_country_code", "page_visits", ["country_code"])


def downgrade() -> None:
    op.drop_index("ix_page_visits_country_code", "page_visits")
    op.drop_index("ix_page_visits_created_at", "page_visits")
    op.drop_table("page_visits")
