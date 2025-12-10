import { Router } from 'express';
import { syncUser, getMe, updateMe } from '../controllers/userController';
import { verifyToken } from '../middlewares/auth';

const router = Router();

// all routes here protected
router.use(verifyToken);

router.post('/sync', syncUser); // Call this after Firebase login
router.get('/me', getMe);
router.put('/me', updateMe);

export default router;
