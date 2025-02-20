const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Doctor user details
const doctor = {
  email: 'doctor@healthcare.com',
  id: 'y08Vx7ZE23UaAOb41nIctLaqA6l1'
};

async function assignFacilitiesToDoctor() {
  const facilitiesRef = db.collection('facilities');
  const facilitiesSnapshot = await facilitiesRef.get();
  const facilities = facilitiesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  console.log(`Found ${facilities.length} facilities. Assigning to doctor@healthcare.com...`);

  // Assign all available facilities to the doctor
  for (const facility of facilities) {
    const facilityRef = facilitiesRef.doc(facility.id);
    
    // Add doctor to connectedUserIds if not already present
    const connectedUserIds = new Set(facility.connectedUserIds || []);
    connectedUserIds.add(doctor.id);

    // Update the facility
    await facilityRef.update({
      connectedUserIds: Array.from(connectedUserIds)
    });

    // Add to user_facilities collection
    await db.collection('user_facilities').add({
      userId: doctor.id,
      facilityId: facility.id,
      createdAt: new Date().toISOString()
    });

    console.log(`Assigned facility "${facility.name}" to doctor@healthcare.com`);
  }
}

// Run the assignment process
async function main() {
  try {
    await assignFacilitiesToDoctor();
    console.log('Completed assigning facilities to doctor@healthcare.com');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
