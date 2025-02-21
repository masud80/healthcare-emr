const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const refreshAdminToken = async (email) => {
  try {
    // Get the user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    
    if (!userRecord) {
      throw new Error('User not found in Firebase Authentication');
    }

    // Verify admin claim is set
    const customClaims = userRecord.customClaims || {};
    if (!customClaims.admin) {
      // Set admin custom claim if not already set
      await admin.auth().setCustomUserClaims(userRecord.uid, {
        admin: true
      });
      console.log('Admin claim set for user:', email);
    }

    // Force token refresh
    await admin.auth().revokeRefreshTokens(userRecord.uid);
    console.log('Successfully revoked refresh tokens for user:', email);
    console.log('Please sign out and sign back in to get the updated admin privileges');

  } catch (error) {
    console.error('Error refreshing admin token:', error.message);
    throw error;
  }
};

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address as an argument');
  process.exit(1);
}

refreshAdminToken(email)
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to refresh admin token:', error);
    process.exit(1);
  });
