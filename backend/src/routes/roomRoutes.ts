import { Router } from 'express';
import { createRoom, getRooms, joinRoom, getMyRooms, getPendingRequests, updateMembershipStatus, updateRoom, deleteRoom, leaveRoom } from '../controllers/roomController.js';
import { verifyToken } from '../middlewares/auth.js';

import messageRoutes from './messageRoutes.js';

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
router.get('/:roomId/pending', getPendingRequests);
router.post('/:roomId/approve/:userId', updateMembershipStatus);
router.put('/:roomId', updateRoom);
router.delete('/:roomId', deleteRoom);
router.post('/:roomId/leave', leaveRoom);

export default router;
