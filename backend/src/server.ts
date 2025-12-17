import mongoose from 'mongoose';
import app from './app';
import http from 'http';
import { initSocket, setIO } from './socket';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || '';

const startServer = async () => {
    try {
        if (!MONGO_URI) {
            console.warn('⚠️  MONGO_URI is not defined. Database will not connect.');
        } else {
            await mongoose.connect(MONGO_URI);
            console.log('✅ [Database] MongoDB connected successfully');
        }

        // Create HTTP server from Express app
        const server = http.createServer(app);

        // Initialize Socket.io
        const io = initSocket(server);
        setIO(io);

        server.listen(PORT, () => {
            console.log(`✅ [Server] Running on http://localhost:${PORT}`);
            checkEnvironment();
        });
    } catch (error) {
        console.error('❌ Server startup failed:', error);
        process.exit(1);
    }
};

const checkEnvironment = () => {
    console.log('\n🔍 [Diagnostics] Checking Environment Configuration...');

    const requiredVars = [
        'PORT',
        'MONGO_URI',
        'CLIENT_URL',
        'FIREBASE_PROJECT_ID',
        'FIREBASE_CLIENT_EMAIL',
        'FIREBASE_PRIVATE_KEY'
    ];

    let allPresent = true;

    requiredVars.forEach(varName => {
        const value = process.env[varName];
        if (value) {
            let displayValue = 'Set';
            if (varName === 'PORT') displayValue = value;
            if (varName === 'CLIENT_URL') displayValue = value; // Show allowed origins
            // Truncate secrets
            if (varName.includes('KEY')) displayValue = 'Set (Confidential)';

            console.log(`✅ [Env] ${varName}: ${displayValue}`);
        } else {
            console.error(`❌ [Env] ${varName}: MISSING`);
            allPresent = false;
        }
    });

    if (process.env.CLIENT_URL) {
        const origins = process.env.CLIENT_URL.split(',');
        console.log(`ℹ️  [Frontend Connection] Backend configured to accept: ${origins.join(', ')}`);
    } else {
        console.warn('⚠️  [Frontend Connection] CLIENT_URL missing. CORS may block frontend.');
    }

    if (allPresent) {
        console.log('✅ [Diagnostics] All required environment variables are present.\n');
    } else {
        console.warn('⚠️  [Diagnostics] Some environment variables are missing. Check deployment settings.\n');
    }
};

startServer();
