import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from '@firebase/auth';
import { getFirestore, doc, getDoc } from '@firebase/firestore';
import { auth } from '../firebase/config';

export const AuthContext = createContext({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const db = getFirestore();
          const patientDoc = await getDoc(doc(db, 'patients', firebaseUser.uid));
          
          if (!patientDoc.exists() || !patientDoc.data().isPatientPortalEnabled) {
            // If not a patient or portal not enabled, sign out
            await auth.signOut();
            setUser(null);
          } else {
            setUser(firebaseUser);
          }
        } catch (error) {
          console.error('Error checking patient status:', error);
          await auth.signOut();
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

};
