import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase/config';
import store from './redux/store';
import { setUser, setLoading } from './redux/slices/authSlice';

const container = document.getElementById('root');
const root = createRoot(container);

// Initialize loading state
store.dispatch(setLoading(true));

// Set up authentication listener
onAuthStateChanged(auth, async (user) => {
  try {
    if (user) {
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
      } else {
        store.dispatch(setUser(null));
      }
    } else {
      store.dispatch(setUser(null));
    }
  } catch (error) {
    console.error('Error during authentication:', error);
    store.dispatch(setUser(null));
  } finally {
    store.dispatch(setLoading(false));
  }
});

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
