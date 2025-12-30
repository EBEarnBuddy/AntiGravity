import { Router } from 'express';
import { createOpportunity, getOpportunities, getOpportunityById, deleteOpportunity, updateOpportunityStatus, updateOpportunity } from '../controllers/opportunityController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = Router();

// Public routes
router.get('/', getOpportunities);
router.get('/:id', getOpportunityById);

// Protected routes
router.post('/', verifyToken, createOpportunity);
router.delete('/:id', verifyToken, deleteOpportunity);
router.patch('/:id/status', verifyToken, updateOpportunityStatus);
router.put('/:id', verifyToken, updateOpportunity); // Full update

export default router;
