import { assignFacilityToUser } from './assignFacilityToUser';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const testAssignment = async () => {
  try {
    // First get a facility ID
    const facilitiesSnapshot = await getDocs(collection(db, 'facilities'));
    if (facilitiesSnapshot.empty) {
      throw new Error('No facilities found');
    }
    
    const facilityId = facilitiesSnapshot.docs[0].id;
    const userEmail = 'doctor@healthcare.com';

    // Assign the facility to the user
    await assignFacilityToUser(userEmail, facilityId);
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testAssignment();
