# Google Calendar Backend Integration

## 🚀 Настройка Google Calendar API на Backend

### 1. Настройка Google Cloud Console

1. **Создайте проект в [Google Cloud Console](https://console.cloud.google.com/)**
2. **Включите Google Calendar API:**
   - Перейдите в "APIs & Services" > "Library"
   - Найдите "Google Calendar API"
   - Нажмите "Enable"

### 2. Настройка OAuth 2.0

1. **Создайте OAuth Client ID:**
   - Перейдите в "APIs & Services" > "Credentials"
   - Нажмите "Create Credentials" > "OAuth client ID"
   - Выберите "Web application"
2. **Настройте Redirect URIs:**
   ```
   http://localhost:8000/calendar/callback
   ```
3. **Скопируйте Client ID и Client Secret**

### 3. Настройка OAuth Consent Screen

1. **Настройте Consent Screen:**

   - Перейдите в "APIs & Services" > "OAuth consent screen"
   - Выберите "External" для публичного доступа
   - Заполните обязательные поля:
     - App name: "Memetum.ai"
     - User support email: ваш email
     - Developer contact: ваш email

2. **Добавьте Scopes:**
   ```
   https://www.googleapis.com/auth/calendar.events
   https://www.googleapis.com/auth/userinfo.email
   https://www.googleapis.com/auth/userinfo.profile
   ```

### 4. Переменные окружения

Создайте файл `.env` в папке `backend/` с содержимым:

```env
# Google OAuth
GOOGLE_CLIENT_ID=ваш-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=ваш-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/calendar/callback

# Остальные переменные из env.example...
```

### 5. Миграция базы данных

```bash
# Создайте миграцию для новой таблицы GoogleToken
python -m alembic revision --autogenerate -m "Add GoogleToken table"

# Примените миграцию
python -m alembic upgrade head
```

## 📡 API Endpoints

### Авторизация

- `GET /calendar/auth-url` - Получить URL для авторизации
- `GET /calendar/callback` - Callback для OAuth
- `GET /calendar/status` - Статус подключения
- `DELETE /calendar/disconnect` - Отключиться от Google

### Календари и события

- `GET /calendar/user-info` - Информация о пользователе Google
- `GET /calendar/calendars` - Список календарей
- `GET /calendar/events` - События календаря
- `POST /calendar/events` - Создать событие

## 🔄 Архитектура

```
Frontend (React)
    ↓ HTTP Requests
Backend (FastAPI)
    ↓ Google API
Google Calendar API
    ↓ OAuth Tokens
PostgreSQL Database
```

### Основные компоненты:

1. **`models.py`** - Модель GoogleToken для хранения OAuth токенов
2. **`google_calendar/service.py`** - Сервис для работы с Google Calendar API
3. **`google_calendar/router.py`** - FastAPI роутер с endpoints
4. **`google_calendar/schemas.py`** - Pydantic схемы для валидации данных

## 🔒 Безопасность

- **OAuth токены** хранятся в зашифрованном виде в PostgreSQL
- **Автоматическое обновление** токенов при истечении
- **CORS настройки** для безопасного взаимодействия с фронтендом
- **JWT аутентификация** для доступа к API

## 🛠 Использование

1. **Пользователь заходит на `/calendar`**
2. **Нажимает "Sign in with Google"**
3. **Перенаправляется на Google OAuth**
4. **После авторизации возвращается на фронтенд**
5. **Токены сохраняются в базе данных**
6. **API автоматически использует сохраненные токены**

## 🐛 Отладка

```bash
# Проверьте логи FastAPI
uvicorn main:app --reload --log-level debug

# Проверьте подключение к базе данных
python -c "from database import async_engine; print('DB OK')"

# Проверьте переменные окружения
python -c "import os; print(f'Client ID: {os.getenv(\"GOOGLE_CLIENT_ID\")[:10]}...')"
```

## 📋 Требования

- Python 3.8+
- PostgreSQL
- Google Cloud Project с включенным Calendar API
- Настроенный OAuth 2.0 Client
