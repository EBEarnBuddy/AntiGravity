
import axios from 'axios';
import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Initialize Admin SDK to mint tokens
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

const verifySync = async () => {
    try {
        console.log('Minting test token...');
        const testUid = `test-user-${Date.now()}`;
        // Note: For backend-to-backend test without client SDK, we can't easily exchange custom token for ID token 
        // strictly without using the Firebase REST API or Client SDK.
        // HOWEVER, our middleware verifies ID tokens. 
        // Admin SDK can mint *Custom* tokens. Validating *Custom* tokens as ID tokens usually fails in `verifyIdToken`.
        // We need a real ID token.
        // Strategy: Use Firebase Auth REST API to sign in with custom token.

        const customToken = await admin.auth().createCustomToken(testUid, { role: 'tester' });

        // Exchange custom token for ID token via REST API
        const apiKey = process.env.FIREBASE_API_KEY || "AIzaSyBjVYtsj3bqd4s-_EWUUcfa9MkuC33aXbo"; // Using the known public key if env missing
        const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`;

        const signInResponse = await axios.post(signInUrl, {
            token: customToken,
            returnSecureToken: true
        });

        const idToken = signInResponse.data.idToken;
        console.log('Got ID Token.');

        // Call Backend Sync
        const backendUrl = 'http://localhost:5000/api/v1/users/sync';

        console.log('Calling Sync Endpoint (First Time)...');
        const res1 = await axios.post(backendUrl, {
            displayName: 'Test User',
            photoURL: 'http://example.com/photo.jpg'
        }, {
            headers: { Authorization: `Bearer ${idToken}` }
        });

        console.log('First Sync Response Status:', res1.status);
        if (res1.data.firebaseUid !== testUid) throw new Error('UID Mismatch');
        if (res1.data.displayName !== 'Test User') throw new Error('Name Mismatch');

        console.log('Calling Sync Endpoint (Second Time - Idempotency)...');
        const res2 = await axios.post(backendUrl, {
            displayName: 'Test User Updated',
            photoURL: 'http://example.com/photo2.jpg'
        }, {
            headers: { Authorization: `Bearer ${idToken}` }
        });

        console.log('Second Sync Response Status:', res2.status);
        if (res2.data.displayName !== 'Test User Updated') throw new Error('Update Failed');
        if (new Date(res2.data.lastLogin) <= new Date(res1.data.lastLogin)) console.warn('Warning: LastLogin not updated or too fast');

        console.log('✅ Verification Successful: User Created and Updated.');

        // Cleanup
        await admin.auth().deleteUser(testUid);
        console.log('Cleanup: Test user deleted from Firebase.');

    } catch (error: any) {
        console.error('❌ Verification Failed:', error.response?.data || error.message);
        process.exit(1);
    }
};

verifySync();
