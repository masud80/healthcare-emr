const admin = require('firebase-admin');
const serviceAccount = require('../../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const addMissingUser = async (email) => {
  try {
    // Get the user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    
    if (!userRecord) {
      console.error('User not found in Firebase Authentication');
      return;
    }

    // Create the user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email: email,
      name: email.split('@')[0], // Default name from email
      role: 'user', // Default role
      createdAt: new Date().toISOString()
    });

    console.log(`Successfully created Firestore document for user: ${email}`);
  } catch (error) {
    console.error('Error adding missing user:', error.message);
    throw error;
  }
};

module.exports = {
  addMissingUser
};
