const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const nurseUser = {
  email: 'nurse@healthcare.com',
  id: 'BYcRtIAz0GSdeiRG4kuX0wU2Se73'
};

async function assignFacilitiesToNurse() {
  try {
    // Get all facilities
    const facilitiesRef = db.collection('facilities');
    const facilitiesSnapshot = await facilitiesRef.get();
    const facilities = facilitiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Randomly select 2 facilities
    const shuffledFacilities = facilities.sort(() => 0.5 - Math.random());
    const selectedFacilities = shuffledFacilities.slice(0, 2);

    console.log(`Assigning 2 facilities to ${nurseUser.email}`);

    // First, remove nurse from all facilities
    for (const facility of facilities) {
      const facilityRef = facilitiesRef.doc(facility.id);
      await facilityRef.update({
        connectedUserIds: admin.firestore.FieldValue.arrayRemove(nurseUser.id)
      });
    }

    // Delete existing user_facilities entries for nurse
    const userFacilitiesRef = db.collection('user_facilities');
    const existingAssignments = await userFacilitiesRef
      .where('userId', '==', nurseUser.id)
      .get();
    
    for (const doc of existingAssignments.docs) {
      await doc.ref.delete();
    }

    // Assign new facilities
    for (const facility of selectedFacilities) {
      const facilityRef = facilitiesRef.doc(facility.id);
      
      // Add nurse to facility's connectedUserIds
      await facilityRef.update({
        connectedUserIds: admin.firestore.FieldValue.arrayUnion(nurseUser.id)
      });

      // Create new user_facilities entry
      await userFacilitiesRef.add({
        userId: nurseUser.id,
        facilityId: facility.id,
        createdAt: new Date().toISOString()
      });

      console.log(`Assigned facility "${facility.name}" to ${nurseUser.email}`);
    }

    console.log('Successfully assigned facilities to nurse');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

assignFacilitiesToNurse();
