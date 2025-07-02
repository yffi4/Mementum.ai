import json
import re
from typing import List, Dict, Any, Optional
import openai
from .prompts import AGENT_PROMPTS


class NoteAnalyzer:
    """
    Улучшенный анализатор заметок для точной категоризации, оценки важности и поиска связей
    """
    
    # Предопределенные категории с четкими критериями
    CATEGORIES = {
        "Обучение": ["курс", "лекция", "изучение", "обучение", "образование", "tutorial", "гайд", "инструкция"],
        "Проект": ["проект", "задача", "план", "этап", "milestone", "цель", "техзадание", "requirements"],
        "Идея": ["идея", "концепция", "мысль", "инновация", "предложение", "brainstorm", "креатив"],
        "Работа": ["работа", "офис", "коллега", "начальник", "задание", "отчет", "встреча", "совещание"],
        "Исследование": ["исследование", "анализ", "изучение", "эксперимент", "данные", "статистика", "research"],
        "Финансы": ["деньги", "бюджет", "расходы", "доходы", "инвестиции", "банк", "кредит", "налоги"],
        "Здоровье": ["здоровье", "врач", "лечение", "диета", "спорт", "фитнес", "медицина", "болезнь"],
        "Путешествия": ["путешествие", "поездка", "отпуск", "отель", "билет", "виза", "маршрут"],
        "Покупки": ["покупка", "магазин", "товар", "цена", "скидка", "заказ", "доставка"],
        "Личное": ["семья", "друзья", "хобби", "развлечения", "личное", "дневник", "размышления"],
        "Технология": ["программирование", "код", "алгоритм", "технология", "софт", "hardware", "IT", "компьютер"],
        "Ссылки": ["ссылка", "сайт", "статья", "видео", "ресурс", "документ", "источник", "материал"],
        "Статьи": ["статья", "статья", "статья", "статья", "статья", "статья", "статья", "статья", "статья", "статья"],
        "События": ["событие", "событие", "событие", "событие", "событие", "событие", "событие", "событие", "событие", "событие"],
        "Книги": ["книга", "книга", "книга", "книга", "книга", "книга", "книга", "книга", "книга", "книга"],
        "Фильмы": ["фильм", "фильм", "фильм", "фильм", "фильм", "фильм", "фильм", "фильм", "фильм", "фильм"],
        "Музыка": ["музыка", "музыка", "музыка", "музыка", "музыка", "музыка", "музыка", "музыка", "музыка", "музыка"],
        "Игры": ["игра", "игра", "игра", "игра", "игра", "игра", "игра", "игра", "игра", "игра"],
        #"Прочее": ["прочее", "прочее", "прочее", "прочее", "прочее", "прочее", "прочее", "прочее", "прочее", "прочее"],
        "Общее": []  # Для всего остального
    }
    
    def __init__(self, openai_client: openai.AsyncOpenAI):
        self.openai_client = openai_client
    
    def _extract_keywords_simple(self, content: str) -> List[str]:
        """Простое извлечение ключевых слов без AI"""
        # Удаляем знаки препинания и приводим к нижнему регистру
        words = re.findall(r'\b\w+\b', content.lower())
        # Фильтруем короткие слова и стоп-слова
        stop_words = {'и', 'в', 'на', 'с', 'по', 'для', 'от', 'до', 'из', 'к', 'у', 'о', 'а', 'но', 'что', 'как', 'это', 'то', 'же', 'бы', 'не', 'или', 'да', 'нет'}
        keywords = [word for word in words if len(word) > 2 and word not in stop_words]
        return list(set(keywords))  # Убираем дубликаты
    
    def _categorize_by_keywords(self, content: str) -> str:
        """Категоризация по ключевым словам как fallback"""
        content_lower = content.lower()
        
        # Подсчитываем совпадения для каждой категории
        category_scores = {}
        for category, keywords in self.CATEGORIES.items():
            if not keywords:  # Пропускаем "Общее"
                continue
            score = sum(1 for keyword in keywords if keyword in content_lower)
            if score > 0:
                category_scores[category] = score
        
        # Возвращаем категорию с наибольшим количеством совпадений
        if category_scores:
            return max(category_scores, key=category_scores.get)
        
        return "Общее"
    
    def _assess_importance_by_keywords(self, content: str) -> int:
        """Оценка важности по ключевым словам как fallback"""
        content_lower = content.lower()
        
        # Высокая важность (7-10)
        high_importance = ['срочно', 'важно', 'критично', 'дедлайн', 'deadline', 'проект', 'встреча', 'звонок', 'задача', 'цель']
        # Средняя важность (4-6)  
        medium_importance = ['план', 'идея', 'изучить', 'прочитать', 'посмотреть', 'исследование']
        # Низкая важность (1-3)
        low_importance = ['заметка', 'мысль', 'интересно', 'возможно', 'может быть']
        
        high_count = sum(1 for word in high_importance if word in content_lower)
        medium_count = sum(1 for word in medium_importance if word in content_lower)
        low_count = sum(1 for word in low_importance if word in content_lower)
        
        # Длина контента тоже влияет на важность
        length_factor = min(len(content) / 500, 2)  # Длинные заметки обычно важнее
        
        if high_count > 0:
            return min(10, 7 + high_count + int(length_factor))
        elif medium_count > 0:
            return min(8, 4 + medium_count + int(length_factor))
        elif low_count > 0:
            return max(1, 3 - low_count + int(length_factor))
        else:
            return 5  # Средняя важность по умолчанию
    
    async def categorize_note(self, content: str) -> str:
        """
        Улучшенная категоризация заметки с fallback
        """
        if not content or len(content.strip()) < 10:
            return "Общее"
        
        try:
            prompt = f"""
Определи наиболее подходящую категорию для заметки из следующего списка:

КАТЕГОРИИ:
• Обучение - курсы, лекции, изучение технологий, образовательные материалы
• Проект - планы проектов, задачи, этапы работы, техзадания  
• Идея - концепции, инновации, творческие мысли, предложения
• Работа - рабочие задачи, встречи, отчеты, корпоративные дела
• Исследование - анализ, изучение данных, эксперименты, research
• Финансы - деньги, бюджет, инвестиции, расходы, доходы
• Здоровье - медицина, фитнес, диета, лечение, самочувствие
• Путешествия - поездки, отпуск, маршруты, отели, билеты
• Покупки - товары, магазины, заказы, цены, скидки
• Личное - семья, друзья, хобби, личные размышления
• Техника - программирование, IT, технологии, код, алгоритмы
• Ссылки - веб-ресурсы, статьи, документы, материалы для изучения
• Общее - все остальное, что не подходит под другие категории

ЗАМЕТКА:
{content[:1000]}

ИНСТРУКЦИЯ: Верни ТОЛЬКО название категории, без дополнительного текста.
"""
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",  # Используем более быструю модель
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=50
            )
            
            result = response.choices[0].message.content.strip()
            
            # Проверяем, что результат - одна из наших категорий
            if result in self.CATEGORIES:
                return result
            
            # Если AI вернул что-то другое, пробуем найти похожую категорию
            for category in self.CATEGORIES:
                if category.lower() in result.lower():
                    return category
            
            # Fallback к анализу ключевых слов
            return self._categorize_by_keywords(content)
            
        except Exception as e:
            print(f"Ошибка категоризации AI: {e}")
            # Fallback к анализу ключевых слов
            return self._categorize_by_keywords(content)
    
    async def assess_importance(self, content: str) -> int:
        """
        Улучшенная оценка важности заметки (1-10) с fallback
        """
        if not content or len(content.strip()) < 5:
            return 3
        
        try:
            prompt = f"""
Оцени важность заметки по шкале от 1 до 10 на основе следующих критериев:

ШКАЛА ВАЖНОСТИ:
• 1-2: Очень низкая - случайные мысли, незначительные заметки
• 3-4: Низкая - общая информация, интересные факты  
• 5-6: Средняя - полезная информация, планы на будущее
• 7-8: Высокая - важные задачи, ключевые идеи, рабочие проекты
• 9-10: Критическая - срочные дедлайны, критически важные решения

КРИТЕРИИ ОЦЕНКИ:
- Срочность (есть ли дедлайны, временные рамки)
- Влияние на работу/жизнь (насколько это важно для достижения целей)
- Конкретность (четкие задачи важнее общих размышлений)
- Практическая ценность (можно ли это использовать)

ЗАМЕТКА:
{content[:800]}

ИНСТРУКЦИЯ: Верни ТОЛЬКО число от 1 до 10, без дополнительного текста.
"""
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=10
            )
            
            result = response.choices[0].message.content.strip()
            
            # Извлекаем число из ответа
            numbers = re.findall(r'\d+', result)
            if numbers:
                importance = int(numbers[0])
                return max(1, min(10, importance))  # Ограничиваем диапазон 1-10
            
            # Fallback к анализу ключевых слов
            return self._assess_importance_by_keywords(content)
            
        except Exception as e:
            print(f"Ошибка оценки важности AI: {e}")
            # Fallback к анализу ключевых слов
            return self._assess_importance_by_keywords(content)
    
    async def generate_summary(self, content: str) -> str:
        """
        Улучшенная генерация краткого резюме заметки
        """
        if not content or len(content.strip()) < 20:
            return content[:100] + "..." if len(content) > 100 else content
        
        try:
            prompt = f"""
Создай краткое резюме заметки (максимум 2-3 предложения).
Резюме должно отражать основную суть и ключевые моменты.

ЗАМЕТКА:
{content}

ИНСТРУКЦИЯ: Верни только резюме, без дополнительного текста.
"""
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=200
            )
            
            summary = response.choices[0].message.content.strip()
            return summary if summary else content[:200] + "..."
            
        except Exception as e:
            print(f"Ошибка генерации резюме: {e}")
            # Fallback - первые 200 символов
            return content[:200] + "..." if len(content) > 200 else content
    
    async def suggest_tags(self, content: str) -> List[str]:
        """
        Улучшенное предложение тегов для заметки
        """
        if not content or len(content.strip()) < 10:
            return []
        
        try:
            prompt = f"""
Предложи 3-7 релевантных тегов для заметки.
Теги должны быть:
- Короткими (1-2 слова)
- Конкретными и полезными для поиска
- На русском языке
- Отражающими ключевые темы заметки

ЗАМЕТКА:
{content[:600]}

ИНСТРУКЦИЯ: Верни теги через запятую, без дополнительного текста.
Пример: программирование, python, веб-разработка, backend
"""
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                max_tokens=100
            )
            
            result = response.choices[0].message.content.strip()
            tags = [tag.strip() for tag in result.split(',') if tag.strip()]
            
            # Ограничиваем количество тегов и их длину
            return [tag for tag in tags[:7] if len(tag) <= 30]
            
        except Exception as e:
            print(f"Ошибка генерации тегов: {e}")
            # Fallback - извлекаем ключевые слова
            keywords = self._extract_keywords_simple(content)
            return keywords[:5]
    
    async def find_connections(self, new_content: str, existing_notes: List[Any]) -> List[Dict[str, Any]]:
        """
        Улучшенный поиск связей между заметками
        """
        if not new_content or not existing_notes:
            return []
        
        try:
            # Ограничиваем количество заметок для анализа
            notes_to_analyze = existing_notes[:20]
            
            notes_data = []
            for note in notes_to_analyze:
                notes_data.append({
                    "id": note.id,
                    "title": getattr(note, 'title', 'Без названия'),
                    "content": note.content[:300],
                    "category": getattr(note, 'category', 'Общее')
                })
            
            prompt = f"""
Найди связи между новой заметкой и существующими заметками.

НОВАЯ ЗАМЕТКА:
{new_content[:500]}

СУЩЕСТВУЮЩИЕ ЗАМЕТКИ:
{json.dumps(notes_data, ensure_ascii=False, indent=2)}

ТИПЫ СВЯЗЕЙ:
- RELATED: связанные темы или контекст
- SIMILAR: похожие идеи или концепции  
- FOLLOW_UP: продолжение или развитие темы
- PREREQUISITE: необходимые предварительные знания

ИНСТРУКЦИЯ: Верни JSON массив объектов со связями (максимум 5):
[{{"note_id": 123, "relation": "RELATED", "reason": "обе заметки про Python"}}]

Если связей нет, верни пустой массив: []
"""
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                max_tokens=500
            )
            
            result = response.choices[0].message.content.strip()
            connections = json.loads(result)
            
            # Валидируем результат
            valid_connections = []
            for conn in connections[:5]:  # Максимум 5 связей
                if isinstance(conn, dict) and 'note_id' in conn and 'relation' in conn:
                    valid_connections.append(conn)
            
            return valid_connections
            
        except Exception as e:
            print(f"Ошибка поиска связей: {e}")
            return []
    
    async def extract_keywords(self, content: str) -> List[str]:
        """
        Извлечение ключевых слов из заметки
        """
        return self._extract_keywords_simple(content)
    
    async def detect_topics(self, content: str) -> List[str]:
        """
        Определение основных тем заметки
        """
        if not content or len(content.strip()) < 20:
            return []
        
        try:
            prompt = f"""
Определи 2-4 основные темы в заметке.
Темы должны быть конкретными и полезными.

ЗАМЕТКА:
{content[:600]}

ИНСТРУКЦИЯ: Верни темы через запятую.
Пример: веб-разработка, базы данных, оптимизация
"""
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                max_tokens=100
            )
            
            result = response.choices[0].message.content.strip()
            topics = [topic.strip() for topic in result.split(',') if topic.strip()]
            return topics[:4]
            
        except Exception as e:
            print(f"Ошибка определения тем: {e}")
            return []
    
    async def analyze_sentiment(self, content: str) -> Dict[str, Any]:
        """
        Анализ тональности заметки
        """
        if not content:
            return {"sentiment": "neutral", "confidence": 0.5}
        
        try:
            # Простой анализ тональности по ключевым словам
            positive_words = ['хорошо', 'отлично', 'успех', 'радость', 'позитив', 'удача', 'достижение']
            negative_words = ['плохо', 'ошибка', 'проблема', 'неудача', 'грусть', 'сложно', 'трудно']
            
            content_lower = content.lower()
            positive_count = sum(1 for word in positive_words if word in content_lower)
            negative_count = sum(1 for word in negative_words if word in content_lower)
            
            if positive_count > negative_count:
                sentiment = "positive"
                confidence = min(0.9, 0.6 + (positive_count - negative_count) * 0.1)
            elif negative_count > positive_count:
                sentiment = "negative"  
                confidence = min(0.9, 0.6 + (negative_count - positive_count) * 0.1)
            else:
                sentiment = "neutral"
                confidence = 0.7
            
            return {
                "sentiment": sentiment,
                "confidence": confidence
            }
            
        except Exception as e:
            print(f"Ошибка анализа тональности: {e}")
            return {"sentiment": "neutral", "confidence": 0.5}
    
    async def find_action_items(self, content: str) -> List[str]:
        """
        Поиск задач и действий в заметке
        """
        if not content:
            return []
        
        # Простой поиск по ключевым словам и паттернам
        action_patterns = [
            r'нужно\s+([^.!?]+)',
            r'надо\s+([^.!?]+)', 
            r'сделать\s+([^.!?]+)',
            r'выполнить\s+([^.!?]+)',
            r'TODO:?\s*([^.!?\n]+)',
            r'[-•]\s*([^.!?\n]+)',
        ]
        
        actions = []
        for pattern in action_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            actions.extend([match.strip() for match in matches if len(match.strip()) > 5])
        
        return list(set(actions))[:10]  # Убираем дубликаты и ограничиваем количество
    
    async def suggest_improvements(self, content: str) -> List[str]:
        """
        Предложение улучшений для заметки
        """
        improvements = []
        
        if len(content) < 50:
            improvements.append("Добавить больше деталей и контекста")
        
        if not re.search(r'[.!?]', content):
            improvements.append("Структурировать текст с помощью знаков препинания")
        
        if len(content.split('\n')) == 1 and len(content) > 200:
            improvements.append("Разбить текст на абзацы для лучшей читаемости")
        
        if not re.search(r'[0-9]', content) and 'план' in content.lower():
            improvements.append("Добавить конкретные даты или числовые показатели")
        
        return improvements[:5]
    
    async def organize_notes(self, notes: List[Any]) -> List[Dict[str, Any]]:
        """
        Организация заметок в логические группы
        """
        if not notes:
            return []
        
        # Группируем по категориям
        groups = {}
        for note in notes:
            category = getattr(note, 'category', 'Общее')
            if category not in groups:
                groups[category] = []
            groups[category].append(note.id)
        
        # Формируем результат
        result = []
        for category, note_ids in groups.items():
            if len(note_ids) > 1:  # Группы только если больше одной заметки
                result.append({
                    "group_name": f"Группа: {category}",
                    "theme": category,
                    "notes": note_ids,
                    "summary": f"Заметки категории '{category}' ({len(note_ids)} шт.)"
                })
        
        return result 