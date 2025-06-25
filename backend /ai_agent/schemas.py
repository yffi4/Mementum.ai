from pydantic import BaseModel, HttpUrl, Field
from typing import Dict, Any, List, Optional
from datetime import datetime


class AgentRequest(BaseModel):
    """Запрос к AI агенту"""
    message: str = Field(..., description="Сообщение пользователя для обработки")
    enable_background_tasks: bool = Field(False, description="Включить фоновые задачи")


class AgentResponse(BaseModel):
    """Ответ от AI агента"""
    success: bool = Field(..., description="Успешность операции")
    message: str = Field(..., description="Сообщение о результате")
    data: Optional[Dict[str, Any]] = Field(None, description="Дополнительные данные")
    note_id: Optional[int] = Field(None, description="ID созданной заметки")
    category: Optional[str] = Field(None, description="Категория заметки")
    importance: Optional[int] = Field(None, description="Важность заметки (1-10)")


class NoteAnalysisRequest(BaseModel):
    """Запрос на анализ заметки"""
    note_id: int = Field(..., description="ID заметки для анализа")


class NoteAnalysisResponse(BaseModel):
    """Результат анализа заметки"""
    note_id: int = Field(..., description="ID заметки")
    category: str = Field(..., description="Категория заметки")
    importance: int = Field(..., description="Важность заметки (1-10)")
    keywords: List[str] = Field(..., description="Ключевые слова")
    summary: str = Field(..., description="Краткое резюме")
    tags: List[str] = Field(..., description="Предлагаемые теги")
    topics: List[str] = Field(..., description="Основные темы")
    sentiment: Dict[str, Any] = Field(..., description="Анализ тональности")
    improvements: List[str] = Field(..., description="Предложения по улучшению")
    action_items: List[str] = Field(..., description="Найденные задачи и действия")


class WebScrapeRequest(BaseModel):
    """Запрос на парсинг веб-страницы"""
    url: HttpUrl = Field(..., description="URL для парсинга")


class WebScrapeResponse(BaseModel):
    """Результат парсинга веб-страницы"""
    success: bool = Field(..., description="Успешность операции")
    note_id: int = Field(..., description="ID созданной заметки")
    url: str = Field(..., description="URL страницы")
    content_length: int = Field(..., description="Длина извлеченного контента")
    metadata: Dict[str, str] = Field(..., description="Метаданные страницы")
    related_links: List[Dict[str, str]] = Field(..., description="Связанные ссылки")
    message: str = Field(..., description="Сообщение о результате")


class CalendarEventRequest(BaseModel):
    """Запрос на создание события в календаре"""
    summary: str = Field(..., description="Заголовок события")
    description: str = Field("", description="Описание события")
    start_time: str = Field(..., description="Время начала (ISO формат или относительное)")
    end_time: Optional[str] = Field(None, description="Время окончания")
    location: str = Field("", description="Место проведения")
    attendees: Optional[List[str]] = Field(None, description="Список участников (email)")


class CalendarEventResponse(BaseModel):
    """Результат создания события в календаре"""
    success: bool = Field(..., description="Успешность операции")
    event_id: str = Field(..., description="ID события в календаре")
    note_id: int = Field(..., description="ID созданной заметки-напоминания")
    summary: str = Field(..., description="Заголовок события")
    start_time: str = Field(..., description="Время начала")
    end_time: str = Field(..., description="Время окончания")
    html_link: str = Field(..., description="Ссылка на событие в календаре")
    message: str = Field(..., description="Сообщение о результате")


class CalendarEvent(BaseModel):
    """Модель события календаря"""
    id: str = Field(..., description="ID события")
    summary: str = Field(..., description="Заголовок события")
    description: str = Field("", description="Описание события")
    start: str = Field(..., description="Время начала")
    end: str = Field(..., description="Время окончания")
    location: str = Field("", description="Место проведения")
    html_link: str = Field(..., description="Ссылка на событие")


class CalendarEventsResponse(BaseModel):
    """Ответ со списком событий календаря"""
    success: bool = Field(..., description="Успешность операции")
    events: List[CalendarEvent] = Field(..., description="Список событий")
    count: int = Field(..., description="Количество событий")


class RelatedLink(BaseModel):
    """Модель связанной ссылки"""
    title: str = Field(..., description="Заголовок ссылки")
    url: str = Field(..., description="URL ссылки")
    description: str = Field(..., description="Описание ссылки")
    source: str = Field(..., description="Источник (google, bing, duckduckgo)")


class SearchRelatedLinksRequest(BaseModel):
    """Запрос на поиск связанных ссылок"""
    note_id: int = Field(..., description="ID заметки")
    max_results: int = Field(5, ge=1, le=20, description="Максимальное количество результатов")


class SearchRelatedLinksResponse(BaseModel):
    """Результат поиска связанных ссылок"""
    success: bool = Field(..., description="Успешность операции")
    original_note_id: int = Field(..., description="ID исходной заметки")
    found_links: int = Field(..., description="Количество найденных ссылок")
    created_notes: int = Field(..., description="Количество созданных заметок")
    links: List[RelatedLink] = Field(..., description="Список найденных ссылок")
    message: str = Field(..., description="Сообщение о результате")


