# Быстрый запуск AI Notes Manager

## Шаг 1: Установка зависимостей

```bash
pip install -r requirements.txt
```

## Шаг 2: Настройка переменных окружения

Скопируйте и настройте файл `.env`:

```bash
cp env.example .env
```

Минимальная настройка `.env`:

```env
# База данных (замените на ваши данные)
DATABASE_URL=postgresql+asyncpg://user:password@localhost/notes_db

# JWT (сгенерируйте случайный ключ)
SECRET_KEY=your-super-secret-key-here

# OpenAI API (обязательно для AI агента)
OPENAI_API_KEY=sk-your-openai-api-key-here
```

## Шаг 3: Настройка базы данных

```bash
# Создание миграций
alembic revision --autogenerate -m "Initial migration"

# Применение миграций
alembic upgrade head
```

## Шаг 4: Запуск приложения

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Шаг 5: Тестирование

Откройте браузер и перейдите на:

- http://localhost:8000 - Главная страница API
- http://localhost:8000/docs - Swagger документация

## Примеры использования

### 1. Регистрация пользователя

```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "password123"
  }'
```

### 2. Вход в систему

```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com",
    "password": "password123"
  }'
```

### 3. Создание заметки через AI агента

```bash
curl -X POST "http://localhost:8000/ai-agent/process" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Создай заметку о важности изучения Python",
    "enable_background_tasks": true
  }'
```

### 4. Создание плана обучения

```bash
curl -X POST "http://localhost:8000/ai-agent/process" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Сделай мне план изучения FastAPI для начинающих",
    "enable_background_tasks": true
  }'
```

### 5. Сохранение веб-страницы

```bash
curl -X POST "http://localhost:8000/ai-agent/scrape-web" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://fastapi.tiangolo.com/"
  }'
```

## Дополнительные настройки

### Google Calendar (опционально)

1. Создайте проект в [Google Cloud Console](https://console.cloud.google.com/)
2. Включите Google Calendar API
3. Создайте OAuth 2.0 credentials
4. Скачайте `credentials.json` в корень проекта
5. Добавьте в `.env`:

```env
GOOGLE_CREDENTIALS_PATH=credentials.json
```

### Поисковые API (опционально)

Для улучшения поиска связанных ссылок добавьте:

```env
# Google Custom Search
GOOGLE_SEARCH_API_KEY=your-google-search-api-key
GOOGLE_SEARCH_ENGINE_ID=your-search-engine-id

# Bing Search
BING_SEARCH_API_KEY=your-bing-search-api-key
```

## Тестирование AI агента

Запустите тестовый скрипт:

```bash
python test_agent.py
```

## Возможные проблемы

### 1. Ошибка подключения к базе данных

Убедитесь, что PostgreSQL запущен и доступен по указанному URL.

### 2. Ошибка OpenAI API

Проверьте правильность API ключа и баланс аккаунта.

### 3. Ошибка импорта модулей

Убедитесь, что все зависимости установлены:

```bash
pip install -r requirements.txt
```

### 4. Ошибка миграций

Удалите папку `alembic/versions/` и создайте миграции заново:

```bash
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## Следующие шаги

1. Изучите API документацию на http://localhost:8000/docs
2. Настройте Google Calendar для напоминаний
3. Добавьте поисковые API для лучшего поиска ссылок
4. Настройте периодические задачи для автоматического поиска
5. Интегрируйте с фронтендом

## Поддержка

При возникновении проблем:

1. Проверьте логи приложения
2. Убедитесь в правильности настроек `.env`
3. Проверьте доступность всех сервисов
4. Создайте issue в репозитории
