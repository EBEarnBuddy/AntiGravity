import { Router } from 'express';
import {
    applyToOpportunity,
    getMyApplications,
    getApplicationsForOpportunity,
    updateApplicationStatus,
} from '../controllers/applicationController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = Router();

router.use(verifyToken);

// Candidate-facing
router.post('/', applyToOpportunity);
router.get('/me', getMyApplications);

// Opportunity owner–facing
router.get('/opportunity/:opportunityId', getApplicationsForOpportunity);
router.patch('/:applicationId/status', updateApplicationStatus);

export default router;
