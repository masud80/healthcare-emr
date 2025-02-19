import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase/config';
import store from './redux/store';
import { setUser, setRole } from './redux/slices/authSlice';

const container = document.getElementById('root');
const root = createRoot(container);

// Set up authentication listener
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        store.dispatch(setUser(user));
        store.dispatch(setRole(userDoc.data().role));
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  } else {
    store.dispatch(setUser(null));
    store.dispatch(setRole(null));
  }
});

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
