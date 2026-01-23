"""Add project metrics fields and testimonials

Revision ID: 20250123_add_project_metrics_testimonials
Revises: 20250115_add_awards_services_blog
Create Date: 2026-01-23

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20250123_add_project_metrics_testimonials"
down_revision = "20250115_add_awards_services_blog"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new project metrics fields
    op.add_column("projects", sa.Column("metrics_users", sa.String(), nullable=True))
    op.add_column("projects", sa.Column("metrics_performance", sa.String(), nullable=True))
    op.add_column("projects", sa.Column("metrics_impact", sa.String(), nullable=True))
    op.add_column("projects", sa.Column("solo_contributions", sa.Text(), nullable=True))
    op.add_column("projects", sa.Column("tech_decisions", sa.Text(), nullable=True))

    # Create testimonials table
    op.create_table(
        "testimonials",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column("company", sa.String(), nullable=True),
        sa.Column("avatar_url", sa.String(), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=True),
        sa.Column("project_relation", sa.String(), nullable=True),
        sa.Column("linkedin_url", sa.String(), nullable=True),
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("display_order", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP")),
    )


def downgrade() -> None:
    op.drop_table("testimonials")

    op.drop_column("projects", "tech_decisions")
    op.drop_column("projects", "solo_contributions")
    op.drop_column("projects", "metrics_impact")
    op.drop_column("projects", "metrics_performance")
    op.drop_column("projects", "metrics_users")
