import { Router } from 'express';
import { sendMessage, getMessages } from '../controllers/messageController';
import { verifyToken } from '../middlewares/auth';

const router = Router({ mergeParams: true }); // Enable access to :roomId from parent router

// Get messages (could be public or protected, making protected for consistency)
router.use(verifyToken);
router.get('/', getMessages);
router.post('/', sendMessage);

export default router;
