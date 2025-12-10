import mongoose from 'mongoose';
import app from './app';
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
            console.log('✅ MongoDB connected successfully');
        }

        app.listen(PORT, () => {
            console.log(`✅ Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Server startup failed:', error);
        process.exit(1);
    }
};

startServer();
