"""add status and submitter_email to testimonials

Revision ID: 20260226_add_testimonial_submission
Revises: 20260226_add_is_active_projects
Create Date: 2026-02-26
"""
from alembic import op
import sqlalchemy as sa

revision = '20260226_add_testimonial_submission'
down_revision = '20260226_add_is_active_projects'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'testimonials',
        sa.Column('status', sa.String(20), nullable=False, server_default='approved'),
    )
    op.add_column(
        'testimonials',
        sa.Column('submitter_email', sa.String(255), nullable=True),
    )


def downgrade():
    op.drop_column('testimonials', 'status')
    op.drop_column('testimonials', 'submitter_email')
