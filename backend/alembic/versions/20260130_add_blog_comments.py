"""Add blog comments model

Revision ID: 20260130_add_blog_comments
Revises: 20260130_add_account_lockout
Create Date: 2026-01-30

"""
from alembic import op
import sqlalchemy as sa


revision = '20260130_add_blog_comments'
down_revision = '20260130_add_account_lockout'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'blog_comments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('post_id', sa.Integer(), nullable=False),
        sa.Column('author_name', sa.String(length=100), nullable=False),
        sa.Column('author_email', sa.String(length=255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('parent_id', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['post_id'], ['blog_posts.id']),
        sa.ForeignKeyConstraint(['parent_id'], ['blog_comments.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_blog_comments_post_id', 'blog_comments', ['post_id'])
    op.create_index('ix_blog_comments_status', 'blog_comments', ['status'])


def downgrade():
    op.drop_index('ix_blog_comments_status', 'blog_comments')
    op.drop_index('ix_blog_comments_post_id', 'blog_comments')
    op.drop_table('blog_comments')
