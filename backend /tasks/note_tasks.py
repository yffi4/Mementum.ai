from celery import shared_task
from celery.utils.log import get_task_logger
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from typing import Dict, Any, Optional
import asyncio
import os

from database import ASYNC_DATABASE_URL
from models import Note, User
from notes.schemas import NoteCreate, NoteUpdate
from notes import crud as notes_crud

logger = get_task_logger(__name__)

# Создаем асинхронный движок для Celery задач
engine = create_async_engine(ASYNC_DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db():
    """Получение сессии БД для Celery задач"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


@shared_task(bind=True, name='tasks.note_tasks.create_note_async')
def create_note_async(self, note_data: Dict[str, Any], user_id: int) -> Dict[str, Any]:
    """
    Асинхронное создание заметки
    """
    try:
        logger.info(f"Creating note for user {user_id}")
        
        # Запускаем асинхронную функцию в синхронном контексте
        result = asyncio.run(_create_note_async(note_data, user_id))
        
        logger.info(f"Note created successfully: {result['id']}")
        return result
        
    except Exception as e:
        logger.error(f"Error creating note: {str(e)}")
        # Повторная попытка через 60 секунд
        raise self.retry(exc=e, countdown=60, max_retries=3)


async def _create_note_async(note_data: Dict[str, Any], user_id: int) -> Dict[str, Any]:
    """Внутренняя асинхронная функция создания заметки"""
    async with AsyncSessionLocal() as db:
        # Создаем объект NoteCreate
        note_create = NoteCreate(**note_data)
        
        # Создаем заметку в БД
        note = await notes_crud.create_note(db, note_create, user_id)
        
        # Возвращаем данные заметки
        return {
            'id': note.id,
            'title': note.title,
            'content': note.content,
            'created_at': note.created_at.isoformat() if note.created_at else None,
            'updated_at': note.updated_at.isoformat() if note.updated_at else None,
        }


@shared_task(bind=True, name='tasks.note_tasks.update_note_async')
def update_note_async(self, note_id: int, note_data: Dict[str, Any], user_id: int) -> Dict[str, Any]:
    """
    Асинхронное обновление заметки
    """
    try:
        logger.info(f"Updating note {note_id} for user {user_id}")
        
        result = asyncio.run(_update_note_async(note_id, note_data, user_id))
        
        logger.info(f"Note updated successfully: {note_id}")
        return result
        
    except Exception as e:
        logger.error(f"Error updating note: {str(e)}")
        raise self.retry(exc=e, countdown=60, max_retries=3)


async def _update_note_async(note_id: int, note_data: Dict[str, Any], user_id: int) -> Dict[str, Any]:
    """Внутренняя асинхронная функция обновления заметки"""
    async with AsyncSessionLocal() as db:
        # Получаем существующую заметку
        note = await notes_crud.get_note(db, note_id, user_id)
        if not note:
            raise ValueError(f"Note {note_id} not found for user {user_id}")
        
        # Создаем объект NoteUpdate
        note_update = NoteUpdate(**note_data)
        
        # Обновляем заметку
        updated_note = await notes_crud.update_note(db, note_id, note_update, user_id)
        
        return {
            'id': updated_note.id,
            'title': updated_note.title,
            'content': updated_note.content,
            'updated_at': updated_note.updated_at.isoformat() if updated_note.updated_at else None,
        }


@shared_task(bind=True, name='tasks.note_tasks.delete_note_async')
def delete_note_async(self, note_id: int, user_id: int) -> Dict[str, Any]:
    """
    Асинхронное удаление заметки
    """
    try:
        logger.info(f"Deleting note {note_id} for user {user_id}")
        
        result = asyncio.run(_delete_note_async(note_id, user_id))
        
        logger.info(f"Note deleted successfully: {note_id}")
        return result
        
    except Exception as e:
        logger.error(f"Error deleting note: {str(e)}")
        raise self.retry(exc=e, countdown=30, max_retries=2)


async def _delete_note_async(note_id: int, user_id: int) -> Dict[str, Any]:
    """Внутренняя асинхронная функция удаления заметки"""
    async with AsyncSessionLocal() as db:
        # Удаляем заметку
        success = await notes_crud.delete_note(db, note_id, user_id)
        
        if not success:
            raise ValueError(f"Failed to delete note {note_id}")
        
        return {
            'id': note_id,
            'deleted': True,
        }


@shared_task(name='tasks.note_tasks.batch_create_notes')
def batch_create_notes(notes_data: list[Dict[str, Any]], user_id: int) -> Dict[str, Any]:
    """
    Пакетное создание заметок
    """
    logger.info(f"Batch creating {len(notes_data)} notes for user {user_id}")
    
    created_notes = []
    failed_notes = []
    
    for note_data in notes_data:
        try:
            result = create_note_async(note_data, user_id)
            created_notes.append(result)
        except Exception as e:
            logger.error(f"Failed to create note: {str(e)}")
            failed_notes.append({
                'data': note_data,
                'error': str(e)
            })
    
    return {
        'created': len(created_notes),
        'failed': len(failed_notes),
        'created_notes': created_notes,
        'failed_notes': failed_notes,
    }


@shared_task(name='tasks.note_tasks.sync_notes_with_calendar')
def sync_notes_with_calendar(user_id: int) -> Dict[str, Any]:
    """
    Синхронизация заметок с календарем
    """
    try:
        logger.info(f"Syncing notes with calendar for user {user_id}")
        
        result = asyncio.run(_sync_notes_with_calendar(user_id))
        
        logger.info(f"Sync completed: {result['synced']} notes")
        return result
        
    except Exception as e:
        logger.error(f"Error syncing notes: {str(e)}")
        raise


async def _sync_notes_with_calendar(user_id: int) -> Dict[str, Any]:
    """Внутренняя функция синхронизации"""
    async with AsyncSessionLocal() as db:
        # Получаем заметки с тегом "calendar" или "event"
        from sqlalchemy import select, or_, func
        
        query = select(Note).where(
            Note.user_id == user_id,
            or_(
                func.array_to_string(Note.tags, ',').contains('calendar'),
                func.array_to_string(Note.tags, ',').contains('event'),
                func.array_to_string(Note.tags, ',').contains('meeting')
            )
        )
        
        result = await db.execute(query)
        notes = result.scalars().all()
        
        synced_count = 0
        for note in notes:
            # Здесь будет логика синхронизации с календарем
            # Пока просто считаем
            synced_count += 1
        
        return {
            'total_notes': len(notes),
            'synced': synced_count,
        } 