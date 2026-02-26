"""add social_username to press_mentions

Revision ID: 20260226_add_social_username
Revises: 202602261107
Create Date: 2026-02-26
"""
from alembic import op
import sqlalchemy as sa

revision = '20260226_add_social_username'
down_revision = '202602261107'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'press_mentions',
        sa.Column('social_username', sa.String(100), nullable=True),
    )


def downgrade():
    op.drop_column('press_mentions', 'social_username')
