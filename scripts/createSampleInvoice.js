const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const createSampleInvoice = async () => {
  const sampleInvoice = {
    billId: '8RWNPj9kVbIUTyxCaNGJ', // Reference to the created bill
    invoiceNumber: `INV-${Date.now()}`,
    amountDue: 110,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Due in 30 days
    status: 'Pending'
  };

  try {
    const invoiceRef = await db.collection('invoices').add(sampleInvoice);
    console.log('Sample invoice created with ID:', invoiceRef.id);
  } catch (error) {
    console.error('Error creating sample invoice:', error);
  }
};

createSampleInvoice();
