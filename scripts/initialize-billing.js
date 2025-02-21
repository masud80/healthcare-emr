const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Sample billing data
const sampleBills = [
  {
    billNumber: 'BILL-001',
    patientId: 'patient1',
    patientName: 'John Doe',
    items: [
      {
        description: 'General Consultation',
        quantity: 1,
        unitPrice: 150.00,
        amount: 150.00
      },
      {
        description: 'Blood Test',
        quantity: 1,
        unitPrice: 75.00,
        amount: 75.00
      }
    ],
    subtotal: 225.00,
    tax: 22.50,
    discount: 0,
    totalAmount: 247.50,
    paidAmount: 247.50,
    status: 'paid',
    paymentTerms: 'due_on_receipt',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    payments: [
      {
        amount: 247.50,
        method: 'credit_card',
        reference: 'PAY-001',
        date: new Date().toISOString()
      }
    ]
  },
  {
    billNumber: 'BILL-002',
    patientId: 'patient2',
    patientName: 'Jane Smith',
    items: [
      {
        description: 'Emergency Room Visit',
        quantity: 1,
        unitPrice: 500.00,
        amount: 500.00
      },
      {
        description: 'X-Ray',
        quantity: 2,
        unitPrice: 200.00,
        amount: 400.00
      }
    ],
    subtotal: 900.00,
    tax: 90.00,
    discount: 50.00,
    totalAmount: 940.00,
    paidAmount: 500.00,
    status: 'partial',
    paymentTerms: 'net_30',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    payments: [
      {
        amount: 500.00,
        method: 'insurance',
        reference: 'PAY-002',
        date: new Date().toISOString()
      }
    ]
  },
  {
    billNumber: 'BILL-003',
    patientId: 'patient3',
    patientName: 'Robert Johnson',
    items: [
      {
        description: 'Specialist Consultation',
        quantity: 1,
        unitPrice: 250.00,
        amount: 250.00
      }
    ],
    subtotal: 250.00,
    tax: 25.00,
    discount: 0,
    totalAmount: 275.00,
    paidAmount: 0,
    status: 'pending',
    paymentTerms: 'net_15',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    payments: []
  }
];

async function initializeBilling() {
  try {
    // Create a batch
    const batch = db.batch();

    // Add each bill to the batch
    for (const bill of sampleBills) {
      const billRef = db.collection('bills').doc();
      batch.set(billRef, bill);
    }

    // Commit the batch
    await batch.commit();
    console.log('Successfully initialized billing collection with sample data');
  } catch (error) {
    console.error('Error initializing billing collection:', error);
  }
}

// Run the initialization
initializeBilling()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
