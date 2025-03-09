# Firebase Cross-Project Integration

This document outlines how to integrate multiple Firebase projects within the same application.

## Overview

There are several approaches to integrate multiple Firebase projects:

1. **Firebase Admin SDK (Server-side)** - The recommended approach for secure cross-project access
2. **Multiple Firebase Apps (Client-side)** - For client-side access to multiple projects
3. **Firebase Extensions** - For specific use cases with pre-built solutions
4. **Custom API** - For more complex integration scenarios

## 1. Firebase Admin SDK (Recommended)

The Firebase Admin SDK allows you to initialize multiple Firebase apps in your server-side code, each pointing to a different Firebase project.

### Setup Instructions

1. **Generate Service Account Keys**:
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate New Private Key" for each project
   - Save the JSON files securely in your project (do not commit to version control)

2. **Initialize Multiple Admin Apps**:
   ```javascript
   // In functions/src/admin.js
   const admin = require('firebase-admin');

   // Initialize the primary project
   const primaryApp = admin.initializeApp({
     credential: admin.credential.cert(require('../../primaryProjectServiceAccountKey.json')),
   }, 'primary');

   // Initialize the secondary project
   const secondaryApp = admin.initializeApp({
     credential: admin.credential.cert(require('../../secondProjectServiceAccountKey.json')),
   }, 'secondary');

   // Export Firestore instances for both projects
   const primaryDb = primaryApp.firestore();
   const secondaryDb = secondaryApp.firestore();

   module.exports = { primaryDb, secondaryDb };
   ```

3. **Use in Cloud Functions**:
   ```javascript
   // In functions/src/index.js
   const functions = require('firebase-functions');
   const { primaryDb, secondaryDb } = require('./admin');

   exports.syncData = functions.firestore
     .document('collection/{docId}')
     .onCreate(async (snapshot, context) => {
       // Read from primary project
       const data = snapshot.data();
       
       // Write to secondary project
       await secondaryDb.collection('collection').doc(context.params.docId).set(data);
       
       return { success: true };
     });
   ```

## 2. Multiple Firebase Apps (Client-side)

For client-side access to multiple Firebase projects:

```javascript
// Initialize the primary app (default)
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const primaryApp = initializeApp({
  apiKey: "...",
  authDomain: "...",
  projectId: "..."
});

// Initialize the secondary app
const secondaryAppConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "..."
};
const secondaryApp = initializeApp(secondaryAppConfig, 'secondary');

// Get Firestore instances
const primaryDb = getFirestore(primaryApp);
const secondaryDb = getFirestore(secondaryApp);

// Use them separately
const primaryCollection = collection(primaryDb, 'collection');
const secondaryCollection = collection(secondaryDb, 'collection');
```

## 3. Firebase Extensions

Firebase offers pre-built extensions that can help with specific cross-project scenarios:

- **Firestore Cross-Project Replicator**: Automatically replicates Firestore data between projects
- **Storage Cross-Project Mover**: Moves files between Storage buckets in different projects

Check the [Firebase Extensions Marketplace](https://firebase.google.com/products/extensions) for available options.

## 4. Custom API Approach

For more complex integration needs, you can create a custom API layer:

1. Create an API in one project using Cloud Functions
2. Secure the API with Firebase Auth tokens or API keys
3. Call the API from the other project

This approach gives you full control over the integration but requires more development effort.

## Security Considerations

- Keep service account keys secure and never commit them to version control
- Use the principle of least privilege when setting up cross-project access
- Consider using Firebase Security Rules to restrict access at the data level
- Monitor cross-project access for unusual patterns

## Troubleshooting

- **CORS Issues**: Ensure proper CORS configuration when making cross-project requests
- **Authentication**: Make sure authentication tokens are properly passed between projects
- **Quota Limits**: Be aware that each project has its own quota limits

## Additional Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firebase Multi-Project Applications](https://firebase.google.com/docs/projects/multiprojects)
- [Firebase Security Rules](https://firebase.google.com/docs/rules) 