import { Router } from 'express';
import { createRoom, getRooms, joinRoom, getMyRooms } from '../controllers/roomController';
import { verifyToken } from '../middlewares/auth';

import messageRoutes from './messageRoutes';

const router = Router();

// Public
router.get('/', getRooms);

// Protected
router.use(verifyToken);
// Nested message routes
router.use('/:roomId/messages', messageRoutes);

router.post('/', createRoom);
router.post('/:roomId/join', joinRoom);
router.get('/me', getMyRooms);

export default router;
