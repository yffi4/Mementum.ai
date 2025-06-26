# Google Calendar Integration Setup

## Настройка Google API

### 1. Создание проекта в Google Cloud Console

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google Calendar API:
   - Перейдите в "APIs & Services" > "Library"
   - Найдите "Google Calendar API"
   - Нажмите "Enable"

### 2. Настройка OAuth 2.0

1. Перейдите в "APIs & Services" > "Credentials"
2. Нажмите "Create Credentials" > "OAuth client ID"
3. Выберите "Web application"
4. Добавьте разрешенные источники JavaScript:
   - `http://localhost:5173` (для разработки)
   - Ваш домен для продакшена
5. Скопируйте Client ID

### 3. Создание API Key

1. В разделе "Credentials" нажмите "Create Credentials" > "API key"
2. Скопируйте API Key
3. (Рекомендуется) Ограничьте API key только Google Calendar API

### 4. Настройка переменных окружения

Создайте файл `.env.local` в папке `frontend/` с содержимым:

```env
REACT_APP_GOOGLE_CLIENT_ID=ваш-client-id.apps.googleusercontent.com
REACT_APP_GOOGLE_API_KEY=ваш-api-key
```

### 5. Настройка OAuth Consent Screen

1. Перейдите в "APIs & Services" > "OAuth consent screen"
2. Выберите тип пользователя (External для общего доступа)
3. Заполните обязательные поля:
   - App name: "Memetum.ai"
   - User support email: ваш email
   - Developer contact information: ваш email
4. Добавьте скоупы:
   - `https://www.googleapis.com/auth/calendar.readonly`
   - `https://www.googleapis.com/auth/calendar.events`

## Возможности интеграции

### Текущие функции:

- ✅ Авторизация через Google OAuth
- ✅ Просмотр календарей пользователя
- ✅ Отображение событий в календарной сетке
- ✅ Просмотр деталей событий
- ✅ Фильтрация по календарям
- ✅ Месячный и списочный вид

### Планируемые функции:

- 🔄 Создание новых событий
- 🔄 Редактирование существующих событий
- 🔄 Удаление событий
- 🔄 Интеграция с заметками (связывание событий с заметками)
- 🔄 Уведомления о предстоящих событиях
- 🔄 Синхронизация с AI-анализом заметок

## Использование

1. Перейдите на страницу `/calendar`
2. Нажмите "Sign in with Google"
3. Разрешите доступ к календарю
4. Просматривайте и управляйте событиями

## Безопасность

- Все данные календаря остаются в браузере пользователя
- Токены доступа не передаются на сервер
- Используется официальный Google API JavaScript SDK
- Соблюдаются все требования Google API Terms of Service
