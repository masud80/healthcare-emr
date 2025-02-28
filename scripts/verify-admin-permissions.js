const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const verifyAndFixAdminPermissions = async () => {
  try {
    const email = 'admin@healthcare.com';
    
    // 1. Get the user from Auth
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log('Found user:', userRecord.uid);
    
    // 2. Set admin custom claim
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    console.log('Set admin custom claim');
    
    // 3. Update Firestore user document
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email: email,
      role: 'admin',
      name: 'Admin User',
      uid: userRecord.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log('Updated Firestore user document');

    // 4. Create a test audit log to verify permissions
    await admin.firestore().collection('audit').add({
      userId: userRecord.uid,
      action: 'VERIFY_ADMIN_PERMISSIONS',
      targetType: 'SYSTEM',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      details: {
        message: 'Verifying admin permissions'
      }
    });
    console.log('Created test audit log');

    // 5. Verify the changes
    const updatedUser = await admin.auth().getUser(userRecord.uid);
    console.log('Updated custom claims:', updatedUser.customClaims);
    
    const updatedDoc = await admin.firestore().collection('users').doc(userRecord.uid).get();
    console.log('Updated Firestore data:', updatedDoc.data());
    
    console.log('Admin permissions verification complete');
  } catch (error) {
    console.error('Error:', error);
  }
};

verifyAndFixAdminPermissions(); 