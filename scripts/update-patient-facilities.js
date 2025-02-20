const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function updatePatientFacilities() {
  try {
    // Get nurse's user ID
    const nurseId = 'BYcRtIAz0GSdeiRG4kuX0wU2Se73';  // nurse@healthcare.com ID

    // Get nurse's assigned facilities
    const userFacilitiesQuery = await db.collection('user_facilities')
      .where('userId', '==', nurseId)
      .get();

    const nurseFacilityIds = userFacilitiesQuery.docs.map(doc => doc.data().facilityId);
    
    if (nurseFacilityIds.length === 0) {
      console.log('No facilities found for nurse');
      return;
    }

    console.log(`Found ${nurseFacilityIds.length} facilities for nurse:`, nurseFacilityIds);

    // Get all patients
    const patientsSnapshot = await db.collection('patients').get();
    const patients = patientsSnapshot.docs;

    console.log(`Found ${patients.length} total patients`);

    // Update each patient to be assigned to one of the nurse's facilities
    let updatedCount = 0;
    for (const patientDoc of patients) {
      // Randomly select one of the nurse's facilities
      const randomFacilityId = nurseFacilityIds[Math.floor(Math.random() * nurseFacilityIds.length)];
      
      // Only update if the patient's facility is not already one of the nurse's facilities
      const currentFacilityId = patientDoc.data().facilityId;
      if (!nurseFacilityIds.includes(currentFacilityId)) {
        await db.collection('patients').doc(patientDoc.id).update({
          facilityId: randomFacilityId
        });
        updatedCount++;
        console.log(`Updated patient ${patientDoc.data().name} facility to ${randomFacilityId}`);
      } else {
        console.log(`Patient ${patientDoc.data().name} already in correct facility`);
      }
    }

    console.log(`Updated ${updatedCount} patients`);
    console.log('Successfully updated patient facilities');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updatePatientFacilities();
