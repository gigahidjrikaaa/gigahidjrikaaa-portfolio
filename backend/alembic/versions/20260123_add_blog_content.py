"""Add blog post content field

Revision ID: 20260123_add_blog_content
Revises: 20250123_add_project_metrics_testimonials
Create Date: 2026-01-23

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20260123_add_blog_content"
down_revision = "20250123_add_project_metrics_testimonials"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("blog_posts", sa.Column("content", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("blog_posts", "content")
