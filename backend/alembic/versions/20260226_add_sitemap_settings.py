"""Add sitemap control settings to seo_settings table.

Revision ID: 20260226_add_sitemap_settings
Revises: 20260226_add_analytics
Create Date: 2026-02-26
"""

from alembic import op
import sqlalchemy as sa

revision = '20260226_add_sitemap_settings'
down_revision = '20260226_add_analytics'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('seo_settings', sa.Column('sitemap_home_priority', sa.Float(), nullable=True, server_default='1.0'))
    op.add_column('seo_settings', sa.Column('sitemap_home_changefreq', sa.String(20), nullable=True, server_default='daily'))
    op.add_column('seo_settings', sa.Column('sitemap_blog_enabled', sa.Boolean(), nullable=True, server_default=sa.text('true')))
    op.add_column('seo_settings', sa.Column('sitemap_blog_priority', sa.Float(), nullable=True, server_default='0.9'))
    op.add_column('seo_settings', sa.Column('sitemap_blog_changefreq', sa.String(20), nullable=True, server_default='daily'))
    op.add_column('seo_settings', sa.Column('sitemap_posts_enabled', sa.Boolean(), nullable=True, server_default=sa.text('true')))
    op.add_column('seo_settings', sa.Column('sitemap_posts_priority', sa.Float(), nullable=True, server_default='0.8'))
    op.add_column('seo_settings', sa.Column('sitemap_posts_changefreq', sa.String(20), nullable=True, server_default='monthly'))
    op.add_column('seo_settings', sa.Column('sitemap_custom_pages', sa.Text(), nullable=True))


def downgrade():
    op.drop_column('seo_settings', 'sitemap_home_priority')
    op.drop_column('seo_settings', 'sitemap_home_changefreq')
    op.drop_column('seo_settings', 'sitemap_blog_enabled')
    op.drop_column('seo_settings', 'sitemap_blog_priority')
    op.drop_column('seo_settings', 'sitemap_blog_changefreq')
    op.drop_column('seo_settings', 'sitemap_posts_enabled')
    op.drop_column('seo_settings', 'sitemap_posts_priority')
    op.drop_column('seo_settings', 'sitemap_posts_changefreq')
    op.drop_column('seo_settings', 'sitemap_custom_pages')
