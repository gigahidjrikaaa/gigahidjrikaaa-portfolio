"""Add blog metadata fields

Revision ID: 20260124_add_blog_metadata
Revises: 20260123_add_blog_content
Create Date: 2026-01-24

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20260124_add_blog_metadata"
down_revision = "20260123_add_blog_content"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("blog_posts", sa.Column("category", sa.String(), nullable=True))
    op.add_column("blog_posts", sa.Column("tags", sa.String(), nullable=True))
    op.add_column("blog_posts", sa.Column("og_image_url", sa.String(), nullable=True))
    op.add_column("blog_posts", sa.Column("seo_title", sa.String(), nullable=True))
    op.add_column("blog_posts", sa.Column("seo_description", sa.Text(), nullable=True))
    op.add_column("blog_posts", sa.Column("seo_keywords", sa.String(), nullable=True))
    op.add_column("blog_posts", sa.Column("reading_time_minutes", sa.Integer(), nullable=True))
    op.add_column("blog_posts", sa.Column("view_count", sa.Integer(), server_default=sa.text("0"), nullable=False))
    op.add_column("blog_posts", sa.Column("like_count", sa.Integer(), server_default=sa.text("0"), nullable=False))


def downgrade() -> None:
    op.drop_column("blog_posts", "like_count")
    op.drop_column("blog_posts", "view_count")
    op.drop_column("blog_posts", "reading_time_minutes")
    op.drop_column("blog_posts", "seo_keywords")
    op.drop_column("blog_posts", "seo_description")
    op.drop_column("blog_posts", "seo_title")
    op.drop_column("blog_posts", "og_image_url")
    op.drop_column("blog_posts", "tags")
    op.drop_column("blog_posts", "category")
