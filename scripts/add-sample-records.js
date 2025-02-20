const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');
const addSampleMedicalRecords = require('../src/utils/addSampleMedicalRecords');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Run the sample data insertion
addSampleMedicalRecords(db)
  .then(() => {
    console.log('Completed adding sample medical records');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
