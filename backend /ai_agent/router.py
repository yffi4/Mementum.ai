from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List
from database import get_async_db
from jwt_auth.auth import get_current_active_user, oauth2_scheme
from models import User

from .agent import AIAgent
from .schemas import (
    AgentRequest,
    AgentResponse,
    NoteAnalysisRequest,
    NoteAnalysisResponse,
    WebScrapeRequest,
    WebScrapeResponse,
    CalendarEventRequest,
    CalendarEventResponse
)

router = APIRouter()


@router.post("/process", response_model=AgentResponse)
async def process_request(
    request: AgentRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Обработка запроса пользователя через AI агента
    """
    try:
        agent = AIAgent(db, current_user)
        result = await agent.process_user_request(request.message)
        
        # Запускаем периодические задачи в фоне
        if request.enable_background_tasks:
            background_tasks.add_task(agent.run_periodic_tasks)
        
        return AgentResponse(
            success=result.get("success", False),
            message=result.get("message", ""),
            data=result,
            note_id=result.get("note_id"),
            category=result.get("category"),
            importance=result.get("importance")
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка обработки запроса: {str(e)}"
        )


@router.post("/analyze-note", response_model=NoteAnalysisResponse)
async def analyze_note(
    request: NoteAnalysisRequest,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Анализ существующей заметки
    """
    try:
        agent = AIAgent(db, current_user)
        
        # Получаем заметку
        from notes import crud as notes_crud
        note = await notes_crud.get_note(db, request.note_id, current_user.id)
        
        if not note:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Заметка не найдена"
            )
        
        # Анализируем заметку
        category = await agent.note_analyzer.categorize_note(note.content)
        importance = await agent.note_analyzer.assess_importance(note.content)
        keywords = await agent.note_analyzer.extract_keywords(note.content)
        summary = await agent.note_analyzer.generate_summary(note.content)
        tags = await agent.note_analyzer.suggest_tags(note.content)
        topics = await agent.note_analyzer.detect_topics(note.content)
        sentiment = await agent.note_analyzer.analyze_sentiment(note.content)
        improvements = await agent.note_analyzer.suggest_improvements(note.content)
        action_items = await agent.note_analyzer.find_action_items(note.content)
        
        return NoteAnalysisResponse(
            note_id=note.id,
            category=category,
            importance=importance,
            keywords=keywords,
            summary=summary,
            tags=tags,
            topics=topics,
            sentiment=sentiment,
            improvements=improvements,
            action_items=action_items
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка анализа заметки: {str(e)}"
        )


@router.post("/scrape-web", response_model=WebScrapeResponse)
async def scrape_web_content(
    request: WebScrapeRequest,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Парсинг веб-страницы и сохранение контента
    """
    try:
        agent = AIAgent(db, current_user)
        
        # Парсим страницу
        content = await agent.web_scraper.scrape_url(request.url)
        
        # Получаем метаданные
        metadata = await agent.web_scraper.get_page_metadata(request.url)
        
        # Создаем заметку
        from notes.schemas import NoteCreate
        note_data = NoteCreate(
            title=metadata.get('title', f"Сохранено с {request.url}"),
            content=f"Источник: {request.url}\n\n{content}"
        )
        
        from notes import crud as notes_crud
        note = await notes_crud.create_note(db, note_data, current_user.id)
        
        # Ищем связанные ссылки
        related_links = await agent.web_scraper.search_related_content(content, 5)
        
        return WebScrapeResponse(
            success=True,
            note_id=note.id,
            url=request.url,
            content_length=len(content),
            metadata=metadata,
            related_links=related_links,
            message=f"Контент с {request.url} успешно сохранен"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка парсинга: {str(e)}"
        )


@router.post("/calendar/event", response_model=CalendarEventResponse)
async def create_calendar_event(
    request: CalendarEventRequest,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Создание события в Google Calendar
    """
    try:
        agent = AIAgent(db, current_user)
        
        # Создаем событие в календаре
        event = await agent.calendar_manager.create_event(
            summary=request.summary,
            description=request.description,
            start_time=request.start_time,
            end_time=request.end_time,
            location=request.location,
            attendees=request.attendees
        )
        
        if "error" in event:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=event["error"]
            )
        
        # Создаем заметку с напоминанием
        from notes.schemas import NoteCreate
        note_data = NoteCreate(
            title=f"Напоминание: {request.summary}",
            content=f"Время: {event['start']}\nОписание: {request.description}\nКалендарь ID: {event['id']}"
        )
        
        from notes import crud as notes_crud
        note = await notes_crud.create_note(db, note_data, current_user.id)
        
        return CalendarEventResponse(
            success=True,
            event_id=event['id'],
            note_id=note.id,
            summary=event['summary'],
            start_time=event['start'],
            end_time=event['end'],
            html_link=event['htmlLink'],
            message="Событие создано в календаре"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка создания события: {str(e)}"
        )


