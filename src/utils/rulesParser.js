import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import fs from 'fs';
import path from 'path';

const DEFAULT_PERMISSIONS = {
  admin: {
    facilities: { read: true, write: true, create: true, update: true, delete: true },
    user_facilities: { read: true, write: true, create: true, update: true, delete: true },
    users: { read: true, write: true, create: true, update: true, delete: true },
    patients: { read: true, write: true, create: true, update: true, delete: true },
    visits: { read: true, write: true, create: true, update: true, delete: true },
    appointments: { read: true, write: true, create: true, update: true, delete: true },
    prescriptions: { read: true, write: true, create: true, update: true, delete: true },
    messages: { read: true, write: true, create: true, update: true, delete: true },
    messageThreads: { read: true, write: true, create: true, update: true, delete: true }
  },
  facility_admin: {
    facilities: { read: true, write: false, create: false, update: true, delete: false },
    user_facilities: { read: true, write: true, create: true, update: true, delete: true },
    users: { read: true, write: false, create: false, update: true, delete: false },
    patients: { read: true, write: true, create: true, update: true, delete: false },
    visits: { read: true, write: true, create: true, update: true, delete: false },
    appointments: { read: true, write: true, create: true, update: true, delete: false },
    prescriptions: { read: true, write: true, create: true, update: true, delete: false },
    messages: { read: true, write: true, create: true, update: true, delete: false },
    messageThreads: { read: true, write: true, create: true, update: true, delete: false }
  },
  doctor: {
    facilities: { read: true, write: false, create: false, update: false, delete: false },
    user_facilities: { read: true, write: false, create: false, update: false, delete: false },
    users: { read: true, write: false, create: false, update: false, delete: false },
    patients: { read: true, write: true, create: false, update: true, delete: false },
    visits: { read: true, write: true, create: true, update: true, delete: false },
    appointments: { read: true, write: true, create: true, update: true, delete: false },
    prescriptions: { read: true, write: true, create: true, update: true, delete: false },
    messages: { read: true, write: true, create: true, update: true, delete: false },
    messageThreads: { read: true, write: true, create: true, update: true, delete: false }
  },
  nurse: {
    facilities: { read: true, write: false, create: false, update: false, delete: false },
    user_facilities: { read: true, write: false, create: false, update: false, delete: false },
    users: { read: true, write: false, create: false, update: false, delete: false },
    patients: { read: true, write: true, create: false, update: true, delete: false },
    visits: { read: true, write: true, create: true, update: true, delete: false },
    appointments: { read: true, write: true, create: true, update: true, delete: false },
    prescriptions: { read: true, write: false, create: false, update: false, delete: false },
    messages: { read: true, write: true, create: true, update: true, delete: false },
    messageThreads: { read: true, write: true, create: true, update: true, delete: false }
  }
};

// Function to get default permissions for a role
const getDefaultPermissions = async (role) => {
  try {
    // First try to get from defaultpermissions collection
    const defaultPermRef = doc(db, 'defaultpermissions', role);
    const defaultPermDoc = await getDoc(defaultPermRef);
    
    if (defaultPermDoc.exists()) {
      return defaultPermDoc.data();
    }
    
    // Fall back to hardcoded defaults
    return DEFAULT_PERMISSIONS[role] || {};
  } catch (error) {
    console.error('Error getting default permissions:', error);
    return DEFAULT_PERMISSIONS[role] || {};
  }
};

// Function to merge existing permissions from Firestore with defaults
export const mergePermissions = async () => {
  try {
    // Get existing permissions from rolepermissions collection
    const permissionsRef = collection(db, 'rolepermissions');
    const snapshot = await getDocs(permissionsRef);
    const existingPermissions = {};
    
    snapshot.forEach(doc => {
      existingPermissions[doc.id] = doc.data();
    });

    // Get default permissions for each role and merge
    const roles = ['admin', 'facility_admin', 'doctor', 'nurse'];
    const mergedPermissions = {};

    for (const role of roles) {
      const defaultPerms = await getDefaultPermissions(role);
      mergedPermissions[role] = {
        ...defaultPerms,
        ...existingPermissions[role]
      };
    }

    return mergedPermissions;
  } catch (error) {
    console.error('Error merging permissions:', error);
    return DEFAULT_PERMISSIONS; // Fallback to hardcoded defaults
  }
};

// Function to parse the rules file and extract permissions
const parseRules = (rulesContent) => {
  const permissions = {
    admin: {},
    facility_admin: {},
    doctor: {},
    nurse: {}
  };

  const collections = [
    'facilities',
    'user_facilities',
    'users',
    'patients',
    'visits',
    'appointments',
    'prescriptions',
    'messages',
    'messageThreads'
  ];

  const operations = ['read', 'write', 'create', 'update', 'delete'];

  // Helper function to check if a rule string indicates permission
  const hasPermission = (ruleString, role, operation) => {
    const rolePatterns = {
      admin: /isAdmin\(\)/,
      facility_admin: /isFacilityAdmin\(\)/,
      doctor: /isDoctor\(\)/,
      nurse: /isNurse\(\)/
    };

    const operationPatterns = {
      read: /allow read:/,
      write: /allow write:/,
      create: /allow create:/,
      update: /allow update:/,
      delete: /allow delete:/
    };

    return rolePatterns[role].test(ruleString) && operationPatterns[operation].test(ruleString);
  };

  // Parse each collection's rules
  collections.forEach(collection => {
    const collectionMatch = rulesContent.match(new RegExp(`match /${collection}/\\{[^}]+\\} \\{([^}]+)\\}`, 's'));
    if (collectionMatch) {
      const collectionRules = collectionMatch[1];

      Object.keys(permissions).forEach(role => {
        permissions[role][collection] = {};
        operations.forEach(operation => {
          permissions[role][collection][operation] = hasPermission(collectionRules, role, operation);
        });
      });
    }
  });

  return permissions;
};

// Function to update the defaultpermissions collection
const updateDefaultPermissions = async (permissions) => {
  try {
    for (const [role, rolePermissions] of Object.entries(permissions)) {
      await setDoc(doc(db, 'defaultpermissions', role), {
        ...rolePermissions,
        _metadata: {
          updatedAt: new Date().toISOString(),
          source: 'firestore.rules',
          version: '1.0'
        }
      });
    }
    console.log('Successfully updated default permissions');
  } catch (error) {
    console.error('Error updating default permissions:', error);
    throw error;
  }
};

// Main function to read rules and update permissions
export const updatePermissionsFromRules = async () => {
  try {
    const rulesPath = path.join(process.cwd(), 'firestore.rules');
    const rulesContent = fs.readFileSync(rulesPath, 'utf8');
    const permissions = parseRules(rulesContent);
    await updateDefaultPermissions(permissions);
    return permissions;
  } catch (error) {
    console.error('Error updating permissions from rules:', error);
    throw error;
  }
};

export default getDefaultPermissions; 