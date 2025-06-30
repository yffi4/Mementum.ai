from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from database import get_async_db
from jwt_auth.auth import get_current_active_user, oauth2_scheme
from models import User
from .service import google_calendar_service
from .schemas import *

router = APIRouter()


@router.get("/auth-url", response_model=GoogleAuthURL)
async def get_google_auth_url(
    current_user: User = Depends(get_current_active_user)
):
    """Получает URL для авторизации Google OAuth"""
    try:
        auth_url = google_calendar_service.get_auth_url(state=str(current_user.id))
        return GoogleAuthURL(auth_url=auth_url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate auth URL: {str(e)}")


@router.get("/callback")
async def google_callback(
    code: str = Query(...),
    state: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_async_db)
):
    """Обрабатывает callback от Google OAuth"""
    if not state:
        raise HTTPException(status_code=400, detail="Missing state parameter")
    
    try:
        user_id = int(state)
        token_response = await google_calendar_service.exchange_code_for_tokens(
            code=code,
            user_id=user_id,
            db=db
        )
        
        # Перенаправляем на фронтенд с успешным результатом
        return RedirectResponse(
            url="http://localhost:5173/calendar?auth=success",
            status_code=302
        )
    except ValueError as e:
        return RedirectResponse(
            url=f"http://localhost:5173/calendar?auth=error&message={str(e)}",
            status_code=302
        )
    except Exception as e:
        return RedirectResponse(
            url=f"http://localhost:5173/calendar?auth=error&message=Authentication failed",
            status_code=302
        )


@router.get("/user-info", response_model=GoogleCalendarUser)
async def get_google_user_info(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Получает информацию о подключенном Google аккаунте"""
    try:
        user_info = await google_calendar_service.get_user_info(current_user.id, db)
        if not user_info:
            return GoogleCalendarUser(
                email="",
                name="",
                picture=None,
                is_connected=False
            )
        return user_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user info: {str(e)}")


@router.get("/calendars", response_model=CalendarListResponse)
async def get_calendars(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Получает список календарей пользователя"""
    try:
        calendars = await google_calendar_service.get_calendars(current_user.id, db)
        return CalendarListResponse(calendars=calendars)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch calendars: {str(e)}")


@router.get("/events", response_model=EventsListResponse)
async def get_events(
    calendar_id: str = Query("primary", description="ID календаря"),
    time_min: Optional[str] = Query(None, description="Начальное время в ISO формате"),
    time_max: Optional[str] = Query(None, description="Конечное время в ISO формате"),
    max_results: int = Query(250, description="Максимальное количество событий"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Получает события календаря"""
    try:
        events = await google_calendar_service.get_events(
            user_id=current_user.id,
            db=db,
            calendar_id=calendar_id,
            time_min=time_min,
            time_max=time_max,
            max_results=max_results
        )
        return EventsListResponse(events=events)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch events: {str(e)}")


@router.post("/events", response_model=CalendarEvent)
async def create_event(
    event_data: CreateEventRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Создает новое событие в календаре"""
    try:
        event = await google_calendar_service.create_event(
            user_id=current_user.id,
            db=db,
            event_data=event_data
        )
        return event
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create event: {str(e)}")


@router.delete("/disconnect")
async def disconnect_google_calendar(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Отключает пользователя от Google Calendar"""
    try:
        success = await google_calendar_service.disconnect_user(current_user.id, db)
        if success:
            return {"message": "Successfully disconnected from Google Calendar"}
        else:
            raise HTTPException(status_code=500, detail="Failed to disconnect")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to disconnect: {str(e)}")


@router.get("/status")
async def get_connection_status(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Проверяет статус подключения к Google Calendar"""
    try:
        user_info = await google_calendar_service.get_user_info(current_user.id, db)
        return {
            "is_connected": user_info is not None,
            "user_info": user_info if user_info else None
        }
    except Exception as e:
        return {
            "is_connected": False,
            "user_info": None,
            "error": str(e)
        } 