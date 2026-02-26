"""add is_active to projects

Revision ID: 20260226_add_is_active_projects
Revises: 20260226_add_social_username
Create Date: 2026-02-26
"""
from alembic import op
import sqlalchemy as sa

revision = '20260226_add_is_active_projects'
down_revision = '20260226_add_social_username'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'projects',
        sa.Column('is_active', sa.Boolean(), server_default=sa.false(), nullable=False),
    )


def downgrade():
    op.drop_column('projects', 'is_active')
