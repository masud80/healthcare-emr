import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase/config';
import store from './redux/store';
import { setUser } from './redux/slices/authSlice';

const container = document.getElementById('root');
const root = createRoot(container);

// Set up authentication listener
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      // Force token refresh to get latest claims
      await user.getIdToken(true);
      const idTokenResult = await user.getIdTokenResult();
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        store.dispatch(setUser({
          uid: user.uid,
          email: user.email,
          role: idTokenResult.claims.admin ? 'admin' : (userDoc.data().role || 'user')
        }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      store.dispatch(setUser(null));
    }
  } else {
    store.dispatch(setUser(null));
  }
});

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
