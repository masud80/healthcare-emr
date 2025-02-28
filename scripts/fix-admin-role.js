const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function fixAdminRole() {
  try {
    // Admin user's UID from auth-users.json
    const adminUid = "y08uWeJoGTakEL68AEhcakE0FOn1";
    
    // Create or update the admin user document in Firestore
    await db.collection('users').doc(adminUid).set({
      email: 'admin@healthcare.com',
      role: 'admin',
      name: 'Admin User'
    }, { merge: true });
    
    console.log('Admin role document updated successfully');

    // Also update user_facilities to ensure admin has access to all facilities
    const facilitiesSnapshot = await db.collection('facilities').get();
    const facilities = facilitiesSnapshot.docs.map(doc => doc.id);

    // Add admin to user_facilities collection with all facilities
    await db.collection('user_facilities').doc(adminUid).set({
      userId: adminUid,
      facilities: facilities,
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log('Admin facilities updated successfully');
  } catch (error) {
    console.error('Error updating admin role:', error);
  }
}

fixAdminRole().then(() => process.exit()); 