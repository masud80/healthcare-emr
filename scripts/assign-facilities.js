const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Sample facilities data
const sampleFacilities = [
  {
    name: 'Central Hospital',
    type: 'Hospital',
    location: '123 Healthcare Ave',
    capacity: '500',
    status: 'active',
    services: 'Emergency, Surgery, ICU',
    contact: '555-0100'
  },
  {
    name: 'Wellness Clinic',
    type: 'Clinic',
    location: '456 Medical Blvd',
    capacity: '100',
    status: 'active',
    services: 'Primary Care, Pediatrics',
    contact: '555-0200'
  },
  {
    name: 'Specialty Care Center',
    type: 'Specialty',
    location: '789 Specialist St',
    capacity: '200',
    status: 'active',
    services: 'Cardiology, Orthopedics',
    contact: '555-0300'
  }
];

// Users to assign facilities to (from auth-users.json)
const users = [
  { email: 'nurse@healthcare.com', id: 'BYcRtIAz0GSdeiRG4kuX0wU2Se73' },
  { email: 'doctor@healthcare.com', id: 'y08Vx7ZE23UaAOb41nIctLaqA6l1' },
  { email: 'doctor2@healthcare.com', id: 'ElePKObPezT2AWYVOCp35LzGAkU2' },
  { email: 'admin@healthcare.com', id: 'y08uWeJoGTakEL68AEhcakE0FOn1' }
];

async function createFacilities() {
  const facilitiesRef = db.collection('facilities');
  const facilitiesSnapshot = await facilitiesRef.get();

  if (facilitiesSnapshot.empty) {
    console.log('Creating sample facilities...');
    for (const facility of sampleFacilities) {
      await facilitiesRef.add({
        ...facility,
        adminIds: [],
        connectedUserIds: []
      });
    }
    console.log('Sample facilities created successfully');
  } else {
    console.log('Facilities already exist, skipping creation');
  }
}

async function assignFacilitiesToUsers() {
  const facilitiesRef = db.collection('facilities');
  const facilitiesSnapshot = await facilitiesRef.get();
  const facilities = facilitiesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  for (const user of users) {
  // For admin user, assign all facilities, for others assign 1-2 random facilities
  const selectedFacilities = user.email === 'admin@healthcare.com' 
    ? facilities 
    : facilities.slice(0, Math.floor(Math.random() * 2) + 1);

    console.log(`Assigning ${selectedFacilities.length} facilities to ${user.email}`);

    // Update each selected facility
    for (const facility of selectedFacilities) {
      const facilityRef = facilitiesRef.doc(facility.id);
      
      // Add user to connectedUserIds if not already present
      const connectedUserIds = new Set(facility.connectedUserIds || []);
      connectedUserIds.add(user.id);

      // Update the facility
      await facilityRef.update({
        connectedUserIds: Array.from(connectedUserIds)
      });

      // Add to user_facilities collection
      await db.collection('user_facilities').add({
        userId: user.id,
        facilityId: facility.id,
        createdAt: new Date().toISOString()
      });

      console.log(`Assigned facility "${facility.name}" to ${user.email}`);
    }
  }
}

// Run the assignment process
async function main() {
  try {
    await createFacilities();
    await assignFacilitiesToUsers();
    console.log('Completed assigning facilities to users');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
