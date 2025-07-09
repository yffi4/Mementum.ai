import json
import re
from typing import List, Dict, Any, Optional
import openai
from .prompts import AGENT_PROMPTS


class NoteAnalyzer:
    """
    Улучшенный анализатор заметок с поддержкой многоязычности.
    Определяет язык входящего текста и генерирует ответы на том же языке.
    """
    
    # Предопределенные категории для разных языков
    CATEGORIES = {
        "ru": {
            "Обучение": ["курс", "лекция", "изучение", "обучение", "образование", "tutorial", "гайд", "инструкция"],
            "Проект": ["проект", "задача", "план", "этап", "milestone", "цель", "техзадание", "requirements"],
            "Идея": ["идея", "концепция", "мысль", "инновация", "предложение", "brainstorm", "креатив"],
            "Работа": ["работа", "офис", "коллега", "начальник", "задание", "отчет", "встреча", "совещание"],
            "Исследование": ["исследование", "анализ", "изучение", "эксперимент", "данные", "статистика", "research"],
            "Финансы": ["деньги", "бюджет", "расходы", "доходы", "инвестиции", "банк", "кредит", "налоги"],
            "Здоровье": ["здоровье", "врач", "лечение", "диета", "спорт", "фитнес", "медицина", "болезнь"],
            "Путешествия": ["путешествие", "поездка", "отпуск", "отель", "билет", "виза", "маршрут"],
            "Покупки": ["покупка", "магазин", "товар", "цена", "скидка", "заказ", "доставка"],
            "Личное": ["семья", "друзья", "хобби", "личное", "дом", "отношения", "эмоции"],
            "Техника": ["программирование", "код", "алгоритм", "технология", "IT", "software", "hardware"],
            "Ссылки": ["ссылка", "статья", "документ", "ресурс", "материал", "источник"],
            "Общее": ["заметка", "запись", "информация", "разное", "прочее"]
        },
        "en": {
            "Learning": ["course", "lecture", "study", "education", "tutorial", "guide", "instruction", "training"],
            "Project": ["project", "task", "plan", "stage", "milestone", "goal", "requirements", "specification"],
            "Idea": ["idea", "concept", "thought", "innovation", "proposal", "brainstorm", "creative"],
            "Work": ["work", "office", "colleague", "boss", "assignment", "report", "meeting", "conference"],
            "Research": ["research", "analysis", "study", "experiment", "data", "statistics", "investigation"],
            "Finance": ["money", "budget", "expenses", "income", "investment", "bank", "credit", "taxes"],
            "Health": ["health", "doctor", "treatment", "diet", "sport", "fitness", "medicine", "illness"],
            "Travel": ["travel", "trip", "vacation", "hotel", "ticket", "visa", "route"],
            "Shopping": ["shopping", "store", "product", "price", "discount", "order", "delivery"],
            "Personal": ["family", "friends", "hobby", "personal", "home", "relationships", "emotions"],
            "Tech": ["programming", "code", "algorithm", "technology", "IT", "software", "hardware"],
            "Links": ["link", "article", "document", "resource", "material", "source"],
            "General": ["note", "record", "information", "miscellaneous", "other"]
        }
    }
    
    def __init__(self, openai_client: Optional[openai.AsyncOpenAI] = None):
        self.openai_client = openai_client or openai.AsyncOpenAI()
    
    async def detect_language(self, text: str) -> str:
        """
        Определение языка текста
        """
        if not text or len(text.strip()) < 3:
            return "en"
        
        try:
            prompt = AGENT_PROMPTS["language_detection"].format(text=text[:500])
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=10
            )
            
            detected_lang = response.choices[0].message.content.strip().lower()
            
            # Проверяем на корректность
            if detected_lang in ['ru', 'en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko']:
                return detected_lang
            else:
                return "en"
                
        except Exception as e:
            print(f"Ошибка определения языка: {e}")
            # Fallback - простая эвристика
            return self._detect_language_fallback(text)
    
    def _detect_language_fallback(self, text: str) -> str:
        """
        Простое определение языка по ключевым словам
        """
        text_lower = text.lower()
        
        # Русские слова
        russian_words = ['что', 'как', 'где', 'когда', 'зачем', 'почему', 'если', 'тогда', 'или', 'но', 'да', 'нет', 'это', 'для', 'из', 'на', 'в', 'с', 'по', 'к', 'от', 'за', 'над', 'под', 'перед', 'после', 'через', 'без', 'про', 'при', 'о', 'об', 'и', 'а', 'у', 'ы', 'э', 'ё', 'ю', 'я', 'щ', 'ъ', 'ь']
        
        # Английские слова
        english_words = ['the', 'and', 'or', 'but', 'if', 'then', 'what', 'how', 'where', 'when', 'why', 'who', 'which', 'that', 'this', 'with', 'for', 'from', 'to', 'of', 'in', 'on', 'at', 'by', 'as', 'be', 'have', 'do', 'will', 'would', 'could', 'should', 'can', 'may', 'might', 'must']
        
        russian_count = sum(1 for word in russian_words if word in text_lower)
        english_count = sum(1 for word in english_words if word in text_lower)
        
        if russian_count > english_count:
            return "ru"
        else:
            return "en"
    
    async def categorize_note(self, content: str) -> str:
        """
        Улучшенная категоризация заметки с поддержкой языков
        """
        if not content or len(content.strip()) < 10:
            return "General" if await self.detect_language(content) == "en" else "Общее"
        
        try:
            # Определяем язык
            language = await self.detect_language(content)
            
            # Используем новый промпт
            prompt = AGENT_PROMPTS["categorization"].format(content=content[:1000])
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=50
            )
            
            category = response.choices[0].message.content.strip()
            
            # Проверяем корректность категории
            if language == "ru":
                valid_categories = list(self.CATEGORIES["ru"].keys())
            else:
                valid_categories = list(self.CATEGORIES["en"].keys())
            
            if category in valid_categories:
                return category
            else:
                return self._categorize_by_keywords(content, language)
                
        except Exception as e:
            print(f"Ошибка категоризации AI: {e}")
            language = await self.detect_language(content)
            return self._categorize_by_keywords(content, language)
    
    def _categorize_by_keywords(self, content: str, language: str) -> str:
        """
        Категоризация по ключевым словам
        """
        content_lower = content.lower()
        categories = self.CATEGORIES.get(language, self.CATEGORIES["en"])
        
        category_scores = {}
        for category, keywords in categories.items():
            score = sum(1 for keyword in keywords if keyword in content_lower)
            if score > 0:
                category_scores[category] = score
        
        if category_scores:
            return max(category_scores, key=category_scores.get)
        else:
            return "General" if language == "en" else "Общее"
    
    async def assess_importance(self, content: str) -> int:
        """
        Оценка важности заметки (универсальная для всех языков)
        """
        if not content or len(content.strip()) < 10:
            return 3
        
        try:
            prompt = AGENT_PROMPTS["importance_assessment"].format(content=content[:1000])
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=10
            )
            
            # Извлекаем число из ответа
            import re
            numbers = re.findall(r'\d+', response.choices[0].message.content)
            
            if numbers:
                importance = int(numbers[0])
                return max(1, min(10, importance))  # Ограничиваем диапазон 1-10
            
            # Fallback к анализу ключевых слов
            return self._assess_importance_by_keywords(content)
            
        except Exception as e:
            print(f"Ошибка оценки важности AI: {e}")
            return self._assess_importance_by_keywords(content)
    
    def _assess_importance_by_keywords(self, content: str) -> int:
        """
        Оценка важности по ключевым словам
        """
        content_lower = content.lower()
        
        # Высокая важность
        high_importance = ["urgent", "critical", "important", "deadline", "asap", "priority", "срочно", "критично", "важно", "дедлайн", "приоритет"]
        
        # Средняя важность
        medium_importance = ["meeting", "task", "project", "goal", "plan", "встреча", "задача", "проект", "цель", "план"]
        
        # Низкая важность
        low_importance = ["note", "idea", "thought", "maybe", "заметка", "идея", "мысль", "может быть"]
        
        high_score = sum(1 for word in high_importance if word in content_lower)
        medium_score = sum(1 for word in medium_importance if word in content_lower)
        low_score = sum(1 for word in low_importance if word in content_lower)
        
        if high_score > 0:
            return min(8 + high_score, 10)
        elif medium_score > 0:
            return min(5 + medium_score, 7)
        elif low_score > 0:
            return max(1, 3 - low_score)
        else:
            return 5  # Средняя важность по умолчанию
    
    async def generate_summary(self, content: str) -> str:
        """
        Генерация краткого резюме на языке оригинала
        """
        if not content or len(content.strip()) < 20:
            return content[:100] + "..." if len(content) > 100 else content
        
        try:
            prompt = AGENT_PROMPTS["summary_generation"].format(content=content)
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=200
            )
            
            summary = response.choices[0].message.content.strip()
            return summary if summary else content[:200] + "..."
            
        except Exception as e:
            print(f"Ошибка генерации резюме: {e}")
            return content[:200] + "..." if len(content) > 200 else content
    
    async def suggest_tags(self, content: str) -> List[str]:
        """
        Предложение тегов на языке оригинала
        """
        if not content or len(content.strip()) < 10:
            return []
        
        try:
            prompt = AGENT_PROMPTS["tags_generation"].format(content=content[:1000])
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=100
            )
            
            # Парсим JSON ответ
            try:
                tags = json.loads(response.choices[0].message.content)
                return tags[:5] if isinstance(tags, list) else []
            except json.JSONDecodeError:
                # Fallback - извлекаем теги из текста
                content_text = response.choices[0].message.content
                tags = [tag.strip() for tag in content_text.split(',') if tag.strip()]
                return tags[:5]
                
        except Exception as e:
            print(f"Ошибка генерации тегов: {e}")
            return self._extract_tags_by_keywords(content)
    
    def _extract_tags_by_keywords(self, content: str) -> List[str]:
        """
        Извлечение тегов по ключевым словам
        """
        # Простое извлечение часто встречающихся слов
        words = re.findall(r'\b\w+\b', content.lower())
        word_freq = {}
        for word in words:
            if len(word) > 3:  # Игнорируем короткие слова
                word_freq[word] = word_freq.get(word, 0) + 1
        
        # Сортируем по частоте и берем топ-5
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        return [word for word, freq in sorted_words[:5]]
    
    async def extract_keywords(self, content: str) -> List[str]:
        """
        Извлечение ключевых слов на языке оригинала
        """
        if not content or len(content.strip()) < 10:
            return []
        
        try:
            prompt = AGENT_PROMPTS["keyword_extraction"].format(content=content[:1000])
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=150
            )
            
            try:
                keywords = json.loads(response.choices[0].message.content)
                return keywords[:10] if isinstance(keywords, list) else []
            except json.JSONDecodeError:
                # Fallback
                return self._extract_tags_by_keywords(content)
                
        except Exception as e:
            print(f"Ошибка извлечения ключевых слов: {e}")
            return self._extract_tags_by_keywords(content)
    
    async def detect_topics(self, content: str) -> List[str]:
        """
        Определение тем на языке оригинала
        """
        if not content or len(content.strip()) < 10:
            return []
        
        try:
            prompt = AGENT_PROMPTS["topics_detection"].format(content=content[:1000])
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=100
            )
            
            try:
                topics = json.loads(response.choices[0].message.content)
                return topics[:5] if isinstance(topics, list) else []
            except json.JSONDecodeError:
                return []
                
        except Exception as e:
            print(f"Ошибка определения тем: {e}")
            return []
    
    async def analyze_sentiment(self, content: str) -> str:
        """
        Анализ настроения (универсальный для всех языков)
        """
        if not content or len(content.strip()) < 10:
            return "neutral"
        
        try:
            prompt = AGENT_PROMPTS["sentiment_analysis"].format(content=content[:1000])
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=20
            )
            
            sentiment = response.choices[0].message.content.strip().lower()
            
            if sentiment in ['positive', 'negative', 'neutral']:
                return sentiment
            else:
                return "neutral"
                
        except Exception as e:
            print(f"Ошибка анализа настроения: {e}")
            return "neutral"
    
    async def suggest_improvements(self, content: str) -> List[str]:
        """
        Предложения по улучшению на языке оригинала
        """
        if not content or len(content.strip()) < 20:
            return []
        
        try:
            prompt = AGENT_PROMPTS["improvements_suggestion"].format(content=content[:1000])
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=200
            )
            
            try:
                improvements = json.loads(response.choices[0].message.content)
                return improvements[:5] if isinstance(improvements, list) else []
            except json.JSONDecodeError:
                return []
                
        except Exception as e:
            print(f"Ошибка предложений по улучшению: {e}")
            return []
    
    async def find_action_items(self, content: str) -> List[Dict[str, Any]]:
        """
        Извлечение действий на языке оригинала
        """
        if not content or len(content.strip()) < 20:
            return []
        
        try:
            prompt = AGENT_PROMPTS["action_items_extraction"].format(content=content[:1000])
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=200
            )
            
            try:
                actions = json.loads(response.choices[0].message.content)
                return actions[:5] if isinstance(actions, list) else []
            except json.JSONDecodeError:
                return []
                
        except Exception as e:
            print(f"Ошибка извлечения действий: {e}")
            return []
    
    async def find_connections(self, new_content: str, existing_notes: List[Any]) -> List[Dict[str, Any]]:
        """
        Поиск связей между заметками
        """
        if not new_content or not existing_notes:
            return []
        
        try:
            # Подготавливаем данные о существующих заметках
            notes_data = []
            for note in existing_notes[:20]:  # Ограничиваем до 20 заметок
                notes_data.append({
                    "id": note.id,
                    "title": note.title,
                    "content": note.content[:200],
                    "category": getattr(note, 'category', 'General')
                })
            
            prompt = AGENT_PROMPTS["connection_finding"].format(
                new_content=new_content[:1000],
                existing_notes=json.dumps(notes_data, ensure_ascii=False)
            )
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=300
            )
            
            try:
                connections = json.loads(response.choices[0].message.content)
                return connections[:10] if isinstance(connections, list) else []
            except json.JSONDecodeError:
                return []
                
        except Exception as e:
            print(f"Ошибка поиска связей: {e}")
            return []
    
    async def organize_notes(self, notes: List[Any]) -> List[Dict[str, Any]]:
        """
        Организация заметок в группы
        """
        if not notes:
            return []
        
        try:
            # Подготавливаем данные о заметках
            notes_data = []
            for note in notes[:50]:  # Ограничиваем до 50 заметок
                notes_data.append({
                    "id": note.id,
                    "title": note.title,
                    "content": note.content[:200],
                    "category": getattr(note, 'category', 'General'),
                    "created_at": str(note.created_at)
                })
            
            prompt = AGENT_PROMPTS["note_organization"].format(
                notes=json.dumps(notes_data, ensure_ascii=False)
            )
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=500
            )
            
            try:
                groups = json.loads(response.choices[0].message.content)
                return groups if isinstance(groups, list) else []
            except json.JSONDecodeError:
                return []
                
        except Exception as e:
            print(f"Ошибка организации заметок: {e}")
            return [] 

    async def generate_title(self, content: str) -> str:
        """
        Генерирует заголовок для заметки на основе содержимого
        """
        try:
            # Обрезаем содержимое если оно слишком длинное
            truncated_content = content[:1000] if len(content) > 1000 else content
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "user", "content": AGENT_PROMPTS["title_generation"].format(content=truncated_content)}
                ],
                max_tokens=50,
                temperature=0.7
            )
            
            title = response.choices[0].message.content.strip()
            
            # Убираем кавычки если они есть
            if title.startswith('"') and title.endswith('"'):
                title = title[1:-1]
            if title.startswith("'") and title.endswith("'"):
                title = title[1:-1]
            
            # Ограничиваем длину заголовка
            if len(title) > 100:
                title = title[:97] + "..."
            
            return title
            
        except Exception as e:
            print(f"Ошибка генерации заголовка: {str(e)}")
            # Возвращаем первые несколько слов содержимого как заголовок
            words = content.split()[:5]
            return " ".join(words) + ("..." if len(words) == 5 else "") 