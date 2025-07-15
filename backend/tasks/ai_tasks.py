from celery import shared_task, group
from celery.utils.log import get_task_logger
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from typing import Dict, Any, List, Optional
import asyncio
import json
import hashlib
from datetime import datetime, timedelta
import redis
import openai
from functools import lru_cache

from database import ASYNC_DATABASE_URL
from models import Note, User
from ai_agent.note_analyzer import NoteAnalyzer
from ai_agent.agent import AIAgent

logger = get_task_logger(__name__)

# Redis для кеширования
redis_client = redis.Redis(host='redis', port=6379, db=1, decode_responses=True)

# Создаем асинхронный движок
engine = create_async_engine(ASYNC_DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# Время жизни кеша в секундах
CACHE_TTL = 3600 * 24  # 24 часа


def get_cache_key(prefix: str, content: str) -> str:
    """Генерация ключа кеша на основе контента"""
    content_hash = hashlib.md5(content.encode()).hexdigest()
    return f"{prefix}:{content_hash}"


@shared_task(bind=True, name='tasks.ai_tasks.analyze_note_async')
def analyze_note_async(self, note_id: int, user_id: int, force: bool = False) -> Dict[str, Any]:
    """
    Асинхронный анализ заметки с кешированием
    """
    try:
        logger.info(f"Analyzing note {note_id} for user {user_id}")
        
        result = asyncio.run(_analyze_note_async(note_id, user_id, force))
        
        logger.info(f"Note analyzed successfully: {note_id}")
        return result
        
    except Exception as e:
        logger.error(f"Error analyzing note: {str(e)}")
        raise self.retry(exc=e, countdown=120, max_retries=2)


async def _analyze_note_async(note_id: int, user_id: int, force: bool = False) -> Dict[str, Any]:
    """Внутренняя функция анализа с кешированием"""
    async with AsyncSessionLocal() as db:
        # Получаем заметку
        from sqlalchemy import select
        query = select(Note).where(Note.id == note_id, Note.user_id == user_id)
        result = await db.execute(query)
        note = result.scalar_one_or_none()
        
        if not note:
            raise ValueError(f"Note {note_id} not found")
        
        # Проверяем кеш
        cache_key = get_cache_key("note_analysis", note.content)
        if not force:
            cached_result = redis_client.get(cache_key)
            if cached_result:
                logger.info(f"Using cached analysis for note {note_id}")
                return json.loads(cached_result)
        
        # Создаем анализатор
        analyzer = NoteAnalyzer()
        
        # Определяем язык заметки
        language = await analyzer.detect_language(note.content)
        
        # Параллельный анализ всех аспектов
        tasks = [
            analyzer.categorize_note(note.content),
            analyzer.assess_importance(note.content),
            analyzer.extract_keywords(note.content),
            analyzer.generate_summary(note.content),
            analyzer.suggest_tags(note.content),
            analyzer.analyze_sentiment(note.content),
        ]
        
        results = await asyncio.gather(*tasks)
        
        analysis_result = {
            'note_id': note_id,
            'category': results[0],
            'importance': results[1],
            'keywords': results[2],
            'summary': results[3],
            'tags': results[4],
            'sentiment': results[5],
            'analyzed_at': datetime.utcnow().isoformat(),
        }
        
        # Сохраняем в кеш
        redis_client.setex(cache_key, CACHE_TTL, json.dumps(analysis_result))
        
        # Обновляем заметку в БД
        note.category = results[0]
        note.importance = results[1]
        note.tags = results[4]
        note.summary = results[3]
        note.ai_processed = True
        note.ai_processed_at = datetime.utcnow()
        
        await db.commit()
        
        return analysis_result


@shared_task(name='tasks.ai_tasks.batch_analyze_notes')
def batch_analyze_notes(note_ids: List[int], user_id: int) -> Dict[str, Any]:
    """
    Пакетный анализ заметок с параллельной обработкой
    """
    logger.info(f"Batch analyzing {len(note_ids)} notes for user {user_id}")
    
    # Создаем группу задач для параллельного выполнения
    job = group(analyze_note_async.s(note_id, user_id) for note_id in note_ids)
    result = job.apply_async()
    
    # Ждем завершения всех задач
    results = result.get(timeout=300)  # 5 минут таймаут
    
    successful = [r for r in results if r.get('note_id')]
    failed = len(results) - len(successful)
    
    return {
        'total': len(note_ids),
        'successful': len(successful),
        'failed': failed,
        'results': successful,
    }


@shared_task(name='tasks.ai_tasks.generate_summary_async')
def generate_summary_async(content: str, max_length: int = 150) -> str:
    """
    Генерация резюме с кешированием
    """
    # Проверяем кеш
    cache_key = get_cache_key(f"summary:{max_length}", content)
    cached = redis_client.get(cache_key)
    if cached:
        return cached
    
    try:
        # Оптимизированный промпт для быстрой генерации
        prompt = f"""Summarize this text in {max_length} characters or less. Be concise and capture key points:

{content[:1000]}...

Summary:"""
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  # Используем более быструю модель
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100,
            temperature=0.3,
            timeout=10,  # Таймаут 10 секунд
        )
        
        summary = response.choices[0].message.content.strip()
        
        # Сохраняем в кеш
        redis_client.setex(cache_key, CACHE_TTL, summary)
        
        return summary
        
    except Exception as e:
        logger.error(f"Error generating summary: {str(e)}")
        # Возвращаем простое резюме при ошибке
        return content[:max_length] + "..." if len(content) > max_length else content


