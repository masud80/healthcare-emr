# Hospice EMR Frontend Architecture

## Overview

This document outlines the recommended architecture for implementing a separate frontend application for the hospice EMR while connecting to the same Firebase backend as the regular healthcare EMR.

## Architecture Approach

### Separate Codebase, Shared Backend

![Architecture Diagram](https://mermaid.ink/img/pako:eNqFkk1PwzAMhv9KlBOgSf0BHCZtQkgcEBLixGVKXTdis6RJ04yh_XecrmODcSCXOH7fR7YT75QbK6hPtfMWXjwqtBYeHJYWHFoTIQxKNOgHCMrCHa6wQRXhFb1Hb0A5hAGVQRg9GgcGYYTRYYMwYYOqQRiVRTWiNzBBGNFYGBGGUVkMCKOyGBEGZTEhjMpiRhiUxYIwKIsVYVAWG8KgLHaEQVnsCIOyOCAMyuKIMCiLE8KgLM4Ig7K4IAzK4oowKIs3hEFZvCMMyuIDYVAWnwiDsvhCGJTFN8KgLH4QBmXxizAoi7-_LJZ_WfwY8Vc4pVRQX1TGdZXxTd3UZb1rm6osmrJp2qoqq7Zti6Ys9_u2rNqyLsqmaYq6KKq2rYq6bsq6-gNVmoqK?type=png)

1. **Separate Frontend Repositories**:
   - Regular EMR Frontend (existing)
   - Hospice EMR Frontend (new)

2. **Shared Firebase Backend**:
   - Single Firebase project
   - Prefixed collections for hospice data
   - Unified authentication system
   - Shared security rules

## Frontend Implementation

### Project Setup

1. **Create a New Repository** for the hospice EMR frontend
2. **Initialize with the Same Tech Stack** as the regular EMR for consistency:
   - React/Vue/Angular (match existing)
   - TypeScript
   - Same UI component library if possible

3. **Environment Configuration**:
   ```javascript
   // .env
   REACT_APP_FIREBASE_API_KEY=same_as_regular_emr
   REACT_APP_FIREBASE_AUTH_DOMAIN=same_as_regular_emr
   REACT_APP_FIREBASE_PROJECT_ID=same_as_regular_emr
   REACT_APP_FIREBASE_STORAGE_BUCKET=same_as_regular_emr
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=same_as_regular_emr
   REACT_APP_FIREBASE_APP_ID=same_as_regular_emr
   
   // Hospice-specific configuration
   REACT_APP_IS_HOSPICE=true
   REACT_APP_HOSPICE_COLLECTION_PREFIX="hospice_"
   ```

### Firebase Configuration

Create a Firebase configuration file similar to the regular EMR:

```javascript
// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
```

### Authentication

Use the same authentication system as the regular EMR, but with hospice-specific role checks:

```javascript
// src/hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRoles, setUserRoles] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Get user roles and permissions
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Check if user has hospice access
          if (!userData.hospiceAccess) {
            // Redirect to access denied or regular EMR
            window.location.href = process.env.REACT_APP_REGULAR_EMR_URL || '/access-denied';
            return;
          }
          
          setUserRoles(userData);
        }
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRoles,
    isHospiceStaff: userRoles?.hospiceAccess || false,
    isAdmin: userRoles?.role === 'admin',
    isHospicePhysician: userRoles?.role === 'doctor' && userRoles?.hospiceAccess,
    isHospiceNurse: userRoles?.role === 'nurse' && userRoles?.hospiceAccess,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
```

### Data Services

Create hospice-specific data services that use the prefixed collections:

```javascript
// src/services/hospicePatientService.js
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  orderBy,
  limit 
} from 'firebase/firestore';
import { db } from '../firebase/config';

const COLLECTION_NAME = 'hospice_patients';

export const getHospicePatients = async (filters = {}) => {
  try {
    let q = collection(db, COLLECTION_NAME);
    
    // Apply filters
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    if (filters.physicianId) {
      q = query(q, where('hospicePhysicianId', '==', filters.physicianId));
    }
    
    // Apply sorting
    q = query(q, orderBy('createdAt', 'desc'));
    
    // Apply pagination
    if (filters.limit) {
      q = query(q, limit(filters.limit));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting hospice patients:', error);
    throw error;
  }
};

export const getHospicePatient = async (patientId) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, patientId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      // Get the regular patient data as well
      const regularPatientId = docSnap.data().regularPatientId;
      const regularPatientDoc = await getDoc(doc(db, 'patients', regularPatientId));
      
      return {
        id: docSnap.id,
        ...docSnap.data(),
        regularPatientData: regularPatientDoc.exists() ? regularPatientDoc.data() : null
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting hospice patient:', error);
    throw error;
  }
};

export const createHospicePatient = async (patientData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...patientData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating hospice patient:', error);
    throw error;
  }
};

export const updateHospicePatient = async (patientId, patientData) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, patientId);
    await updateDoc(docRef, {
      ...patientData,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error updating hospice patient:', error);
    throw error;
  }
};

export const deleteHospicePatient = async (patientId) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, patientId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting hospice patient:', error);
    throw error;
  }
};
```

### Shared Components and Utilities

Consider creating a shared library for components and utilities used by both EMRs:

1. **Create a Shared Package**:
   ```
   my-emr-shared/
   ├── components/
   │   ├── Button.jsx
   │   ├── Card.jsx
   │   └── ...
   ├── utils/
   │   ├── dateUtils.js
   │   ├── formatters.js
   │   └── ...
   └── package.json
   ```

2. **Publish as a Private NPM Package** or use as a Git submodule

3. **Import in Both Projects**:
   ```javascript
   import { Button, Card } from 'my-emr-shared/components';
   import { formatDate } from 'my-emr-shared/utils';
   ```

## Routing and Navigation

Create a hospice-specific routing structure:

```javascript
// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/PatientList';
import PatientDetails from './pages/PatientDetails';
import CarePlan from './pages/CarePlan';
import VisitList from './pages/VisitList';
import VisitDetails from './pages/VisitDetails';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser, isHospiceStaff } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (!isHospiceStaff) {
    return <Navigate to="/access-denied" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/access-denied" element={<AccessDenied />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/patients" element={
            <ProtectedRoute>
              <PatientList />
            </ProtectedRoute>
          } />
          
          <Route path="/patients/:id" element={
            <ProtectedRoute>
              <PatientDetails />
            </ProtectedRoute>
          } />
          
          <Route path="/care-plans/:id" element={
            <ProtectedRoute>
              <CarePlan />
            </ProtectedRoute>
          } />
          
          <Route path="/visits" element={
            <ProtectedRoute>
              <VisitList />
            </ProtectedRoute>
          } />
          
          <Route path="/visits/:id" element={
            <ProtectedRoute>
              <VisitDetails />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

## Deployment Strategy

1. **Separate Deployment Pipelines**:
   - Regular EMR: `emr.example.com`
   - Hospice EMR: `hospice.example.com`

2. **Environment-Specific Configurations**:
   - Development: Points to dev Firebase project
   - Staging: Points to staging Firebase project
   - Production: Points to production Firebase project

3. **CI/CD Setup**:
   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy Hospice EMR
   
   on:
     push:
       branches: [main]
   
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         
         - name: Setup Node.js
           uses: actions/setup-node@v2
           with:
             node-version: '16'
             
         - name: Install dependencies
           run: npm ci
           
         - name: Build
           run: npm run build
           env:
             REACT_APP_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
             REACT_APP_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
             REACT_APP_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
             REACT_APP_FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_STORAGE_BUCKET }}
             REACT_APP_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
             REACT_APP_FIREBASE_APP_ID: ${{ secrets.FIREBASE_APP_ID }}
             REACT_APP_IS_HOSPICE: true
             REACT_APP_HOSPICE_COLLECTION_PREFIX: "hospice_"
             
         - name: Deploy to Firebase
           uses: FirebaseExtended/action-hosting-deploy@v0
           with:
             repoToken: ${{ secrets.GITHUB_TOKEN }}
             firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
             channelId: live
             projectId: ${{ secrets.FIREBASE_PROJECT_ID }}
   ```

## Cross-Application Navigation

To allow users to navigate between the regular EMR and hospice EMR:

```javascript
// src/components/AppHeader.jsx
import { useAuth } from '../hooks/useAuth';

const AppHeader = () => {
  const { userRoles } = useAuth();
  
  const handleSwitchToRegularEMR = () => {
    window.location.href = process.env.REACT_APP_REGULAR_EMR_URL || 'https://emr.example.com';
  };
  
  return (
    <header className="app-header">
      <div className="logo">Hospice EMR</div>
      <nav>
        {/* Navigation links */}
      </nav>
      <div className="user-actions">
        {userRoles && !userRoles.hospiceOnly && (
          <button onClick={handleSwitchToRegularEMR}>
            Switch to Regular EMR
          </button>
        )}
        {/* Other user actions */}
      </div>
    </header>
  );
};

export default AppHeader;
```

## Performance Considerations

1. **Firestore Query Optimization**:
   - Create appropriate indexes for hospice-specific queries
   - Use collection group queries for cross-collection searches

2. **Data Caching**:
   - Implement client-side caching for frequently accessed data
   - Consider using React Query or SWR for data fetching and caching

3. **Code Splitting**:
   - Use dynamic imports for route-based code splitting
   - Lazy load heavy components

## Conclusion

This architecture allows you to create a separate, specialized frontend for hospice EMR while leveraging the same Firebase backend. The approach provides:

1. **Clean Separation of Concerns**: Different frontends for different workflows
2. **Unified Data**: Single source of truth for patient data
3. **Simplified Authentication**: Users can access both systems with the same credentials
4. **Efficient Development**: Teams can work on each frontend independently

By using prefixed collections and proper security rules, you maintain data isolation while still enabling cross-system data access when needed. 