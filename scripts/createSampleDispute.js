const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const createSampleDispute = async () => {
  const sampleDispute = {
    billId: '8RWNPj9kVbIUTyxCaNGJ', // Reference to the created bill
    reason: 'Incorrect amount charged',
    status: 'Open',
    createdAt: new Date().toISOString()
  };

  try {
    const disputeRef = await db.collection('disputes').add(sampleDispute);
    console.log('Sample dispute created with ID:', disputeRef.id);
  } catch (error) {
    console.error('Error creating sample dispute:', error);
  }
};

createSampleDispute();
