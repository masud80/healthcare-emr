import { auth, db } from '../firebase/config';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

export const assignFacilityToUser = async (userEmail, facilityId) => {
  try {
    // Get the user document from Firestore
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', userEmail));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('User not found in Firestore');
    }

    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;

    // Create the user-facility assignment
    await addDoc(collection(db, 'user_facilities'), {
      userId,
      facilityId,
      assignedAt: new Date().toISOString()
    });

    console.log(`Successfully assigned facility ${facilityId} to user: ${userEmail}`);
    return true;
  } catch (error) {
    console.error('Error assigning facility to user:', error.message);
    throw error;
  }
};
