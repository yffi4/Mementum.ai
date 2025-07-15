import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import hashlib
import json
from concurrent.futures import ThreadPoolExecutor
import openai

from redis_config import cache
from models import Note
from config import settings

class OptimizedAIAgent:
    """Оптимизированный AI агент с батчингом и кешированием"""
    
    def __init__(self):
        self.client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.executor = ThreadPoolExecutor(max_workers=5)
        
        # Оптимизированные промпты
        self.prompts = {
            'category': """Категоризируй текст одним словом из списка:
Work, Learning, Personal, Finance, Health, Idea, Travel, Shopping, General.
Текст: {text}
Категория:""",
            
            'importance': """Оцени важность от 1 до 10.
Текст: {text}
Важность (число):""",
            
            'summary': """Кратко резюмируй в 2-3 предложениях:
{text}
Резюме:""",
            
            'tags': """Предложи 3-5 тегов через запятую:
{text}
Теги:""",
        }
    
    def _get_cache_key(self, prefix: str, text: str) -> str:
        """Генерация ключа кеша"""
        text_hash = hashlib.md5(text.encode()).hexdigest()
        return f"ai:{prefix}:{text_hash}"
    
    async def batch_analyze(self, notes: List[Note]) -> List[Dict[str, Any]]:
        """Пакетный анализ заметок"""
        tasks = []
        for note in notes:
            task = self.analyze_note(note)
            tasks.append(task)
        
        # Выполняем все анализы параллельно
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Обрабатываем результаты
        analyzed = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                print(f"Ошибка анализа заметки {notes[i].id}: {result}")
                analyzed.append({
                    'note_id': notes[i].id,
                    'error': str(result)
                })
            else:
                analyzed.append(result)
        
        return analyzed
    
    async def analyze_note(self, note: Note) -> Dict[str, Any]:
        """Анализ одной заметки с кешированием"""
        # Проверяем кеш для полного анализа
        cache_key = self._get_cache_key("full_analysis", note.content)
        cached = cache.get(cache_key)
        if cached:
            cached['note_id'] = note.id
            cached['from_cache'] = True
            return cached
        
        # Параллельный анализ всех аспектов
        tasks = [
            self._categorize_cached(note.content),
            self._assess_importance_cached(note.content),
            self._generate_summary_cached(note.content),
            self._suggest_tags_cached(note.content),
        ]
        
        results = await asyncio.gather(*tasks)
        
        analysis = {
            'note_id': note.id,
            'category': results[0],
            'importance': results[1],
            'summary': results[2],
            'tags': results[3],
            'analyzed_at': datetime.utcnow().isoformat(),
            'from_cache': False
        }
        
        # Сохраняем в кеш
        cache.set(cache_key, analysis, ttl=timedelta(days=7))
        
        return analysis
    
    async def _categorize_cached(self, text: str) -> str:
        """Категоризация с кешированием"""
        cache_key = self._get_cache_key("category", text)
        cached = cache.get(cache_key)
        if cached:
            return cached
        
        # Быстрая категоризация по ключевым словам
        category = self._quick_categorize(text)
        if category:
            cache.set(cache_key, category, ttl=timedelta(days=30))
            return category
        
        # AI категоризация если не удалось быстро
        try:
            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{
                    "role": "user",
                    "content": self.prompts['category'].format(text=text[:500])
                }],
                max_tokens=10,
                temperature=0.3,
                timeout=5
            )
            category = response.choices[0].message.content.strip()
            cache.set(cache_key, category, ttl=timedelta(days=30))
            return category
        except Exception:
            return "General"
    
    def _quick_categorize(self, text: str) -> Optional[str]:
        """Быстрая категоризация по ключевым словам"""
        text_lower = text.lower()
        
        keywords = {
            'Работа': ['работа', 'проект', 'задача', 'встреча', 'дедлайн'],
            'Обучение': ['учеба', 'курс', 'книга', 'изучить', 'обучение'],
            'Личное': ['личное', 'семья', 'друзья', 'дом', 'хобби'],
            'Финансы': ['деньги', 'бюджет', 'расход', 'доход', 'счет'],
            'Здоровье': ['здоровье', 'врач', 'лекарство', 'спорт', 'диета'],
            'Идея': ['идея', 'мысль', 'концепция', 'план', 'стартап'],
            'Путешествия': ['путешествие', 'поездка', 'отпуск', 'билет'],
            'Покупки': ['купить', 'покупка', 'магазин', 'заказ'],
        }
        
        scores = {}
        for category, words in keywords.items():
            score = sum(1 for word in words if word in text_lower)
            if score > 0:
                scores[category] = score
        
        if scores:
            return max(scores, key=scores.get)
        return None
    
    async def _assess_importance_cached(self, text: str) -> int:
        """Оценка важности с кешированием"""
        cache_key = self._get_cache_key("importance", text)
        cached = cache.get(cache_key)
        if cached:
            return cached
        
        # Быстрая оценка по ключевым словам
        importance = self._quick_assess_importance(text)
        cache.set(cache_key, importance, ttl=timedelta(days=30))
        return importance
    
    def _quick_assess_importance(self, text: str) -> int:
        """Быстрая оценка важности"""
        text_lower = text.lower()
        
        # Ключевые слова и их веса
        high_importance = ['срочно', 'важно', 'критично', 'deadline', 'asap', 'немедленно']
        medium_importance = ['нужно', 'необходимо', 'следует', 'планирую']
        
        score = 5  # Базовая важность
        
        # Увеличиваем важность
        for word in high_importance:
            if word in text_lower:
                score += 2
        
        for word in medium_importance:
            if word in text_lower:
                score += 1
        
        # Учитываем длину текста
        if len(text) > 500:
            score += 1
        
        # Учитываем наличие дат
        import re
        if re.search(r'\d{1,2}[/.]\d{1,2}', text):
            score += 1
        
        return min(score, 10)
    
    async def _generate_summary_cached(self, text: str) -> str:
        """Генерация резюме с кешированием"""
        cache_key = self._get_cache_key("summary", text)
        cached = cache.get(cache_key)
        if cached:
            return cached
        
        # Простое резюме для коротких текстов
        if len(text) < 100:
            cache.set(cache_key, text, ttl=timedelta(days=30))
            return text
        
        # Извлекаем первые предложения
        sentences = text.split('.')[:3]
        summary = '. '.join(sentences).strip()
        if summary and len(summary) < 200:
            cache.set(cache_key, summary, ttl=timedelta(days=30))
            return summary
        
        # Обрезаем по длине
        summary = text[:150] + "..."
        cache.set(cache_key, summary, ttl=timedelta(days=30))
        return summary
    
    async def _suggest_tags_cached(self, text: str) -> List[str]:
        """Предложение тегов с кешированием"""
        cache_key = self._get_cache_key("tags", text)
        cached = cache.get(cache_key)
        if cached:
            return cached
        
        # Извлекаем теги из текста
        tags = self._extract_tags(text)
        cache.set(cache_key, tags, ttl=timedelta(days=30))
        return tags
    
    def _extract_tags(self, text: str) -> List[str]:
        """Извлечение тегов из текста"""
        import re
        
        # Ищем хештеги
        hashtags = re.findall(r'#(\w+)', text)
        
        # Ключевые слова
        text_lower = text.lower()
        keywords = []
        
        # Технические термины
        tech_terms = ['python', 'javascript', 'react', 'api', 'database', 'ai', 'ml']
        for term in tech_terms:
            if term in text_lower:
                keywords.append(term)
        
        # Общие теги
        if 'встреча' in text_lower or 'meeting' in text_lower:
            keywords.append('встреча')
        if 'задача' in text_lower or 'task' in text_lower:
            keywords.append('задача')
        if any(word in text_lower for word in ['идея', 'idea']):
            keywords.append('идея')
        
        # Объединяем и ограничиваем
        all_tags = list(set(hashtags + keywords))
        return all_tags[:5]


# Глобальный экземпляр оптимизированного агента
optimized_agent = OptimizedAIAgent() 