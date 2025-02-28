import { initializeApp } from 'firebase/app';

// Optionally import the services that you want to use
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const fireapp = initializeApp(firebaseConfig);
// Initialize Firebase Authentication and get a reference to the service
const fireauth = getAuth(fireapp);

const db = getFirestore(fireapp);

export { fireapp, fireauth, db };

export const signInWithEmail = (email, password) => {
  return signInWithEmailAndPassword(fireauth, email, password)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      // Check if user's email matches a patient doc with isPatientPortalEnabled = true
      return getDocs(collection(db, 'patients'))
        .then((querySnapshot) => {
          const patientDoc = querySnapshot.docs.find(doc => 
            doc.data().email === email && doc.data().isPatientPortalEnabled === true
          );
          if (!patientDoc) {
            throw new Error('User is not authorized to access the patient portal');
          }
          return user;
        });
    })
    .catch((error) => {
      console.log("Error signing in:", error.message);
      throw error;
    });
};







