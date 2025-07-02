# 🚀 Production Deployment - Сводка изменений

## ✅ Выполненные изменения

### 🔧 Backend изменения

1. **main.py** - CORS теперь использует переменную `FRONTEND_URLS`
2. **env.example** - добавлены новые переменные:
   - `API_BASE_URL`
   - `FRONTEND_URL`
   - `FRONTEND_URLS`
3. **auth/oauth_router.py** - redirect URLs используют `FRONTEND_URL`
4. **database.py** - уже настроен правильно с `ASYNC_DATABASE_URL`

### 🌐 Frontend изменения

1. **config/api.ts** - новый файл с централизованной конфигурацией API
2. **services/** - все API клиенты обновлены для использования переменных:
   - `apiClient.ts`
   - `authApi.ts`
   - `calendarApi.ts`
3. **hooks/useNotes.ts** - использует централизованную конфигурацию
4. **pages/** - обновлены страницы:
   - `LoginPage.tsx`
   - `RegisterPage.tsx`
5. **env.example** - добавлены переменные для Vite:
   - `VITE_API_URL`
   - `VITE_FRONTEND_URL`

### 🐳 Docker конфигурация

1. **docker-compose.yml** - обновлен для использования переменных окружения
2. **production.env.example** - полная production конфигурация
3. **PRODUCTION_SETUP.md** - подробное руководство по развертыванию

## 📋 Инструкции для развертывания

### Для разработки (localhost):

```bash
# 1. Скопируйте конфигурацию
cp backend\ /env.example backend\ /.env
cp frontend/env.example frontend/.env

# 2. Отредактируйте файлы .env с вашими ключами API

# 3. Запустите
docker-compose up -d
```

### Для продакшена:

```bash
# 1. Скопируйте production конфигурацию
cp production.env.example .env

# 2. Отредактируйте .env:
# - Замените yourdomain.com на ваш домен
# - Сгенерируйте SECRET_KEY: openssl rand -base64 32
# - Добавьте реальные API ключи
# - Создайте сильные пароли

# 3. Настройте Google OAuth redirect URI:
# https://api.yourdomain.com/auth/google/callback

# 4. Настройте SSL сертификаты (Let's Encrypt рекомендуется)

# 5. Создайте production docker compose и запустите
# (см. PRODUCTION_SETUP.md)
```

## 🔑 Ключевые переменные окружения

### Обязательные для production:

- `DOMAIN` - ваш домен
- `SECRET_KEY` - сгенерированный секретный ключ
- `POSTGRES_PASSWORD` - сильный пароль БД
- `OPENAI_API_KEY` - ваш OpenAI ключ
- `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET`
- `VITE_API_URL` - URL вашего API

### URLs конфигурация:

- `API_BASE_URL` - базовый URL API (например: https://api.yourdomain.com)
- `FRONTEND_URL` - URL фронтенда (например: https://yourdomain.com)
- `FRONTEND_URLS` - список разрешенных фронтенд URLs для CORS
- `VITE_API_URL` - API URL для фронтенда (используется Vite)

## 🚀 Быстрый старт для продакшена

1. **Подготовьте сервер** с Docker и Docker Compose
2. **Получите домен** и настройте DNS записи
3. **Клонируйте репозиторий**:
   ```bash
   git clone <your-repo>
   cd mementum-ai
   ```
4. **Настройте переменные**:
   ```bash
   cp production.env.example .env
   nano .env  # Отредактируйте под ваши нужды
   ```
5. **Получите SSL сертификаты** (Let's Encrypt):
   ```bash
   sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com
   ```
6. **Запустите приложение**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

## 🔍 Проверка работоспособности

После развертывания проверьте:

- ✅ HTTPS работает без ошибок
- ✅ API документация: `https://api.yourdomain.com/docs`
- ✅ Google OAuth перенаправляет корректно
- ✅ Создание заметок работает
- ✅ AI анализ заметок работает
- ✅ Нет CORS ошибок в браузере

## 📚 Дополнительные файлы

- **PRODUCTION_SETUP.md** - полное руководство по production развертыванию
- **production.env.example** - пример production конфигурации
- **frontend/src/config/api.ts** - централизованная конфигурация API URLs

## 🎯 Результат

Теперь ваш проект **полностью готов для продакшена**:

- ❌ Убраны все хардкод localhost ссылки
- ✅ Все URLs настраиваются через переменные окружения
- ✅ Отдельная конфигурация для development и production
- ✅ Документация для развертывания
- ✅ Безопасность и SSL настройки
- ✅ Мониторинг и backup инструкции

Ваш Mementum.ai готов к запуску на любом домене! 🚀
