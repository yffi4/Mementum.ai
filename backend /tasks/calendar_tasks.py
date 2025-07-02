from celery import shared_task
from celery.utils.log import get_task_logger
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from typing import Dict, Any, List
import asyncio
from datetime import datetime, timedelta

from database import ASYNC_DATABASE_URL
from models import Note, User, GoogleToken

logger = get_task_logger(__name__)

# Создаем асинхронный движок
engine = create_async_engine(ASYNC_DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


@shared_task(name='tasks.calendar_tasks.sync_calendar_async')
def sync_calendar_async(user_id: int) -> Dict[str, Any]:
    """
    Синхронизация календаря пользователя
    """
    try:
        logger.info(f"Syncing calendar for user {user_id}")
        
        result = asyncio.run(_sync_calendar_async(user_id))
        
        logger.info(f"Calendar synced: {result['events_synced']} events")
        return result
        
    except Exception as e:
        logger.error(f"Error syncing calendar: {str(e)}")
        raise


async def _sync_calendar_async(user_id: int) -> Dict[str, Any]:
    """Внутренняя функция синхронизации календаря"""
    async with AsyncSessionLocal() as db:
        # Проверяем, есть ли у пользователя токен Google
        from sqlalchemy import select
        query = select(GoogleToken).where(GoogleToken.user_id == user_id)
        result = await db.execute(query)
        token = result.scalar_one_or_none()
        
        if not token:
            return {
                'success': False,
                'message': 'Google calendar not connected',
                'events_synced': 0,
            }
        
        # Здесь будет логика синхронизации с Google Calendar API
        # Пока заглушка
        events_synced = 0
        
        # Получаем заметки с событиями
        query = select(Note).where(
            Note.user_id == user_id,
            Note.tags.contains(['event'])
        ).limit(20)
        
        result = await db.execute(query)
        notes = result.scalars().all()
        
        for note in notes:
            # Здесь будет создание события в календаре
            events_synced += 1
        
        return {
            'success': True,
            'events_synced': events_synced,
            'total_notes': len(notes),
        }


@shared_task(name='tasks.calendar_tasks.sync_all_calendars')
def sync_all_calendars() -> Dict[str, Any]:
    """
    Периодическая синхронизация всех календарей
    """
    logger.info("Starting sync for all calendars")
    
    result = asyncio.run(_sync_all_calendars())
    
    logger.info(f"Synced {result['users_synced']} user calendars")
    return result


async def _sync_all_calendars() -> Dict[str, Any]:
    """Внутренняя функция для синхронизации всех календарей"""
    async with AsyncSessionLocal() as db:
        # Получаем пользователей с подключенным Google
        from sqlalchemy import select
        query = select(GoogleToken.user_id).distinct()
        result = await db.execute(query)
        user_ids = result.scalars().all()
        
        synced = 0
        failed = 0
        
        for user_id in user_ids:
            try:
                sync_calendar_async.delay(user_id)
                synced += 1
            except Exception as e:
                logger.error(f"Failed to sync calendar for user {user_id}: {str(e)}")
                failed += 1
        
        return {
            'users_synced': synced,
            'users_failed': failed,
            'total_users': len(user_ids),
        }


@shared_task(name='tasks.calendar_tasks.create_calendar_event')
def create_calendar_event(note_id: int, user_id: int) -> Dict[str, Any]:
    """
    Создание события в календаре из заметки
    """
    try:
        logger.info(f"Creating calendar event from note {note_id}")
        
        result = asyncio.run(_create_calendar_event(note_id, user_id))
        
        return result
        
    except Exception as e:
        logger.error(f"Error creating calendar event: {str(e)}")
        raise


async def _create_calendar_event(note_id: int, user_id: int) -> Dict[str, Any]:
    """Внутренняя функция создания события"""
    async with AsyncSessionLocal() as db:
        # Получаем заметку
        from sqlalchemy import select
        query = select(Note).where(Note.id == note_id, Note.user_id == user_id)
        result = await db.execute(query)
        note = result.scalar_one_or_none()
        
        if not note:
            raise ValueError(f"Note {note_id} not found")
        
        # Извлекаем дату и время из заметки
        # Простой парсер для демонстрации
        import re
        
        # Ищем паттерны даты/времени
        date_pattern = r'(\d{1,2}[/.]\d{1,2}[/.]\d{2,4})'
        time_pattern = r'(\d{1,2}:\d{2})'
        
        date_match = re.search(date_pattern, note.content)
        time_match = re.search(time_pattern, note.content)
        
        if date_match:
            # Здесь будет создание события
            return {
                'success': True,
                'note_id': note_id,
                'event_created': True,
                'date_found': date_match.group(1),
                'time_found': time_match.group(1) if time_match else None,
            }
        
        return {
            'success': False,
            'note_id': note_id,
            'event_created': False,
            'message': 'No date found in note',
        }


@shared_task(name='tasks.calendar_tasks.remind_upcoming_events')
def remind_upcoming_events() -> Dict[str, Any]:
    """
    Напоминание о предстоящих событиях
    """
    logger.info("Checking for upcoming events")
    
    result = asyncio.run(_remind_upcoming_events())
    
    logger.info(f"Sent {result['reminders_sent']} reminders")
    return result


async def _remind_upcoming_events() -> Dict[str, Any]:
    """Внутренняя функция для напоминаний"""
    async with AsyncSessionLocal() as db:
        # Получаем заметки с событиями на ближайшие 24 часа
        tomorrow = datetime.utcnow() + timedelta(days=1)
        
        # Здесь будет логика поиска событий
        # Пока заглушка
        
        reminders_sent = 0
        
        return {
            'reminders_sent': reminders_sent,
            'checked_until': tomorrow.isoformat(),
        } 