# Stage 1 - build frontend
FROM node:18-alpine as frontend-builder

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы
COPY . .

# Сборка приложения
RUN npm run build

# Stage 2 - Nginx для продакшн-сервера (можно заменить)
FROM nginx:alpine

# Копируем сборку из предыдущего этапа
COPY --from=frontend-builder /app/build /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
