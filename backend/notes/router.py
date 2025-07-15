from fastapi import APIRouter, Depends, HTTPException, status, Query, Security
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import List, Optional, Dict, Any
from datetime import datetime
import json
import openai
from database import get_async_db, get_db
from jwt_auth.auth import get_current_active_user, oauth2_scheme
from models import User, NoteCalendarEvent, Note
from config import settings

from . import crud
from .schemas import (
    NoteCreate, 
    NoteUpdate, 
    NoteResponse, 
    NoteWithConnections,
    NoteConnectionCreate,
    NoteConnectionResponse,
)

# Импорты для календаря
from ai_agent.calendar_agent import calendar_agent
from ai_agent.note_analyzer import NoteAnalyzer
from auth.google_oauth import google_oauth_service
from google_calendar.schemas import (
    CreateEventRequest,
    CalendarListResponse,
    UserInfoResponse,
    CalendarEventResponse
)

# Импорт Celery задач
from tasks.note_tasks import create_note_async, update_note_async
from tasks.ai_tasks import analyze_note_async

# Инициализация AI анализатора
openai_client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
note_analyzer = NoteAnalyzer(openai_client)

router = APIRouter()


# Эндпоинты для Note
@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    note: NoteCreate,
    db: AsyncSession = Depends(get_async_db),
    sync_db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    background: bool = Query(True, description="Создать заметку в фоне")
):
    """Создать новую заметку с автоматическим AI анализом и анализом на события календаря"""
    
    if background:
        # Создаем заметку в фоне через Celery
        task = create_note_async.delay(
            note_data=note.dict(),
            user_id=current_user.id
        )
        
        # Возвращаем временный ответ с task_id
        return NoteResponse(
            id=0,  # Временный ID
            title=note.title,
            content=note.content,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            user_id=current_user.id,
            task_id=task.id,  # ID задачи для отслеживания
            processing=True
        )
    
    # Синхронное создание (старый код)
    db_note = await crud.create_note(db, note, current_user.id)
    
    # Запускаем AI анализ в фоне
    analyze_note_async.delay(
        note_id=db_note.id,
        user_id=current_user.id
    )
    
    # Анализ календаря в фоне
    try:
        calendar_agent.analyze_note_for_events(sync_db, db_note, current_user.id)
    except Exception as e:
        print(f"Ошибка анализа календаря: {e}")
    
    return db_note


