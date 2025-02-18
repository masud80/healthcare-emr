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

export const initializeTestData = async () => {
  try {
    let doctorIds = {};
    let patientIds = {};

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
          
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
          if (userDoc.exists() && userDoc.data().role === 'doctor') {
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