class NoteGroup(BaseModel):
    """Модель группы заметок"""
    group_name: str = Field(..., description="Название группы")
    theme: str = Field(..., description="Общая тема группы")
    notes: List[int] = Field(..., description="ID заметок в группе")
    summary: str = Field(..., description="Описание группы")


class OrganizeNotesResponse(BaseModel):
    """Результат организации заметок"""
    success: bool = Field(..., description="Успешность операции")
    note_id: int = Field(..., description="ID сводной заметки")
    total_notes: int = Field(..., description="Общее количество заметок")
    organized_groups: int = Field(..., description="Количество созданных групп")
    groups: List[NoteGroup] = Field(..., description="Список групп")
    message: str = Field(..., description="Сообщение о результате")


class AgentStatusResponse(BaseModel):
    """Статус AI агента"""
    success: bool = Field(..., description="Успешность операции")
    user_id: int = Field(..., description="ID пользователя")
    calendar_connected: bool = Field(..., description="Подключение к календарю")
    total_notes: int = Field(..., description="Общее количество заметок")
    recent_notes_count: int = Field(..., description="Количество недавних заметок")
    agent_version: str = Field(..., description="Версия агента")
    services: Dict[str, bool] = Field(..., description="Статус сервисов")


class LearningPlanRequest(BaseModel):
    """Запрос на создание плана обучения"""
    topic: str = Field(..., description="Тема для изучения")
    complexity: str = Field("средняя", description="Сложность (простая, средняя, сложная)")
    duration: Optional[str] = Field(None, description="Продолжительность обучения")
    goals: Optional[List[str]] = Field(None, description="Цели обучения")


class LearningPlanResponse(BaseModel):
    """Результат создания плана обучения"""
    success: bool = Field(..., description="Успешность операции")
    main_note_id: int = Field(..., description="ID основной заметки с планом")
    steps_count: int = Field(..., description="Количество шагов")
    steps: List[Dict[str, str]] = Field(..., description="Список шагов")
    message: str = Field(..., description="Сообщение о результате")


class ProjectPlanRequest(BaseModel):
    """Запрос на создание плана проекта"""
    project_name: str = Field(..., description="Название проекта")
    description: str = Field(..., description="Описание проекта")
    complexity: str = Field("средняя", description="Сложность проекта")
    deadline: Optional[str] = Field(None, description="Дедлайн проекта")
    team_size: Optional[int] = Field(None, description="Размер команды")


class ProjectPlanResponse(BaseModel):
    """Результат создания плана проекта"""
    success: bool = Field(..., description="Успешность операции")
    main_note_id: int = Field(..., description="ID основной заметки с планом")
    phases_count: int = Field(..., description="Количество фаз")
    phases: List[Dict[str, Any]] = Field(..., description="Список фаз проекта")
    message: str = Field(..., description="Сообщение о результате")


class ReminderRequest(BaseModel):
    """Запрос на создание напоминания"""
    title: str = Field(..., description="Заголовок напоминания")
    description: str = Field("", description="Описание напоминания")
    reminder_time: str = Field(..., description="Время напоминания")
    priority: str = Field("средняя", description="Приоритет (низкая, средняя, высокая)")
    recurring: bool = Field(False, description="Повторяющееся напоминание")


class ReminderResponse(BaseModel):
    """Результат создания напоминания"""
    success: bool = Field(..., description="Успешность операции")
    note_id: int = Field(..., description="ID заметки-напоминания")
    calendar_event_id: str = Field(..., description="ID события в календаре")
    reminder_time: str = Field(..., description="Время напоминания")
    message: str = Field(..., description="Сообщение о результате")


class WebContentMetadata(BaseModel):
    """Метаданные веб-контента"""
    url: str = Field(..., description="URL страницы")
    title: str = Field(..., description="Заголовок страницы")
    description: str = Field("", description="Описание страницы")
    image: str = Field("", description="URL изображения")
    author: str = Field("", description="Автор")
    published_date: str = Field("", description="Дата публикации")
    favicon: str = Field("", description="URL favicon")


class WebContentAnalysis(BaseModel):
    """Анализ веб-контента"""
    metadata: WebContentMetadata = Field(..., description="Метаданные страницы")
    content_summary: str = Field(..., description="Краткое содержание")
    key_topics: List[str] = Field(..., description="Ключевые темы")
    related_keywords: List[str] = Field(..., description="Связанные ключевые слова")
    sentiment: Dict[str, Any] = Field(..., description="Анализ тональности")
    readability_score: float = Field(..., description="Оценка читаемости")
    estimated_reading_time: int = Field(..., description="Примерное время чтения (минуты)")


class WebContentAnalysisResponse(BaseModel):
    """Результат анализа веб-контента"""
    success: bool = Field(..., description="Успешность операции")
    note_id: int = Field(..., description="ID созданной заметки")
    analysis: WebContentAnalysis = Field(..., description="Результат анализа")
    related_links: List[RelatedLink] = Field(..., description="Связанные ссылки")
    message: str = Field(..., description="Сообщение о результате") 