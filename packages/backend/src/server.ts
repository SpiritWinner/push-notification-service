import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import logger from './utils/logger';

const port = process.env.PORT || 3000;

app.listen(port, () => {
  logger.info(`🚀 Сервер запущен на ${port}`);
}).on('error', (err) => {
  logger.error('Ошибка запуска сервера', err);
  process.exit(1);
});