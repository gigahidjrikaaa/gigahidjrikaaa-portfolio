"""Add account lockout fields to User model

Revision ID: 20260130_add_account_lockout
Revises: 20260124_add_blog_featured
Create Date: 2026-01-30

"""
from alembic import op
import sqlalchemy as sa


revision = '20260130_add_account_lockout'
down_revision = '20260124_add_blog_featured'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('last_login', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('failed_login_attempts', sa.Integer(), default=0))
    op.add_column('users', sa.Column('locked_until', sa.DateTime(), nullable=True))


def downgrade():
    op.drop_column('users', 'locked_until')
    op.drop_column('users', 'failed_login_attempts')
    op.drop_column('users', 'last_login')