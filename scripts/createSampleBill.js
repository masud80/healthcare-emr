const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json'); // Ensure the path to your service account key is correct

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const createSampleBill = async () => {
  const sampleBill = {
    patientId: '12345',
    patientName: 'John Doe',
    billNumber: `BILL-${Date.now()}`,
    items: [
      {
        description: 'Consultation',
        quantity: 1,
        unitPrice: 100,
        amount: 100
      }
    ],
    subtotal: 100,
    tax: 10,
    discount: 0,
    totalAmount: 110,
    notes: 'First bill',
    paymentTerms: 'due_on_receipt',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
    createdAt: new Date().toISOString()
  };

  try {
    const billRef = await db.collection('bills').add(sampleBill);
    console.log('Sample bill created with ID:', billRef.id);
  } catch (error) {
    console.error('Error creating sample bill:', error);
  }
};

createSampleBill();
