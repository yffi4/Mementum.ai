"""Add note analysis fields

Revision ID: add_note_analysis_fields
Revises: 6ce5506598f1
Create Date: 2025-06-26 15:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_note_analysis_fields'
down_revision: Union[str, None] = '6ce5506598f1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add analysis fields to notes table."""
    op.add_column('notes', sa.Column('category', sa.String(length=100), nullable=True))
    op.add_column('notes', sa.Column('importance', sa.Integer(), nullable=True, default=1))
    op.add_column('notes', sa.Column('tags', sa.Text(), nullable=True))
    op.add_column('notes', sa.Column('summary', sa.Text(), nullable=True))


def downgrade() -> None:
    """Remove analysis fields from notes table."""
    op.drop_column('notes', 'summary')
    op.drop_column('notes', 'tags')
    op.drop_column('notes', 'importance')
    op.drop_column('notes', 'category') 