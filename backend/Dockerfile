# backend/Dockerfile
FROM python:3.10-slim

# Устанавливаем системные зависимости (для Postgres, Pillow и т.п.)
RUN apt-get update && \
    apt-get install -y gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1) Копируем и устанавливаем Python-зависимости
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 2) Копируем код бэкенда
COPY backend/ .

# 3) Открываем порт
EXPOSE 8000

# 4) Запускаем Uvicorn в exec-форме с HTTPS
CMD ["uvicorn","main:app","--host","0.0.0.0","--port","8000","--ssl-keyfile","/certs/privkey.pem","--ssl-certfile","/certs/fullchain.pem"]
