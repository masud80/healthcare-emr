# Security Rules for Shared Firebase Project with Hospice EMR

## Overview

This document outlines the security rules structure for a Firebase project that hosts both a regular healthcare EMR and a hospice EMR with prefixed collections.

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Common helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Regular EMR user roles
    function isRegularDoctor() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'doctor' &&
        !get(/databases/$(database)/documents/users/$(request.auth.uid)).data.hospiceAccess;
    }
    
    // Hospice EMR user roles
    function isHospiceStaff() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.hospiceAccess == true;
    }
    
    // User profiles - accessible by the user themselves or admins
    match /users/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      allow write: if isAdmin();
      allow update: if isAuthenticated() && request.auth.uid == userId && 
                     !request.resource.data.diff(resource.data).affectedKeys()
                      .hasAny(['role', 'hospiceAccess']);
    }
    
    // Regular EMR collections
    match /patients/{patientId} {
      allow read: if isAuthenticated() && (isRegularDoctor() || isAdmin() || isHospiceStaff());
      allow write: if isAuthenticated() && (isRegularDoctor() || isAdmin());
    }
    
    match /appointments/{appointmentId} {
      allow read, write: if isAuthenticated() && (isRegularDoctor() || isAdmin());
    }
    
    // Hospice EMR collections
    match /hospice_patients/{patientId} {
      allow read, write: if isAuthenticated() && (isHospiceStaff() || isAdmin());
    }
    
    match /hospice_care_plans/{planId} {
      allow read, write: if isAuthenticated() && (isHospiceStaff() || isAdmin());
    }
    
    match /hospice_visits/{visitId} {
      allow read, write: if isAuthenticated() && (isHospiceStaff() || isAdmin());
    }
    
    // Shared collections with mixed access
    match /medications/{medicationId} {
      allow read: if isAuthenticated();
      allow create, update: if isAuthenticated() && 
        ((resource.data.type == 'hospice' && isHospiceStaff()) || 
         (resource.data.type != 'hospice' && isRegularDoctor()) || 
         isAdmin());
      allow delete: if isAuthenticated() && 
        ((resource.data.type == 'hospice' && isHospiceStaff()) || 
         (resource.data.type != 'hospice' && isRegularDoctor()) || 
         isAdmin());
    }
  }
}
```

## Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Common helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isHospiceStaff() {
      return isAuthenticated() && 
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.hospiceAccess == true;
    }
    
    function isRegularDoctor() {
      return isAuthenticated() && 
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'doctor' &&
        !firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.hospiceAccess;
    }
    
    // Regular EMR files
    match /patient_files/{patientId}/{fileName} {
      allow read: if isAuthenticated() && (isRegularDoctor() || isAdmin() || isHospiceStaff());
      allow write: if isAuthenticated() && (isRegularDoctor() || isAdmin());
    }
    
    // Hospice EMR files
    match /hospice_files/{patientId}/{fileName} {
      allow read, write: if isAuthenticated() && (isHospiceStaff() || isAdmin());
    }
  }
}
```

## User Management

For this approach to work effectively, your user management system should include:

1. **Role-based access control** with specific roles for hospice staff
2. **Hospice access flag** to indicate which users can access hospice data
3. **Custom claims** in Firebase Auth to speed up access checks

Example user document structure:

```javascript
{
  "uid": "user123",
  "email": "doctor@example.com",
  "role": "doctor",
  "hospiceAccess": true,  // Can access hospice data
  "permissions": {
    "canViewPatients": true,
    "canEditPatients": true,
    "canViewHospiceCarePlans": true,
    "canEditHospiceCarePlans": true
  }
}
```

## Data Model Considerations

When using prefixed collections in a shared project:

1. **Avoid duplicating patient data** - Consider using references between regular patients and hospice patients
2. **Use type fields** for shared collections to distinguish between regular and hospice records
3. **Consider using subcollections** for deeply nested hospice-specific data

Example reference between patient collections:

```javascript
// In hospice_patients collection
{
  "id": "hospice_patient_123",
  "regularPatientId": "patient_456",  // Reference to main patients collection
  "hospiceAdmissionDate": "2023-05-15",
  "primaryDiagnosis": "...",
  "carePlanId": "..."
}
``` 