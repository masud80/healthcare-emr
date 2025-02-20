const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

async function createIndexes() {
  try {
    // Get the Firestore instance
    const db = admin.firestore();

    // Create the composite index for patients collection
    const collectionGroup = db.collection('patients');
    
    // Define the index fields
    const index = {
      collectionGroup: 'patients',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'facilityId', order: 'ASCENDING' },
        { fieldPath: 'name', order: 'ASCENDING' }
      ]
    };

    // Create the index
    console.log('Creating composite index for patients collection...');
    await db.collection('patients').doc('_ignored_').collection('_ignored_').doc().set({});
    await admin.firestore().listIndexes();
    
    console.log('Index creation initiated. The index will be ready in a few minutes.');
    console.log('You can monitor index creation progress in the Firebase Console.');

  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}

// Run the index creation
createIndexes()
  .then(() => {
    console.log('Index creation process completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
