import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.js';
import { createCollabRequest, acceptCollabRequest, getMyRequests } from '../controllers/collabController.js';

const router = Router();

router.use(verifyToken);

router.post('/', createCollabRequest);
router.post('/:requestId/accept', acceptCollabRequest);
router.get('/pending', getMyRequests);

export default router;
