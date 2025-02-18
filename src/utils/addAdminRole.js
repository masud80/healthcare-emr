import { auth, db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

export const addAdminRole = async () => {
  try {
    // Admin user's UID from auth-users.json
    const adminUid = "y08uWeJoGTakEL68AEhcakE0FOn1";
    
    // Create or update the admin user document in Firestore
    await setDoc(doc(db, 'users', adminUid), {
      email: 'admin@healthcare.com',
      role: 'admin',
      name: 'Admin User'
    });
    
    console.log('Admin role document created successfully');
  } catch (error) {
    console.error('Error creating admin role:', error);
    throw error;
  }
};
