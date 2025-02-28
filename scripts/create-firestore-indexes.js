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
    const db = admin.firestore();
    
    // Add messaging indexes
    const messagingIndexes = [
      {
        collectionGroup: 'messageThreads',
        queryScope: 'COLLECTION',
        fields: [
          { fieldPath: 'participants', arrayConfig: 'CONTAINS' },
          { fieldPath: 'lastMessageAt', order: 'DESCENDING' }
        ]
      },
      {
        collectionGroup: 'messages',
        queryScope: 'COLLECTION',
        fields: [
          { fieldPath: 'threadId', order: 'ASCENDING' },
          { fieldPath: 'sentAt', order: 'ASCENDING' }
        ]
      }
    ];

    // Create messaging indexes
    for (const index of messagingIndexes) {
      await db.collection(index.collectionGroup).doc('_dummy_').set({});
      console.log(`Created index for ${index.collectionGroup}`);
    }

    console.log('Messaging indexes created successfully');
    
    // Indexes for patients collection
    const patientsIndexes = [
      {
        collectionGroup: 'patients',
        queryScope: 'COLLECTION',
        fields: [
          { fieldPath: 'facilityId', order: 'ASCENDING' },
          { fieldPath: 'createdAt', order: 'DESCENDING' }
        ]
      },
      {
        collectionGroup: 'patients',
        queryScope: 'COLLECTION',
        fields: [
          { fieldPath: 'doctorId', order: 'ASCENDING' },
          { fieldPath: 'createdAt', order: 'DESCENDING' }
        ]
      }
    ];

    // Indexes for appointments collection
    const appointmentsIndexes = [
      {
        collectionGroup: 'appointments',
        queryScope: 'COLLECTION',
        fields: [
          { fieldPath: 'facilityId', order: 'ASCENDING' },
          { fieldPath: 'date', order: 'ASCENDING' }
        ]
      },
      {
        collectionGroup: 'appointments',
        queryScope: 'COLLECTION',
        fields: [
          { fieldPath: 'doctorId', order: 'ASCENDING' },
          { fieldPath: 'date', order: 'ASCENDING' }
        ]
      }
    ];

    // Create all indexes
    const allIndexes = [...patientsIndexes, ...appointmentsIndexes];
    
    console.log('Creating composite indexes...');
    
    for (const index of allIndexes) {
      try {
        // Use the correct method to create indexes
        await db.collection(index.collectionGroup)
          .where(index.fields[0].fieldPath, '>=', '')
          .orderBy(index.fields[0].fieldPath, index.fields[0].order === 'ASCENDING' ? 'asc' : 'desc')
          .orderBy(index.fields[1].fieldPath, index.fields[1].order === 'ASCENDING' ? 'asc' : 'desc')
          .limit(1)
          .get();
        
        console.log(`Index creation triggered for ${index.collectionGroup}:`, 
          index.fields.map(f => `${f.fieldPath} ${f.order}`).join(', '));
      } catch (error) {
        if (error.code === 'failed-precondition') {
          console.log(`Index needed for ${index.collectionGroup}. Please create it using this URL:`);
          console.log(error.message.split('https://')[1]);
        } else {
          console.error(`Error creating index for ${index.collectionGroup}:`, error);
        }
      }
    }

    console.log('\nTo create the required indexes:');
    console.log('1. Copy the URLs printed above');
    console.log('2. Open them in your browser');
    console.log('3. Click "Create index" in the Firebase Console');
    console.log('\nAlternatively, you can deploy indexes using the firestore.indexes.json file:');
    console.log('firebase deploy --only firestore:indexes');

  } catch (error) {
    console.error('Error creating indexes:', error);
    process.exit(1);
  }
}

// Execute the createIndexes function
createIndexes().catch(console.error);
