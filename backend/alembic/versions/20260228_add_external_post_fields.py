"""Add external post fields (is_external, external_url, external_source) to blog_posts

Revision ID: 20260228_add_external_post_fields
Revises: 20260130_add_scheduled_publishing
Create Date: 2026-02-28

"""
from alembic import op
import sqlalchemy as sa

revision = "20260228_add_external_post_fields"
down_revision = "20260228_edu_bg"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Columns may already exist if added manually; use IF NOT EXISTS to be safe
    op.execute("ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS is_external BOOLEAN NOT NULL DEFAULT false")
    op.execute("ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS external_url VARCHAR")
    op.execute("ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS external_source VARCHAR")


def downgrade() -> None:
    op.drop_column("blog_posts", "external_source")
    op.drop_column("blog_posts", "external_url")
    op.drop_column("blog_posts", "is_external")
