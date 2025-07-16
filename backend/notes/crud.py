from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime

from models import Note, NoteConnection, User
from .schemas import NoteCreate, NoteUpdate, NoteConnectionCreate


# CRUD операции для Note
async def create_note(db: AsyncSession, note: NoteCreate, user_id: int) -> Note:
    """Создать новую заметку"""
    db_note = Note(
        content=note.content,
        title=note.title,
        user_id=user_id
    )
    db.add(db_note)
    await db.commit()
    await db.refresh(db_note)
    return db_note


async def get_note(db: AsyncSession, note_id: int, user_id: int) -> Optional[Note]:
    """Получить заметку по ID (только для владельца)"""
    result = await db.execute(
        select(Note).filter(Note.id == note_id, Note.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def get_note_with_connections(db: AsyncSession, note_id: int, user_id: int) -> Optional[Note]:
    """Получить заметку с её связями"""
    result = await db.execute(
        select(Note)
        .options(
            selectinload(Note.connections_as_a),
            selectinload(Note.connections_as_b)
        )
        .filter(Note.id == note_id, Note.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def get_user_notes(db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100) -> List[Note]:
    """Получить все заметки пользователя с пагинацией"""
    result = await db.execute(
        select(Note)
        .filter(Note.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .order_by(Note.created_at.desc())
    )
    return result.scalars().all()


async def update_note(db: AsyncSession, note_id: int, user_id: int, note_update: NoteUpdate) -> Optional[Note]:
    """Обновить заметку"""
    # Сначала проверяем, что заметка принадлежит пользователю
    db_note = await get_note(db, note_id, user_id)
    if not db_note:
        return None
    
    # Обновляем только переданные поля
    update_data = note_update.dict(exclude_unset=True)
    if update_data:
        await db.execute(
            update(Note)
            .where(Note.id == note_id, Note.user_id == user_id)
            .values(**update_data)
        )
        await db.commit()
        await db.refresh(db_note)
    
    return db_note


async def delete_note(db: AsyncSession, note_id: int, user_id: int) -> bool:
    """Удалить заметку принудительно, игнорируя связи"""
    db_note = await get_note(db, note_id, user_id)
    if not db_note:
        return False
    
    # Принудительно удаляем все связи, где заметка является note_a или note_b
    await db.execute(
        delete(NoteConnection).where(
            (NoteConnection.note_a_id == note_id) | (NoteConnection.note_b_id == note_id)
        )
    )
    
    # Удаляем заметку
    await db.delete(db_note)
    await db.commit()
    return True


async def search_notes(db: AsyncSession, user_id: int, search_term: str, skip: int = 0, limit: int = 100) -> List[Note]:
    """Поиск заметок по содержимому"""
    result = await db.execute(
        select(Note)
        .filter(
            Note.user_id == user_id,
            Note.content.ilike(f"%{search_term}%")
        )
        .offset(skip)
        .limit(limit)
        .order_by(Note.created_at.desc())
    )
    return result.scalars().all()


# CRUD операции для NoteConnection
async def create_connection(db: AsyncSession, note_a_id: int, connection: NoteConnectionCreate, user_id: int) -> Optional[NoteConnection]:
    """Создать связь между заметками"""
    # Проверяем, что обе заметки принадлежат пользователю
    note_a = await get_note(db, note_a_id, user_id)
    note_b = await get_note(db, connection.note_b_id, user_id)
    
    if not note_a or not note_b:
        return None
    
    # Проверяем, что связь не существует
    existing_connection = await db.execute(
        select(NoteConnection).filter(
            NoteConnection.note_a_id == note_a_id,
            NoteConnection.note_b_id == connection.note_b_id
        )
    )
    if existing_connection.scalar_one_or_none():
        return None
    
    db_connection = NoteConnection(
        note_a_id=note_a_id,
        note_b_id=connection.note_b_id,
        relation=connection.relation
    )
    db.add(db_connection)
    await db.commit()
    await db.refresh(db_connection)
    return db_connection


async def get_note_connections(db: AsyncSession, note_id: int, user_id: int) -> List[NoteConnection]:
    """Получить все связи заметки"""
    # Проверяем, что заметка принадлежит пользователю
    note = await get_note(db, note_id, user_id)
    if not note:
        return []
    
    result = await db.execute(
        select(NoteConnection).filter(
            (NoteConnection.note_a_id == note_id) | (NoteConnection.note_b_id == note_id)
        )
    )
    return result.scalars().all()


async def delete_connection(db: AsyncSession, connection_id: int, user_id: int) -> bool:
    """Удалить связь между заметками"""
    # Проверяем, что связь принадлежит пользователю
    result = await db.execute(
        select(NoteConnection)
        .join(Note, NoteConnection.note_a_id == Note.id)
        .filter(NoteConnection.id == connection_id, Note.user_id == user_id)
    )
    db_connection = result.scalar_one_or_none()
    
    if not db_connection:
        return False
    
    await db.delete(db_connection)
    await db.commit()
    return True


async def get_connected_notes(db: AsyncSession, note_id: int, user_id: int) -> List[Note]:
    """Получить все связанные заметки"""
    # Проверяем, что заметка принадлежит пользователю
    note = await get_note(db, note_id, user_id)
    if not note:
        return []
    
    # Получаем ID связанных заметок
    connections_result = await db.execute(
        select(NoteConnection).filter(
            (NoteConnection.note_a_id == note_id) | (NoteConnection.note_b_id == note_id)
        )
    )
    connections = connections_result.scalars().all()
    
    # Собираем ID связанных заметок
    connected_note_ids = []
    for conn in connections:
        if conn.note_a_id == note_id:
            connected_note_ids.append(conn.note_b_id)
        else:
            connected_note_ids.append(conn.note_a_id)
    
    if not connected_note_ids:
        return []
    
    # Получаем связанные заметки
    result = await db.execute(
        select(Note).filter(
            Note.id.in_(connected_note_ids),
            Note.user_id == user_id
        )
    )
    return result.scalars().all()


# Дополнительные операции
async def get_notes_count(db: AsyncSession, user_id: int) -> int:
    """Получить количество заметок пользователя"""
    result = await db.execute(
        select(Note).filter(Note.user_id == user_id)
    )
    return len(result.scalars().all())


async def get_recent_notes(db: AsyncSession, user_id: int, limit: int = 10) -> List[Note]:
    """Получить последние заметки пользователя"""
    result = await db.execute(
        select(Note)
        .filter(Note.user_id == user_id)
        .order_by(Note.created_at.desc())
        .limit(limit)
    )
    return result.scalars().all()
    
