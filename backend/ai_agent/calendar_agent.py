import re
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from openai import OpenAI

from models import Note, NoteCalendarEvent
from auth.google_oauth import google_oauth_service
from config import settings


class CalendarAgent:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        
        # Шаблоны для определения временных выражений
        self.time_patterns = [
            r'(\d{1,2}):(\d{2})',  # HH:MM
            r'(\d{1,2}) часов?',    # X часов
            r'в (\d{1,2})',        # в X
            r'утром',
            r'днем',
            r'вечером',
            r'ночью'
        ]
        
        # Шаблоны для определения дат
        self.date_patterns = [
            r'(\d{1,2})\.(\d{1,2})\.(\d{4})',  # DD.MM.YYYY
            r'(\d{1,2})\.(\d{1,2})',          # DD.MM
            r'завтра',
            r'послезавтра',
            r'через (\d+) дн',
            r'через неделю',
            r'в понедельник',
            r'во вторник',
            r'в среду',
            r'в четверг',
            r'в пятницу',
            r'в субботу',
            r'в воскресенье'
        ]
        
        # Ключевые слова для встреч/событий
        self.event_keywords = [
            'встреча', 'собрание', 'конференция', 'презентация', 'интервью',
            'звонок', 'разговор', 'обсуждение', 'планерка', 'созвон',
            'напомни', 'напоминание', 'не забыть', 'дедлайн', 'срок',
            'мероприятие', 'событие', 'день рождения', 'праздник',
            'врач', 'доктор', 'прием', 'визит', 'поход', 'поездка'
        ]

    def analyze_note_for_events(self, db: Session, note: Note, user_id: int) -> List[NoteCalendarEvent]:
        """Анализировать заметку на предмет событий календаря"""
        
        # Проверить, есть ли в заметке временные маркеры
        if not self._contains_temporal_markers(note.content):
            return []
        
        # Использовать GPT для анализа и извлечения событий
        events_data = self._extract_events_with_gpt(note.content)
        
        created_events = []
        for event_data in events_data:
            try:
                # Создать событие в Google Calendar
                calendar_service = google_oauth_service.get_calendar_service(db, user_id)
                google_event = self._create_google_event(calendar_service, event_data, note)
                
                if google_event:
                    # Сохранить связь в базе данных
                    note_event = NoteCalendarEvent(
                        note_id=note.id,
                        google_event_id=google_event['id'],
                        calendar_id=event_data.get('calendar_id', 'primary'),
                        event_title=event_data['title'],
                        event_description=event_data.get('description', ''),
                        start_datetime=datetime.fromisoformat(event_data['start_time'].replace('Z', '+00:00')),
                        end_datetime=datetime.fromisoformat(event_data['end_time'].replace('Z', '+00:00')),
                        location=event_data.get('location'),
                        is_all_day=event_data.get('is_all_day', False),
                        reminder_minutes=event_data.get('reminder_minutes', 30),
                        created_by_ai=True
                    )
                    
                    db.add(note_event)
                    created_events.append(note_event)
                    
            except Exception as e:
                print(f"Ошибка создания события: {e}")
                continue
        
        if created_events:
            db.commit()
            
        return created_events

    def _contains_temporal_markers(self, text: str) -> bool:
        """Проверить, содержит ли текст временные маркеры"""
        text_lower = text.lower()
        
        # Проверить ключевые слова событий
        has_event_keywords = any(keyword in text_lower for keyword in self.event_keywords)
        
        # Проверить временные паттерны
        has_time_patterns = any(re.search(pattern, text_lower) for pattern in self.time_patterns)
        
        # Проверить паттерны дат
        has_date_patterns = any(re.search(pattern, text_lower) for pattern in self.date_patterns)
        
        return has_event_keywords and (has_time_patterns or has_date_patterns)

    def _extract_events_with_gpt(self, note_content: str) -> List[Dict[str, Any]]:
        """Использовать GPT для извлечения событий из заметки"""
        
        system_prompt = """
        Ты - AI ассистент для анализа заметок и создания событий календаря.
        
        Проанализируй текст заметки и извлеки все упоминания о встречах, событиях, дедлайнах или других важных датах.
        
        Для каждого найденного события верни JSON объект со следующими полями:
        - title: краткое название события (обязательно)
        - description: описание события (опционально)
        - start_time: время начала в формате ISO 8601 (обязательно)
        - end_time: время окончания в формате ISO 8601 (обязательно)
        - location: место проведения (опционально)
        - is_all_day: true если событие на весь день (по умолчанию false)
        - reminder_minutes: за сколько минут напомнить (по умолчанию 30)
        
        Если время не указано точно, предположи разумное время:
        - Встречи/собрания: обычно 1-2 часа
        - Звонки: 30-60 минут
        - Дедлайны: установи на конец рабочего дня (18:00)
        
        Если дата не указана точно (например, "завтра"), рассчитай дату относительно сегодняшнего дня.
        
        Верни массив JSON объектов. Если событий не найдено, верни пустой массив.
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Текст заметки:\n{note_content}"}
                ],
                temperature=0.3
            )
            
            content = response.choices[0].message.content.strip()
            
            # Попытаться распарсить JSON
            import json
            if content.startswith('[') and content.endswith(']'):
                return json.loads(content)
            elif content.startswith('{') and content.endswith('}'):
                return [json.loads(content)]
            else:
                # Попытаться найти JSON в тексте
                import re
                json_match = re.search(r'\[.*\]', content, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group())
                
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    return [json.loads(json_match.group())]
                    
            return []
            
        except Exception as e:
            print(f"Ошибка анализа с GPT: {e}")
            return []

    def _create_google_event(self, calendar_service, event_data: Dict[str, Any], note: Note) -> Optional[Dict[str, Any]]:
        """Создать событие в Google Calendar"""
        
        try:
            # Подготовить данные события
            event_body = {
                'summary': event_data['title'],
                'description': f"Создано из заметки: {note.title}\n\n{event_data.get('description', '')}",
                'start': {
                    'dateTime': event_data['start_time'],
                    'timeZone': 'Europe/Moscow',
                },
                'end': {
                    'dateTime': event_data['end_time'],
                    'timeZone': 'Europe/Moscow',
                },
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {'method': 'popup', 'minutes': event_data.get('reminder_minutes', 30)},
                    ],
                },
            }
            
            # Добавить локацию если есть
            if event_data.get('location'):
                event_body['location'] = event_data['location']
            
            # Создать событие
            event = calendar_service.events().insert(
                calendarId='primary',
                body=event_body
            ).execute()
            
            return event
            
        except Exception as e:
            print(f"Ошибка создания Google события: {e}")
            return None

    def get_note_events(self, db: Session, note_id: int) -> List[NoteCalendarEvent]:
        """Получить все события календаря для заметки"""
        return db.query(NoteCalendarEvent).filter(
            NoteCalendarEvent.note_id == note_id
        ).all()

    def delete_note_events(self, db: Session, note_id: int, user_id: int):
        """Удалить все события календаря для заметки"""
        events = self.get_note_events(db, note_id)
        
        if not events:
            return
        
        try:
            calendar_service = google_oauth_service.get_calendar_service(db, user_id)
            
            for event in events:
                try:
                    # Удалить из Google Calendar
                    calendar_service.events().delete(
                        calendarId=event.calendar_id,
                        eventId=event.google_event_id
                    ).execute()
                except Exception as e:
                    print(f"Ошибка удаления события {event.google_event_id}: {e}")
                
                # Удалить из БД
                db.delete(event)
            
            db.commit()
            
        except Exception as e:
            print(f"Ошибка удаления событий: {e}")


calendar_agent = CalendarAgent() 