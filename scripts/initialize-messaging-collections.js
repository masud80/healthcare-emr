const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function initializeMessagingCollections() {
  try {
    // Create sample message thread
    const threadRef = await db.collection('messageThreads').add({
      subject: 'Welcome to Secure Messaging',
      participants: ['system'], // You'll need to add actual user IDs here
      createdAt: admin.firestore.Timestamp.now(),
      createdBy: 'system',
      isArchived: false,
      lastMessageAt: admin.firestore.Timestamp.now()
    });

    // Create sample message
    await db.collection('messages').add({
      threadId: threadRef.id,
      content: 'Welcome to the secure messaging system. This is a sample message.',
      sentAt: admin.firestore.Timestamp.now(),
      sentBy: 'system',
      senderName: 'System'
    });

    console.log('Messaging collections initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing messaging collections:', error);
    process.exit(1);
  }
}

initializeMessagingCollections();