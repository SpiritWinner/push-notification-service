FROM node:20-slim

RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    curl \
    wget \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Копируем пакеты
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --legacy-peer-deps --no-optional

# Копируем prisma схему
COPY prisma ./prisma/

# Генерируем prisma client
RUN npx prisma generate

# Копируем весь проект
COPY . .

# Сборка
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
