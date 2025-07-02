from celery import shared_task
from celery.utils.log import get_task_logger
from datetime import datetime, timedelta
from typing import Dict, Any
import redis

logger = get_task_logger(__name__)

# Redis клиент
redis_client = redis.Redis(host='redis', port=6379, db=0, decode_responses=True)


@shared_task(name='tasks.maintenance.cleanup_old_results')
def cleanup_old_results() -> Dict[str, Any]:
    """
    Очистка старых результатов Celery
    """
    logger.info("Starting cleanup of old Celery results")
    
    # Удаляем результаты старше 7 дней
    cutoff_time = datetime.utcnow() - timedelta(days=7)
    
    # Здесь будет логика очистки
    # Celery автоматически очищает результаты через result_expires
    
    return {
        'success': True,
        'cleaned_before': cutoff_time.isoformat(),
    }


@shared_task(name='tasks.maintenance.cleanup_redis_cache')
def cleanup_redis_cache() -> Dict[str, Any]:
    """
    Очистка истекшего кеша Redis
    """
    logger.info("Starting Redis cache cleanup")
    
    # Redis автоматически удаляет истекшие ключи
    # Но мы можем принудительно очистить некоторые паттерны
    
    deleted = 0
    patterns = [
        'note_analysis:*',
        'summary:*',
        'category:*',
    ]
    
    for pattern in patterns:
        keys = redis_client.keys(pattern)
        if keys:
            deleted += redis_client.delete(*keys)
    
    logger.info(f"Deleted {deleted} cache keys")
    
    return {
        'success': True,
        'keys_deleted': deleted,
    }


@shared_task(name='tasks.maintenance.health_check')
def health_check() -> Dict[str, Any]:
    """
    Проверка здоровья системы
    """
    logger.info("Running system health check")
    
    checks = {
        'redis': False,
        'database': False,
        'celery': True,  # Если эта задача выполняется, Celery работает
    }
    
    # Проверка Redis
    try:
        redis_client.ping()
        checks['redis'] = True
    except Exception as e:
        logger.error(f"Redis health check failed: {str(e)}")
    
    # Проверка базы данных
    try:
        from database import DATABASE_URL
        from sqlalchemy import create_engine, text
        
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        checks['database'] = True
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
    
    all_healthy = all(checks.values())
    
    return {
        'healthy': all_healthy,
        'checks': checks,
        'timestamp': datetime.utcnow().isoformat(),
    }


@shared_task(name='tasks.maintenance.optimize_database')
def optimize_database() -> Dict[str, Any]:
    """
    Оптимизация базы данных
    """
    logger.info("Starting database optimization")
    
    try:
        from database import DATABASE_URL
        from sqlalchemy import create_engine, text
        
        engine = create_engine(DATABASE_URL)
        
        with engine.connect() as conn:
            # Анализ таблиц для оптимизации запросов
            tables = ['notes', 'users', 'note_connections']
            
            for table in tables:
                conn.execute(text(f"ANALYZE {table}"))
                logger.info(f"Analyzed table: {table}")
            
            # Очистка старых версий строк
            conn.execute(text("VACUUM"))
            logger.info("Vacuum completed")
        
        return {
            'success': True,
            'tables_analyzed': len(tables),
            'vacuum_completed': True,
        }
        
    except Exception as e:
        logger.error(f"Database optimization failed: {str(e)}")
        return {
            'success': False,
            'error': str(e),
        }


@shared_task(name='tasks.maintenance.generate_statistics')
def generate_statistics() -> Dict[str, Any]:
    """
    Генерация статистики использования
    """
    logger.info("Generating usage statistics")
    
    try:
        from database import DATABASE_URL
        from sqlalchemy import create_engine, text
        
        engine = create_engine(DATABASE_URL)
        
        stats = {}
        
        with engine.connect() as conn:
            # Общее количество заметок
            result = conn.execute(text("SELECT COUNT(*) FROM notes"))
            stats['total_notes'] = result.scalar()
            
            # Количество пользователей
            result = conn.execute(text("SELECT COUNT(*) FROM users"))
            stats['total_users'] = result.scalar()
            
            # Заметки за последние 24 часа
            result = conn.execute(text("""
                SELECT COUNT(*) FROM notes 
                WHERE created_at > NOW() - INTERVAL '24 hours'
            """))
            stats['notes_24h'] = result.scalar()
            
            # Самые популярные категории
            result = conn.execute(text("""
                SELECT category, COUNT(*) as count 
                FROM notes 
                WHERE category IS NOT NULL 
                GROUP BY category 
                ORDER BY count DESC 
                LIMIT 5
            """))
            stats['top_categories'] = [
                {'category': row[0], 'count': row[1]} 
                for row in result
            ]
        
        logger.info(f"Generated statistics: {stats}")
        
        return {
            'success': True,
            'statistics': stats,
            'generated_at': datetime.utcnow().isoformat(),
        }
        
    except Exception as e:
        logger.error(f"Statistics generation failed: {str(e)}")
        return {
            'success': False,
            'error': str(e),
        } 