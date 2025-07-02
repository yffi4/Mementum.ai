"""empty message

Revision ID: 932112b19d54
Revises: 26a554eaa0d6
Create Date: 2025-07-02 13:48:43.037108

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '932112b19d54'
down_revision: Union[str, None] = '26a554eaa0d6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Добавляем поля для AI обработки
    op.add_column('notes', sa.Column('ai_processed', sa.Boolean(), nullable=True, default=False))
    op.add_column('notes', sa.Column('ai_processed_at', sa.DateTime(), nullable=True))
    op.add_column('notes', sa.Column('ai_summary', sa.Text(), nullable=True))
    op.add_column('notes', sa.Column('ai_keywords', postgresql.ARRAY(sa.String()), nullable=True))
    
    # Создаем индекс для необработанных заметок
    op.create_index('idx_notes_ai_unprocessed', 'notes', ['ai_processed'], postgresql_where=(sa.text('ai_processed IS FALSE OR ai_processed IS NULL')))


def downgrade() -> None:
    # Удаляем индекс
    op.drop_index('idx_notes_ai_unprocessed', table_name='notes')
    
    # Удаляем колонки
    op.drop_column('notes', 'ai_keywords')
    op.drop_column('notes', 'ai_summary')
    op.drop_column('notes', 'ai_processed_at')
    op.drop_column('notes', 'ai_processed') 
