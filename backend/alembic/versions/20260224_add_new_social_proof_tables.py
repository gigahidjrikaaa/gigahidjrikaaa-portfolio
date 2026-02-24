"""add_new_social_proof_tables

Revision ID: 20260224_add_new_social_proof_tables
Revises: 
Create Date: 2026-02-24 08:00:00.000000

"""
from alembic import op
import sqlalchemy as sa



# revision identifiers, used by Alembic.
revision = '20260224_add_new_social_proof_tables'
down_revision = 'cf085ade2af6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Stories table
    op.create_table(
        'stories',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('title', sa.String(200), nullable=True),
        sa.Column('caption', sa.Text(), nullable=True),
        sa.Column('image_url', sa.String(1000), nullable=False),
        sa.Column('thumbnail_url', sa.String(1000), nullable=True),
        sa.Column('is_featured', sa.Boolean(), server_default='0'),
        sa.Column('display_order', sa.Integer(), server_default='0'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Clients table
    op.create_table(
        'clients',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('logo_url', sa.String(1000), nullable=False),
        sa.Column('website_url', sa.String(500), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_featured', sa.Boolean(), server_default='0'),
        sa.Column('display_order', sa.Integer(), server_default='0'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Press mentions table
    op.create_table(
        'press_mentions',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('publication', sa.String(200), nullable=True),
        sa.Column('publication_url', sa.String(500), nullable=True),
        sa.Column('publication_date', sa.DateTime(), nullable=True),
        sa.Column('excerpt', sa.Text(), nullable=True),
        sa.Column('image_url', sa.String(1000), nullable=True),
        sa.Column('is_featured', sa.Boolean(), server_default='0'),
        sa.Column('display_order', sa.Integer(), server_default='0'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Currently working on table
    op.create_table(
        'currently_working_on',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('project_url', sa.String(500), nullable=True),
        sa.Column('status', sa.String(20), nullable=False),
        sa.Column('progress_percentage', sa.Integer(), nullable=True),
        sa.Column('tags', sa.String(500), nullable=True),
        sa.Column('is_public', sa.Boolean(), server_default='1'),
        sa.Column('display_order', sa.Integer(), server_default='0'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('currently_working_on')
    op.drop_table('press_mentions')
    op.drop_table('clients')
    op.drop_table('stories')
