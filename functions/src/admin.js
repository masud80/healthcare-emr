const admin = require('firebase-admin');

// Initialize the primary project (current project)
const primaryApp = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  // Or use a service account:
  // credential: admin.credential.cert(require('../../serviceAccountKey.json')),
}, 'primary');

// Initialize the secondary project
const secondaryApp = admin.initializeApp({
  credential: admin.credential.cert(require('../../secondProjectServiceAccountKey.json')),
  databaseURL: 'https://your-second-project-id.firebaseio.com',
  storageBucket: 'your-second-project-id.appspot.com'
}, 'secondary');

// Export Firestore instances for both projects
const primaryDb = primaryApp.firestore();
const secondaryDb = secondaryApp.firestore();

// Export Auth instances for both projects
const primaryAuth = primaryApp.auth();
const secondaryAuth = secondaryApp.auth();

// Export Storage instances for both projects
const primaryStorage = primaryApp.storage();
const secondaryStorage = secondaryApp.storage();

module.exports = {
  primaryApp,
  secondaryApp,
  primaryDb,
  secondaryDb,
  primaryAuth,
  secondaryAuth,
  primaryStorage,
  secondaryStorage
}; 