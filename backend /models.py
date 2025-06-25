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
    hashed_password = Column(String(255), nullable=False)
    is_pro = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


    notes = relationship("Note", back_populates='user')
    links = relationship("RelatedLink", back_populates='user')
    

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, unique=True, index=0)
    user_id = Column(ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates='notes')
    connections_as_a = relationship("NoteConnection", back_populates='note_a', foreign_keys='NoteConnection.note_a_id', cascade='all, delete-orphan')
    connections_as_b = relationship("NoteConnection", back_populates='note_b', foreign_keys='NoteConnection.note_b_id')
    

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

