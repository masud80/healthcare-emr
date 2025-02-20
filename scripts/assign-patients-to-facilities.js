const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function assignPatientsToFacilities() {
  try {
    // Get all facilities
    const facilitiesSnapshot = await db.collection('facilities').get();
    const facilities = facilitiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get all patients
    const patientsSnapshot = await db.collection('patients').get();
    const patients = patientsSnapshot.docs;

    console.log(`Found ${patients.length} patients and ${facilities.length} facilities`);

    // Assign each patient to a random facility
    for (const patientDoc of patients) {
      const randomFacility = facilities[Math.floor(Math.random() * facilities.length)];
      
      await db.collection('patients').doc(patientDoc.id).update({
        facilityId: randomFacility.id
      });

      console.log(`Assigned patient ${patientDoc.data().name} to facility ${randomFacility.name}`);
    }

    console.log('Successfully assigned patients to facilities');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

assignPatientsToFacilities();
