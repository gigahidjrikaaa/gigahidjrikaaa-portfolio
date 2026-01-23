"""Add featured flag to blog posts

Revision ID: 20260124_add_blog_featured
Revises: 20260124_add_blog_metadata
Create Date: 2026-01-24

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20260124_add_blog_featured"
down_revision = "20260124_add_blog_metadata"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "blog_posts",
        sa.Column("is_featured", sa.Boolean(), server_default=sa.text("false"), nullable=False),
    )


def downgrade() -> None:
    op.drop_column("blog_posts", "is_featured")
