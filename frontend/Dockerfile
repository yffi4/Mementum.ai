# === Стадия 1: билд React-приложения ===
FROM node:22 AS build

WORKDIR /app

ENV NODE_OPTIONS=--max_old_space_size=2048

RUN npm cache clean --force
# Устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем исходники и билдим
COPY . .
RUN npm run build

# === Стадия 2: Nginx для прод-сервера ===
FROM nginx:alpine

# Копируем собранное приложение из стадии build
COPY --from=build /app/dist /usr/share/nginx/html

# Создаем конфигурацию nginx для SPA
RUN echo 'server {' > /etc/nginx/conf.d/default.conf && \
    echo '    listen 80;' >> /etc/nginx/conf.d/default.conf && \
    echo '    server_name localhost;' >> /etc/nginx/conf.d/default.conf && \
    echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    index index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    location / {' >> /etc/nginx/conf.d/default.conf && \
    echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '}' >> /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]