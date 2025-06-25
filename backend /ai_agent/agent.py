import asyncio
import aiohttp
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import openai
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import pickle
import os
from pathlib import Path

from models import Note, User
from notes import crud as notes_crud
from notes.schemas import NoteCreate, NoteUpdate, NoteConnectionCreate
from .web_scraper import WebScraper
from .note_analyzer import NoteAnalyzer
from .calendar_manager import CalendarManager
from .prompts import AGENT_PROMPTS


class AIAgent:
    """
    Интеллектуальный агент для управления заметками
    - Создание и сортировка заметок
    - Интеграция с Google Calendar
    - Парсинг интернета для поиска связанных ссылок
    - Анализ и категоризация заметок
    """
    
    def __init__(self, db: AsyncSession, user: User):
        self.db = db
        self.user = user
        self.openai_client = openai.AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.web_scraper = WebScraper()
        self.note_analyzer = NoteAnalyzer(self.openai_client)
        self.calendar_manager = CalendarManager()
        
    async def process_user_request(self, request: str) -> Dict[str, Any]:
        """
        Обработка запроса пользователя
        """
        try:
            # Анализируем запрос
            analysis = await self._analyze_request(request)
            
            if analysis["type"] == "create_note":
                return await self._create_note_from_request(request, analysis)
            elif analysis["type"] == "create_plan":
                return await self._create_learning_plan(request, analysis)
            elif analysis["type"] == "save_link":
                return await self._save_web_content(request, analysis)
            elif analysis["type"] == "reminder":
                return await self._create_reminder(request, analysis)
            elif analysis["type"] == "search":
                return await self._search_and_organize(request, analysis)
            else:
                return await self._general_assistance(request, analysis)
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Произошла ошибка при обработке запроса"
            }
    
    async def _analyze_request(self, request: str) -> Dict[str, Any]:
        """
        Анализ запроса пользователя для определения типа действия
        """
        try:
            prompt = AGENT_PROMPTS["request_analysis"].format(request=request)
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1
            )
            
            analysis = json.loads(response.choices[0].message.content)
            
            # Устанавливаем значения по умолчанию для обязательных полей
            default_values = {
                "type": "create_note",
                "title": "Новая заметка",
                "category": "общая",
                "format": "структурированная",
                "description": request[:100] + "..." if len(request) > 100 else request
            }
            
            # Обеспечиваем наличие всех необходимых полей
            for key, default_value in default_values.items():
                if key not in analysis or not analysis[key]:
                    analysis[key] = default_value
            
            return analysis
            
        except json.JSONDecodeError:
            # Если не удалось распарсить JSON, возвращаем значения по умолчанию
            return {
                "type": "create_note",
                "title": "Новая заметка",
                "category": "общая",
                "format": "структурированная",
                "description": request[:100] + "..." if len(request) > 100 else request
            }
        except Exception as e:
            # Логируем ошибку, но все равно возвращаем значения по умолчанию
            print(f"Ошибка при анализе запроса: {str(e)}")
            return {
                "type": "create_note",
                "title": "Новая заметка",
                "category": "общая",
                "format": "структурированная",
                "description": request[:100] + "..." if len(request) > 100 else request
            }
    
    async def _create_note_from_request(self, request: str, analysis: Dict) -> Dict[str, Any]:
        """
        Создание заметки на основе запроса пользователя
        """
        # Генерируем структурированную заметку
        note_content = await self._generate_note_content(request, analysis)
        
        # Создаем заметку
        note_data = NoteCreate(
            title=analysis.get("title", "Новая заметка"),
            content=note_content
        )
        
        note = await notes_crud.create_note(self.db, note_data, self.user.id)
        
        # Анализируем и категоризируем заметку
        category = await self.note_analyzer.categorize_note(note.content)
        importance = await self.note_analyzer.assess_importance(note.content)
        
        # Создаем связи с существующими заметками
        await self._create_automatic_connections(note.id, note.content)
        
        return {
            "success": True,
            "note_id": note.id,
            "category": category,
            "importance": importance,
            "message": f"Заметка '{note.title}' создана и проанализирована"
        }
    
    async def _create_learning_plan(self, request: str, analysis: Dict) -> Dict[str, Any]:
        """
        Создание плана обучения или проекта
        """
        # Генерируем план с помощью AI
        plan_content = await self._generate_learning_plan(request, analysis)
        
        # Создаем основную заметку с планом
        main_note = NoteCreate(
            title=f"План: {analysis.get('title', 'Обучение/Проект')}",
            content=plan_content
        )
        
        main_note_db = await notes_crud.create_note(self.db, main_note, self.user.id)
        
        # Создаем подзаметки для каждого этапа
        steps = await self._extract_plan_steps(plan_content)
        step_notes = []
        
        for i, step in enumerate(steps, 1):
            step_note = NoteCreate(
                title=f"Шаг {i}: {step['title']}",
                content=step['content']
            )
            step_note_db = await notes_crud.create_note(self.db, step_note, self.user.id)
            step_notes.append(step_note_db)
            
            # Создаем связь с основной заметкой
            connection = NoteConnectionCreate(
                note_b_id=step_note_db.id,
                relation="PLAN_STEP"
            )
            await notes_crud.create_connection(self.db, main_note_db.id, connection, self.user.id)
        
        return {
            "success": True,
            "main_note_id": main_note_db.id,
            "steps_count": len(steps),
            "message": f"План создан с {len(steps)} этапами"
        }
    
    async def _save_web_content(self, request: str, analysis: Dict) -> Dict[str, Any]:
        """
        Сохранение контента с веб-страницы
        """
        url = analysis.get("url")
        if not url:
            return {"success": False, "error": "URL не найден в запросе"}
        
        # Парсим веб-страницу
        content = await self.web_scraper.scrape_url(url)
        
        # Создаем заметку с контентом
        note_data = NoteCreate(
            title=analysis.get("title", f"Сохранено с {url}"),
            content=f"Источник: {url}\n\n{content}"
        )
        
        note = await notes_crud.create_note(self.db, note_data, self.user.id)
        
        # Добавляем в очередь для периодического поиска связанных ссылок
        await self._schedule_link_search(note.id, content)
        
        return {
            "success": True,
            "note_id": note.id,
            "url": url,
            "message": f"Контент с {url} сохранен"
        }
    
    async def _create_reminder(self, request: str, analysis: Dict) -> Dict[str, Any]:
        """
        Создание напоминания в Google Calendar
        """
        # Извлекаем информацию о времени
        time_info = await self._extract_time_info(request)
        
        # Создаем событие в календаре
        event = await self.calendar_manager.create_event(
            summary=analysis.get("title", "Напоминание"),
            description=analysis.get("description", request),
            start_time=time_info["start"],
            end_time=time_info["end"]
        )
        
        # Создаем заметку с напоминанием
        note_data = NoteCreate(
            title=f"Напоминание: {analysis.get('title', 'Событие')}",
            content=f"Время: {time_info['start']}\nОписание: {analysis.get('description', request)}\nКалендарь ID: {event['id']}"
        )
        
        note = await notes_crud.create_note(self.db, note_data, self.user.id)
        
        return {
            "success": True,
            "note_id": note.id,
            "calendar_event_id": event['id'],
            "reminder_time": time_info["start"],
            "message": "Напоминание создано в календаре"
        }
    
    async def _search_and_organize(self, request: str, analysis: Dict) -> Dict[str, Any]:
        """
        Поиск и организация существующих заметок
        """
        # Ищем релевантные заметки
        relevant_notes = await notes_crud.search_notes(
            self.db, self.user.id, analysis.get("search_term", request), 0, 50
        )
        
        # Если заметок нет, создаём новую заметку на основе запроса
        if not relevant_notes:
            return await self._create_note_from_request(request, analysis)
        
        # Анализируем и группируем заметки
        organized_notes = await self.note_analyzer.organize_notes(relevant_notes)
        
        # Создаем сводную заметку
        summary_content = await self._create_summary_note(organized_notes, request)
        
        summary_note = NoteCreate(
            title=f"Сводка: {analysis.get('title', 'Поиск')}",
            content=summary_content
        )
        
        note = await notes_crud.create_note(self.db, summary_note, self.user.id)
        
        return {
            "success": True,
            "note_id": note.id,
            "found_notes": len(relevant_notes),
            "organized_groups": len(organized_notes),
            "message": f"Найдено и организовано {len(relevant_notes)} заметок"
        }
    
    async def _general_assistance(self, request: str, analysis: Dict) -> Dict[str, Any]:
        """
        Общая помощь и ответы на вопросы
        """
        # Генерируем ответ с помощью AI
        response = await self.openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": AGENT_PROMPTS["assistant"]},
                {"role": "user", "content": request}
            ],
            temperature=0.7
        )
        
        answer = response.choices[0].message.content
        
        # Создаем заметку с ответом
        note_data = NoteCreate(
            title=f"Ответ: {analysis.get('title', 'Вопрос')}",
            content=f"Вопрос: {request}\n\nОтвет: {answer}"
        )
        
        note = await notes_crud.create_note(self.db, note_data, self.user.id)
        
        return {
            "success": True,
            "note_id": note.id,
            "answer": answer,
            "message": "Ответ сохранен в заметке"
        }
    
    async def _generate_note_content(self, request: str, analysis: Dict) -> str:
        """
        Генерация структурированного содержимого заметки
        """
        prompt = AGENT_PROMPTS["note_generation"].format(
            request=request,
            category=analysis.get("category", "общая"),
            format=analysis.get("format", "структурированная")
        )
        
        response = await self.openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        
        return response.choices[0].message.content
    
    async def _generate_learning_plan(self, request: str, analysis: Dict) -> str:
        """
        Генерация плана обучения или проекта
        """
        prompt = AGENT_PROMPTS["plan_generation"].format(
            request=request,
            plan_type=analysis.get("plan_type", "обучение"),
            complexity=analysis.get("complexity", "средняя")
        )
        
        response = await self.openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4
        )
        
        return response.choices[0].message.content
    
    async def _extract_plan_steps(self, plan_content: str) -> List[Dict[str, str]]:
        """
        Извлечение шагов из плана
        """
        prompt = AGENT_PROMPTS["step_extraction"].format(plan_content=plan_content)
        
        response = await self.openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1
        )
        
        steps = json.loads(response.choices[0].message.content)
        return steps
    
    async def _extract_time_info(self, request: str) -> Dict[str, Any]:
        """
        Извлечение информации о времени из запроса
        """
        prompt = AGENT_PROMPTS["time_extraction"].format(request=request)
        
        response = await self.openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1
        )
        
        time_info = json.loads(response.choices[0].message.content)
        return time_info
    
    async def _create_automatic_connections(self, note_id: int, content: str) -> None:
        """
        Создание автоматических связей с существующими заметками
        """
        # Получаем все заметки пользователя
        user_notes = await notes_crud.get_user_notes(self.db, self.user.id, 0, 1000)
        
        # Анализируем связи
        connections = await self.note_analyzer.find_connections(content, user_notes)
        
        # Создаем связи
        for connection in connections:
            if connection["note_id"] != note_id:
                conn_data = NoteConnectionCreate(
                    note_b_id=connection["note_id"],
                    relation=connection["relation"]
                )
                await notes_crud.create_connection(self.db, note_id, conn_data, self.user.id)
    
    async def _schedule_link_search(self, note_id: int, content: str) -> None:
        """
        Планирование поиска связанных ссылок
        """
        # Здесь будет логика планирования периодического поиска
        # Пока просто сохраняем информацию о необходимости поиска
        pass
    
    async def _create_summary_note(self, organized_notes: List[Dict], request: str) -> str:
        """
        Создание сводной заметки
        """
        prompt = AGENT_PROMPTS["summary_creation"].format(
            request=request,
            organized_notes=json.dumps(organized_notes, ensure_ascii=False)
        )
        
        response = await self.openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        
        return response.choices[0].message.content
    
    async def run_periodic_tasks(self):
        """
        Запуск периодических задач (каждые 8 часов)
        """
        while True:
            try:
                # Поиск новых связанных ссылок
                await self._search_related_links()
                
                # Анализ и реорганизация заметок
                await self._reorganize_notes()
                
                # Проверка напоминаний
                await self._check_reminders()
                
            except Exception as e:
                print(f"Ошибка в периодических задачах: {e}")
            
            # Ждем 8 часов
            await asyncio.sleep(8 * 60 * 60)
    
    async def _search_related_links(self):
        """
        Поиск связанных ссылок для всех заметок
        """
        # Получаем все заметки пользователя
        notes = await notes_crud.get_user_notes(self.db, self.user.id, 0, 1000)
        
        for note in notes:
            # Ищем связанные ссылки
            links = await self.web_scraper.search_related_content(note.content)
            
            # Создаем заметки с найденными ссылками
            for link in links:
                link_note = NoteCreate(
                    title=f"Связанная ссылка: {link['title']}",
                    content=f"Источник: {link['url']}\nОписание: {link['description']}\nСвязано с: {note.title}"
                )
                
                link_note_db = await notes_crud.create_note(self.db, link_note, self.user.id)
                
                # Создаем связь с исходной заметкой
                connection = NoteConnectionCreate(
                    note_b_id=link_note_db.id,
                    relation="RELATED_LINK"
                )
                await notes_crud.create_connection(self.db, note.id, connection, self.user.id)
    
    async def _reorganize_notes(self):
        """
        Реорганизация заметок на основе анализа
        """
        notes = await notes_crud.get_user_notes(self.db, self.user.id, 0, 1000)
        
        # Анализируем и перекатегоризируем заметки
        for note in notes:
            new_category = await self.note_analyzer.categorize_note(note.content)
            new_importance = await self.note_analyzer.assess_importance(note.content)
            
            # Обновляем заметку если нужно
            if new_category != getattr(note, 'category', None):
                await notes_crud.update_note(
                    self.db, note.id, self.user.id,
                    NoteUpdate(content=note.content)  # Добавить поля category и importance
                )
    
    async def _check_reminders(self):
        """
        Проверка и отправка напоминаний
        """
        # Получаем события из календаря
        events = await self.calendar_manager.get_upcoming_events(hours=24)
        
        for event in events:
            # Создаем уведомление
            notification_note = NoteCreate(
                title=f"Напоминание: {event['summary']}",
                content=f"Время: {event['start']}\nОписание: {event.get('description', '')}"
            )
            
            await notes_crud.create_note(self.db, notification_note, self.user.id)
