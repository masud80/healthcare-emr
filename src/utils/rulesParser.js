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
    messageThreads: { read: true, write: true, create: true, update: true, delete: true },
    bills: { read: true, write: true, create: true, update: true, delete: true }
  },
  facility_admin: {
    facilities: { read: true, write: false, create: false, update: true, delete: false },
    user_facilities: { read: true, write: true, create: true, update: true, delete: true },
    users: { read: true, write: false, create: false, update: true, delete: false },
    patients: { read: true, write: true, create: true, update: true, delete: false },
    visits: { read: true, write: true, create: true, update: true, delete: true },
    appointments: { read: true, write: true, create: true, update: true, delete: true },
    prescriptions: { read: true, write: true, create: true, update: true, delete: true },
    messages: { read: true, write: true, create: true, update: true, delete: true },
    messageThreads: { read: true, write: true, create: true, update: true, delete: true },
    bills: { read: true, write: true, create: true, update: true, delete: true }
  },
  doctor: {
    facilities: { read: true, write: false, create: false, update: false, delete: false },
    user_facilities: { read: true, write: false, create: false, update: false, delete: false },
    users: { read: false, write: false, create: false, update: false, delete: false },
    patients: { read: true, write: true, create: false, update: true, delete: false },
    visits: { read: true, write: true, create: true, update: true, delete: false },
    appointments: { read: true, write: true, create: true, update: true, delete: false },
    prescriptions: { read: true, write: true, create: true, update: true, delete: false },
    messages: { read: true, write: true, create: true, update: true, delete: false },
    messageThreads: { read: true, write: true, create: true, update: true, delete: false },
    bills: { read: true, write: false, create: false, update: false, delete: false }
  },
  nurse: {
    facilities: { read: true, write: false, create: false, update: false, delete: false },
    user_facilities: { read: true, write: false, create: false, update: false, delete: false },
    users: { read: false, write: false, create: false, update: false, delete: false },
    patients: { read: true, write: true, create: false, update: true, delete: false },
    visits: { read: true, write: true, create: true, update: true, delete: false },
    appointments: { read: true, write: true, create: true, update: true, delete: false },
    prescriptions: { read: true, write: true, create: true, update: true, delete: false },
    messages: { read: true, write: true, create: true, update: true, delete: false },
    messageThreads: { read: true, write: true, create: true, update: true, delete: false },
    bills: { read: true, write: false, create: false, update: false, delete: false }
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

// Helper function to check if a rule string indicates permission
const hasPermission = (ruleString, role, operation) => {
  const operationPatterns = {
    read: /allow\s+read\s*:/,
    write: /allow\s+write\s*:/,
    create: /allow\s+create(?:\s*,\s*update\s*,\s*delete)?\s*:/,
    update: /allow\s+(?:create\s*,\s*)?update(?:\s*,\s*delete)?\s*:/,
    delete: /allow\s+(?:create\s*,\s*update\s*,\s*)?delete\s*:/
  };

  // Check if the operation is allowed
  const operationMatch = operationPatterns[operation].test(ruleString);
  if (!operationMatch) return false;

  // Extract the condition after "if"
  const conditionMatch = ruleString.match(new RegExp(`allow\\s+(?:${operation}|[\\w\\s,]+${operation}[\\w\\s,]*)\\s*:\\s*if\\s+([^;]+)`, 's'));
  if (!conditionMatch) return false;

  const condition = conditionMatch[1];

  // Split by OR operator and check each clause
  const clauses = condition.split(/\s*\|\|\s*/);
  
  // Admin has access if isAdmin() appears in any clause
  if (role === 'admin' && condition.includes('isAdmin()')) {
    return true;
  }

  // For other roles, check each clause for their function
  for (const clause of clauses) {
    switch (role) {
      case 'facility_admin':
        if (clause.includes('isFacilityAdmin()')) return true;
        break;
      case 'doctor':
        if (clause.includes('isDoctor()')) return true;
        break;
      case 'nurse':
        if (clause.includes('isNurse()')) return true;
        break;
    }
  }

  return false;
};

// Function to parse the rules file and extract permissions
const parseRules = (rulesContent) => {
  const collections = ['facilities', 'user_facilities', 'users', 'patients', 'visits', 'appointments', 'prescriptions', 'messages', 'messageThreads', 'bills'];
  const roles = ['admin', 'facility_admin', 'doctor', 'nurse'];
  const operations = ['read', 'write', 'create', 'update', 'delete'];

  const permissions = {};

  // Initialize permissions with defaults
  roles.forEach(role => {
    permissions[role] = {};
    collections.forEach(collection => {
      permissions[role][collection] = {
        read: false,
        write: false,
        create: false,
        update: false,
        delete: false
      };
    });
  });

  // Parse rules for each collection
  collections.forEach(collection => {
    // Find the collection rules block
    const collectionMatch = rulesContent.match(new RegExp(`match\\s*/${collection}/\\{[^}]*\\}\\s*\\{([^}]+)\\}`, 'gs'));
    if (!collectionMatch) return;

    const collectionRules = collectionMatch[0];

    // For each role and operation, check if it's allowed
    roles.forEach(role => {
      operations.forEach(operation => {
        if (hasPermission(collectionRules, role, operation)) {
          permissions[role][collection][operation] = true;
        }
      });
    });
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