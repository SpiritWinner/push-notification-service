import { Response } from 'express';
import { RequestWithUser } from '../types';
import * as devicesService from '../services/devicesService';
import * as expoService from '../services/expoService';
import * as notificationsService from '../services/notificationsService';
import { getTicketId } from '../services/expoService';

/**
 * @swagger
 * /api/send:
 *   post:
 *     summary: Отправить уведомление себе
 *     description: Отправляет push-уведомление на собственное зарегистрированное устройство
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - body
 *             properties:
 *               title:
 *                 type: string
 *                 description: Заголовок уведомления
 *                 example: Новое сообщение
 *                 minLength: 1
 *                 maxLength: 100
 *               body:
 *                 type: string
 *                 description: Текст уведомления
 *                 example: У вас новое сообщение от пользователя
 *                 minLength: 1
 *                 maxLength: 500
 *               data:
 *                 type: object
 *                 description: Дополнительные данные для уведомления (опционально)
 *                 additionalProperties: true
 *                 example: { type: 'message', id: 123, url: 'app://messages/123' }
 *     responses:
 *       200:
 *         description: Уведомление успешно отправлено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Уведомление отправлено
 *                 ticket:
 *                   type: object
 *                   description: Информация о тикете отправки от Expo
 *                   nullable: true
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: ok
 *                     id:
 *                       type: string
 *                       example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
 *                     message:
 *                       type: string
 *                       example: 'success'
 *       400:
 *         description: Не указаны обязательные поля title или body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Устройство не зарегистрировано
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Устройство не зарегистрировано
 *       500:
 *         description: Внутренняя ошибка сервера при отправке уведомления
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Ошибка отправки уведомления
 */
export const sendToSelf = async (req: RequestWithUser, res: Response) => {
  const { title, body, data = {} } = req.body;
  const userId = req.userId;
  
  if (!title || !body) return res.status(400).json({ 
    success: false, 
    error: 'title и body обязательны' 
  });

  try {
    const device = await devicesService.findDeviceByUser(userId);
    if (!device) return res.status(404).json({ 
      success: false, 
      error: 'Устройство не зарегистрировано' 
    });

    await devicesService.setLastActive(userId);

    const { tickets } = await expoService.sendPushMessages([{
      to: device.expo_push_token,
      title,
      body,
      data
    }]);

    const ticketId = getTicketId(tickets?.[0]);

    await notificationsService.logNotification({
      type: 'single',
      userId,
      title,
      body,
      data,
      ticketId,
      status: 'sent'
    });

    res.json({ 
      success: true, 
      message: 'Уведомление отправлено', 
      ticket: tickets?.[0] 
    });
  } catch (err: any) {
    console.error(err);
    await notificationsService.logNotification({
      type: 'single',
      userId,
      title,
      body,
      data,
      status: 'error',
      error: err.message
    });
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Ошибка отправки уведомления' 
    });
  }
};

/**
 * @swagger
 * /api/test-token:
 *   post:
 *     summary: Отправить тестовое уведомление
 *     description: Отправляет тестовое push-уведомление для проверки работоспособности токена устройства
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Тестовое уведомление успешно отправлено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Тестовое уведомление отправлено
 *                 ticket:
 *                   type: object
 *                   description: Информация о тикете отправки от Expo
 *                   nullable: true
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: ok
 *                     id:
 *                       type: string
 *                       example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: Время отправки уведомления
 *                   example: 2024-01-15T10:30:00Z
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Устройство не зарегистрировано
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Устройство не зарегистрировано
 *       500:
 *         description: Внутренняя ошибка сервера при отправке тестового уведомления
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Ошибка отправки тестового уведомления
 */
export const testToken = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  
  try {
    const device = await devicesService.findDeviceByUser(userId);
    if (!device) return res.status(404).json({ 
      success: false, 
      error: 'Устройство не зарегистрировано' 
    });

    const { tickets } = await expoService.sendPushMessages([{
      to: device.expo_push_token,
      title: 'Тест уведомления',
      body: 'Это тестовое уведомление для проверки токена',
      data: { type: 'test', timestamp: new Date().toISOString() }
    }]);

    const ticketId = getTicketId(tickets?.[0]);

    await notificationsService.logNotification({
      type: 'test',
      userId,
      title: 'Тест уведомления',
      body: 'Это тестовое уведомление для проверки токена',
      data: { type: 'test' },
      ticketId,
      status: 'sent'
    });

    res.json({ 
      success: true, 
      message: 'Тестовое уведомление отправлено', 
      ticket: tickets?.[0], 
      timestamp: new Date().toISOString() 
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Ошибка отправки тестового уведомления' 
    });
  }
};

