import redis
from typing import Optional, Any
import json
import os
from datetime import timedelta

# Redis клиенты для разных целей
redis_cache = redis.Redis(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    db=1,  # DB 1 для кеша
    decode_responses=True
)

redis_celery = redis.Redis(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    db=0,  # DB 0 для Celery
    decode_responses=True
)


class RedisCache:
    """Утилиты для работы с Redis кешем"""
    
    def __init__(self, client: redis.Redis = redis_cache):
        self.client = client
        self.default_ttl = timedelta(hours=24)
    
    def get(self, key: str) -> Optional[Any]:
        """Получить значение из кеша"""
        try:
            value = self.client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception:
            return None
    
    def set(self, key: str, value: Any, ttl: Optional[timedelta] = None) -> bool:
        """Сохранить значение в кеш"""
        try:
            ttl = ttl or self.default_ttl
            self.client.setex(
                key,
                int(ttl.total_seconds()),
                json.dumps(value, ensure_ascii=False)
            )
            return True
        except Exception:
            return False
    
    def delete(self, key: str) -> bool:
        """Удалить значение из кеша"""
        try:
            return bool(self.client.delete(key))
        except Exception:
            return False
    
    def exists(self, key: str) -> bool:
        """Проверить существование ключа"""
        try:
            return bool(self.client.exists(key))
        except Exception:
            return False
    
    def get_or_set(self, key: str, func, ttl: Optional[timedelta] = None) -> Any:
        """Получить из кеша или вычислить и сохранить"""
        value = self.get(key)
        if value is not None:
            return value
        
        value = func()
        self.set(key, value, ttl)
        return value
    
    def clear_pattern(self, pattern: str) -> int:
        """Удалить все ключи по паттерну"""
        try:
            keys = self.client.keys(pattern)
            if keys:
                return self.client.delete(*keys)
            return 0
        except Exception:
            return 0


# Глобальный экземпляр кеша
cache = RedisCache() 