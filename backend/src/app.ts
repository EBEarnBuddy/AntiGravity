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
const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'http://localhost:3001', // Local dev fallback
    'https://earnbuddy.vercel.app', // Example production domain
    'https://earnbuddy.onrender.com'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some(o => origin.startsWith(o))) {
            callback(null, true);
        } else {
            console.warn(`Blocked by CORS: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(morgan('dev'));

import userRoutes from './routes/userRoutes';
import opportunityRoutes from './routes/opportunityRoutes';
import applicationRoutes from './routes/applicationRoutes';
import roomRoutes from './routes/roomRoutes';
import collabRoutes from './routes/collabRoutes';
import eventRoutes from './routes/eventRoutes';
import notificationRoutes from './routes/notificationRoutes';

// Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/opportunities', opportunityRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/rooms', roomRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/collab', collabRoutes);
app.use('/api/v1/events', eventRoutes);

// Basic Health Check
app.get('/', (req: Request, res: Response) => {
    // console.log('Health check hit'); // Too noisy for basic check
    res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        service: 'earnbuddy-backend'
    });
});
app.get('/health', (req: Request, res: Response) => {
    res.status(200).send('OK');
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

export default app;
