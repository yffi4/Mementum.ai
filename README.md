# 🚀 Mementum.ai - Intelligent Notes Application

Современное приложение для создания и управления заметками с поддержкой ИИ анализа, Google OAuth авторизации и календарной интеграции.

## 📋 Стек технологий

### Backend

- **FastAPI** - современный веб-фреймворк для Python
- **PostgreSQL** - надежная реляционная база данных
- **Redis** - кеширование и очереди задач
- **Celery** - асинхронная обработка задач
- **OpenAI API** - анализ заметок с помощью ИИ
- **Google APIs** - OAuth авторизация и календарь

### Frontend

- **React 19** с TypeScript
- **Vite** - быстрая сборка и hot reload
- **TailwindCSS** - современная стилизация
- **Framer Motion** - плавные анимации
- **React Query** - управление состоянием сервера

### DevOps

- **Docker & Docker Compose** - контейнеризация
- **Nginx** - reverse proxy и статические файлы
- **Prometheus & Grafana** - мониторинг (опционально)

## 🚀 Быстрый старт

### Предварительные требования

- Docker и Docker Compose
- OpenAI API ключ
- Google OAuth credentials (опционально)

### 1. Клонирование проекта

```bash
git clone <repository-url>
cd mementum-ai
```

### 2. Настройка переменных окружения

```bash
# Скопируйте пример файла
cp docker.env.example .env

# Отредактируйте .env файл
nano .env
```

**Обязательные переменные:**

```env
SECRET_KEY=your-super-secret-key-change-in-production
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**Для Google OAuth (опционально):**

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Запуск приложения

```bash
# Базовый запуск (backend + frontend + database + redis)
docker-compose up -d

# Запуск с мониторингом
docker-compose --profile monitoring up -d

# Запуск в production режиме с Nginx
docker-compose --profile production up -d
```

### 4. Инициализация базы данных

```bash
# База данных инициализируется автоматически при первом запуске
# Проверить статус можно так:
docker-compose logs backend
```

### 5. Доступ к приложению

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Grafana** (если включен): http://localhost:3001
- **Prometheus** (если включен): http://localhost:9090

## 📁 Структура проекта

```
mementum-ai/
├── docker-compose.yml          # Главный Docker Compose файл
├── docker.env.example          # Пример переменных окружения
├── README.md                   # Этот файл
│
├── frontend/                   # React frontend
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── src/
│   └── package.json
│
└── backend /                   # FastAPI backend
    ├── Dockerfile
    ├── requirements.txt
    ├── main.py
    └── ...
```

## 🔧 Команды управления

### Базовые команды

```bash
# Запуск всех сервисов
docker-compose up -d

# Остановка всех сервисов
docker-compose down

# Просмотр логов
docker-compose logs -f [service_name]

# Перестройка образов
docker-compose build

# Запуск отдельного сервиса
docker-compose up -d postgres redis backend
```

### Команды для разработки

```bash
# Запуск только базы данных и Redis для локальной разработки
docker-compose up -d postgres redis

# Подключение к контейнеру backend
docker-compose exec backend bash

# Выполнение миграций вручную
docker-compose exec backend alembic upgrade head

# Просмотр логов конкретного сервиса
docker-compose logs -f backend
```

### Команды для производства

```bash
# Запуск в production режиме
docker-compose --profile production up -d

# Обновление и перезапуск
docker-compose pull
docker-compose down
docker-compose up -d
```

## 🔍 Управление данными

### Backup базы данных

```bash
# Создание backup
docker-compose exec postgres pg_dump -U notes_user notes_db > backup.sql

# Восстановление из backup
docker-compose exec -T postgres psql -U notes_user notes_db < backup.sql
```

### Очистка данных

```bash
# Удаление volumes (ВНИМАНИЕ: удалит все данные!)
docker-compose down -v

# Удаление неиспользуемых образов
docker system prune -a
```

## 🐛 Отладка

### Логи сервисов

```bash
# Все логи
docker-compose logs

# Логи конкретного сервиса
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Следить за логами в реальном времени
docker-compose logs -f backend
```

### Состояние сервисов

```bash
# Статус всех контейнеров
docker-compose ps

# Подробная информация о контейнерах
docker-compose top
```

### Подключение к контейнерам

```bash
# Backend
docker-compose exec backend bash

# База данных
docker-compose exec postgres psql -U notes_user notes_db

# Redis
docker-compose exec redis redis-cli
```

## ⚙️ Настройка окружения

### Для разработки

1. Скопируйте `docker.env.example` в `.env`
2. Установите `OPENAI_API_KEY`
3. Запустите: `docker-compose up -d`

### Для production

1. Измените `SECRET_KEY` на уникальный
2. Настройте SSL сертификаты в `nginx/ssl/`
3. Обновите домен в `FRONTEND_URLS`
4. Запустите: `docker-compose --profile production up -d`

## 🔐 Безопасность

- Измените все пароли по умолчанию
- Используйте сложный `SECRET_KEY`
- Настройте SSL для production
- Ограничьте доступ к портам базы данных
- Регулярно обновляйте образы Docker

## 📚 API Документация

API документация доступна по адресу: http://localhost:8000/docs

Основные endpoints:

- `POST /auth/register` - Регистрация
- `POST /auth/login` - Вход
- `GET /notes/` - Список заметок
- `POST /notes/` - Создание заметки
- `POST /notes/analyze-all` - Анализ всех заметок

## 🤝 Contributing

1. Fork проект
2. Создайте feature branch
3. Commit изменения
4. Push в branch
5. Создайте Pull Request

## 📄 Лицензия

MIT License

## 🆘 Поддержка

Если у вас возникли проблемы:

1. Проверьте логи: `docker-compose logs`
2. Убедитесь, что все порты свободны
3. Проверьте `.env` файл
4. Создайте issue в репозитории

---

**Сделано с ❤️ для эффективной работы с заметками**
