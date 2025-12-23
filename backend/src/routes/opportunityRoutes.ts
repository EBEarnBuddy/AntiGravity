import { Router } from 'express';
import { createOpportunity, getOpportunities, getOpportunityById, deleteOpportunity, updateOpportunityStatus } from '../controllers/opportunityController';
import { verifyToken } from '../middlewares/auth';

const router = Router();

// Public routes
router.get('/', getOpportunities);
router.get('/:id', getOpportunityById);

// Protected routes
router.post('/', verifyToken, createOpportunity);
router.delete('/:id', verifyToken, deleteOpportunity);
router.patch('/:id/status', verifyToken, updateOpportunityStatus);

export default router;
