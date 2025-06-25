# AI Notes Manager

Интеллектуальная система управления заметками с AI агентом, который автоматически создает, организует и анализирует заметки, интегрируется с Google Calendar и ищет связанные ссылки в интернете.

## Возможности

### 🤖 AI Агент

- **Автоматическое создание заметок** на основе запросов пользователя
- **Генерация планов обучения и проектов** с детальными этапами
- **Анализ и категоризация** заметок по важности и темам
- **Поиск связей** между заметками
- **Автоматическая организация** заметок в логические группы

### 📅 Google Calendar Интеграция

- **Создание напоминаний** и событий в календаре
- **Парсинг естественного языка** для времени ("завтра в 15:00", "через 2 часа")
- **Автоматические уведомления** о предстоящих событиях
- **Синхронизация** с заметками-напоминаниями

### 🌐 Веб-скрапинг и поиск

- **Парсинг веб-страниц** и сохранение контента
- **Поиск связанных ссылок** каждые 8 часов
- **Интеграция с поисковыми системами** (Google, Bing, DuckDuckGo)
- **Анализ метаданных** страниц

### 📝 Управление заметками

- **Полноценная CRUD система** для заметок
- **Связи между заметками** (как в Obsidian)
- **Поиск и фильтрация** по содержимому
- **Пагинация и сортировка**

## Установка и настройка

### 1. Клонирование и установка зависимостей

```bash
git clone <repository-url>
cd backend
pip install -r requirements.txt
```

### 2. Настройка переменных окружения

Скопируйте `env.example` в `.env` и заполните необходимые переменные:

```bash
cp env.example .env
```

#### Обязательные переменные:

```env
# База данных PostgreSQL
DATABASE_URL=postgresql+asyncpg://user:password@localhost/notes_db

# JWT для аутентификации
SECRET_KEY=your-secret-key-here

# OpenAI API (для AI агента)
OPENAI_API_KEY=your-openai-api-key-here
```

#### Опциональные переменные:

```env
# Google Calendar API
GOOGLE_CREDENTIALS_PATH=credentials.json

# Google Custom Search API
GOOGLE_SEARCH_API_KEY=your-google-search-api-key
GOOGLE_SEARCH_ENGINE_ID=your-search-engine-id

# Bing Search API
BING_SEARCH_API_KEY=your-bing-search-api-key
```

### 3. Настройка базы данных

```bash
# Создание миграций
alembic revision --autogenerate -m "Initial migration"

# Применение миграций
alembic upgrade head
```

### 4. Настройка Google Calendar API

1. Создайте проект в [Google Cloud Console](https://console.cloud.google.com/)
2. Включите Google Calendar API
3. Создайте OAuth 2.0 credentials
4. Скачайте `credentials.json` и поместите в корень проекта
5. При первом запуске пройдите аутентификацию

### 5. Запуск приложения

```bash
# Разработка
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Продакшн
uvicorn main:app --host 0.0.0.0 --port 8000
```

## API Endpoints

### Аутентификация

- `POST /auth/register` - Регистрация
- `POST /auth/login` - Вход
- `GET /auth/me` - Информация о пользователе

### Заметки

- `GET /notes/` - Получение заметок
- `POST /notes/` - Создание заметки
- `GET /notes/{id}` - Получение заметки
- `PUT /notes/{id}` - Обновление заметки
- `DELETE /notes/{id}` - Удаление заметки

### AI Агент

- `POST /ai-agent/process` - Обработка запроса пользователя
- `POST /ai-agent/analyze-note` - Анализ заметки
- `POST /ai-agent/scrape-web` - Парсинг веб-страницы
- `POST /ai-agent/calendar/event` - Создание события в календаре
- `GET /ai-agent/calendar/events` - Получение событий
- `POST /ai-agent/organize-notes` - Организация заметок
- `POST /ai-agent/search-related-links` - Поиск связанных ссылок

## Примеры использования

### Создание плана обучения

```bash
curl -X POST "http://localhost:8000/ai-agent/process" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Сделай мне план изучения Python для начинающих",
    "enable_background_tasks": true
  }'
```

### Сохранение веб-страницы

```bash
curl -X POST "http://localhost:8000/ai-agent/scrape-web" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/article"
  }'
```

### Создание напоминания

```bash
curl -X POST "http://localhost:8000/ai-agent/calendar/event" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Встреча с клиентом",
    "description": "Обсуждение проекта",
    "start_time": "завтра 14:00",
    "end_time": "завтра 15:00"
  }'
```

## Архитектура

### Основные компоненты:

1. **AIAgent** - Главный класс агента, координирующий все операции
2. **NoteAnalyzer** - Анализ и категоризация заметок с помощью OpenAI
3. **WebScraper** - Парсинг веб-страниц и поиск связанных ссылок
4. **CalendarManager** - Интеграция с Google Calendar API
5. **FastAPI Router** - REST API для взаимодействия с агентом

### Периодические задачи:

- **Поиск связанных ссылок** - каждые 8 часов
- **Реорганизация заметок** - автоматический анализ и группировка
- **Проверка напоминаний** - уведомления о предстоящих событиях

## Разработка

### Структура проекта:

```
backend/
├── ai_agent/
│   ├── __init__.py
│   ├── agent.py          # Основной AI агент
│   ├── note_analyzer.py  # Анализ заметок
│   ├── web_scraper.py    # Веб-скрапинг
│   ├── calendar_manager.py # Google Calendar
│   ├── prompts.py        # Промпты для OpenAI
│   ├── router.py         # API endpoints
│   └── schemas.py        # Pydantic схемы
├── notes/
│   ├── crud.py           # CRUD операции
│   ├── router.py         # API для заметок
│   └── schemas.py        # Схемы заметок
├── jwt_auth/
│   ├── auth.py           # JWT аутентификация
│   └── router.py         # Auth endpoints
├── models.py             # SQLAlchemy модели
├── database.py           # Настройки БД
├── main.py              # FastAPI приложение
└── requirements.txt     # Зависимости
```

### Добавление новых возможностей:

1. **Новые типы анализа** - расширьте `NoteAnalyzer`
2. **Дополнительные API** - добавьте в `WebScraper`
3. **Новые промпты** - обновите `prompts.py`
4. **Дополнительные эндпоинты** - расширьте `router.py`

## Лицензия

MIT License

## Поддержка

Для вопросов и предложений создавайте issues в репозитории.
