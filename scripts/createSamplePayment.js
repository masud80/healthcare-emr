const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const createSamplePayment = async () => {
  const samplePayment = {
    billId: '8RWNPj9kVbIUTyxCaNGJ', // Reference to the created bill
    amount: 110,
    paymentDate: new Date().toISOString(),
    paymentMethod: 'Credit Card',
    status: 'Completed'
  };

  try {
    const paymentRef = await db.collection('payments').add(samplePayment);
    console.log('Sample payment created with ID:', paymentRef.id);
  } catch (error) {
    console.error('Error creating sample payment:', error);
  }
};

createSamplePayment();
