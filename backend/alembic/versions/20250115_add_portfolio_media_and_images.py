"""Add portfolio media, profile, settings, and project images

Revision ID: 20250115_add_portfolio_media
Revises: 
Create Date: 2025-01-15

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20250115_add_portfolio_media"
down_revision = "20250114_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # New tables
    op.create_table(
        "profiles",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("full_name", sa.String(), nullable=True),
        sa.Column("headline", sa.String(), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("location", sa.String(), nullable=True),
        sa.Column("availability", sa.String(), nullable=True),
        sa.Column("avatar_url", sa.String(), nullable=True),
        sa.Column("resume_url", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP")),
    )

    op.create_table(
        "site_settings",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("email", sa.String(), nullable=True),
        sa.Column("phone", sa.String(), nullable=True),
        sa.Column("github_url", sa.String(), nullable=True),
        sa.Column("linkedin_url", sa.String(), nullable=True),
        sa.Column("twitter_url", sa.String(), nullable=True),
        sa.Column("instagram_url", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP")),
    )

    op.create_table(
        "seo_settings",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("site_title", sa.String(), nullable=True),
        sa.Column("site_description", sa.Text(), nullable=True),
        sa.Column("keywords", sa.String(), nullable=True),
        sa.Column("og_image_url", sa.String(), nullable=True),
        sa.Column("canonical_url", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP")),
    )

    op.create_table(
        "media_assets",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("title", sa.String(), nullable=True),
        sa.Column("alt_text", sa.String(), nullable=True),
        sa.Column("url", sa.String(), nullable=False),
        sa.Column("public_id", sa.String(), nullable=True),
        sa.Column("provider", sa.String(), nullable=True),
        sa.Column("folder", sa.String(), nullable=True),
        sa.Column("tags", sa.String(), nullable=True),
        sa.Column("asset_type", sa.String(), nullable=True),
        sa.Column("width", sa.Integer(), nullable=True),
        sa.Column("height", sa.Integer(), nullable=True),
        sa.Column("size_bytes", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP")),
    )

    op.create_table(
        "project_images",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("project_id", sa.Integer(), sa.ForeignKey("projects.id"), nullable=False),
        sa.Column("url", sa.String(), nullable=False),
        sa.Column("kind", sa.String(), nullable=True),
        sa.Column("caption", sa.String(), nullable=True),
        sa.Column("display_order", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP")),
    )

    # Add new columns to existing tables
    op.add_column("projects", sa.Column("thumbnail_url", sa.String(), nullable=True))
    op.add_column("projects", sa.Column("ui_image_url", sa.String(), nullable=True))

    op.add_column("experience", sa.Column("company_logo_url", sa.String(), nullable=True))
    op.add_column("education", sa.Column("institution_logo_url", sa.String(), nullable=True))
    op.add_column("skills", sa.Column("icon_url", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("skills", "icon_url")
    op.drop_column("education", "institution_logo_url")
    op.drop_column("experience", "company_logo_url")
    op.drop_column("projects", "ui_image_url")
    op.drop_column("projects", "thumbnail_url")

    op.drop_table("project_images")
    op.drop_table("media_assets")
    op.drop_table("seo_settings")
    op.drop_table("site_settings")
    op.drop_table("profiles")
