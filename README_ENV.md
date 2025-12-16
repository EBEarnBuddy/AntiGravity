# Environment Variables Documentation

This project requires environment variables to be set for both the Backend and Frontend to function correctly in production.

## Backend (.env)

These variables should be set in your Render (or other backend host) environment configuration.

| Variable | Description | Example |
|---|---|---|
| `PORT` | The port the server listens on (Render sets this automatically) | `5000` |
| `MONGO_URI` | Connection string for MongoDB Atlas | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `FIREBASE_PROJECT_ID` | Firebase Project ID (Service Account) | `earnbuddy-641b3` |
| `FIREBASE_CLIENT_EMAIL` | Firebase Client Email (Service Account) | `firebase-adminsdk-xxxxx@earnbuddy-641b3.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Firebase Private Key (Service Account) | `-----BEGIN PRIVATE KEY-----\nMII...` |
| `FRONTEND_URL` | URL of the deployed frontend (for CORS) | `https://earnbuddy-frontend.vercel.app` |

**Note:** `FIREBASE_PRIVATE_KEY` usually needs to be handled carefully in some hosting providers to preserve newlines (`\n`). If your host doesn't support multiline secrets easily, you might need to base64 encode it or ensure the newlines are literal `\n` characters.

## Frontend (.env.local / Vercel Environment Variables)

These variables should be set in your Vercel project settings.

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL of the deployed backend | `https://earnbuddy-backend.onrender.com/api/v1` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API Key | `AIzaSy...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `earnbuddy-641b3.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID | `earnbuddy-641b3` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | `earnbuddy-641b3.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | `1234567890` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID | `1:1234567890:web:abcdef` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase Measurement ID (Optional) | `G-XYZ123` |

**Important:** Rebuild the frontend after changing these variables.
