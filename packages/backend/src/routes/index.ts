import express from 'express';
import verifyToken from '../middleware/verifyToken';
import * as devicesController from '../controllers/devicesController';
import * as notificationsController from '../controllers/notificationsController';

const router = express.Router();

// Devices
router.post('/api/register', verifyToken, devicesController.register as any);
router.post('/api/verify-token', verifyToken, devicesController.verifyToken as any);
router.get('/api/token-info', verifyToken, devicesController.getTokenInfo as any);
router.delete('/api/unregister', verifyToken, devicesController.unregister as any);
router.get('/api/me', verifyToken, devicesController.me as any);
router.get('/api/users', devicesController.getUsers as any);

// Notifications
router.post('/api/send', verifyToken, notificationsController.sendToSelf as any);
router.post('/api/test-token', verifyToken, notificationsController.testToken as any);
router.post('/api/broadcast', verifyToken, notificationsController.broadcast as any);
router.get('/api/history', verifyToken, notificationsController.history as any);

export default router;