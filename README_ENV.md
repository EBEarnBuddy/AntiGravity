# Environment Variables Documentation

This project requires environment variables to be set for both the Backend and Frontend to function correctly in production.

## Backend (.env / Render Environment)

Set these variables in your backend hosting provider (e.g., Render, Railway, DigitalOcean).

| Variable | Description | Example |
|---|---|---|
| `PORT` | The port the server listens on (Render sets this automatically) | `5000` |
| `NODE_ENV` | Environment mode (production/development) | `production` |
| `MONGO_URI` | Connection string for MongoDB Atlas | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `CLIENT_URL` | **[CRITICAL]** The URL of your deployed frontend. Used for CORS whitelist. | `https://earnbuddy-frontend.vercel.app` |
| `FIREBASE_PROJECT_ID` | Firebase Project ID (Service Account) | `earnbuddy-641b3` |
| `FIREBASE_CLIENT_EMAIL` | Firebase Client Email (Service Account) | `firebase-adminsdk-xxxxx@earnbuddy-641b3.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Firebase Private Key (Service Account) | `-----BEGIN PRIVATE KEY-----\nMII...` |

**Note on `FIREBASE_PRIVATE_KEY`**:
Some hosting providers do not handle newlines (`\n`) in secrets well. If you encounter "PEM routines" errors:
1.  Ensure the key is copied exactly as is from the JSON file.
2.  Or replace literal newlines with `\n` characters if the host requires a single line string.

---

## Frontend (.env.local / Vercel Environment Variables)

Set these variables in your frontend hosting provider (e.g., Vercel, Netlify).

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | **[CRITICAL]** URL of the deployed backend API (must end with `/api/v1`) | `https://earnbuddy-backend.onrender.com/api/v1` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API Key | `AIzaSy...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `earnbuddy-641b3.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID | `earnbuddy-641b3` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | `earnbuddy-641b3.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | `1234567890` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID | `1:1234567890:web:abcdef` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase Measurement ID (Optional) | `G-XYZ123` |

### **Important Deployment Checklist**
1.  **Backend**: Ensure `CLIENT_URL` matches your frontend domain perfectly (no trailing slash usually preferred for origin checks, but exact match is key).
2.  **Frontend**: Ensure `NEXT_PUBLIC_API_URL` points to your backend and includes `/api/v1` at the end.
3.  **Redeploy**: Always redeploy both services after updating environment variables.
