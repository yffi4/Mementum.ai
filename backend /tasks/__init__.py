from celery_app import celery_app

# Импортируем все задачи, чтобы Celery их обнаружил
from .note_tasks import *
from .ai_tasks import *
from .calendar_tasks import *
from .maintenance import *

__all__ = ['celery_app'] 