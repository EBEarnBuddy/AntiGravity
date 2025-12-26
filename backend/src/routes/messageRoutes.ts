import { Router } from 'express';
import { sendMessage, getMessages, markRoomAsRead, startTyping, stopTyping } from '../controllers/messageController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = Router({ mergeParams: true }); // Enable access to :roomId from parent router

// Get messages (could be public or protected, making protected for consistency)
router.use(verifyToken);
router.get('/', getMessages);
router.post('/', sendMessage);
router.post('/read', markRoomAsRead);
router.post('/typing/start', startTyping);
router.post('/typing/stop', stopTyping);

export default router;
