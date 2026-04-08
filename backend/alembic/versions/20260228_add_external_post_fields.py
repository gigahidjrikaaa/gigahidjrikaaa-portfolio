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
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_columns = {column["name"] for column in inspector.get_columns("blog_posts")}

    if "is_external" not in existing_columns:
        op.add_column(
            "blog_posts",
            sa.Column("is_external", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        )
    if "external_url" not in existing_columns:
        op.add_column("blog_posts", sa.Column("external_url", sa.String(), nullable=True))
    if "external_source" not in existing_columns:
        op.add_column("blog_posts", sa.Column("external_source", sa.String(), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_columns = {column["name"] for column in inspector.get_columns("blog_posts")}

    if "external_source" in existing_columns:
        op.drop_column("blog_posts", "external_source")
    if "external_url" in existing_columns:
        op.drop_column("blog_posts", "external_url")
    if "is_external" in existing_columns:
        op.drop_column("blog_posts", "is_external")
