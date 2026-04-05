# -*- mode: python; -*-
"""Add gmail_processed_message_ids to integrations

Revision ID: a1b2c3d4e5f6
Revises: 02430cd6fed1
Create Date: 2026-04-05

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f6"
down_revision: str = "02430cd6fed1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "integrations",
        sa.Column("gmail_processed_message_ids", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("integrations", "gmail_processed_message_ids")
