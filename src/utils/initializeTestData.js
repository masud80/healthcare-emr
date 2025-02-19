import { auth, db } from '../firebase/config';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithEmailAndPassword as signIn
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  collection, 
  addDoc,
  getDoc
} from 'firebase/firestore';

const testFacilities = [
  {
    name: 'Central Hospital',
    address: '789 Hospital Drive, Anytown, USA',
    phone: '555-0001',
    type: 'hospital'
  },
  {
    name: 'Westside Clinic',
    address: '456 Medical Plaza, Anytown, USA',
    phone: '555-0002',
    type: 'clinic'
  },
  {
    name: 'Eastside Medical Center',
    address: '123 Healthcare Ave, Anytown, USA',
    phone: '555-0003',
    type: 'hospital'
  }
];

const testUsers = [
  {
    email: 'admin@healthcare.com',
    password: 'admin123',
    role: 'admin',
    name: 'Admin User'
  },
  {
    email: 'doctor@healthcare.com',
    password: 'doctor123',
    role: 'doctor',
    name: 'Dr. John Smith'
  },
  {
    email: 'doctor2@healthcare.com',
    password: 'doctor123',
    role: 'doctor',
    name: 'Dr. Emily Brown'
  },
  {
    email: 'nurse@healthcare.com',
    password: 'nurse123',
    role: 'nurse',
    name: 'Nurse Sarah Johnson'
  }
];

const testPatients = [
  {
    name: 'James Wilson',
    dateOfBirth: '1985-03-15',
    gender: 'Male',
    contact: '555-0123',
    email: 'james.wilson@email.com',
    address: '123 Main St, Anytown, USA',
    emergencyContact: {
      name: 'Mary Wilson',
      relationship: 'Spouse',
      phone: '555-0124'
    },
    bloodType: 'A+',
    allergies: ['Penicillin', 'Peanuts'],
    chronicConditions: ['Hypertension'],
    visits: [
      {
        date: '2023-12-01',
        reason: 'Annual checkup',
        doctor: 'Dr. John Smith'
      }
    ],
    notes: [
      {
        content: 'Patient shows good progress with blood pressure management',
        timestamp: '2023-12-01T10:30:00',
        author: 'doctor'
      }
    ]
  },
  {
    name: 'Emily Brown',
    dateOfBirth: '1990-07-22',
    gender: 'Female',
    contact: '555-0125',
    email: 'emily.brown@email.com',
    address: '456 Oak Ave, Anytown, USA',
    emergencyContact: {
      name: 'Robert Brown',
      relationship: 'Father',
      phone: '555-0126'
    },
    bloodType: 'O-',
    allergies: ['Sulfa drugs'],
    chronicConditions: ['Asthma'],
    visits: [
      {
        date: '2023-11-15',
        reason: 'Asthma follow-up',
        doctor: 'Dr. John Smith'
      }
    ],
    notes: [
      {
        content: 'Prescribed new inhaler, scheduled follow-up in 3 months',
        timestamp: '2023-11-15T14:45:00',
        author: 'doctor'
      }
    ]
  }
];

const testAppointments = [
  {
    patientId: '',  // Will be set after patient creation
    patientName: 'James Wilson',
    doctorId: '',   // Will be set after doctor creation
    doctorName: 'Dr. John Smith',
    date: new Date('2024-03-20T10:00:00').toISOString(),
    purpose: 'Follow-up checkup',
    status: 'scheduled',
    notes: 'Regular blood pressure check',
    createdAt: new Date().toISOString()
  },
  {
    patientId: '',  // Will be set after patient creation
    patientName: 'Emily Brown',
    doctorId: '',   // Will be set after doctor creation
    doctorName: 'Dr. Emily Brown',
    date: new Date('2024-03-21T14:30:00').toISOString(),
    purpose: 'Asthma review',
    status: 'scheduled',
    notes: 'Seasonal asthma check',
    createdAt: new Date().toISOString()
  }
];

let facilityIds = {};

