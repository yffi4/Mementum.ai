from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import List, Optional, Dict, Any
from datetime import datetime
import json
from database import get_async_db, get_db
from jwt_auth.auth import get_current_active_user
from models import User, NoteCalendarEvent, Note

from . import crud
from .schemas import (
    NoteCreate, 
    NoteUpdate, 
    NoteResponse, 
    NoteWithConnections,
    NoteConnectionCreate,
    NoteConnectionResponse
)

# Импорты для календаря
from ai_agent.calendar_agent import calendar_agent
from auth.google_oauth import google_oauth_service
from google_calendar.schemas import (
    CalendarEventCreator,
    CalendarListResponse,
    UserInfoResponse,
    CalendarEventResponse
)

router = APIRouter()


# Эндпоинты для Note
@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    note: NoteCreate,
    db: AsyncSession = Depends(get_async_db),
    sync_db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Создать новую заметку с автоматическим анализом на события календаря"""
    # Создать заметку
    db_note = await crud.create_note(db, note, current_user.id)
    
    # Анализировать заметку на предмет событий календаря
    try:
        created_events = calendar_agent.analyze_note_for_events(sync_db, db_note, current_user.id)
        if created_events:
            print(f"Создано {len(created_events)} событий календаря для заметки {db_note.id}")
    except Exception as e:
        print(f"Ошибка анализа календаря: {e}")
        # Не прерываем создание заметки из-за ошибки календаря
    
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


@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: int,
    note_update: NoteUpdate,
    db: AsyncSession = Depends(get_async_db),
    sync_db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Обновить заметку с повторным анализом на события календаря"""
    updated_note = await crud.update_note(db, note_id, current_user.id, note_update)
    if not updated_note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Заметка не найдена"
        )
    
    # Удалить старые события календаря и создать новые
    try:
        calendar_agent.delete_note_events(sync_db, note_id, current_user.id)
        created_events = calendar_agent.analyze_note_for_events(sync_db, updated_note, current_user.id)
        if created_events:
            print(f"Пересоздано {len(created_events)} событий календаря для заметки {note_id}")
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
        service = google_oauth_service.get_calendar_service(db, current_user.id)
        # Получить информацию из Calendar API или использовать сохраненную
        return UserInfoResponse(
            id=current_user.google_id or "",
            email=current_user.google_email or current_user.email,
            name=current_user.google_name or current_user.username,
            picture=current_user.google_picture or ""
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка получения информации: {str(e)}"
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
            CalendarEventResponse(
                id=event['id'],
                summary=event.get('summary', 'Без названия'),
                description=event.get('description', ''),
                start_time=event['start'].get('dateTime', event['start'].get('date')),
                end_time=event['end'].get('dateTime', event['end'].get('date')),
                location=event.get('location', ''),
                html_link=event.get('htmlLink', ''),
                created=event.get('created', ''),
                updated=event.get('updated', '')
            )
            for event in events
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка получения событий: {str(e)}"
        )


@router.post("/calendar/events", response_model=CalendarEventResponse)
def create_calendar_event(
    event_data: CalendarEventCreator,
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
            'start': {
                'dateTime': event_data.start_time.isoformat(),
                'timeZone': 'Europe/Moscow',
            },
            'end': {
                'dateTime': event_data.end_time.isoformat(),
                'timeZone': 'Europe/Moscow',
            },
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
        
        return CalendarEventResponse(
            id=event['id'],
            summary=event.get('summary', ''),
            description=event.get('description', ''),
            start_time=event['start'].get('dateTime', event['start'].get('date')),
            end_time=event['end'].get('dateTime', event['end'].get('date')),
            location=event.get('location', ''),
            html_link=event.get('htmlLink', ''),
            created=event.get('created', ''),
            updated=event.get('updated', '')
        )
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


@router.post("/analyze-all")
async def analyze_all_notes(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user)
):
    """Анализировать все заметки пользователя и обновить категории"""
    try:
        from ai_agent.agent import AIAgent
        import json
        
        # Получаем все заметки пользователя
        result = await db.execute(
            select(Note).filter(Note.user_id == current_user.id)
        )
        notes = result.scalars().all()
        
        agent = AIAgent(db, current_user)
        analyzed_notes = []
        
        for note in notes:
            try:
                # Анализируем заметку
                category = await agent.note_analyzer.categorize_note(note.content)
                importance = await agent.note_analyzer.assess_importance(note.content)
                keywords = await agent.note_analyzer.extract_keywords(note.content)
                summary = await agent.note_analyzer.generate_summary(note.content)
                tags = await agent.note_analyzer.suggest_tags(note.content)
                
                # Обновляем заметку
                note.category = category
                note.importance = importance
                note.tags = json.dumps(tags) if tags else None
                note.summary = summary
                
                analyzed_notes.append({
                    "id": note.id,
                    "title": note.title,
                    "category": category,
                    "importance": importance,
                    "tags": tags,
                    "keywords": keywords
                })
                
            except Exception as e:
                print(f"Ошибка анализа заметки {note.id}: {str(e)}")
                continue
        
        await db.commit()
        
        return {
            "success": True,
            "analyzed_count": len(analyzed_notes),
            "notes": analyzed_notes
        }
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка анализа заметок: {str(e)}"
        )


@router.get("/categories")
async def get_note_categories(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user)
):
    """Получить все категории заметок пользователя"""
    try:
        result = await db.execute(
            select(Note.category, func.count(Note.id).label('count'))
            .filter(Note.user_id == current_user.id)
            .filter(Note.category.isnot(None))
            .group_by(Note.category)
            .order_by(func.count(Note.id).desc())
        )
        categories = result.all()
        
        return {
            "categories": [
                {"name": cat.category, "count": cat.count} 
                for cat in categories
            ]
        }
        
    except Exception as e:
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
        result = await db.execute(
            select(Note)
            .filter(Note.user_id == current_user.id)
            .filter(Note.category == category)
            .order_by(Note.importance.desc(), Note.created_at.desc())
        )
        notes = result.scalars().all()
        
        return {
            "category": category,
            "notes": [
                {
                    "id": note.id,
                    "title": note.title,
                    "content": note.content[:200] + "..." if len(note.content) > 200 else note.content,
                    "importance": note.importance,
                    "tags": json.loads(note.tags) if note.tags else [],
                    "summary": note.summary,
                    "created_at": note.created_at
                }
                for note in notes
            ]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка получения заметок: {str(e)}"
        )
