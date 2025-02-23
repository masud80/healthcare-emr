import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase/config';
import store from './redux/store';
import { setUser, setLoading, setRole, setError } from './redux/slices/authSlice';

const container = document.getElementById('root'); 

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
        const firestoreData = userDoc.data();
        
        // Determine role from both claims and Firestore data
        const role = idTokenResult.claims.admin === true ? 'admin' : 
                     firestoreData.role || 'user';

        store.dispatch(setUser({
          uid: user.uid,
          email: user.email
        }));
        
        // Explicitly dispatch role
        store.dispatch(setRole(role));
      }
    } else {
      // Clear auth state when user logs out
      store.dispatch(setUser(null));
      store.dispatch(setRole(null));
    }
    store.dispatch(setLoading(false));
  } catch (error) {
    console.error('Auth state change error:', error);
    store.dispatch(setError(error.message));
    store.dispatch(setLoading(false));
  }
});

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
