import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Connect to Firestore emulator in development
if (process.env.REACT_APP_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}

// Log which environment we're using
console.log(`Using Firebase environment: ${process.env.REACT_APP_ENV}`);

// Add .gitignore entry to prevent committing sensitive data
const gitignoreEntry = `
# Firebase Environment Variables
.env.development
.env.production
`;

// Note: You'll need to manually add these to .gitignore if not already present
