const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function verifyPatientFacilities() {
  try {
    // Get all patients
    const patientsSnapshot = await db.collection('patients').get();
    const patients = patientsSnapshot.docs;

    console.log(`Found ${patients.length} patients`);

    let patientsWithoutFacility = [];
    let patientsWithInvalidFacility = [];
    let validPatients = [];

    // Get all valid facility IDs
    const facilitiesSnapshot = await db.collection('facilities').get();
    const validFacilityIds = facilitiesSnapshot.docs.map(doc => doc.id);

    console.log(`Found ${validFacilityIds.length} valid facilities`);

    // Check each patient
    for (const patientDoc of patients) {
      const patient = patientDoc.data();
      const patientId = patientDoc.id;

      if (!patient.facilityId) {
        patientsWithoutFacility.push({
          id: patientId,
          name: patient.name
        });
      } else if (!validFacilityIds.includes(patient.facilityId)) {
        patientsWithInvalidFacility.push({
          id: patientId,
          name: patient.name,
          facilityId: patient.facilityId
        });
      } else {
        validPatients.push({
          id: patientId,
          name: patient.name,
          facilityId: patient.facilityId
        });
      }
    }

    // Print results
    console.log('\nVerification Results:');
    console.log(`Total patients: ${patients.length}`);
    console.log(`Valid patients with facility: ${validPatients.length}`);
    console.log(`Patients without facility: ${patientsWithoutFacility.length}`);
    console.log(`Patients with invalid facility: ${patientsWithInvalidFacility.length}`);

    if (patientsWithoutFacility.length > 0) {
      console.log('\nPatients without facility:');
      patientsWithoutFacility.forEach(p => console.log(`- ${p.name} (${p.id})`));
    }

    if (patientsWithInvalidFacility.length > 0) {
      console.log('\nPatients with invalid facility:');
      patientsWithInvalidFacility.forEach(p => console.log(`- ${p.name} (${p.id}): ${p.facilityId}`));
    }

    // Fix patients without facility
    if (patientsWithoutFacility.length > 0 || patientsWithInvalidFacility.length > 0) {
      console.log('\nFixing patient assignments...');
      
      const allPatientsToFix = [...patientsWithoutFacility, ...patientsWithInvalidFacility];
      
      for (const patient of allPatientsToFix) {
        // Assign to a random facility
        const randomFacilityId = validFacilityIds[Math.floor(Math.random() * validFacilityIds.length)];
        
        await db.collection('patients').doc(patient.id).update({
          facilityId: randomFacilityId
        });

        console.log(`Assigned patient ${patient.name} to facility ${randomFacilityId}`);
      }
    }

    console.log('\nVerification and fixes completed');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the verification
verifyPatientFacilities()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
