const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const checkBillsCollection = async () => {
  try {
    const billsRef = db.collection('bills');
    const snapshot = await billsRef.get();

    if (snapshot.empty) {
      console.log('No bills found in the collection.');
      return;
    }

    snapshot.forEach(doc => {
      console.log(`Bill ID: ${doc.id}, Data: ${JSON.stringify(doc.data())}`);
    });
  } catch (error) {
    console.error('Error fetching bills:', error);
  }
};

checkBillsCollection();
