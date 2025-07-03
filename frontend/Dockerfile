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

# Копируем дефолтную конфигурацию nginx (если хочешь настроить — дальше)
# Если не указывать свой, nginx сам отработает с index.html
# Но можно подправить немного (см. ниже)
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 5173

CMD ["npm", "run", "dev"]