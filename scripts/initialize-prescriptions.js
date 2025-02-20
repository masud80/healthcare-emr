const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function initializePrescriptions() {
  try {
    // Get a sample patient
    const patientsSnapshot = await db.collection('patients').limit(1).get();
    if (patientsSnapshot.empty) {
      console.log('No patients found to add prescriptions');
      return;
    }

    const patient = patientsSnapshot.docs[0];
    const patientData = patient.data();

    // Create a sample prescription
    const prescriptionData = {
      patientId: patient.id,
      facilityId: patientData.facilityId,
      createdAt: new Date().toISOString(),
      status: 'active',
      medications: [
        {
          name: 'Amoxicillin',
          dosage: '500mg',
          route: 'Oral',
          frequency: 'Every 8 hours',
          duration: '7 days'
        }
      ],
      pharmacy: {
        name: 'City Pharmacy',
        address: '123 Healthcare Ave',
        phone: '555-0123'
      }
    };

    // Add the prescription to Firestore
    const result = await db.collection('prescriptions').add(prescriptionData);
    console.log('Created prescription with ID:', result.id);

    // Update the patient with the default pharmacy
    await db.collection('patients').doc(patient.id).update({
      defaultPharmacy: prescriptionData.pharmacy
    });
    console.log('Updated patient with default pharmacy');

  } catch (error) {
    console.error('Error initializing prescriptions:', error);
  }
}

// Run the initialization
initializePrescriptions()
  .then(() => {
    console.log('Prescription initialization complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to initialize prescriptions:', error);
    process.exit(1);
  });
