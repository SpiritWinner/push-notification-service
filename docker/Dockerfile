# Этап сборки
FROM node:20-alpine AS builder

# Установка pnpm
RUN npm install -g pnpm

# Установка зависимостей
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/frontend/package.json ./packages/frontend/

RUN pnpm install

# Копируем исходный код
COPY . .

# Сборка бэкенда
WORKDIR /app/packages/backend
RUN pnpm run build

# Генерация Prisma клиента
RUN npx prisma generate

# Сборка фронтенда
WORKDIR /app/packages/frontend
RUN pnpm run build

# Этап продакшн
FROM node:20-alpine AS production

# Установка pnpm
RUN npm install -g pnpm

WORKDIR /app

# Копируем зависимости
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages/backend/package.json ./packages/backend/
COPY --from=builder /app/packages/backend/node_modules ./packages/backend/node_modules/

# Копируем собранные приложения
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist/
COPY --from=builder /app/packages/backend/prisma ./packages/backend/prisma/
COPY --from=builder /app/packages/frontend/dist ./packages/frontend/dist/

# Порты
EXPOSE 3000 5173

# Запуск приложения
CMD ["sh", "-c", "cd /app/packages/backend && node dist/index.js & cd /app && npx serve -p 5173 packages/frontend/dist"]