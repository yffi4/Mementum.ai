from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class GoogleAuthURL(BaseModel):
    auth_url: str


class GoogleTokenCallback(BaseModel):
    code: str
    state: Optional[str] = None


class GoogleTokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str]
    expires_at: datetime
    token_type: str = "Bearer"
    scope: str


class CalendarEventAttendee(BaseModel):
    email: str
    displayName: Optional[str] = None
    responseStatus: Optional[str] = None


class CalendarEventDateTime(BaseModel):
    dateTime: Optional[str] = None
    date: Optional[str] = None
    timeZone: Optional[str] = None


class CalendarEventCreator(BaseModel):
    email: str
    displayName: Optional[str] = None


class CalendarEvent(BaseModel):
    id: str
    summary: str
    description: Optional[str] = None
    start: CalendarEventDateTime
    end: CalendarEventDateTime
    location: Optional[str] = None
    attendees: Optional[List[CalendarEventAttendee]] = None
    colorId: Optional[str] = None
    creator: Optional[CalendarEventCreator] = None
    htmlLink: Optional[str] = None
    status: Optional[str] = None


class Calendar(BaseModel):
    id: str
    summary: str
    description: Optional[str] = None
    backgroundColor: Optional[str] = None
    foregroundColor: Optional[str] = None
    selected: Optional[bool] = None
    accessRole: Optional[str] = None


class CalendarListResponse(BaseModel):
    calendars: List[Calendar]


class EventsListResponse(BaseModel):
    events: List[CalendarEvent]
    nextPageToken: Optional[str] = None


class CreateEventRequest(BaseModel):
    calendar_id: str = "primary"
    summary: str
    description: Optional[str] = None
    start: CalendarEventDateTime
    end: CalendarEventDateTime
    location: Optional[str] = None
    attendees: Optional[List[CalendarEventAttendee]] = None
    colorId: Optional[str] = None


class UpdateEventRequest(BaseModel):
    calendar_id: str = "primary"
    event_id: str
    summary: Optional[str] = None
    description: Optional[str] = None
    start: Optional[CalendarEventDateTime] = None
    end: Optional[CalendarEventDateTime] = None
    location: Optional[str] = None
    attendees: Optional[List[CalendarEventAttendee]] = None
    colorId: Optional[str] = None


class GoogleCalendarUser(BaseModel):
    email: str
    name: str
    picture: Optional[str] = None
    is_connected: bool 

class UserInfoResponse(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    is_connected: bool  

class CalendarEventResponse(BaseModel):
    id: str
    summary: str
    description: Optional[str] = None
    start: CalendarEventDateTime
    end: CalendarEventDateTime
    location: Optional[str] = None
    attendees: Optional[List[CalendarEventAttendee]] = None
    colorId: Optional[str] = None
    creator: Optional[CalendarEventCreator] = None