@router.get("/calendar/events")
async def get_calendar_events(
    hours: int = 24,
    max_results: int = 10,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Получение предстоящих событий из календаря
    """
    try:
        agent = AIAgent(db, current_user)
        events = await agent.calendar_manager.get_upcoming_events(hours, max_results)
        
        return {
            "success": True,
            "events": events,
            "count": len(events)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка получения событий: {str(e)}"
        )


@router.get("/calendar/search")
async def search_calendar_events(
    query: str,
    max_results: int = 20,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Поиск событий в календаре
    """
    try:
        agent = AIAgent(db, current_user)
        events = await agent.calendar_manager.search_events(query, max_results)
        
        return {
            "success": True,
            "query": query,
            "events": events,
            "count": len(events)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка поиска событий: {str(e)}"
        )


@router.post("/organize-notes")
async def organize_notes(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Организация и реорганизация заметок пользователя
    """
    try:
        agent = AIAgent(db, current_user)
        
        # Получаем все заметки пользователя
        from notes import crud as notes_crud
        notes = await notes_crud.get_user_notes(db, current_user.id, 0, 1000)
        
        # Организуем заметки
        organized_groups = await agent.note_analyzer.organize_notes(notes)
        
        # Создаем сводную заметку
        summary_content = f"Организация заметок:\n\n"
        for group in organized_groups:
            summary_content += f"## {group['group_name']}\n"
            summary_content += f"Тема: {group['theme']}\n"
            summary_content += f"Заметок: {len(group['notes'])}\n"
            summary_content += f"Описание: {group['summary']}\n\n"
        
        from notes.schemas import NoteCreate
        summary_note = NoteCreate(
            title="Сводка организации заметок",
            content=summary_content
        )
        
        note = await notes_crud.create_note(db, summary_note, current_user.id)
        
        return {
            "success": True,
            "note_id": note.id,
            "total_notes": len(notes),
            "organized_groups": len(organized_groups),
            "groups": organized_groups,
            "message": f"Организовано {len(notes)} заметок в {len(organized_groups)} групп"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка организации заметок: {str(e)}"
        )


@router.post("/search-related-links")
async def search_related_links(
    note_id: int,
    max_results: int = 5,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Поиск связанных ссылок для конкретной заметки
    """
    try:
        agent = AIAgent(db, current_user)
        
        # Получаем заметку
        from notes import crud as notes_crud
        note = await notes_crud.get_note(db, note_id, current_user.id)
        
        if not note:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Заметка не найдена"
            )
        
        # Ищем связанные ссылки
        related_links = await agent.web_scraper.search_related_content(note.content, max_results)
        
        # Создаем заметки с найденными ссылками
        created_notes = []
        for link in related_links:
            link_note = NoteCreate(
                title=f"Связанная ссылка: {link['title']}",
                content=f"Источник: {link['url']}\nОписание: {link['description']}\nСвязано с: {note.title}"
            )
            
            link_note_db = await notes_crud.create_note(db, link_note, current_user.id)
            created_notes.append(link_note_db)
            
            # Создаем связь с исходной заметкой
            from notes.schemas import NoteConnectionCreate
            connection = NoteConnectionCreate(
                note_b_id=link_note_db.id,
                relation="RELATED_LINK"
            )
            await notes_crud.create_connection(db, note.id, connection, current_user.id)
        
        return {
            "success": True,
            "original_note_id": note_id,
            "found_links": len(related_links),
            "created_notes": len(created_notes),
            "links": related_links,
            "message": f"Найдено {len(related_links)} связанных ссылок"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка поиска связанных ссылок: {str(e)}"
        )


@router.get("/status")
async def get_agent_status(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Получение статуса AI агента
    """
    try:
        agent = AIAgent(db, current_user)
        
        # Проверяем доступность сервисов
        calendar_status = await agent.calendar_manager._ensure_authenticated()
        
        # Получаем статистику заметок
        from notes import crud as notes_crud
        total_notes = await notes_crud.get_notes_count(db, current_user.id)
        recent_notes = await notes_crud.get_recent_notes(db, current_user.id, 5)
        
        return {
            "success": True,
            "user_id": current_user.id,
            "calendar_connected": calendar_status,
            "total_notes": total_notes,
            "recent_notes_count": len(recent_notes),
            "agent_version": "1.0.0",
            "services": {
                "openai": True,  # Предполагаем, что доступен
                "calendar": calendar_status,
                "web_scraper": True
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка получения статуса: {str(e)}"
        ) 