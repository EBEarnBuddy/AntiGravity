import express from 'express';
import { getEvents, createEvent } from '../controllers/eventController';
import { verifyToken } from '../middlewares/auth';

const router = express.Router();

router.get('/', verifyToken, getEvents);
router.post('/', verifyToken, createEvent);

export default router;
