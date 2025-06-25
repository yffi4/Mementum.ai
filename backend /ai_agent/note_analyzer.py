import json
from typing import List, Dict, Any
import openai
from .prompts import AGENT_PROMPTS


class NoteAnalyzer:
    """
    Анализатор заметок для категоризации, оценки важности и поиска связей
    """
    
    def __init__(self, openai_client: openai.AsyncOpenAI):
        self.openai_client = openai_client
    
    async def categorize_note(self, content: str) -> str:
        """
        Категоризация заметки
        """
        prompt = AGENT_PROMPTS["categorization"].format(content=content)
        
        response = await self.openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1
        )
        
        return response.choices[0].message.content.strip()
    
    async def assess_importance(self, content: str) -> int:
        """
        Оценка важности заметки (1-10)
        """
        prompt = AGENT_PROMPTS["importance_assessment"].format(content=content)
        
        response = await self.openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1
        )
        
        try:
            return int(response.choices[0].message.content.strip())
        except ValueError:
            return 5  # Средняя важность по умолчанию
    
    async def find_connections(self, new_content: str, existing_notes: List[Any]) -> List[Dict[str, Any]]:
        """
        Поиск связей между новой заметкой и существующими
        """
        # Подготавливаем данные существующих заметок
        notes_data = []
        for note in existing_notes:
            notes_data.append({
                "id": note.id,
                "title": getattr(note, 'title', ''),
                "content": note.content[:500]  # Ограничиваем длину для промпта
            })
        
        prompt = AGENT_PROMPTS["connection_finding"].format(
            new_content=new_content,
            existing_notes=json.dumps(notes_data, ensure_ascii=False)
        )
        
        response = await self.openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )
        
        try:
            connections = json.loads(response.choices[0].message.content)
            return connections
        except json.JSONDecodeError:
            return []
    
    async def organize_notes(self, notes: List[Any]) -> List[Dict[str, Any]]:
        """
        Организация заметок в логические группы
        """
        # Подготавливаем данные заметок
        notes_data = []
        for note in notes:
            notes_data.append({
                "id": note.id,
                "title": getattr(note, 'title', ''),
                "content": note.content[:300],
                "created_at": str(note.created_at)
            })
        
        prompt = AGENT_PROMPTS["note_organization"].format(
            notes=json.dumps(notes_data, ensure_ascii=False)
        )
        
        response = await self.openai_client.chat.completions.create(
            model="gpt-4.1",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        
        try:
            groups = json.loads(response.choices[0].message.content)
            return groups
        except json.JSONDecodeError:
            return []
    
    async def extract_keywords(self, content: str) -> List[str]:
        """
        Извлечение ключевых слов из заметки
        """
        prompt = f"""
        Извлеки ключевые слова из текста. Верни только список слов через запятую.
        
        Текст: {content}
        """
        
        response = await self.openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1
        )
        
        keywords = response.choices[0].message.content.strip().split(',')
        return [kw.strip() for kw in keywords if kw.strip()]
    
    async def generate_summary(self, content: str) -> str:
        """
        Генерация краткого резюме заметки
        """
        prompt = f"""
        Создай краткое резюме (2-3 предложения) следующего текста:
        
        {content}
        """
        
        response = await self.openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        
        return response.choices[0].message.content.strip()
    
    async def suggest_tags(self, content: str) -> List[str]:
        """
        Предложение тегов для заметки
        """
        prompt = f"""
        Предложи 5-7 релевантных тегов для заметки. Верни только теги через запятую.
        
        Содержимое: {content}
        """
        
        response = await self.openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )
        
        tags = response.choices[0].message.content.strip().split(',')
        return [tag.strip() for tag in tags if tag.strip()]
    
    async def detect_topics(self, content: str) -> List[str]:
        """
        Определение основных тем заметки
        """
        prompt = f"""
        Определи основные темы (3-5) в тексте. Верни только названия тем через запятую.
        
        Текст: {content}
        """
        
        response = await self.openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )
        
        topics = response.choices[0].message.content.strip().split(',')
        return [topic.strip() for topic in topics if topic.strip()]
    
    async def analyze_sentiment(self, content: str) -> Dict[str, Any]:
        """
        Анализ тональности и эмоциональной окраски заметки
        """
        prompt = f"""
        Проанализируй тональность и эмоциональную окраску текста.
        
        Текст: {content}
        
        Верни JSON:
        {{
            "sentiment": "positive|neutral|negative",
            "confidence": 0.85,
            "emotions": ["интерес", "энтузиазм", "спокойствие"],
            "tone": "формальный|неформальный|технический|творческий"
        }}
        """
        
        response = await self.openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1
        )
        
        try:
            return json.loads(response.choices[0].message.content)
        except json.JSONDecodeError:
            return {
                "sentiment": "neutral",
                "confidence": 0.5,
                "emotions": [],
                "tone": "neutral"
            }
    
    async def suggest_improvements(self, content: str) -> List[str]:
        """
        Предложение улучшений для заметки
        """
        prompt = f"""
        Предложи 3-5 улучшений для заметки:
        - Структура и организация
        - Ясность и понятность
        - Полнота информации
        - Практическая ценность
        
        Заметка: {content}
        
        Верни список предложений через перенос строки.
        """
        
        response = await self.openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4
        )
        
        improvements = response.choices[0].message.content.strip().split('\n')
        return [imp.strip() for imp in improvements if imp.strip()]
    
    async def find_action_items(self, content: str) -> List[str]:
        """
        Поиск задач и действий в заметке
        """
        prompt = f"""
        Найди все задачи, действия и пункты "что нужно сделать" в тексте.
        
        Текст: {content}
        
        Верни список действий через перенос строки.
        """
        
        response = await self.openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )
        
        actions = response.choices[0].message.content.strip().split('\n')
        return [action.strip() for action in actions if action.strip()] 