import express from 'express';
import { verifyToken } from '../middlewares/auth';
import {
    sendCollaborationRequest,
    getPendingCollaborationRequests,
    acceptCollaborationRequest,
    rejectCollaborationRequest
} from '../controllers/collaborationController';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Send collaboration request
router.post('/request', sendCollaborationRequest);

// Get pending collaboration requests for current user
router.get('/pending', getPendingCollaborationRequests);

// Accept collaboration request
router.post('/:requestId/accept', acceptCollaborationRequest);

// Reject collaboration request
router.post('/:requestId/reject', rejectCollaborationRequest);

export default router;
