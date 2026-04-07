"""add cv_url to profiles

Revision ID: 20260407_add_profile_cv_url
Revises: 20260228_add_external_post_fields
Create Date: 2026-04-07
"""

from alembic import op
import sqlalchemy as sa


revision = "20260407_add_profile_cv_url"
down_revision = "20260228_add_external_post_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("profiles", sa.Column("cv_url", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("profiles", "cv_url")
