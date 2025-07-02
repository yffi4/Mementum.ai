# 🚀 Production Setup Guide для Mementum.ai

## 📋 Требования для продакшена

- **Сервер**: VPS/Dedicated server с Docker и Docker Compose
- **Домен**: Зарегистрированный домен с SSL сертификатом
- **Минимальные ресурсы**: 2GB RAM, 20GB SSD, 1 CPU core
- **Порты**: 80 (HTTP), 443 (HTTPS)

## 🔧 Пошаговая настройка

### 1. Подготовка сервера

```bash
# Обновите систему
sudo apt update && sudo apt upgrade -y

# Установите Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Установите Docker Compose
sudo apt install docker-compose-plugin

# Перезайдите в систему для применения прав Docker
```

### 2. Клонирование и настройка проекта

```bash
# Клонируйте репозиторий
git clone <your-repo-url>
cd mementum-ai

# Скопируйте production конфигурацию
cp production.env.example .env

# ВАЖНО: Отредактируйте .env файл!
nano .env
```

### 3. Настройка переменных окружения

Отредактируйте `.env` файл:

```bash
# ⚠️ ОБЯЗАТЕЛЬНО ЗАМЕНИТЕ:
DOMAIN=yourdomain.com                    # Ваш домен
SECRET_KEY=YOUR_GENERATED_SECRET_KEY     # Сгенерируйте: openssl rand -base64 32
POSTGRES_PASSWORD=YOUR_STRONG_PASSWORD   # Сильный пароль для БД

# URLs
API_BASE_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
VITE_API_URL=https://api.yourdomain.com

# API Keys
OPENAI_API_KEY=sk-your-real-openai-key
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://api.yourdomain.com/auth/google/callback
```

### 4. Генерация сильных паролей

```bash
# Генерируйте SECRET_KEY
openssl rand -base64 32

# Генерируйте пароль для БД
openssl rand -base64 24

# Генерируйте пароль для Grafana
openssl rand -base64 16
```

### 5. Настройка Google OAuth

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. В OAuth consent screen добавьте ваш production домен
3. В Credentials → OAuth 2.0 Client IDs добавьте:
   - **Authorized origins**: `https://yourdomain.com`
   - **Authorized redirect URIs**: `https://api.yourdomain.com/auth/google/callback`

### 6. Настройка DNS записей

Добавьте A записи в DNS:

```
yourdomain.com     → YOUR_SERVER_IP
api.yourdomain.com → YOUR_SERVER_IP
```

### 7. SSL сертификаты

#### Вариант A: Let's Encrypt (рекомендуется)

