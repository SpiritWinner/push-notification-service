import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import routes from './routes/index';
import swaggerOptions from './config/swagger';

const app = express();

// Swagger документация
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Простой и рабочий вариант
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Добавьте также endpoint для raw JSON спецификации
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Добавьте root endpoint для проверки
app.get('/', (req, res) => {
  res.json({
    message: 'Push Notification Server API',
    version: '1.1.0',
    docs: '/api-docs',
    health: '/health',
    timestamp: new Date().toISOString()
  });
});

// Health check для Render.com
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Middleware
app.use(cors());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/', routes);

export default app;