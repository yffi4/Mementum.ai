# Настройка Google OAuth для Memetum.ai

## 🔧 Пошаговая настройка Google Cloud Console

### 1. Создание проекта в Google Cloud Console

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите необходимые API

### 2. Включение API

В разделе "API и сервисы" → "Библиотека" включите:

- **Google Calendar API**
- **Google+ API** (для получения профиля пользователя)

### 3. Настройка экрана согласия OAuth

1. Перейдите в "API и сервисы" → "Экран согласия OAuth"
2. Выберите тип пользователя: **Внешний**
3. Заполните обязательные поля:

   - **Название приложения**: Memetum.ai
   - **Эл. почта службы поддержки**: ваш email
   - **Домен приложения**: localhost (для разработки)
   - **Эл. почта разработчика**: ваш email

4. Добавьте области доступа:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `../auth/calendar`

### 4. Создание учетных данных OAuth 2.0

1. Перейдите в "API и сервисы" → "Учетные данные"
2. Нажмите "Создать учетные данные" → "Идентификатор клиента OAuth 2.0"
3. Выберите тип приложения: **Веб-приложение**
4. Укажите название: **Memetum.ai Web Client**

### 5. ⚠️ ВАЖНО: Настройка URI перенаправления

В разделе "Разрешенные URI перенаправления" добавьте **ТОЧНО**:

```
http://localhost:8000/auth/google/callback
```

**Обратите внимание:**

- Используйте `http://` (не `https://`) для localhost
- Порт должен быть `8000` (порт вашего FastAPI сервера)
- Путь должен быть `/auth/google/callback` (НЕ `/calendar/callback`)

### 6. Получение учетных данных

После создания вы получите:

- **Client ID** (заканчивается на `.apps.googleusercontent.com`)
- **Client Secret** (строка символов)

### 7. Настройка переменных окружения

Создайте файл `.env` в папке `backend` со следующими переменными:

```env
# Google OAuth
GOOGLE_CLIENT_ID=ваш-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=ваш-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
```

## 🚀 Тестирование настройки

### 1. Запустите backend сервер:

```bash
cd backend
uvicorn main:app --reload --port 8000
```

### 2. Запустите frontend:

```bash
cd frontend
npm run dev
```

### 3. Протестируйте авторизацию:

1. Откройте http://localhost:5173/login
2. Нажмите "Continue with Google"
3. Должно произойти перенаправление на Google
4. После авторизации вы должны вернуться в приложение

## 🔍 Решение проблем

### Ошибка "redirect_uri_mismatch"

- Проверьте, что URI в Google Console **точно** совпадает с `GOOGLE_REDIRECT_URI` в .env
- Убедитесь, что используете правильный порт (8000 для backend)
- Проверьте, что нет лишних слешей в конце URI

### Ошибка "invalid_client"

- Проверьте правильность `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET`
- Убедитесь, что нет лишних пробелов в переменных окружения

### Ошибка "access_denied"

- Убедитесь, что включены необходимые API в Google Cloud Console
- Проверьте настройки экрана согласия OAuth

## 📝 Примечания для продакшена

Для продакшена замените localhost на ваш домен:

```env
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback
```

И добавьте этот URI в Google Cloud Console.
