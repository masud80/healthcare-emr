import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export const isEmailUnique = async (email, currentPatientId = null) => {
  if (!email) return true;
  
  const q = query(
    collection(db, 'patients'),
    where('email', '==', email.toLowerCase())
  );

  const querySnapshot = await getDocs(q);
  
  // If no documents found with this email, it's unique
  if (querySnapshot.empty) return true;
  
  // If we're updating an existing patient, check if the found email belongs to the same patient
  if (currentPatientId) {
    return querySnapshot.docs[0].id === currentPatientId;
  }
  
  return false;
};