import os
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from models import GoogleToken, User
from .schemas import *
import json


class GoogleCalendarService:
    def __init__(self):
        self.client_id = os.getenv("GOOGLE_CLIENT_ID")
        self.client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        self.redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/calendar/callback")
        self.scopes = [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
        ]
        
        if not self.client_id or not self.client_secret:
            raise ValueError("Google OAuth credentials not configured")

    def get_auth_url(self, state: Optional[str] = None) -> str:
        """Генерирует URL для авторизации Google OAuth"""
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [self.redirect_uri]
                }
            },
            scopes=self.scopes
        )
        flow.redirect_uri = self.redirect_uri
        
        auth_url, _ = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            state=state,
            prompt='consent'
        )
        
        return auth_url

    async def exchange_code_for_tokens(
        self, 
        code: str, 
        user_id: int, 
        db: AsyncSession
    ) -> GoogleTokenResponse:
        """Обменивает код на токены и сохраняет их в БД"""
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [self.redirect_uri]
                }
            },
            scopes=self.scopes
        )
        flow.redirect_uri = self.redirect_uri
        
        # Получаем токены
        flow.fetch_token(code=code)
        credentials = flow.credentials
        
        # Вычисляем время истечения
        expires_at = datetime.utcnow() + timedelta(seconds=credentials.expiry.timestamp() - datetime.utcnow().timestamp())
        
        # Сохраняем или обновляем токены в БД
        result = await db.execute(
            select(GoogleToken).filter(GoogleToken.user_id == user_id)
        )
        existing_token = result.scalar_one_or_none()
        
        if existing_token:
            # Обновляем существующий токен
            await db.execute(
                update(GoogleToken)
                .where(GoogleToken.user_id == user_id)
                .values(
                    access_token=credentials.token,
                    refresh_token=credentials.refresh_token,
                    expires_at=expires_at,
                    scope=' '.join(self.scopes),
                    updated_at=datetime.utcnow()
                )
            )
        else:
            # Создаем новый токен
            new_token = GoogleToken(
                user_id=user_id,
                access_token=credentials.token,
                refresh_token=credentials.refresh_token,
                expires_at=expires_at,
                scope=' '.join(self.scopes)
            )
            db.add(new_token)
        
        await db.commit()
        
        return GoogleTokenResponse(
            access_token=credentials.token,
            refresh_token=credentials.refresh_token,
            expires_at=expires_at,
            scope=' '.join(self.scopes)
        )

    async def get_user_credentials(self, user_id: int, db: AsyncSession) -> Optional[Credentials]:
        """Получает учетные данные пользователя из БД"""
        result = await db.execute(
            select(GoogleToken).filter(GoogleToken.user_id == user_id)
        )
        token = result.scalar_one_or_none()
        
        if not token:
            return None
        
        credentials = Credentials(
            token=token.access_token,
            refresh_token=token.refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=self.client_id,
            client_secret=self.client_secret,
            scopes=token.scope.split(' ')
        )
        
        # Проверяем и обновляем токен если нужно
        if credentials.expired and credentials.refresh_token:
            credentials.refresh(Request())
            
            # Обновляем токен в БД
            await db.execute(
                update(GoogleToken)
                .where(GoogleToken.user_id == user_id)
                .values(
                    access_token=credentials.token,
                    expires_at=datetime.utcnow() + timedelta(seconds=3600),
                    updated_at=datetime.utcnow()
                )
            )
            await db.commit()
        
        return credentials

    async def get_user_info(self, user_id: int, db: AsyncSession) -> Optional[GoogleCalendarUser]:
        """Получает информацию о пользователе Google"""
        credentials = await self.get_user_credentials(user_id, db)
        if not credentials:
            return None
        
        try:
            service = build('oauth2', 'v2', credentials=credentials)
            user_info = service.userinfo().get().execute()
            
            return GoogleCalendarUser(
                email=user_info.get('email', ''),
                name=user_info.get('name', ''),
                picture=user_info.get('picture'),
                is_connected=True
            )
        except HttpError:
            return None

    async def get_calendars(self, user_id: int, db: AsyncSession) -> List[Calendar]:
        """Получает список календарей пользователя"""
        credentials = await self.get_user_credentials(user_id, db)
        if not credentials:
            raise ValueError("User not authenticated with Google")
        
        try:
            service = build('calendar', 'v3', credentials=credentials)
            calendars_result = service.calendarList().list().execute()
            calendars = calendars_result.get('items', [])
            
            return [
                Calendar(
                    id=cal['id'],
                    summary=cal.get('summary', ''),
                    description=cal.get('description'),
                    backgroundColor=cal.get('backgroundColor'),
                    foregroundColor=cal.get('foregroundColor'),
                    selected=cal.get('selected', False),
                    accessRole=cal.get('accessRole')
                )
                for cal in calendars
            ]
        except HttpError as error:
            raise ValueError(f"Failed to fetch calendars: {error}")

    async def get_events(
        self, 
        user_id: int, 
        db: AsyncSession,
        calendar_id: str = 'primary',
        time_min: Optional[str] = None,
        time_max: Optional[str] = None,
        max_results: int = 250
    ) -> List[CalendarEvent]:
        """Получает события календаря"""
        credentials = await self.get_user_credentials(user_id, db)
        if not credentials:
            raise ValueError("User not authenticated with Google")
        
        try:
            service = build('calendar', 'v3', credentials=credentials)
            
            # Параметры запроса
            params = {
                'calendarId': calendar_id,
                'maxResults': max_results,
                'singleEvents': True,
                'orderBy': 'startTime'
            }
            
            if time_min:
                params['timeMin'] = time_min
            if time_max:
                params['timeMax'] = time_max
            
            events_result = service.events().list(**params).execute()
            events = events_result.get('items', [])
            
            return [
                CalendarEvent(
                    id=event['id'],
                    summary=event.get('summary', 'No Title'),
                    description=event.get('description'),
                    start=CalendarEventDateTime(
                        dateTime=event['start'].get('dateTime'),
                        date=event['start'].get('date'),
                        timeZone=event['start'].get('timeZone')
                    ),
                    end=CalendarEventDateTime(
                        dateTime=event['end'].get('dateTime'),
                        date=event['end'].get('date'),
                        timeZone=event['end'].get('timeZone')
                    ),
                    location=event.get('location'),
                    attendees=[
                        CalendarEventAttendee(
                            email=attendee['email'],
                            displayName=attendee.get('displayName'),
                            responseStatus=attendee.get('responseStatus')
                        )
                        for attendee in event.get('attendees', [])
                    ] if event.get('attendees') else None,
                    colorId=event.get('colorId'),
                    creator=CalendarEventCreator(
                        email=event['creator']['email'],
                        displayName=event['creator'].get('displayName')
                    ) if event.get('creator') else None,
                    htmlLink=event.get('htmlLink'),
                    status=event.get('status')
                )
                for event in events
            ]
        except HttpError as error:
            raise ValueError(f"Failed to fetch events: {error}")

    async def create_event(
        self, 
        user_id: int, 
        db: AsyncSession,
        event_data: CreateEventRequest
    ) -> CalendarEvent:
        """Создает новое событие в календаре"""
        credentials = await self.get_user_credentials(user_id, db)
        if not credentials:
            raise ValueError("User not authenticated with Google")
        
        try:
            service = build('calendar', 'v3', credentials=credentials)
            
            # Подготавливаем данные события
            event_body = {
                'summary': event_data.summary,
                'start': event_data.start.dict(exclude_none=True),
                'end': event_data.end.dict(exclude_none=True)
            }
            
            if event_data.description:
                event_body['description'] = event_data.description
            if event_data.location:
                event_body['location'] = event_data.location
            if event_data.colorId:
                event_body['colorId'] = event_data.colorId
            if event_data.attendees:
                event_body['attendees'] = [
                    attendee.dict(exclude_none=True) 
                    for attendee in event_data.attendees
                ]
            
            # Создаем событие
            event = service.events().insert(
                calendarId=event_data.calendar_id,
                body=event_body
            ).execute()
            
            return CalendarEvent(
                id=event['id'],
                summary=event.get('summary', ''),
                description=event.get('description'),
                start=CalendarEventDateTime(
                    dateTime=event['start'].get('dateTime'),
                    date=event['start'].get('date'),
                    timeZone=event['start'].get('timeZone')
                ),
                end=CalendarEventDateTime(
                    dateTime=event['end'].get('dateTime'),
                    date=event['end'].get('date'),
                    timeZone=event['end'].get('timeZone')
                ),
                location=event.get('location'),
                htmlLink=event.get('htmlLink'),
                status=event.get('status')
            )
        except HttpError as error:
            raise ValueError(f"Failed to create event: {error}")

    async def disconnect_user(self, user_id: int, db: AsyncSession) -> bool:
        """Отключает пользователя от Google Calendar"""
        try:
            # Удаляем токены из БД
            result = await db.execute(
                select(GoogleToken).filter(GoogleToken.user_id == user_id)
            )
            token = result.scalar_one_or_none()
            
            if token:
                await db.delete(token)
                await db.commit()
            
            return True
        except Exception:
            return False


# Создаем экземпляр сервиса
google_calendar_service = GoogleCalendarService() 