import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { initializeFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  return !!(firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId);
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;
let googleProvider: GoogleAuthProvider | undefined;

if (isFirebaseConfigured()) {
  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);

    // Initialize Firebase Authentication and get a reference to the service
    auth = getAuth(app);

    // Configure Google Provider with additional settings
    googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('email');
    googleProvider.addScope('profile');

    // Set custom parameters for better popup handling
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });

    // Initialize Cloud Firestore with robust transport options for dev networks
    // Auto-detect long polling if WebChannel streaming is blocked (proxies/ISP/extensions)
    db = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true
    });

    // Initialize Firebase Storage
    storage = getStorage(app);

    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  console.warn('Firebase is not properly configured. Please update your environment variables with valid Firebase credentials.');
  // TODO: Configure Firebase properly
  auth = undefined;
  googleProvider = undefined;
  db = undefined;
  storage = undefined;
}

export { auth, googleProvider, db, storage, isFirebaseConfigured };
export default app;