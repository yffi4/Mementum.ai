from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from database import get_async_db
from jwt_auth.auth import get_current_active_user
from models import User

from . import crud
from .schemas import (
    NoteCreate, 
    NoteUpdate, 
    NoteResponse, 
    NoteWithConnections,
    NoteConnectionCreate,
    NoteConnectionResponse
)

router = APIRouter()


# Эндпоинты для Note
@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    note: NoteCreate,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user)
):
    """Создать новую заметку"""
    db_note = await crud.create_note(db, note, current_user.id)
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
    current_user: User = Depends(get_current_active_user)
):
    """Обновить заметку"""
    updated_note = await crud.update_note(db, note_id, current_user.id, note_update)
    if not updated_note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Заметка не найдена"
        )
    return updated_note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_active_user)
):
    """Удалить заметку"""
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
