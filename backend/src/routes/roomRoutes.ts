import { Router } from 'express';
import { createRoom, getRooms, joinRoom, getMyRooms } from '../controllers/roomController';
import { verifyToken } from '../middlewares/auth';

import messageRoutes from './messageRoutes';

const router = Router();

// Public
// Protected
router.use(verifyToken);
router.get('/', getRooms); // Now protected to allow membership check
// Nested message routes
// Nested message routes
router.use('/:roomId/messages', messageRoutes);

router.post('/', createRoom);
router.post('/:roomId/join', joinRoom);
router.get('/me', getMyRooms);

export default router;
