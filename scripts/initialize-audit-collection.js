const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function initializeAuditCollection() {
  try {
    // Create a test document in the audit collection
    await db.collection('audit').add({
      userId: 'system',
      action: 'INITIALIZE_COLLECTION',
      targetType: 'SYSTEM',
      timestamp: admin.firestore.Timestamp.now(),
      details: {
        message: 'Audit collection initialized'
      }
    });

    console.log('Audit collection initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing audit collection:', error);
    process.exit(1);
  }
}

initializeAuditCollection();
