const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkVisits(patientId) {
  try {
    console.log(`Checking visits for patient: ${patientId}`);
    
    const visitsRef = db.collection('visits');
    const q = visitsRef.where('patientId', '==', patientId);
    const querySnapshot = await q.get();
    
    console.log(`Found ${querySnapshot.size} visits`);
    
    querySnapshot.forEach((doc) => {
      console.log('Visit:', {
        id: doc.id,
        ...doc.data()
      });
    });
  } catch (error) {
    console.error('Error checking visits:', error);
  }
}

const patientId = '2hTyHAp1NBzG3Xsds4RQ';
checkVisits(patientId).then(() => process.exit(0));
