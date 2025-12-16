import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

import userRoutes from './routes/userRoutes';
import opportunityRoutes from './routes/opportunityRoutes';
import applicationRoutes from './routes/applicationRoutes';
import roomRoutes from './routes/roomRoutes';
import collabRoutes from './routes/collabRoutes';
import eventRoutes from './routes/eventRoutes';

// Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/opportunities', opportunityRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/rooms', roomRoutes);
app.use('/api/v1/collab', collabRoutes);
app.use('/api/v1/events', eventRoutes);

// Basic Health Check
app.get('/', (req: Request, res: Response) => {
    console.log('Health check hit');
    res.send('EarnBuddy Backend is running 🚀');
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

export default app;
