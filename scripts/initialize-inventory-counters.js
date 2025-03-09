const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function initializeInventoryCounters() {
  try {
    const counters = {
      supplierId: 0,
      purchaseOrderId: 0
    };

    // Initialize counters
    for (const [counterName, value] of Object.entries(counters)) {
      await db.collection('inventory_counters').doc(counterName).set({ value });
    }

    console.log('Inventory counters initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing inventory counters:', error);
    process.exit(1);
  }
}

initializeInventoryCounters(); 