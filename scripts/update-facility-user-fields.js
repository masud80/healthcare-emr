const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function updateFacilityUserFields() {
  try {
    const facilitiesRef = db.collection('facilities');
    const facilitiesSnapshot = await facilitiesRef.get();

    console.log(`Found ${facilitiesSnapshot.size} facilities to update...`);

    for (const doc of facilitiesSnapshot.docs) {
      const facility = doc.data();
      const connectedUserIds = facility.connectedUserIds || [];
      
      // Update the facility to use assignedUsers field
      await facilitiesRef.doc(doc.id).update({
        assignedUsers: connectedUserIds,
        // Keep connectedUserIds for backward compatibility
        connectedUserIds: connectedUserIds
      });

      console.log(`Updated facility ${doc.id} with ${connectedUserIds.length} users`);
    }

    console.log('Successfully updated all facilities');
  } catch (error) {
    console.error('Error updating facilities:', error);
  }
}

// Run the update
updateFacilityUserFields()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
