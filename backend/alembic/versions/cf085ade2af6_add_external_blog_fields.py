"""add_external_blog_fields

Revision ID: cf085ade2af6
Revises: 20260130_add_scheduled_publishing
Create Date: 2026-02-24 06:07:25.605732

"""
from alembic import op
import sqlalchemy as sa



# revision identifiers, used by Alembic.
revision = 'cf085ade2af6'
down_revision = '20260130_add_scheduled_publishing'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('blog_posts', sa.Column('is_external', sa.Boolean(), server_default='0', nullable=False))
    op.add_column('blog_posts', sa.Column('external_url', sa.String(), nullable=True))
    op.add_column('blog_posts', sa.Column('external_source', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('blog_posts', 'external_source')
    op.drop_column('blog_posts', 'external_url')
    op.drop_column('blog_posts', 'is_external')