@router.get("/", response_model=List[NoteResponse])
async def get_notes(
    skip: int = Query(0, ge=0, description="Количество записей для пропуска"),
    limit: int = Query(100, ge=1, le=1000, description="Максимальное количество записей"),
    search: Optional[str] = Query(None, description="Поиск по содержимому"),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получить все заметки пользователя"""
    if search:
        notes = await crud.search_notes(db, current_user.id, search, skip, limit)
    else:
        notes = await crud.get_user_notes(db, current_user.id, skip, limit)
    return notes


@router.get("/recent", response_model=List[NoteResponse])
async def get_recent_notes(
    limit: int = Query(10, ge=1, le=50, description="Количество последних заметок"),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получить последние заметки пользователя"""
    notes = await crud.get_recent_notes(db, current_user.id, limit)
    return notes


@router.get("/count")
async def get_notes_count(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получить количество заметок пользователя"""
    count = await crud.get_notes_count(db, current_user.id)
    return {"count": count}


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получить заметку по ID"""
    note = await crud.get_note(db, note_id, current_user.id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Заметка не найдена"
        )
    return note


@router.get("/{note_id}/with-connections", response_model=NoteWithConnections)
async def get_note_with_connections(
    note_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получить заметку с её связями"""
    note = await crud.get_note_with_connections(db, note_id, current_user.id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Заметка не найдена"
        )
    return note


@router.get("/task/{task_id}/status")
async def get_task_status(
    task_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Получить статус задачи Celery"""
    from celery.result import AsyncResult
    from celery_app import celery_app
    
    result = AsyncResult(task_id, app=celery_app)
    
    if result.ready():
        if result.successful():
            return {
                "status": "SUCCESS",
                "result": result.result,
                "task_id": task_id
            }
        else:
            return {
                "status": "FAILURE",
                "error": str(result.info),
                "task_id": task_id
            }
    else:
        return {
            "status": "PENDING",
            "task_id": task_id
        }


@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: int,
    note_update: NoteUpdate,
    db: AsyncSession = Depends(get_async_db),
    sync_db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    background: bool = Query(True, description="Обновить заметку в фоне")
):
    """Обновить заметку с повторным AI анализом и анализом на события календаря"""
    
    if background:
        # Обновляем заметку в фоне через Celery
        task = update_note_async.delay(
            note_id=note_id,
            note_data=note_update.dict(exclude_unset=True),
            user_id=current_user.id
        )
        
        # Возвращаем текущую заметку с информацией о задаче
        current_note = await crud.get_note(db, note_id, current_user.id)
        if not current_note:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Заметка не найдена"
            )
        
        return NoteResponse(
            **current_note.__dict__,
            task_id=task.id,
            processing=True
        )
    
    # Синхронное обновление (старый код)
    updated_note = await crud.update_note(db, note_id, current_user.id, note_update)
    if not updated_note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Заметка не найдена"
        )
    
    # Запускаем AI анализ в фоне
    analyze_note_async.delay(
        note_id=note_id,
        user_id=current_user.id,
        force=True  # Принудительный повторный анализ
    )
    
    # Удалить старые события календаря и создать новые в фоне
    try:
        calendar_agent.delete_note_events(sync_db, note_id, current_user.id)
        calendar_agent.analyze_note_for_events(sync_db, updated_note, current_user.id)
    except Exception as e:
        print(f"Ошибка обновления календаря: {e}")
    
    return updated_note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: int,
    db: AsyncSession = Depends(get_async_db),
    sync_db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Удалить заметку и связанные события календаря"""
    # Удалить события календаря
    try:
        calendar_agent.delete_note_events(sync_db, note_id, current_user.id)
    except Exception as e:
        print(f"Ошибка удаления событий календаря: {e}")
    
    success = await crud.delete_note(db, note_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Заметка не найдена"
        )


# Эндпоинты для NoteConnection
@router.post("/{note_id}/connections", response_model=NoteConnectionResponse, status_code=status.HTTP_201_CREATED)
async def create_connection(
    note_id: int,
    connection: NoteConnectionCreate,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user)
):
    """Создать связь между заметками"""
    db_connection = await crud.create_connection(db, note_id, connection, current_user.id)
    if not db_connection:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Не удалось создать связь. Проверьте, что обе заметки существуют и принадлежат вам."
        )
    return db_connection


@router.get("/{note_id}/connections", response_model=List[NoteConnectionResponse])
async def get_note_connections(
    note_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получить все связи заметки"""
    connections = await crud.get_note_connections(db, note_id, current_user.id)
    return connections


