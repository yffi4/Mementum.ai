import os
import pickle
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import json


class CalendarManager:
    """
    Менеджер для работы с Google Calendar API
    """
    
    def __init__(self):
        self.credentials = None
        self.service = None
        self.calendar_id = 'primary'  # Основной календарь пользователя
        
        # Если изменяете эти области, удалите файл token.pickle
        self.SCOPES = [
            'https://www.googleapis.com/auth/calendar',
            
        ]
    
    async def authenticate(self) -> bool:
        """
        Аутентификация с Google Calendar API
        """
        try:
            # Проверяем, есть ли сохраненные токены
            if os.path.exists('token.pickle'):
                with open('token.pickle', 'rb') as token:
                    self.credentials = pickle.load(token)
            
            # Если нет валидных токенов, запрашиваем новые
            if not self.credentials or not self.credentials.valid:
                if self.credentials and self.credentials.expired and self.credentials.refresh_token:
                    self.credentials.refresh(Request())
                else:
                    # Путь к файлу credentials.json
                    credentials_path = os.getenv('GOOGLE_CREDENTIALS_PATH')
                    
                    if not os.path.exists(credentials_path):
                        print(f"Файл {credentials_path} не найден. Создайте проект в Google Cloud Console и скачайте credentials.json")
                        return False
                    
                    flow = InstalledAppFlow.from_client_secrets_file(
                        credentials_path, self.SCOPES)
                    self.credentials = flow.run_local_server(port=0)
                
                # Сохраняем токены для следующего запуска
                with open('token.pickle', 'wb') as token:
                    pickle.dump(self.credentials, token)
            
            # Создаем сервис
            self.service = build('calendar', 'v3', credentials=self.credentials)
            return True
            
        except Exception as e:
            print(f"Ошибка аутентификации: {e}")
            return False
    
    async def create_event(self, summary: str, description: str = "", 
                          start_time: str = None, end_time: str = None,
                          location: str = "", attendees: List[str] = None) -> Dict[str, Any]:
        """
        Создание события в календаре
        """
        if not await self._ensure_authenticated():
            return {"error": "Не удалось аутентифицироваться"}
        
        try:
            # Парсим время
            start_datetime = self._parse_datetime(start_time)
            end_datetime = self._parse_datetime(end_time)
            
            if not start_datetime:
                start_datetime = datetime.now() + timedelta(hours=1)
            if not end_datetime:
                end_datetime = start_datetime + timedelta(hours=1)
            
            event = {
                'summary': summary,
                'description': description,
                'location': location,
                'start': {
                    'dateTime': start_datetime.isoformat(),
                    'timeZone': 'Asia/Astana',
                },
                'end': {
                    'dateTime': end_datetime.isoformat(),
                    'timeZone': 'Asia/Astana',
                },
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {'method': 'email', 'minutes': 24 * 60},  # За день
                        {'method': 'popup', 'minutes': 30},       # За 30 минут
                    ],
                },
            }
            
            # Добавляем участников если есть
            if attendees:
                event['attendees'] = [{'email': email} for email in attendees]
            
            event = self.service.events().insert(
                calendarId=self.calendar_id, body=event
            ).execute()
            
            return {
                'id': event['id'],
                'summary': event['summary'],
                'start': event['start']['dateTime'],
                'end': event['end']['dateTime'],
                'htmlLink': event['htmlLink']
            }
            
        except HttpError as error:
            print(f"Ошибка создания события: {error}")
            return {"error": str(error)}
    
    async def update_event(self, event_id: str, **kwargs) -> Dict[str, Any]:
        """
        Обновление события
        """
        if not await self._ensure_authenticated():
            return {"error": "Не удалось аутентифицироваться"}
        
        try:
            # Получаем текущее событие
            event = self.service.events().get(
                calendarId=self.calendar_id, eventId=event_id
            ).execute()
            
            # Обновляем поля
            for key, value in kwargs.items():
                if key == 'start_time' and value:
                    event['start']['dateTime'] = self._parse_datetime(value).isoformat()
                elif key == 'end_time' and value:
                    event['end']['dateTime'] = self._parse_datetime(value).isoformat()
                elif key in ['summary', 'description', 'location']:
                    event[key] = value
            
            # Сохраняем изменения
            updated_event = self.service.events().update(
                calendarId=self.calendar_id, eventId=event_id, body=event
            ).execute()
            
            return {
                'id': updated_event['id'],
                'summary': updated_event['summary'],
                'start': updated_event['start']['dateTime'],
                'end': updated_event['end']['dateTime']
            }
            
        except HttpError as error:
            print(f"Ошибка обновления события: {error}")
            return {"error": str(error)}
    
    async def delete_event(self, event_id: str) -> bool:
        """
        Удаление события
        """
        if not await self._ensure_authenticated():
            return False
        
        try:
            self.service.events().delete(
                calendarId=self.calendar_id, eventId=event_id
            ).execute()
            return True
            
        except HttpError as error:
            print(f"Ошибка удаления события: {error}")
            return False
    
    async def get_event(self, event_id: str) -> Optional[Dict[str, Any]]:
        """
        Получение события по ID
        """
        if not await self._ensure_authenticated():
            return None
        
        try:
            event = self.service.events().get(
                calendarId=self.calendar_id, eventId=event_id
            ).execute()
            
            return {
                'id': event['id'],
                'summary': event.get('summary', ''),
                'description': event.get('description', ''),
                'start': event['start']['dateTime'],
                'end': event['end']['dateTime'],
                'location': event.get('location', ''),
                'htmlLink': event['htmlLink']
            }
            
        except HttpError as error:
            print(f"Ошибка получения события: {error}")
            return None
    
    async def get_upcoming_events(self, hours: int = 24, max_results: int = 10) -> List[Dict[str, Any]]:
        """
        Получение предстоящих событий
        """
        if not await self._ensure_authenticated():
            return []
        
        try:
            now = datetime.utcnow().isoformat() + 'Z'
            end_time = (datetime.utcnow() + timedelta(hours=hours)).isoformat() + 'Z'
            
            events_result = self.service.events().list(
                calendarId=self.calendar_id,
                timeMin=now,
                timeMax=end_time,
                maxResults=max_results,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            
            return [{
                'id': event['id'],
                'summary': event.get('summary', ''),
                'description': event.get('description', ''),
                'start': event['start']['dateTime'],
                'end': event['end']['dateTime'],
                'location': event.get('location', ''),
                'htmlLink': event['htmlLink']
            } for event in events]
            
        except HttpError as error:
            print(f"Ошибка получения событий: {error}")
            return []
    
    async def get_events_by_date(self, date: str, max_results: int = 50) -> List[Dict[str, Any]]:
        """
        Получение событий за определенную дату
        """
        if not await self._ensure_authenticated():
            return []
        
        try:
            # Парсим дату
            if isinstance(date, str):
                start_date = datetime.strptime(date, '%Y-%m-%d')
            else:
                start_date = date
            
            end_date = start_date + timedelta(days=1)
            
            events_result = self.service.events().list(
                calendarId=self.calendar_id,
                timeMin=start_date.isoformat() + 'Z',
                timeMax=end_date.isoformat() + 'Z',
                maxResults=max_results,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            
            return [{
                'id': event['id'],
                'summary': event.get('summary', ''),
                'description': event.get('description', ''),
                'start': event['start']['dateTime'],
                'end': event['end']['dateTime'],
                'location': event.get('location', ''),
                'htmlLink': event['htmlLink']
            } for event in events]
            
        except HttpError as error:
            print(f"Ошибка получения событий по дате: {error}")
            return []
    
    async def search_events(self, query: str, max_results: int = 20) -> List[Dict[str, Any]]:
        """
        Поиск событий по тексту
        """
        if not await self._ensure_authenticated():
            return []
        
        try:
            events_result = self.service.events().list(
                calendarId=self.calendar_id,
                q=query,
                maxResults=max_results,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            
            return [{
                'id': event['id'],
                'summary': event.get('summary', ''),
                'description': event.get('description', ''),
                'start': event['start']['dateTime'],
                'end': event['end']['dateTime'],
                'location': event.get('location', ''),
                'htmlLink': event['htmlLink']
            } for event in events]
            
        except HttpError as error:
            print(f"Ошибка поиска событий: {error}")
            return []
    
    async def get_calendar_list(self) -> List[Dict[str, str]]:
        """
        Получение списка доступных календарей
        """
        if not await self._ensure_authenticated():
            return []
        
        try:
            calendar_list = self.service.calendarList().list().execute()
            calendars = calendar_list.get('items', [])
            
            return [{
                'id': calendar['id'],
                'summary': calendar['summary'],
                'description': calendar.get('description', ''),
                'primary': calendar.get('primary', False)
            } for calendar in calendars]
            
        except HttpError as error:
            print(f"Ошибка получения списка календарей: {error}")
            return []
    
    async def set_calendar(self, calendar_id: str) -> bool:
        """
        Установка активного календаря
        """
        self.calendar_id = calendar_id
        return True
    
    def _parse_datetime(self, time_str: str) -> Optional[datetime]:
        """
        Парсинг строки времени в datetime
        """
        if not time_str:
            return None
        
        # Различные форматы времени
        formats = [
            '%Y-%m-%d %H:%M:%S',
            '%Y-%m-%d %H:%M',
            '%Y-%m-%dT%H:%M:%S',
            '%Y-%m-%dT%H:%M',
            '%Y-%m-%d',
            '%H:%M',
            '%H:%M:%S'
        ]
        
        for fmt in formats:
            try:
                if fmt in ['%H:%M', '%H:%M:%S']:
                    # Если указано только время, добавляем сегодняшнюю дату
                    today = datetime.now().date()
                    time_part = datetime.strptime(time_str, fmt).time()
                    return datetime.combine(today, time_part)
                else:
                    return datetime.strptime(time_str, fmt)
            except ValueError:
                continue
        
        # Если не удалось распарсить, пробуем относительные выражения
        return self._parse_relative_time(time_str)
    
    def _parse_relative_time(self, time_str: str) -> Optional[datetime]:
        """
        Парсинг относительных выражений времени
        """
        now = datetime.now()
        time_str = time_str.lower().strip()
        
        if time_str in ['сейчас', 'now']:
            return now
        elif time_str in ['завтра', 'tomorrow']:
            return now + timedelta(days=1)
        elif time_str in ['послезавтра', 'day after tomorrow']:
            return now + timedelta(days=2)
        elif time_str.startswith('через'):
            # "через 2 часа", "через 30 минут"
            parts = time_str.split()
            if len(parts) >= 3:
                try:
                    amount = int(parts[1])
                    unit = parts[2]
                    
                    if 'час' in unit or 'hour' in unit:
                        return now + timedelta(hours=amount)
                    elif 'минут' in unit or 'minute' in unit:
                        return now + timedelta(minutes=amount)
                    elif 'день' in unit or 'day' in unit:
                        return now + timedelta(days=amount)
                    elif 'недел' in unit or 'week' in unit:
                        return now + timedelta(weeks=amount)
                except ValueError:
                    pass
        
        return None
    
    async def _ensure_authenticated(self) -> bool:
        """
        Проверка и обеспечение аутентификации
        """
        if not self.service:
            return await self.authenticate()
        return True
    
    async def create_recurring_event(self, summary: str, description: str = "",
                                   start_time: str = None, end_time: str = None,
                                   recurrence: str = None) -> Dict[str, Any]:
        """
        Создание повторяющегося события
        """
        if not await self._ensure_authenticated():
            return {"error": "Не удалось аутентифицироваться"}
        
        try:
            start_datetime = self._parse_datetime(start_time)
            end_datetime = self._parse_datetime(end_time)
            
            if not start_datetime:
                start_datetime = datetime.now() + timedelta(hours=1)
            if not end_datetime:
                end_datetime = start_datetime + timedelta(hours=1)
            
            event = {
                'summary': summary,
                'description': description,
                'start': {
                    'dateTime': start_datetime.isoformat(),
                    'timeZone': 'Europe/Moscow',
                },
                'end': {
                    'dateTime': end_datetime.isoformat(),
                    'timeZone': 'Europe/Moscow',
                },
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {'method': 'popup', 'minutes': 30},
                    ],
                },
            }
            
            # Добавляем правило повторения
            if recurrence:
                event['recurrence'] = [recurrence]
            
            event = self.service.events().insert(
                calendarId=self.calendar_id, body=event
            ).execute()
            
            return {
                'id': event['id'],
                'summary': event['summary'],
                'start': event['start']['dateTime'],
                'end': event['end']['dateTime'],
                'htmlLink': event['htmlLink']
            }
            
        except HttpError as error:
            print(f"Ошибка создания повторяющегося события: {error}")
            return {"error": str(error)} 