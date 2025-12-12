import { Options } from 'swagger-jsdoc';
import path from 'path';

const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Push Notification Server API',
      version: '1.1.0',
      description: 'API для отправки push-уведомлений через Expo',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://pushserver-kite.onrender.com',
        description: 'Production server'
      }
    ],
    tags: [
      {
        name: 'Devices',
        description: 'Управление устройствами'
      },
      {
        name: 'Notifications',
        description: 'Отправка уведомлений'
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          description: 'Use your user_id as token: Bearer {user_id}'
        }
      },
      schemas: {
        Device: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            user_id: {
              type: 'string',
              example: 'user123'
            },
            expo_push_token: {
              type: 'string',
              example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]'
            },
            platform: {
              type: 'string',
              example: 'ios'
            },
            app_version: {
              type: 'string',
              example: '1.1.0'
            },
            device_name: {
              type: 'string',
              example: 'iPhone 12'
            },
            device_model: {
              type: 'string',
              example: 'iPhone13,2'
            },
            registered_at: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            },
            last_active: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            user_id: {
              type: 'string',
              example: 'user123'
            },
            title: {
              type: 'string',
              example: 'Новое сообщение'
            },
            body: {
              type: 'string',
              example: 'У вас новое сообщение'
            },
            data: {
              type: 'object',
              additionalProperties: true,
              example: { type: 'message' }
            },
            type: {
              type: 'string',
              example: 'single'
            },
            status: {
              type: 'string',
              example: 'sent'
            },
            sent_at: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: 'Сообщение об ошибке'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Операция выполнена успешно'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Токен не предоставлен или невалиден',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Ресурс не найден',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ValidationError: {
          description: 'Ошибка валидации',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: [
    path.join(__dirname, '../controllers/*.ts'),
    path.join(__dirname, '../routes/*.ts')
  ]
};

export default swaggerOptions;