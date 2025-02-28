const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Default collections and operations to check
const roles = ['admin', 'facility_admin', 'doctor', 'nurse'];
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

// Function to parse the rules file and extract permissions
const parseRules = (rulesContent) => {
  const permissions = {
    admin: {},
    facility_admin: {},
    doctor: {},
    nurse: {}
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
      await db.collection('defaultpermissions').doc(role).set({
        ...rolePermissions,
        _metadata: {
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
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

async function updatePermissions() {
  try {
    console.log('Starting permissions update from firestore.rules...');
    
    // Read the rules file
    const rulesPath = path.join(__dirname, '..', 'firestore.rules');
    const rulesContent = fs.readFileSync(rulesPath, 'utf8');
    
    // Parse and update permissions
    const permissions = parseRules(rulesContent);
    await updateDefaultPermissions(permissions);
    
    console.log('Successfully updated permissions:', permissions);
    process.exit(0);
  } catch (error) {
    console.error('Failed to update permissions:', error);
    process.exit(1);
  }
}

// Run the update
updatePermissions(); 