@router.get("/{note_id}/connected-notes", response_model=List[NoteResponse])
async def get_connected_notes(
    note_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получить все связанные заметки"""
    notes = await crud.get_connected_notes(db, note_id, current_user.id)
    return notes


@router.delete("/connections/{connection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_connection(
    connection_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user)
):
    """Удалить связь между заметками"""
    success = await crud.delete_connection(db, connection_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Связь не найдена"
        )


# ========== КАЛЕНДАРНЫЕ ЭНДПОИНТЫ ==========

# Google OAuth эндпоинты
@router.get("/auth/google-url")
def get_google_auth_url():
    """Получить URL для авторизации через Google"""
    auth_url = google_oauth_service.get_authorization_url()
    return {"auth_url": auth_url}


@router.post("/auth/google-callback")
def google_auth_callback(
    code: str,
    db: Session = Depends(get_db)
):
    """Обработать callback от Google OAuth"""
    try:
        token_data = google_oauth_service.exchange_code_for_tokens(code)
        user = google_oauth_service.create_or_update_user(db, token_data)
        
        # Здесь можно создать JWT токен для фронтенда
        # Пока возвращаем информацию о пользователе
        return {
            "message": "Google авторизация успешна",
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.google_name,
                "picture": user.google_picture
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/auth/google-status")
def get_google_auth_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Проверить статус Google авторизации"""
    from models import GoogleToken
    google_token = db.query(GoogleToken).filter(
        GoogleToken.user_id == current_user.id
    ).first()
    
    return {
        "is_connected": google_token is not None,
        "expires_at": google_token.expires_at if google_token else None
    }


@router.delete("/auth/google-disconnect")
def disconnect_google_auth(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Отключить Google авторизацию"""
    from models import GoogleToken
    google_token = db.query(GoogleToken).filter(
        GoogleToken.user_id == current_user.id
    ).first()
    
    if google_token:
        db.delete(google_token)
        db.commit()
    
    return {"message": "Google аккаунт отключен"}


# Календарные эндпоинты
@router.get("/calendar/user-info", response_model=UserInfoResponse)
def get_user_info(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получить информацию о пользователе Google"""
    try:
        # если сервис недоступен (нет токенов) - считаем, что не подключён
        google_oauth_service.get_calendar_service(db, current_user.id)
        connected = True
    except Exception:
        connected = False

    return UserInfoResponse(
        id=current_user.google_id or "",
        email=current_user.google_email or current_user.email,
        name=current_user.google_name or current_user.username,
        picture=current_user.google_picture or "",
        is_connected=connected,
    )


@router.get("/calendar/calendars", response_model=List[CalendarListResponse])
def get_calendars(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получить список календарей пользователя"""
    try:
        service = google_oauth_service.get_calendar_service(db, current_user.id)
        
        calendars_result = service.calendarList().list().execute()
        calendars = calendars_result.get('items', [])
        
        return [
            CalendarListResponse(
                id=cal['id'],
                summary=cal['summary'],
                primary=cal.get('primary', False),
                access_role=cal.get('accessRole', ''),
                background_color=cal.get('backgroundColor', '#ffffff'),
                foreground_color=cal.get('foregroundColor', '#000000')
            )
            for cal in calendars
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка получения календарей: {str(e)}"
        )


@router.get("/calendar/events", response_model=List[CalendarEventResponse])
def get_calendar_events(
    calendar_id: str = Query("primary", description="ID календаря"),
    time_min: Optional[datetime] = Query(None, description="Начальное время"),
    time_max: Optional[datetime] = Query(None, description="Конечное время"),
    max_results: int = Query(50, ge=1, le=100, description="Максимальное количество событий"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получить события календаря"""
    try:
        service = google_oauth_service.get_calendar_service(db, current_user.id)
        
        # Подготовить параметры запроса
        kwargs = {
            'calendarId': calendar_id,
            'maxResults': max_results,
            'singleEvents': True,
            'orderBy': 'startTime'
        }
        
        if time_min:
            kwargs['timeMin'] = time_min.isoformat()
        if time_max:
            kwargs['timeMax'] = time_max.isoformat()
        
        events_result = service.events().list(**kwargs).execute()
        events = events_result.get('items', [])
        
        return [
            {
                "id": event["id"],
                "summary": event.get("summary", "Без названия"),
                "description": event.get("description", ""),
                "start": {
                    "dateTime": event["start"].get("dateTime"),
                    "date": event["start"].get("date"),
                    "timeZone": event["start"].get("timeZone"),
                },
                "end": {
                    "dateTime": event["end"].get("dateTime"),
                    "date": event["end"].get("date"),
                    "timeZone": event["end"].get("timeZone"),
                },
                "location": event.get("location", ""),
                "html_link": event.get("htmlLink", ""),
                "created": event.get("created", ""),
                "updated": event.get("updated", ""),
            }
            for event in events
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка получения событий: {str(e)}"
        )


@router.post("/calendar/events", response_model=CalendarEventResponse)
def create_calendar_event(
    event_data: CreateEventRequest,
    calendar_id: str = Query("primary", description="ID календаря"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Создать событие в календаре"""
    try:
        service = google_oauth_service.get_calendar_service(db, current_user.id)
        
        # Подготовить данные события
        event_body = {
            'summary': event_data.summary,
            'description': event_data.description,
            'start': { **event_data.start.dict(exclude_none=True), 'timeZone': 'Europe/Moscow' },
            'end': { **event_data.end.dict(exclude_none=True), 'timeZone': 'Europe/Moscow' },
        }
        
        if event_data.location:
            event_body['location'] = event_data.location
        
        if event_data.attendees:
            event_body['attendees'] = [{'email': email} for email in event_data.attendees]
        
        # Создать событие
        event = service.events().insert(
            calendarId=calendar_id,
            body=event_body
        ).execute()
        
        return {
            "id": event["id"],
            "summary": event.get("summary", ""),
            "description": event.get("description", ""),
            "start": {
                "dateTime": event["start"].get("dateTime"),
                "date": event["start"].get("date"),
                "timeZone": event["start"].get("timeZone"),
            },
            "end": {
                "dateTime": event["end"].get("dateTime"),
                "date": event["end"].get("date"),
                "timeZone": event["end"].get("timeZone"),
            },
            "location": event.get("location", ""),
            "html_link": event.get("htmlLink", ""),
            "created": event.get("created", ""),
            "updated": event.get("updated", ""),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка создания события: {str(e)}"
        )


# Эндпоинты для событий календаря связанных с заметками
@router.get("/{note_id}/calendar-events")
def get_note_calendar_events(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получить события календаря для заметки"""
    events = calendar_agent.get_note_events(db, note_id)
    return {
        "note_id": note_id,
        "events": [
            {
                "id": event.id,
                "google_event_id": event.google_event_id,
                "title": event.event_title,
                "description": event.event_description,
                "start_datetime": event.start_datetime,
                "end_datetime": event.end_datetime,
                "location": event.location,
                "is_all_day": event.is_all_day,
                "created_by_ai": event.created_by_ai
            }
            for event in events
        ]
    }


@router.post("/{note_id}/analyze-calendar")
def analyze_note_for_calendar(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Принудительно проанализировать заметку на события календаря"""
    # Получить заметку
    from models import Note
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == current_user.id
    ).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Заметка не найдена"
        )
    
    # Удалить старые события и создать новые
    calendar_agent.delete_note_events(db, note_id, current_user.id)
    created_events = calendar_agent.analyze_note_for_events(db, note, current_user.id)
    
    return {
        "message": f"Анализ завершен. Создано событий: {len(created_events)}",
        "events_count": len(created_events)
    }


@router.post("/{note_id}/analyze")
async def analyze_single_note(
    note_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user)
):
    """Анализировать отдельную заметку с помощью AI agent"""
    try:
        import json
        
        # Получаем заметку
        result = await db.execute(
            select(Note).filter(Note.id == note_id, Note.user_id == current_user.id)
        )
        note = result.scalar_one_or_none()
        
        if not note:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Заметка не найдена"
            )
        
        print(f"Запускаем AI анализ для заметки {note_id}: {note.title[:50]}...")
        
        # Используем AI agent для анализа
        category = await note_analyzer.categorize_note(note.content)
        importance = await note_analyzer.assess_importance(note.content)
        tags = await note_analyzer.suggest_tags(note.content)
        summary = await note_analyzer.generate_summary(note.content)
        
        # Дополнительный анализ
        topics = await note_analyzer.detect_topics(note.content)
        keywords = await note_analyzer.extract_keywords(note.content)
        
        print(f"AI анализ завершен: категория={category}, важность={importance}")
        
        # Обновляем заметку
        note.category = category
        note.importance = importance
        note.tags = json.dumps(tags, ensure_ascii=False) if tags else None
        note.summary = summary
        
        await db.commit()
        
        return {
            "success": True,
            "note_id": note_id,
            "analysis": {
                "category": category,
                "importance": importance,
                "tags": tags,
                "summary": summary,
                "topics": topics,
                "keywords": keywords
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR in analyze_single_note: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка AI анализа заметки: {str(e)}"
        )


@router.post("/analyze-all")
async def analyze_all_notes(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user)
):
    """Анализировать все заметки пользователя с помощью AI agent"""
    try:
        import json
        
        # Получаем все заметки пользователя
        result = await db.execute(
            select(Note).filter(Note.user_id == current_user.id)
        )
        notes = result.scalars().all()
        
        analyzed_notes = []
        
        print(f"Начинаем AI анализ {len(notes)} заметок...")
        
        for note in notes:
            try:
                print(f"Анализируем заметку {note.id}: {note.title[:50]}...")
                
                # Используем AI agent для анализа
                category = await note_analyzer.categorize_note(note.content)
                importance = await note_analyzer.assess_importance(note.content)
                tags = await note_analyzer.suggest_tags(note.content)
                summary = await note_analyzer.generate_summary(note.content)
                
                print(f"AI анализ заметки {note.id}: категория={category}, важность={importance}")
                
                # Обновляем заметку
                note.category = category
                note.importance = importance
                note.tags = json.dumps(tags, ensure_ascii=False) if tags else None
                note.summary = summary
                
                analyzed_notes.append({
                    "id": note.id,
                    "title": note.title,
                    "category": category,
                    "importance": importance,
                    "tags": tags,
                    "summary": summary
                })
                
            except Exception as e:
                print(f"Ошибка AI анализа заметки {note.id}: {str(e)}")
                # Fallback на простой анализ
                try:
                    category = "General"
                    importance = 3
                    tags = []
                    summary = note.content[:200] + "..." if len(note.content) > 200 else note.content
                    
                    note.category = category
                    note.importance = importance
                    note.tags = json.dumps(tags, ensure_ascii=False) if tags else None
                    note.summary = summary
                    
                    analyzed_notes.append({
                        "id": note.id,
                        "title": note.title,
                        "category": category,
                        "importance": importance,
                        "tags": tags,
                        "summary": summary
                    })
                except Exception as fallback_error:
                    print(f"Ошибка fallback анализа заметки {note.id}: {str(fallback_error)}")
                    continue
        
        await db.commit()
        
        print(f"AI анализ завершен. Обработано {len(analyzed_notes)} заметок")
        
        return {
            "success": True,
            "analyzed_count": len(analyzed_notes),
            "notes": analyzed_notes
        }
        
    except Exception as e:
        print(f"ERROR in analyze_all_notes: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка AI анализа заметок: {str(e)}"
        )


@router.get("/categories")
async def get_note_categories(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получить все категории заметок пользователя"""
    try:
        print(f"Получаем категории для пользователя {current_user.id}")
        
        # Получаем все заметки пользователя
        result = await db.execute(
            select(Note)
            .filter(Note.user_id == current_user.id)
        )
        notes = result.scalars().all()
        
        print(f"Найдено {len(notes)} заметок")
        
        # Подсчитываем категории
        category_counts = {}
        for note in notes:
            category = note.category
            if category and category.strip():
                category_counts[category] = category_counts.get(category, 0) + 1
            else:
                # Считаем заметки без категории как "General"
                category_counts["General"] = category_counts.get("General", 0) + 1
        
        print(f"Категории: {category_counts}")
        
        # Сортируем по количеству
        sorted_categories = sorted(
            category_counts.items(), 
            key=lambda x: x[1], 
            reverse=True
        )
        
        return {
            "categories": [
                {"name": name, "count": count} 
                for name, count in sorted_categories
            ]
        }
        
    except Exception as e:
        print(f"ERROR in get_note_categories: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка получения категорий: {str(e)}"
        )


@router.get("/by-category/{category}")
async def get_notes_by_category(
    category: str,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получить заметки по категории"""
    try:
        if category == "General":
            # Для категории "General" ищем заметки с пустой или null категорией
            result = await db.execute(
                select(Note)
                .filter(Note.user_id == current_user.id)
                .filter((Note.category.is_(None)) | (Note.category == '') | (Note.category == 'General'))
                .order_by(Note.created_at.desc())
            )
        else:
            result = await db.execute(
                select(Note)
                .filter(Note.user_id == current_user.id)
                .filter(Note.category == category)
                .order_by(Note.created_at.desc())
            )
        
        notes = result.scalars().all()
        
        return {
            "category": category,
            "notes": [
                {
                    "id": note.id,
                    "title": note.title,
                    "content": note.content[:200] + "..." if len(note.content) > 200 else note.content,
                    "category": note.category or "General",
                    "importance": note.importance or 1,
                    "tags": json.loads(note.tags) if note.tags else [],
                    "summary": note.summary or (note.content[:200] + "..." if len(note.content) > 200 else note.content),
                    "created_at": note.created_at,
                    "updated_at": getattr(note, 'updated_at', note.created_at)
                }
                for note in notes
            ]
        }
        
    except Exception as e:
        print(f"ERROR in get_notes_by_category: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка получения заметок: {str(e)}"
        )


# ---------- Новый эндпоинт: заметки сгруппированные по категориям ----------

@router.get("/categories/grouped")
async def get_notes_grouped(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user)
):
    """Вернуть все заметки пользователя, сгруппированные по категориям."""
    try:
        result = await db.execute(
            select(Note).filter(Note.user_id == current_user.id)
        )
        notes = result.scalars().all()

        grouped: Dict[str, list] = {}
        for note in notes:
            category = note.category.strip() if note.category else "General"
            grouped.setdefault(category, []).append({
                "id": note.id,
                "title": note.title,
                "content": note.content,
                "category": category,
                "importance": note.importance or 1,
                "tags": json.loads(note.tags) if note.tags else [],
                "summary": note.summary or note.content[:200],
                "created_at": note.created_at,
                "updated_at": getattr(note, "updated_at", note.created_at)
            })

        # Сортируем категории по количеству заметок
        sorted_grouped = dict(sorted(grouped.items(), key=lambda x: len(x[1]), reverse=True))

        return {"groups": sorted_grouped}

    except Exception as e:
        import traceback
        print("ERROR in get_notes_grouped:", traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка получения сгруппированных заметок: {str(e)}"
        )
