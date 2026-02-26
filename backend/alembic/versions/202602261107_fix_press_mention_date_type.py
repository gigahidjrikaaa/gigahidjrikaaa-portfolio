"""fix press_mentions publication_date to String

Revision ID: 202602261107
Revises: 20260224_add_new_social_proof_tables
Create Date: 2026-02-26T11:07:21.780432
"""
from alembic import op
import sqlalchemy as sa

revision = '202602261107'
down_revision = '20260224_add_new_social_proof_tables'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Change publication_date from TIMESTAMP to VARCHAR(20) so YYYY-MM-DD strings work
    op.alter_column(
        'press_mentions',
        'publication_date',
        type_=sa.String(length=20),
        existing_type=sa.DateTime(),
        existing_nullable=True,
        postgresql_using="publication_date::text",
    )


def downgrade() -> None:
    op.alter_column(
        'press_mentions',
        'publication_date',
        type_=sa.DateTime(),
        existing_type=sa.String(length=20),
        existing_nullable=True,
        postgresql_using="publication_date::timestamp",
    )
