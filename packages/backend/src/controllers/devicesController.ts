import { Response } from 'express';
import { RequestWithUser } from '../types';
import * as devicesService from '../services/devicesService';
import * as expoService from '../services/expoService';
import * as notificationsService from '../services/notificationsService';

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Регистрация устройства
 *     description: Регистрирует новое устройство или обновляет существующее
 *     tags: [Devices]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - expoPushToken
 *             properties:
 *               expoPushToken:
 *                 type: string
 *                 description: Expo push токен устройства
 *                 example: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
 *               platform:
 *                 type: string
 *                 description: Платформа устройства (ios/android)
 *                 example: ios
 *               appVersion:
 *                 type: string
 *                 description: Версия приложения
 *                 example: 1.1.0
 *               deviceName:
 *                 type: string
 *                 description: Название устройства
 *                 example: iPhone 12
 *               deviceModel:
 *                 type: string
 *                 description: Модель устройства
 *                 example: iPhone13,2
 *               silentRegistration:
 *                 type: boolean
 *                 description: Тихая регистрация без отправки приветственного уведомления
 *                 example: false
 *     responses:
 *       200:
 *         description: Устройство успешно зарегистрировано
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
 *                   example: Зарегистрировано
 *                 userId:
 *                   type: string
 *                   example: user123
 *                 isUpdate:
 *                   type: boolean
 *                   example: false
 *                 isSameToken:
 *                   type: boolean
 *                   example: false
 *       400:
 *         description: Неверные данные
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         $ref: '#/components/responses/ValidationError'
 */