/**
 * @swagger
 * /api/broadcast:
 *   post:
 *     summary: Рассылка уведомлений всем пользователям
 *     description: |
 *       Отправляет push-уведомление всем зарегистрированным устройствам.
 *       
 *       **Требует прав администратора** (userId должен быть 'admin')
 *       
 *       Автоматически фильтрует устройства с невалидными токенами.
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - body
 *             properties:
 *               title:
 *                 type: string
 *                 description: Заголовок уведомления для рассылки
 *                 example: Важное объявление
 *                 minLength: 1
 *                 maxLength: 100
 *               body:
 *                 type: string
 *                 description: Текст уведомления для рассылки
 *                 example: Запланированы технические работы с 00:00 до 06:00
 *                 minLength: 1
 *                 maxLength: 500
 *               data:
 *                 type: object
 *                 description: Дополнительные данные для уведомления (опционально)
 *                 additionalProperties: true
 *                 example: { type: 'announcement', priority: 'high', maintenance: true }
 *     responses:
 *       200:
 *         description: Рассылка успешно выполнена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 stats:
 *                   type: object
 *                   properties:
 *                     successCount:
 *                       type: integer
 *                       description: Количество успешно отправленных уведомлений
 *                       example: 150
 *                     failCount:
 *                       type: integer
 *                       description: Количество неудачных отправок
 *                       example: 5
 *                     tickets:
 *                       type: integer
 *                       description: Общее количество созданных тикетов
 *                       example: 155
 *       400:
 *         description: Не указаны обязательные поля title или body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Недостаточно прав (требуются права администратора)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Нужны права администратора
 *       500:
 *         description: Внутренняя ошибка сервера при выполнении рассылки
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Ошибка рассылки
 */
export const broadcast = async (req: RequestWithUser, res: Response) => {
  const userId = req.userId;
  const { title, body, data = {} } = req.body;
  
  if (userId !== 'admin') return res.status(403).json({ 
    success: false, 
    error: 'Нужны права администратора' 
  });

  if (!title || !body) {
    return res.status(400).json({
      success: false,
      error: 'title и body обязательны для рассылки'
    });
  }

  try {
    // Получаем всех пользователей и их устройства
    const users = await devicesService.getAllUsers();
    
    // Получаем полную информацию об устройствах
    const devicePromises = users.map(async (user) => {
      return await devicesService.findDeviceByUser(user.user_id);
    });

    const deviceRows = await Promise.all(devicePromises);

    const messages = deviceRows
      .filter((d): d is NonNullable<typeof d> => {
        if (!d || !d.expo_push_token) {
          return false;
        }
        const isValid = expoService.isValidExpoToken(d.expo_push_token);
        return isValid;
      })
      .map(d => ({
        to: d.expo_push_token,
        sound: 'default' as const,
        title: title!,
        body: body!,
        data: { ...data, broadcast: true }
      }));

    const { tickets, success, fail } = await expoService.sendPushMessages(messages);

    await notificationsService.logNotification({
      type: 'broadcast',
      title,
      body,
      data,
      status: 'sent',
      ticketId: null,
      userId: 'admin'
    });

    res.json({ 
      success: true, 
      stats: { 
        successCount: success, 
        failCount: fail, 
        tickets: tickets.length 
      } 
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Ошибка рассылки' 
    });
  }
};

/**
 * @swagger
 * /api/history:
 *   get:
 *     summary: Получить историю уведомлений
 *     description: |
 *       Возвращает историю отправленных уведомлений.
 *       
 *       **Требует прав администратора** (userId должен быть 'admin')
 *       
 *       По умолчанию возвращает последние 20 записей.
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Количество записей для возврата (макс. 100)
 *         example: 20
 *     responses:
 *       200:
 *         description: История уведомлений успешно получена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 history:
 *                   type: array
 *                   description: Список уведомлений
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Неверный параметр limit (должен быть от 1 до 100)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Недостаточно прав (требуются права администратора)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Нужны права администратора
 *       500:
 *         description: Внутренняя ошибка сервера при получении истории
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Ошибка получения истории
 */
export const history = async (req: RequestWithUser, res: Response) => {
  if (req.userId !== 'admin') return res.status(403).json({ 
    success: false, 
    error: 'Нужны права администратора' 
  });
  
  try {
    const rows = await notificationsService.getHistory(20);
    res.json({ success: true, history: rows });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      error: err.message || 'Ошибка получения истории' 
    });
  }
};