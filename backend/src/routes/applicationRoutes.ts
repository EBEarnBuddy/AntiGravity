import { Router } from 'express';
import { applyToOpportunity, getMyApplications } from '../controllers/applicationController';
import { verifyToken } from '../middlewares/auth';

const router = Router();

router.use(verifyToken);

router.post('/', applyToOpportunity);
router.get('/me', getMyApplications);

export default router;