export const register = async (req: RequestWithUser, res: Response) => {
  const {
    expoPushToken,
    platform = 'unknown',
    appVersion = '1.1.0',
    deviceName = 'Unknown Device',
    deviceModel = 'Unknown Model',
    silentRegistration = false
  } = req.body;
  const userId = req.userId;

  if (!expoPushToken) return res.status(400).json({ success: false, error: 'expoPushToken обязателен' });
  if (!expoService.isValidExpoToken(expoPushToken)) return res.status(400).json({ success: false, error: 'Некорректный Expo токен' });

  try {
    const existingDevice = await devicesService.findDeviceByUser(userId) ||
                           await devicesService.findDeviceByToken(expoPushToken);

    const isUpdate = !!existingDevice;
    const isSameToken = existingDevice && existingDevice.expo_push_token === expoPushToken && existingDevice.user_id === userId;

    await devicesService.upsertDevice(userId, { expoPushToken, platform, appVersion, deviceName, deviceModel });

    if (!silentRegistration && !isSameToken) {
      setTimeout(async () => {
        try {
          const { tickets } = await expoService.sendPushMessages([{
            to: expoPushToken,
            title: 'Устройство зарегистрировано',
            body: 'Теперь вы будете получать уведомления',
            data: { type: 'welcome' }
          }]);

          const firstTicket = tickets[0];
          let ticketId: string | null = null;
          
          if (firstTicket && 'status' in firstTicket && firstTicket.status === 'ok' && 'id' in firstTicket) {
            ticketId = firstTicket.id;
          }

          await notificationsService.logNotification({
            type: 'welcome',
            title: 'Устройство зарегистрировано',
            body: 'Теперь вы будете получать уведомления',
            data: { type: 'welcome' },
            status: 'sent',
            ticketId,
            userId
          });
        } catch (e: any) {
          await notificationsService.logNotification({
            type: 'welcome',
            title: 'Устройство зарегистрировано',
            body: 'Теперь вы будете получать уведомления',
            status: 'error',
            error: e.message,
            userId
          });
        }
      }, 1000);
    }

    res.json({
      success: true,
      message: isUpdate ? 'Обновлено' : 'Зарегистрировано',
      userId,
      isUpdate,
      isSameToken
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Ошибка регистрации устройства' });
  }
};

/**
 * @swagger
 * /api/verify-token:
 *   post:
 *     summary: Проверка токена устройства
 *     description: Проверяет валидность токена устройства и его активность
 *     tags: [Devices]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - expoPushToken
 *             properties:
 *               expoPushToken:
 *                 type: string
 *                 description: Expo push токен для проверки
 *                 example: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
 *     responses:
 *       200:
 *         description: Результат проверки токена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 token_matches:
 *                   type: boolean
 *                   example: true
 *                 is_active:
 *                   type: boolean
 *                   example: true
 *                 last_active:
 *                   type: string
 *                   format: date-time
 *                 token_updated_at:
 *                   type: string
 *                   format: date-time
 *                 expo_valid:
 *                   type: boolean
 *                   example: true
 *                 recent_errors:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: Токен действителен
 *       400:
 *         description: Не указан токен
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Внутренняя ошибка сервера
 */
export const verifyToken = async (req: RequestWithUser, res: Response) => {
  const { expoPushToken } = req.body;
  const userId = req.userId;
  
  if (!expoPushToken) {
    return res.status(400).json({ success: false, error: 'expoPushToken обязателен' });
  }

  try {
    const device = await devicesService.findDeviceByUser(userId);
    
    if (!device) {
      return res.json({ valid: false, reason: 'device_not_registered', message: 'Устройство не зарегистрировано' });
    }

    if (!device.expo_push_token) {
      return res.json({ valid: false, reason: 'no_token_in_db', message: 'Токен отсутствует в базе' });
    }

    if (device.expo_push_token !== expoPushToken) {
      return res.json({ valid: false, reason: 'token_changed', message: 'Токен был обновлён', currentToken: device.expo_push_token });
    }

    const errorCount = await notificationsService.getRecentErrorsCount(userId);
    if (errorCount > 3) {
      return res.json({ valid: false, reason: 'too_many_errors', message: 'Обнаружено много ошибок доставки', recentErrors: errorCount });
    }

    const lastActive = new Date(device.last_active);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (lastActive < thirtyDaysAgo) {
      return res.json({ valid: false, reason: 'device_inactive', message: 'Устройство неактивно более 30 дней', lastActive: device.last_active });
    }

    const isValidExpo = expoService.isValidExpoToken(expoPushToken);

    res.json({
      valid: true,
      token_matches: device.expo_push_token === expoPushToken,
      is_active: device.last_active > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      last_active: device.last_active,
      token_updated_at: device.token_updated_at,
      expo_valid: isValidExpo,
      recent_errors: errorCount,
      message: 'Токен действителен'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Ошибка проверки токена' });
  }
};

/**
 * @swagger
 * /api/token-info:
 *   get:
 *     summary: Получить информацию о токене устройства
 *     description: Возвращает подробную информацию о токене и устройстве текущего пользователя
 *     tags: [Devices]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Информация о токене получена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token_info:
 *                   type: object
 *                   properties:
 *                     has_token:
 *                       type: boolean
 *                       description: Есть ли токен у устройства
 *                       example: true
 *                     token_preview:
 *                       type: string
 *                       nullable: true
 *                       description: Маскированный токен (первые 20 символов)
 *                       example: ExponentPushToken[xxxxx...
 *                     platform:
 *                       type: string
 *                       nullable: true
 *                       description: Платформа устройства
 *                       example: ios
 *                     app_version:
 *                       type: string
 *                       nullable: true
 *                       description: Версия приложения
 *                       example: 1.1.0
 *                     device_name:
 *                       type: string
 *                       nullable: true
 *                       description: Название устройства
 *                       example: iPhone 12
 *                     device_model:
 *                       type: string
 *                       nullable: true
 *                       description: Модель устройства
 *                       example: iPhone13,2
 *                     registered_at:
 *                       type: string
 *                       format: date-time
 *                       description: Дата регистрации устройства
 *                       example: 2024-01-15T10:30:00Z
 *                     last_active:
 *                       type: string
 *                       format: date-time
 *                       description: Дата последней активности
 *                       example: 2024-01-15T10:30:00Z
 *                     token_updated_at:
 *                       type: string
 *                       format: date-time
 *                       description: Дата обновления токена
 *                       example: 2024-01-15T10:30:00Z
 *                     days_since_registration:
 *                       type: integer
 *                       description: Дней с момента регистрации
 *                       example: 5
 *                     hours_since_active:
 *                       type: integer
 *                       description: Часов с последней активности
 *                       example: 2
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Устройство не найдено
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
 *                   example: Устройство не найдено
 *       500:
 *         description: Внутренняя ошибка сервера
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
 *                   example: Ошибка получения информации
 */
export const getTokenInfo = async (req: RequestWithUser, res: Response) => {
  try {
    const device = await devicesService.findDeviceByUser(req.userId);
    if (!device) return res.status(404).json({ success: false, error: 'Устройство не найдено' });

    const maskedToken = device.expo_push_token ? `${device.expo_push_token.substring(0, 20)}...` : null;

    res.json({
      success: true,
      token_info: {
        has_token: !!device.expo_push_token,
        token_preview: maskedToken,
        platform: device.platform,
        app_version: device.app_version,
        device_name: device.device_name,
        device_model: device.device_model,
        registered_at: device.registered_at,
        last_active: device.last_active,
        token_updated_at: device.token_updated_at,
        days_since_registration: Math.floor((new Date().getTime() - new Date(device.registered_at).getTime()) / (1000 * 60 * 60 * 24)),
        hours_since_active: Math.floor((new Date().getTime() - new Date(device.last_active).getTime()) / (1000 * 60 * 60))
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Ошибка получения информации' });
  }
};

/**
 * @swagger
 * /api/unregister:
 *   delete:
 *     summary: Удалить устройство
 *     description: Удаляет текущее устройство и его историю уведомлений
 *     tags: [Devices]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Устройство успешно удалено
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
 *                   example: Устройство и история уведомлений удалены
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Внутренняя ошибка сервера
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
 *                   example: Ошибка удаления устройства
 */
export const unregister = async (req: RequestWithUser, res: Response) => {
  try {
    await devicesService.deleteDevice(req.userId);
    res.json({ success: true, message: 'Устройство и история уведомлений удалены' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Ошибка удаления устройства' });
  }
};

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить список всех пользователей
 *     description: Возвращает список всех зарегистрированных пользователей (публичный endpoint)
 *     tags: [Devices]
 *     responses:
 *       200:
 *         description: Список пользователей получен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: string
 *                         example: user123
 *                       platform:
 *                         type: string
 *                         nullable: true
 *                         example: ios
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 */
export const getUsers = async (req: RequestWithUser, res: Response) => {
  try {
    const users = await devicesService.getAllUsers();
    res.json({ success: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

/**
 * @swagger
 * /api/me:
 *   get:
 *     summary: Получить информацию о текущем пользователе
 *     description: Возвращает информацию о текущем пользователе и его устройстве
 *     tags: [Devices]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Информация о пользователе получена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 userId:
 *                   type: string
 *                   description: ID пользователя из токена
 *                   example: user123
 *                 device:
 *                   nullable: true
 *                   oneOf:
 *                     - $ref: '#/components/schemas/Device'
 *                     - type: null
 *                   description: Информация об устройстве или null если устройство не зарегистрировано
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 */
export const me = async (req: RequestWithUser, res: Response) => {
  try {
    const device = await devicesService.findDeviceByUser(req.userId);
    res.json({ success: true, userId: req.userId, device: device || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};