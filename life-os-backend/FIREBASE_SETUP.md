# Firebase Authentication Setup

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select existing project
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable desired providers (Email/Password, Google, etc.)

## 2. Service Account Setup

1. Go to Project Settings > Service accounts
2. Click "Generate new private key"
3. Download the JSON file (keep it secure!)

## 3. Environment Configuration

Update your `.env` file with Firebase credentials:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

## 4. Frontend Integration Example

```javascript
// Firebase Client SDK
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Sign in
async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();

    // Send token to backend
    const response = await fetch('/auth/verify-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: idToken })
    });

    return await response.json();
  } catch (error) {
    console.error('Sign in error:', error);
  }
}

// Get current user profile
async function getUserProfile() {
  try {
    const user = auth.currentUser;
    if (user) {
      const idToken = await user.getIdToken();

      const response = await fetch('/auth/me', {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });

      return await response.json();
    }
  } catch (error) {
    console.error('Get profile error:', error);
  }
}
```

## 5. API Usage

### Verify Token
```bash
POST /auth/verify-token
Content-Type: application/json

{
  "token": "firebase-id-token"
}
```

### Get Current User
```bash
GET /auth/me
Authorization: Bearer firebase-id-token
```

### Get Firebase User Info
```bash
GET /auth/firebase-user
Authorization: Bearer firebase-id-token
```

## 6. Security Notes

- Store Firebase config securely
- Never expose service account keys in client-side code
- Use HTTPS in production
- Validate tokens on each protected request
- Implement proper CORS policies