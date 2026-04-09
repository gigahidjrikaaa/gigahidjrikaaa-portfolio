"""add certificate type aware fields

Revision ID: 20260409_add_certificate_type_fields
Revises: 20260408_add_highlighted_github_repos
Create Date: 2026-04-09
"""

from alembic import op
import sqlalchemy as sa


revision = "20260409_add_certificate_type_fields"
down_revision = "20260408_add_highlighted_github_repos"
branch_labels = None
depends_on = None


TABLE_NAME = "certificates"


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not inspector.has_table(TABLE_NAME):
        return

    existing_columns = {column["name"] for column in inspector.get_columns(TABLE_NAME)}

    columns_to_add = [
        (
            "certificate_type",
            sa.Column(
                "certificate_type",
                sa.String(length=50),
                nullable=False,
                server_default=sa.text("'technical'"),
            ),
        ),
        ("custom_type_label", sa.Column("custom_type_label", sa.String(length=120), nullable=True)),
        ("authority", sa.Column("authority", sa.String(length=200), nullable=True)),
        ("expiry_date", sa.Column("expiry_date", sa.String(), nullable=True)),
        ("credential_status", sa.Column("credential_status", sa.String(length=50), nullable=True)),
        ("specialization", sa.Column("specialization", sa.String(length=200), nullable=True)),
        ("level", sa.Column("level", sa.String(length=100), nullable=True)),
        ("result", sa.Column("result", sa.String(length=120), nullable=True)),
        ("learning_hours", sa.Column("learning_hours", sa.Integer(), nullable=True)),
        ("skills", sa.Column("skills", sa.Text(), nullable=True)),
        ("region", sa.Column("region", sa.String(length=120), nullable=True)),
        ("custom_details", sa.Column("custom_details", sa.Text(), nullable=True)),
    ]

    for column_name, column_definition in columns_to_add:
        if column_name not in existing_columns:
            op.add_column(TABLE_NAME, column_definition)

    # Keep legacy rows valid after the new required field is introduced.
    op.execute(sa.text("UPDATE certificates SET certificate_type = 'technical' WHERE certificate_type IS NULL"))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not inspector.has_table(TABLE_NAME):
        return

    existing_columns = {column["name"] for column in inspector.get_columns(TABLE_NAME)}

    columns_to_drop = [
        "custom_details",
        "region",
        "skills",
        "learning_hours",
        "result",
        "level",
        "specialization",
        "credential_status",
        "expiry_date",
        "authority",
        "custom_type_label",
        "certificate_type",
    ]

    for column_name in columns_to_drop:
        if column_name in existing_columns:
            op.drop_column(TABLE_NAME, column_name)
