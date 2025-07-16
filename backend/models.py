from datetime import datetime
from typing import List

from sqlalchemy import (
    Column, Integer, Text, ForeignKey, DateTime, String, Boolean
)
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, unique=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)  # Nullable для Google OAuth
    is_pro = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Google OAuth fields
    google_id = Column(String(255), unique=True, nullable=True)
    google_email = Column(String(255), nullable=True)
    google_name = Column(String(255), nullable=True)
    google_picture = Column(Text, nullable=True)

    notes = relationship("Note", back_populates='user')
    links = relationship("RelatedLink", back_populates='user')
    google_tokens = relationship("GoogleToken", back_populates='user', uselist=False)
    

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, unique=True, index=0)
    user_id = Column(ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(100), nullable=True)  # Категория заметки (AI анализ)
    importance = Column(Integer, default=1)  # Важность 1-5 (AI анализ)
    tags = Column(Text, nullable=True)  # JSON массив тегов
    summary = Column(Text, nullable=True)  # Краткое резюме (AI генерация)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates='notes')
    connections_as_a = relationship("NoteConnection", back_populates='note_a', foreign_keys='NoteConnection.note_a_id', cascade='all, delete-orphan')
    connections_as_b = relationship("NoteConnection", back_populates='note_b', foreign_keys='NoteConnection.note_b_id', cascade='all, delete-orphan')
    calendar_events = relationship("NoteCalendarEvent", back_populates='note', cascade='all, delete-orphan')
    

class NoteConnection(Base):
    """ Реализация ребер графа """
    __tablename__ = "note_connections"

    id = Column(Integer, primary_key=True, autoincrement=True)
    note_a_id = Column(ForeignKey("notes.id"), nullable=False)
    note_b_id = Column(ForeignKey("notes.id"), nullable=False)
    relation = Column(String(255), default='RELATED')

    note_a = relationship("Note", back_populates='connections_as_a', foreign_keys=[note_a_id])
    note_b = relationship("Note", back_populates='connections_as_b', foreign_keys=[note_b_id])
    

class RelatedLink(Base):
    """ Рекомендации """
    __tablename__ = "related_links"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(ForeignKey("users.id"), nullable=False)
    note_id = Column(ForeignKey("notes.id"), nullable=False)
    url = Column(Text, nullable=False)
    title = Column(String(255), nullable=False)
    score = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates='links')
    note = relationship("Note")


class GoogleToken(Base):
    """Хранение Google OAuth токенов пользователя"""
    __tablename__ = "google_tokens"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(ForeignKey("users.id"), nullable=False, unique=True)
    access_token = Column(Text, nullable=False)
    refresh_token = Column(Text, nullable=True)
    token_type = Column(String(50), default="Bearer")
    expires_at = Column(DateTime, nullable=False)
    scope = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates='google_tokens')


class RefreshToken(Base):
    """Хранение refresh токенов для длительной авторизации"""
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(ForeignKey("users.id"), nullable=False)
    token = Column(String(255), nullable=False, unique=True, index=True)
    expires_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_used_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")


class NoteCalendarEvent(Base):
    """Связь заметок с событиями календаря"""
    __tablename__ = "note_calendar_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    note_id = Column(ForeignKey("notes.id"), nullable=False)
    google_event_id = Column(String(255), nullable=False)  # ID события в Google Calendar
    calendar_id = Column(String(255), default="primary")
    event_title = Column(String(500), nullable=False)
    event_description = Column(Text, nullable=True)
    start_datetime = Column(DateTime, nullable=False)
    end_datetime = Column(DateTime, nullable=False)
    location = Column(String(500), nullable=True)
    is_all_day = Column(Boolean, default=False)
    reminder_minutes = Column(Integer, default=30)
    created_by_ai = Column(Boolean, default=True)  # Создано ли событие AI агентом
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    note = relationship("Note", back_populates='calendar_events')

