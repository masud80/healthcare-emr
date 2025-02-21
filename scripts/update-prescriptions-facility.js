const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function updatePrescriptionsFacility() {
  try {
    // Get all prescriptions
    const prescriptionsSnapshot = await db.collection('prescriptions').get();
    
    for (const prescriptionDoc of prescriptionsSnapshot.docs) {
      const prescription = prescriptionDoc.data();
      
      // Skip if already has facilityId
      if (prescription.facilityId) {
        console.log(`Prescription ${prescriptionDoc.id} already has facilityId`);
        continue;
      }

      // Get patient's facilityId
      const patientDoc = await db.collection('patients').doc(prescription.patientId).get();
      if (!patientDoc.exists) {
        console.log(`Patient ${prescription.patientId} not found for prescription ${prescriptionDoc.id}`);
        continue;
      }

      const facilityId = patientDoc.data().facilityId;
      if (!facilityId) {
        console.log(`Patient ${prescription.patientId} has no facilityId`);
        continue;
      }

      // Update prescription with facilityId
      await prescriptionDoc.ref.update({
        facilityId: facilityId
      });
      console.log(`Updated prescription ${prescriptionDoc.id} with facilityId ${facilityId}`);
    }

    console.log('Finished updating prescriptions');
  } catch (error) {
    console.error('Error updating prescriptions:', error);
  }
}

updatePrescriptionsFacility();
