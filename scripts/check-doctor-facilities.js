const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const doctorId = 'y08Vx7ZE23UaAOb41nIctLaqA6l1'; // doctor@healthcare.com ID

async function checkDoctorFacilities() {
  console.log('Checking facilities assigned to doctor@healthcare.com...\n');

  // Get all facilities
  const facilitiesRef = db.collection('facilities');
  const facilitiesSnapshot = await facilitiesRef.get();
  
  // Filter facilities where doctor is in connectedUserIds
  const doctorFacilities = [];
  facilitiesSnapshot.forEach(doc => {
    const facility = doc.data();
    if (facility.connectedUserIds && facility.connectedUserIds.includes(doctorId)) {
      doctorFacilities.push({
        id: doc.id,
        ...facility
      });
    }
  });

  console.log(`Found ${doctorFacilities.length} assigned facilities:`);
  doctorFacilities.forEach(facility => {
    console.log(`- ${facility.name} (${facility.id})`);
    console.log(`  Type: ${facility.type}`);
    console.log(`  Location: ${facility.location}`);
    console.log(`  Services: ${facility.services}`);
    console.log('');
  });

  // Check user_facilities collection
  const userFacilitiesRef = db.collection('user_facilities');
  const userFacilitiesSnapshot = await userFacilitiesRef.where('userId', '==', doctorId).get();
  
  console.log('\nUser-Facilities assignments:');
  userFacilitiesSnapshot.forEach(doc => {
    console.log(`- Assignment ID: ${doc.id}`);
    console.log(`  Facility ID: ${doc.data().facilityId}`);
    console.log(`  Created At: ${doc.data().createdAt}`);
    console.log('');
  });
}

// Run the check
async function main() {
  try {
    await checkDoctorFacilities();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