@shared_task(name='tasks.ai_tasks.categorize_note_async')
def categorize_note_async(content: str) -> str:
    """
    Быстрая категоризация заметки с использованием кеша
    """
    # Проверяем кеш
    cache_key = get_cache_key("category", content)
    cached = redis_client.get(cache_key)
    if cached:
        return cached
    
    # Быстрая категоризация по ключевым словам
    categories = {
        'Work': ['работа', 'проект', 'задача', 'встреча', 'дедлайн', 'коллега'],
        'Learning': ['учеба', 'курс', 'книга', 'изучить', 'обучение', 'урок'],
        'Personal': ['личное', 'семья', 'друзья', 'дом', 'хобби', 'отдых'],
        'Finance': ['деньги', 'бюджет', 'расход', 'доход', 'инвестиции', 'счет'],
        'Health': ['здоровье', 'врач', 'лекарство', 'спорт', 'диета', 'сон'],
        'Idea': ['идея', 'мысль', 'концепция', 'план', 'стартап', 'бизнес'],
        'Travel': ['путешествие', 'поездка', 'отпуск', 'билет', 'отель'],
        'Shopping': ['купить', 'покупка', 'магазин', 'заказ', 'товар'],
    }
    
    content_lower = content.lower()
    scores = {}
    
    for category, keywords in categories.items():
        score = sum(1 for keyword in keywords if keyword in content_lower)
        if score > 0:
            scores[category] = score
    
    if scores:
        category = max(scores, key=scores.get)
    else:
        category = 'General'
    
    # Сохраняем в кеш
    redis_client.setex(cache_key, CACHE_TTL, category)
    
    return category


@shared_task(name='tasks.ai_tasks.analyze_unprocessed_notes')
def analyze_unprocessed_notes() -> Dict[str, Any]:
    """
    Периодическая задача для анализа необработанных заметок
    """
    logger.info("Starting analysis of unprocessed notes")
    
    result = asyncio.run(_analyze_unprocessed_notes())
    
    logger.info(f"Analyzed {result['processed']} unprocessed notes")
    return result


async def _analyze_unprocessed_notes() -> Dict[str, Any]:
    """Внутренняя функция для анализа необработанных заметок"""
    async with AsyncSessionLocal() as db:
        # Получаем необработанные заметки
        from sqlalchemy import select, or_
        query = select(Note).where(
            or_(
                Note.ai_processed == False,
                Note.ai_processed == None
            )
        ).limit(50)  # Обрабатываем по 50 заметок за раз
        
        result = await db.execute(query)
        notes = result.scalars().all()
        
        if not notes:
            return {'processed': 0, 'total': 0}
        
        # Группируем по пользователям
        user_notes = {}
        for note in notes:
            if note.user_id not in user_notes:
                user_notes[note.user_id] = []
            user_notes[note.user_id].append(note.id)
        
        # Запускаем пакетный анализ для каждого пользователя
        total_processed = 0
        for user_id, note_ids in user_notes.items():
            try:
                batch_analyze_notes.delay(note_ids, user_id)
                total_processed += len(note_ids)
            except Exception as e:
                logger.error(f"Error processing notes for user {user_id}: {str(e)}")
        
        return {
            'processed': total_processed,
            'total': len(notes),
            'users': len(user_notes),
        }


@shared_task(name='tasks.ai_tasks.optimize_note_content')
def optimize_note_content(note_id: int, user_id: int) -> Dict[str, Any]:
    """
    Оптимизация содержимого заметки (исправление ошибок, форматирование)
    """
    try:
        logger.info(f"Optimizing note {note_id} content")
        
        result = asyncio.run(_optimize_note_content(note_id, user_id))
        
        return result
        
    except Exception as e:
        logger.error(f"Error optimizing note: {str(e)}")
        raise


async def _optimize_note_content(note_id: int, user_id: int) -> Dict[str, Any]:
    """Внутренняя функция оптимизации контента"""
    async with AsyncSessionLocal() as db:
        # Получаем заметку
        from sqlalchemy import select
        query = select(Note).where(Note.id == note_id, Note.user_id == user_id)
        result = await db.execute(query)
        note = result.scalar_one_or_none()
        
        if not note:
            raise ValueError(f"Note {note_id} not found")
        
        # Простая оптимизация без AI для скорости
        optimized_content = note.content
        
        # Удаляем лишние пробелы
        optimized_content = ' '.join(optimized_content.split())
        
        # Исправляем базовую пунктуацию
        optimized_content = optimized_content.replace(' ,', ',')
        optimized_content = optimized_content.replace(' .', '.')
        optimized_content = optimized_content.replace(' !', '!')
        optimized_content = optimized_content.replace(' ?', '?')
        
        # Добавляем заглавные буквы после точек
        import re
        optimized_content = re.sub(r'(\. )([a-z])', lambda m: m.group(1) + m.group(2).upper(), optimized_content)
        
        # Обновляем заметку если есть изменения
        if optimized_content != note.content:
            note.content = optimized_content
            note.updated_at = datetime.utcnow()
            await db.commit()
            
            return {
                'note_id': note_id,
                'optimized': True,
                'changes_made': True,
            }
        
        return {
            'note_id': note_id,
            'optimized': True,
            'changes_made': False,
        } 