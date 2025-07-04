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

CMD ["nginx", "-g", "daemon off;"]