const assignFacilitiesToUser = async (userId, userRole, facilityIdsMap) => {
  const userFacilitiesRef = collection(db, 'user_facilities');
  
  if (userRole === 'admin') {
    // Admin has access to all facilities
    for (const facilityId of Object.values(facilityIdsMap)) {
      await addDoc(userFacilitiesRef, {
        userId: userId,
        facilityId: facilityId
      });
    }
  } else {
    // Other users get assigned to random facilities (1-2 facilities)
    const facilityIdList = Object.values(facilityIdsMap);
    const numFacilities = Math.floor(Math.random() * 2) + 1;
    const selectedFacilities = facilityIdList
      .sort(() => 0.5 - Math.random())
      .slice(0, numFacilities);
    
    for (const facilityId of selectedFacilities) {
      await addDoc(userFacilitiesRef, {
        userId: userId,
        facilityId: facilityId
      });
    }
  }
};

export const initializeTestData = async () => {
  try {
    let doctorIds = {};
    let patientIds = {};
    let facilityIds = {};

    // Create test facilities
    for (const facility of testFacilities) {
      try {
        const facilityDoc = await addDoc(collection(db, 'facilities'), {
          ...facility,
          createdAt: new Date().toISOString()
        });
        facilityIds[facility.name] = facilityDoc.id;
        console.log(`Added facility: ${facility.name}`);
      } catch (error) {
        console.error(`Error adding facility ${facility.name}:`, error.message);
      }
    }

    // Create or get test users
    for (const user of testUsers) {
      try {
        // Try to create new user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          user.email,
          user.password
        );

        // Add user role to Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: user.email,
          role: user.role,
          name: user.name
        });

        // Assign facilities to the user
        await assignFacilitiesToUser(userCredential.user.uid, user.role, facilityIds);

        // Store doctor IDs for appointments
        if (user.role === 'doctor') {
          doctorIds[user.name] = userCredential.user.uid;
        }

        console.log(`Created user: ${user.email}`);
      } catch (error) {
        // If user exists, sign in and get their ID
        if (error.code === 'auth/email-already-in-use') {
          console.log(`User exists: ${user.email}, getting ID...`);
          const userCredential = await signIn(auth, user.email, user.password);
          
          // Get user data from Firestore or create if doesn't exist
          const userRef = doc(db, 'users', userCredential.user.uid);
          const userDoc = await getDoc(userRef);
          
          if (!userDoc.exists()) {
            // Create user document if it doesn't exist
            await setDoc(userRef, {
              email: user.email,
              role: user.role,
              name: user.name
            });
            console.log(`Created Firestore document for: ${user.email}`);

            // Assign facilities to the user
            await assignFacilitiesToUser(userCredential.user.uid, user.role, facilityIds);
          }
          
          // Store doctor ID if applicable
          if (user.role === 'doctor') {
            doctorIds[user.name] = userCredential.user.uid;
          }
        } else {
          throw error;
        }
      }
    }

    // Sign in as admin to add patients and appointments
    await signInWithEmailAndPassword(auth, 'admin@healthcare.com', 'admin123');

    // Add test patients
    for (const patient of testPatients) {
      const patientDoc = await addDoc(collection(db, 'patients'), {
        ...patient,
        createdAt: new Date().toISOString()
      });
      patientIds[patient.name] = patientDoc.id;
      console.log(`Added patient: ${patient.name}`);
    }

    // Add test appointments
    for (const appointment of testAppointments) {
      // Set the correct IDs based on names
      appointment.patientId = patientIds[appointment.patientName];
      appointment.doctorId = doctorIds[appointment.doctorName];

      if (!appointment.patientId || !appointment.doctorId) {
        console.error(`Missing IDs for appointment: ${appointment.patientName} with ${appointment.doctorName}`);
        continue;
      }

      await addDoc(collection(db, 'appointments'), appointment);
      console.log(`Added appointment for: ${appointment.patientName}`);
    }

    console.log('Test data initialization complete!');
  } catch (error) {
    console.error('Error initializing test data:', error);
    throw error;
  }
};

// Function to initialize the database with test data
export const initializeDatabase = async () => {
  try {
    console.log('Starting database initialization...');
    await initializeTestData();
    console.log('Database initialization complete!');
  } catch (error) {
    console.error('Error during database initialization:', error);
    throw error;
  }
};