```bash
# Установите certbot
sudo apt install snapd
sudo snap install --classic certbot

# Получите сертификаты
sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com

# Сертификаты будут в:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

#### Вариант B: Собственные сертификаты

Поместите сертификаты в `./ssl/`:

```
ssl/
├── yourdomain.com.crt
└── yourdomain.com.key
```

### 8. Обновите Nginx конфигурацию

Создайте `nginx/nginx.prod.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Frontend (yourdomain.com)
    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        ssl_certificate /etc/ssl/certs/yourdomain.com.crt;
        ssl_certificate_key /etc/ssl/private/yourdomain.com.key;

        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /static/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API (api.yourdomain.com)
    server {
        listen 80;
        server_name api.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name api.yourdomain.com;

        ssl_certificate /etc/ssl/certs/yourdomain.com.crt;
        ssl_certificate_key /etc/ssl/private/yourdomain.com.key;

        location / {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend:8000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### 9. Создание production Docker Compose

Создайте `docker-compose.prod.yml`:

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:15
    container_name: mementum_postgres_prod
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backup:/backup
    networks:
      - mementum_network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: mementum_redis_prod
    volumes:
      - redis_data:/data
    networks:
      - mementum_network
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD:-}

  backend:
    build: ./backend
    container_name: mementum_backend_prod
    env_file: .env
    volumes:
      - backend_uploads:/app/uploads
      - ./logs:/app/logs
    depends_on:
      - postgres
      - redis
    networks:
      - mementum_network
    restart: unless-stopped
    command: >
      sh -c "
        alembic upgrade head &&
        uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2
      "

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: production
    container_name: mementum_frontend_prod
    networks:
      - mementum_network
    restart: unless-stopped

  celery_worker:
    build: ./backend
    container_name: mementum_celery_prod
    env_file: .env
    command: celery -A celery_app worker --loglevel=info --concurrency=2
    volumes:
      - backend_uploads:/app/uploads
      - ./logs:/app/logs
    depends_on:
      - postgres
      - redis
    networks:
      - mementum_network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: mementum_nginx_prod
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.prod.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt/live/yourdomain.com:/etc/ssl/certs:ro
      - /etc/letsencrypt/live/yourdomain.com:/etc/ssl/private:ro
    depends_on:
      - frontend
      - backend
    networks:
      - mementum_network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  backend_uploads:

networks:
  mementum_network:
    driver: bridge
```

### 10. Запуск в продакшене

```bash
# Сборка и запуск
docker-compose -f docker-compose.prod.yml up -d --build

# Проверка статуса
docker-compose -f docker-compose.prod.yml ps

# Просмотр логов
docker-compose -f docker-compose.prod.yml logs -f
```

### 11. Настройка мониторинга

```bash
# Запуск с мониторингом
docker-compose -f docker-compose.prod.yml --profile monitoring up -d

# Доступ к мониторингу
# Grafana: https://yourdomain.com:3001
# Prometheus: https://yourdomain.com:9090
```

### 12. Настройка автоматических резервных копий

Создайте `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backup"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} > $BACKUP_DIR/db_backup_$DATE.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz ./backend/uploads

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

Добавьте в cron:

```bash
# Backup every day at 2 AM
0 2 * * * /path/to/backup.sh
```

## 🔒 Настройки безопасности

### Firewall настройки

```bash
# Разрешить только необходимые порты
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw enable
```

### Fail2ban для защиты от брутфорса

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 📊 Мониторинг и обслуживание

### Проверка здоровья системы

```bash
# Статус контейнеров
docker-compose -f docker-compose.prod.yml ps

# Использование ресурсов
docker stats

# Логи ошибок
docker-compose -f docker-compose.prod.yml logs --tail=100 backend

# Мониторинг базы данных
docker-compose -f docker-compose.prod.yml exec postgres psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c "SELECT * FROM pg_stat_activity;"
```

### Обновление приложения

```bash
# Получить обновления
git pull origin main

# Пересобрать и перезапустить
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# Применить миграции БД
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

## 🚨 Troubleshooting

### Частые проблемы

1. **Ошибка SSL**: Проверьте пути к сертификатам в nginx.conf
2. **Ошибка подключения к БД**: Проверьте пароли в .env
3. **Ошибка CORS**: Убедитесь что FRONTEND_URLS настроен правильно
4. **Google OAuth не работает**: Проверьте redirect URI в Google Console

### Полезные команды

```bash
# Перезапуск отдельного сервиса
docker-compose -f docker-compose.prod.yml restart backend

# Вход в контейнер для отладки
docker-compose -f docker-compose.prod.yml exec backend bash

# Очистка логов Docker
docker system prune -f

# Проверка сертификата SSL
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

## ✅ Финальная проверка

После развертывания проверьте:

- [ ] Сайт открывается по HTTPS без ошибок
- [ ] API документация доступна: `https://api.yourdomain.com/docs`
- [ ] Google OAuth работает корректно
- [ ] Создание заметок работает
- [ ] AI анализ заметок работает
- [ ] Celery tasks выполняются (проверьте логи)
- [ ] SSL сертификат валиден
- [ ] Мониторинг показывает здоровые метрики

---

## 🎉 Готово!

Ваш Mementum.ai теперь работает в продакшене! Не забудьте настроить регулярные backup'ы и мониторинг.
