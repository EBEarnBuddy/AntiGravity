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
const clientUrls = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : [];
const allowedOrigins = [
    ...clientUrls,
    'http://localhost:3000',
    'http://localhost:3001', // Local dev fallback
    'https://www.earnbuddy.io', // Original domain
    'https://earnbuddy-frontend.vercel.app', // Production domain reported in logs
    'https://earnbuddy.onrender.com'

].filter(Boolean); // Remove empty strings if any
console.log('ℹ️  [CORS] Allowed Origins:', allowedOrigins);

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
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(morgan('dev'));

import userRoutes from './routes/userRoutes.js';
import opportunityRoutes from './routes/opportunityRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import collabRoutes from './routes/collabRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import collaborationRoutes from './routes/collaborationRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

// Routes Configuration
const apiRoutes = [
    { path: '/users', router: userRoutes },
    { path: '/opportunities', router: opportunityRoutes },
    { path: '/applications', router: applicationRoutes },
    { path: '/rooms', router: roomRoutes },
    { path: '/circles', router: roomRoutes }, // Alias for REST stabilization
    { path: '/notifications', router: notificationRoutes },
    { path: '/collaborations', router: collaborationRoutes },
    { path: '/collab', router: collabRoutes },
    { path: '/events', router: eventRoutes },
    { path: '/upload', router: uploadRoutes }
];

// Mount all routes at both /api/v1/ and root level /
// This ensures compatibility whether NEXT_PUBLIC_API_URL includes /api/v1 or not
apiRoutes.forEach(route => {
    app.use(`/api/v1${route.path}`, route.router);
    app.use(route.path, route.router);
});

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
    const origin = req.get('origin');
    if (origin && allowedOrigins.includes(origin)) {
        console.log(`✅ [Frontend Connection] Access from known origin: ${origin}`);
    } else if (origin) {
        console.warn(`⚠️ [Unknown Connection] Access from unknown origin: ${origin}`);
    }

    res.status(200).send('OK');
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

export default app;
