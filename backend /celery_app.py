from celery import Celery
from celery.schedules import crontab
import os
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

# Создаем Celery приложение
celery_app = Celery(
    'mementum_tasks',
    broker=os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0'),
    backend=os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0'),
    include=['tasks.note_tasks', 'tasks.ai_tasks', 'tasks.calendar_tasks']
)

# Конфигурация Celery
celery_app.conf.update(
    # Основные настройки
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    
    # Оптимизация производительности
    worker_prefetch_multiplier=4,
    worker_max_tasks_per_child=1000,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    
    # Настройки результатов
    result_expires=3600,  # Результаты хранятся 1 час
    result_backend_always_retry=True,
    result_backend_max_retries=10,
    
    # Настройки очередей
    task_default_queue='default',
    task_queues={
        'high_priority': {
            'exchange': 'high_priority',
            'exchange_type': 'direct',
            'routing_key': 'high_priority',
        },
        'low_priority': {
            'exchange': 'low_priority',
            'exchange_type': 'direct',
            'routing_key': 'low_priority',
        },
        'ai_tasks': {
            'exchange': 'ai_tasks',
            'exchange_type': 'direct',
            'routing_key': 'ai_tasks',
        },
    },
    
    # Маршрутизация задач
    task_routes={
        'tasks.note_tasks.create_note_async': {'queue': 'high_priority'},
        'tasks.note_tasks.update_note_async': {'queue': 'high_priority'},
        'tasks.ai_tasks.analyze_note_async': {'queue': 'ai_tasks'},
        'tasks.ai_tasks.generate_summary_async': {'queue': 'ai_tasks'},
        'tasks.ai_tasks.categorize_note_async': {'queue': 'ai_tasks'},
        'tasks.calendar_tasks.sync_calendar_async': {'queue': 'low_priority'},
    },
    
    # Настройки повторных попыток
    task_annotations={
        '*': {
            'rate_limit': '100/s',
            'max_retries': 3,
            'default_retry_delay': 60,
        },
        'tasks.ai_tasks.*': {
            'rate_limit': '10/s',  # Ограничение для AI задач
            'max_retries': 2,
            'default_retry_delay': 120,
        },
    },
    
    # Периодические задачи
    beat_schedule={
        'cleanup-old-results': {
            'task': 'tasks.maintenance.cleanup_old_results',
            'schedule': crontab(hour=0, minute=0),  # Каждый день в полночь
        },
        'analyze-unprocessed-notes': {
            'task': 'tasks.ai_tasks.analyze_unprocessed_notes',
            'schedule': crontab(minute='*/30'),  # Каждые 30 минут
        },
        'sync-calendars': {
            'task': 'tasks.calendar_tasks.sync_all_calendars',
            'schedule': crontab(minute='*/15'),  # Каждые 15 минут
        },
    },
)

# Настройки для production
if os.getenv('ENVIRONMENT') == 'production':
    celery_app.conf.update(
        worker_send_task_events=True,
        task_send_sent_event=True,
    ) 