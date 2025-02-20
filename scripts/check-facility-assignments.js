const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkFacilityAssignments() {
  try {
    // Get nurse's user ID
    const nurseId = 'BYcRtIAz0GSdeiRG4kuX0wU2Se73';  // nurse@healthcare.com ID
    console.log('Checking assignments for nurse:', nurseId);

    // 1. Check nurse's assigned facilities
    const userFacilitiesQuery = await db.collection('user_facilities')
      .where('userId', '==', nurseId)
      .get();

    console.log('\nNurse Facility Assignments:');
    const nurseFacilityIds = [];
    for (const doc of userFacilitiesQuery.docs) {
      nurseFacilityIds.push(doc.data().facilityId);
      console.log('- Facility ID:', doc.data().facilityId);
    }

    // 2. Get facility details
    console.log('\nFacility Details:');
    for (const facilityId of nurseFacilityIds) {
      const facilityDoc = await db.collection('facilities').doc(facilityId).get();
      if (facilityDoc.exists) {
        console.log('- Facility:', facilityDoc.data().name);
      } else {
        console.log('- Facility not found for ID:', facilityId);
      }
    }

    // 3. Check patients assigned to these facilities
    console.log('\nPatients in nurse\'s facilities:');
    for (const facilityId of nurseFacilityIds) {
      const patientsQuery = await db.collection('patients')
        .where('facilityId', '==', facilityId)
        .get();

      console.log(`\nFacility ${facilityId} patients:`);
      patientsQuery.docs.forEach(doc => {
        console.log('- Patient:', doc.data().name);
      });
    }

    // 4. Check all patients
    console.log('\nAll patients and their facility assignments:');
    const allPatientsQuery = await db.collection('patients').get();
    allPatientsQuery.docs.forEach(doc => {
      const data = doc.data();
      console.log('- Patient:', data.name, 'Facility:', data.facilityId || 'Not assigned');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkFacilityAssignments();
