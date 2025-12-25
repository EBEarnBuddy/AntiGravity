import { Router } from 'express';
import { getMyNotifications, markAsRead } from '../controllers/notificationController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = Router();

router.use(verifyToken);
router.get('/', getMyNotifications);
router.put('/:id/read', markAsRead);

export default router;
