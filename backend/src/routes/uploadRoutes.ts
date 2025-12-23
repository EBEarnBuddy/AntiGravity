import express from 'express';
import { getUploadSignature } from '../controllers/uploadController';
import { verifyToken } from '../middlewares/auth';

const router = express.Router();

// Get signature for secure upload
// Protected route to prevent unauthorized users from uploading to our cloud
router.post('/signature', verifyToken, getUploadSignature);

export default router;
