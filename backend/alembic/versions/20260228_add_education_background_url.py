"""add institution_background_url to education

Revision ID: 20260228_edu_bg
Revises: 
Create Date: 2026-02-28

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '20260228_edu_bg'
down_revision = '20260226_add_sitemap_settings'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'education',
        sa.Column('institution_background_url', sa.String(), nullable=True),
    )


def downgrade():
    op.drop_column('education', 'institution_background_url')
