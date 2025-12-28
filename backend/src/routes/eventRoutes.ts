import express from 'express';
import { getEvents, createEvent } from '../controllers/eventController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', verifyToken, getEvents);
router.post('/', verifyToken, createEvent);

export default router;
