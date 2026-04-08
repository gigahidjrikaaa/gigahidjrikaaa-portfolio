"""add highlighted github repositories

Revision ID: 20260408_add_highlighted_github_repos
Revises: 20260407_add_profile_cv_url
Create Date: 2026-04-08
"""

from alembic import op
import sqlalchemy as sa


revision = "20260408_add_highlighted_github_repos"
down_revision = "20260407_add_profile_cv_url"
branch_labels = None
depends_on = None


def upgrade() -> None:
    table_name = "highlighted_github_repos"
    repo_name_index = "ix_highlighted_github_repos_repo_name"
    owner_repo_uq = "uq_highlighted_github_repos_owner_repo"

    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not inspector.has_table(table_name):
        op.create_table(
            table_name,
            sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
            sa.Column("owner", sa.String(length=100), nullable=False, server_default=sa.text("'gigahidjrikaaa'")),
            sa.Column("repo_name", sa.String(length=200), nullable=False),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
            sa.Column("display_order", sa.Integer(), nullable=False, server_default=sa.text("0")),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.UniqueConstraint("owner", "repo_name", name=owner_repo_uq),
        )
        inspector = sa.inspect(bind)

    existing_indexes = {idx["name"] for idx in inspector.get_indexes(table_name)}
    if repo_name_index not in existing_indexes:
        op.create_index(repo_name_index, table_name, ["repo_name"])

    existing_constraints = {uq["name"] for uq in inspector.get_unique_constraints(table_name)}
    if owner_repo_uq not in existing_constraints:
        op.create_unique_constraint(owner_repo_uq, table_name, ["owner", "repo_name"])


def downgrade() -> None:
    table_name = "highlighted_github_repos"
    repo_name_index = "ix_highlighted_github_repos_repo_name"

    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not inspector.has_table(table_name):
        return

    existing_indexes = {idx["name"] for idx in inspector.get_indexes(table_name)}
    if repo_name_index in existing_indexes:
        op.drop_index(repo_name_index, table_name=table_name)

    op.drop_table(table_name)
