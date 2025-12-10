import { Router } from 'express';
import { createOpportunity, getOpportunities, getOpportunityById } from '../controllers/opportunityController';
import { verifyToken } from '../middlewares/auth';

const router = Router();

// Public routes
router.get('/', getOpportunities);
router.get('/:id', getOpportunityById);

// Protected routes
router.post('/', verifyToken, createOpportunity);

export default router;
