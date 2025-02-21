const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// List of random first names
const firstNames = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
  'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia',
  'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander'
];

// Function to get random item from array
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Function to get random date of birth between 1950 and 2005
const getRandomDOB = () => {
  const start = new Date('1950-01-01');
  const end = new Date('2005-12-31');
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return randomDate.toISOString().split('T')[0];
};

// Function to get random blood type
const getRandomBloodType = () => {
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  return getRandomItem(bloodTypes);
};

// Function to create a patient
const createPatient = (facilityId, facilityName) => {
  const firstName = getRandomItem(firstNames);
  const lastName = facilityName;

  return {
    name: `${firstName} ${lastName}`,
    dateOfBirth: getRandomDOB(),
    gender: getRandomItem(['male', 'female']),
    contact: `555-${Math.floor(1000 + Math.random() * 9000)}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    address: `${Math.floor(100 + Math.random() * 900)} Main St, City, State`,
    emergencyContact: {
      name: `Emergency ${firstName}`,
      relationship: getRandomItem(['Parent', 'Spouse', 'Sibling']),
      phone: `555-${Math.floor(1000 + Math.random() * 9000)}`
    },
    bloodType: getRandomBloodType(),
    allergies: [],
    chronicConditions: [],
    facilityId: facilityId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

const addSamplePatients = async () => {
  try {
    // Get all facilities
    const facilitiesSnapshot = await db.collection('facilities').get();
    
    for (const facilityDoc of facilitiesSnapshot.docs) {
      const facilityData = facilityDoc.data();
      const facilityId = facilityDoc.id;
      const facilityName = facilityData.name;
      
      console.log(`Adding patients for facility: ${facilityName}`);
      
      // Create two patients for each facility
      for (let i = 0; i < 2; i++) {
        const patientData = createPatient(facilityId, facilityName);
        await db.collection('patients').add(patientData);
        console.log(`Added patient: ${patientData.name}`);
      }
    }
    
    console.log('Successfully added sample patients');
  } catch (error) {
    console.error('Error adding sample patients:', error);
  } finally {
    process.exit();
  }
};

// Run the script
addSamplePatients();
