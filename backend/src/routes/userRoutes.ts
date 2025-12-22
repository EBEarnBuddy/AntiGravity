import { Router } from 'express';
import { syncUser, getMe, updateMe, toggleBookmark } from '../controllers/userController';
import { verifyToken } from '../middlewares/auth';

const router = Router();

// all routes here protected
router.use(verifyToken);

router.post('/sync', syncUser); // Call this after Firebase login
router.get('/me', getMe);
router.put('/me', updateMe);
router.post('/bookmarks/toggle', toggleBookmark);

export default router;
