import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, db } from '../firebase/init';
import { signOut as firebaseSignOut } from 'firebase/auth';




export const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
  signOut: () => Promise.resolve() // Add default signOut function
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe;

    const initializeAuth = async () => {
      try {
        console.log('AuthProvider: Starting initialization');
        
        unsubscribe = auth.onAuthStateChanged(auth, 
          async (firebaseUser) => {
            console.log('AuthProvider: Auth state changed:', 
              firebaseUser ? `User ID: ${firebaseUser.uid}` : 'No user');

            if (!isMounted) return;

            try {
              if (firebaseUser) {
               
                console.log('AuthProvider: Fetching patient document');
                
                const patientDoc = await db.getDoc(db.doc(db, 'patients', firebaseUser.uid));
                console.log('AuthProvider: Patient document exists:', patientDoc.exists());

                if (!patientDoc.exists()) {
                  console.log('AuthProvider: No patient document found');
                  await auth.signOut();
                  setUser(null);
                } else {
                  const patientData = patientDoc.data();
                  console.log('AuthProvider: Portal enabled:', patientData.isPatientPortalEnabled);
                  
                  if (!patientData.isPatientPortalEnabled) {
                    console.log('AuthProvider: Portal access disabled');
                    await auth.signOut();
                    setUser(null);
                  } else {
                    console.log('AuthProvider: Setting authenticated user');
                    setUser(firebaseUser);
                  }
                }
              } else {
                console.log('AuthProvider: Clearing user state');
                setUser(null);
              }
            } catch (err) {
              console.error('AuthProvider: Error during auth state change:', err);
              setError(err.message);
              setUser(null);
            } finally {
              if (isMounted) {
                console.log('AuthProvider: Setting loading to false');
                setLoading(false);
              }
            }
          },
          (error) => {
            console.error('AuthProvider: Auth state change error:', error);
            setError(error.message);
            setLoading(false);
          }
        );

        console.log('AuthProvider: Auth listener setup complete');
      } catch (err) {
        console.error('AuthProvider: Initialization error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      console.log('AuthProvider: Cleanup');
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Add signOut function
  const signOut = async () => {
    try {
      console.log('AuthProvider: Signing out');
      await firebaseSignOut(auth);
      console.log('AuthProvider: Sign out successful');
    } catch (err) {
      console.error('AuthProvider: Sign out error:', err);
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    signOut // Add signOut to the context value
  };

  console.log('AuthProvider: Rendering with state:', value);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
