"""Add scheduled publishing to blog posts

Revision ID: 20260130_add_scheduled_publishing
Revises: 20260130_add_blog_comments
Create Date: 2026-01-30

"""
from alembic import op
import sqlalchemy as sa


revision = '20260130_add_scheduled_publishing'
down_revision = '20260130_add_blog_comments'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('blog_posts', sa.Column('scheduled_at', sa.DateTime(), nullable=True))


def downgrade():
    op.drop_column('blog_posts', 'scheduled_at')
