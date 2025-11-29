FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    libmagic1 \
    build-essential \
    cmake \
    git \
    && rm -rf /var/lib/apt/lists/*

# Установка LightGBM через pip
RUN pip install lightgbm==4.6.0

WORKDIR /app

COPY backend/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .