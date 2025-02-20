const admin = require('firebase-admin');
const serviceAccount = require('../../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const setAdminClaim = async (email) => {
  try {
    // Get the user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    
    if (!userRecord) {
      throw new Error('User not found in Firebase Authentication');
    }

    // Set admin custom claim
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: true
    });

    // Update user document in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).update({
      role: 'admin'
    });

    console.log(`Successfully set admin claim for user: ${email}`);
  } catch (error) {
    console.error('Error setting admin claim:', error.message);
    throw error;
  }
};

module.exports = {
  setAdminClaim
};
