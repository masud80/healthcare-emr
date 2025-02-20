const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const verifyAdmin = async (email) => {
  try {
    // Get the user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    
    if (!userRecord) {
      console.log('User not found');
      return;
    }

    // Get custom claims
    const customClaims = userRecord.customClaims;
    console.log('User ID:', userRecord.uid);
    console.log('Custom Claims:', customClaims);
    
    // Get Firestore user document
    const userDoc = await admin.firestore().collection('users').doc(userRecord.uid).get();
    console.log('Firestore User Data:', userDoc.data());

  } catch (error) {
    console.error('Error verifying admin status:', error);
  }
};

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address');
  process.exit(1);
}

verifyAdmin(email);
