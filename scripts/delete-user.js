const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const email = process.argv[2];

if (!email) {
  console.error('Please provide email');
  console.error('Usage: node delete-user.js <email>');
  process.exit(1);
}

async function deleteUser() {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    
    // Delete from Firestore first
    await admin.firestore().collection('users').doc(userRecord.uid).delete();
    
    // Delete from Authentication
    await admin.auth().deleteUser(userRecord.uid);
    
    console.log(`Successfully deleted user: ${email}`);
    process.exit(0);
  } catch (error) {
    console.error('Error deleting user:', error);
    process.exit(1);
  }
}

deleteUser();
