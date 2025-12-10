import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.warn("⚠️ Firebase credentials missing in .env. Authentication features will not work.");
}

if (!admin.apps.length) {
    try {
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
            });
            console.log('Firebase Admin Initialized');
        }
    } catch (error) {
        console.error('Firebase Admin Initialization Failed:', error);
    }
}

// Export auth safely - if app not initialized, accessing admin.auth() throws.
// We'll export a proxy or handle it. 
// For now, let's try to export it, but if it fails, maybe export null?
// But types might break.
// Better: only call admin.auth() if admin.apps.length > 0
export const auth = admin.apps.length ? admin.auth() : {} as admin.auth.Auth;
