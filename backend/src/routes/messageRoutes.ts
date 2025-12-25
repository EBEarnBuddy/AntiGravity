import { Router } from 'express';
import { sendMessage, getMessages, markRoomAsRead } from '../controllers/messageController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = Router({ mergeParams: true }); // Enable access to :roomId from parent router

// Get messages (could be public or protected, making protected for consistency)
router.use(verifyToken);
router.get('/', getMessages);
router.post('/', sendMessage);
router.post('/read', markRoomAsRead);

export default router;
