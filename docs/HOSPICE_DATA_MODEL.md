# Hospice EMR Data Model in Shared Firebase Project

## Overview

This document outlines the recommended data model for implementing a hospice EMR within the same Firebase project as a regular healthcare EMR, using prefixed collections to maintain separation.

## Collection Structure

### Core Collections

| Collection Name | Purpose | Relationship |
|-----------------|---------|-------------|
| `patients` | Regular EMR patient records | Parent collection |
| `hospice_patients` | Hospice-specific patient information | References `patients` |
| `appointments` | Regular clinic appointments | - |
| `hospice_visits` | Hospice home visits and check-ins | - |
| `medications` | All medications (shared) | Uses `type` field to distinguish |
| `hospice_care_plans` | Hospice care planning documents | - |
| `hospice_assessments` | Hospice-specific assessments | - |
| `hospice_comfort_kits` | Comfort kit tracking | - |

### User Management

| Collection Name | Purpose |
|-----------------|---------|
| `users` | All system users with role-based permissions |
| `user_roles` | Role definitions and permissions |

## Document Structures

### Hospice Patient

```javascript
// hospice_patients/{patientId}
{
  "id": "hospice_patient_123",
  "regularPatientId": "patient_456",  // Reference to main patients collection
  "hospiceAdmissionDate": "2023-05-15",
  "primaryDiagnosis": "Terminal cancer",
  "secondaryDiagnoses": ["Diabetes", "Hypertension"],
  "estimatedPrognosis": "6 months",
  "carePlanId": "care_plan_789",
  "dnrStatus": true,
  "powerOfAttorney": {
    "name": "Jane Smith",
    "relationship": "Daughter",
    "phone": "555-123-4567",
    "email": "jane@example.com"
  },
  "primaryCaregiverName": "John Smith",
  "primaryCaregiverRelationship": "Son",
  "primaryCaregiverPhone": "555-987-6543",
  "hospicePhysicianId": "user_doctor_345",
  "nurseId": "user_nurse_678",
  "socialWorkerId": "user_sw_901",
  "chaplainId": "user_chaplain_234",
  "status": "active", // active, discharged, deceased
  "dischargeDate": null,
  "dischargeReason": null,
  "dateOfDeath": null,
  "locationOfDeath": null,
  "createdAt": "2023-05-15T10:30:00Z",
  "updatedAt": "2023-05-20T14:45:00Z"
}
```

### Hospice Care Plan

```javascript
// hospice_care_plans/{planId}
{
  "id": "care_plan_789",
  "patientId": "hospice_patient_123",
  "startDate": "2023-05-16",
  "endDate": "2023-11-16",
  "goals": [
    {
      "id": "goal_1",
      "description": "Pain management",
      "interventions": [
        "Regular pain assessment",
        "Medication management",
        "Non-pharmacological interventions"
      ],
      "status": "active"
    },
    {
      "id": "goal_2",
      "description": "Emotional support",
      "interventions": [
        "Weekly chaplain visits",
        "Family counseling",
        "Grief support"
      ],
      "status": "active"
    }
  ],
  "medications": [
    {
      "medicationId": "med_123",
      "dosage": "5mg",
      "frequency": "twice daily",
      "purpose": "Pain management"
    }
  ],
  "dietaryConsiderations": "Soft foods, small frequent meals",
  "mobilityConsiderations": "Assistance with ambulation, fall risk",
  "spiritualConsiderations": "Catholic, desires communion",
  "approvedBy": "user_doctor_345",
  "approvedDate": "2023-05-16T09:15:00Z",
  "reviewDate": "2023-06-16",
  "createdAt": "2023-05-15T15:30:00Z",
  "updatedAt": "2023-05-16T09:15:00Z"
}
```

### Hospice Visit

```javascript
// hospice_visits/{visitId}
{
  "id": "visit_456",
  "patientId": "hospice_patient_123",
  "visitDate": "2023-05-18T13:00:00Z",
  "visitType": "nurse", // nurse, social_worker, chaplain, physician, volunteer
  "staffId": "user_nurse_678",
  "duration": 45, // minutes
  "vitalSigns": {
    "temperature": 98.6,
    "pulse": 72,
    "respirations": 16,
    "bloodPressure": "120/80",
    "oxygenSaturation": 96,
    "pain": 3
  },
  "assessments": [
    {
      "type": "pain",
      "score": 3,
      "notes": "Patient reports improved pain control with current regimen"
    },
    {
      "type": "respiratory",
      "score": 2,
      "notes": "Slight shortness of breath with exertion"
    }
  ],
  "interventions": [
    "Medication review",
    "Wound care",
    "Caregiver education"
  ],
  "medicationsAdministered": [
    {
      "medicationId": "med_123",
      "dosage": "5mg",
      "time": "2023-05-18T13:15:00Z",
      "route": "oral"
    }
  ],
  "caregiverPresent": true,
  "caregiverName": "John Smith",
  "notes": "Patient comfortable during visit. Caregiver reports managing well with current support.",
  "followUpNeeded": false,
  "followUpReason": null,
  "nextVisitDate": "2023-05-21",
  "createdAt": "2023-05-18T14:00:00Z",
  "updatedAt": "2023-05-18T14:00:00Z"
}
```

### Medication (Shared Collection with Type Field)

```javascript
// medications/{medicationId}
{
  "id": "med_123",
  "name": "Morphine Sulfate",
  "type": "hospice", // regular or hospice
  "patientId": "patient_456", // ID from the main patients collection
  "hospicePatientId": "hospice_patient_123", // Only for hospice medications
  "dosage": "5mg",
  "route": "oral",
  "frequency": "every 4 hours as needed",
  "startDate": "2023-05-16",
  "endDate": null,
  "prescribedBy": "user_doctor_345",
  "prescriptionDate": "2023-05-16",
  "purpose": "Pain management",
  "instructions": "Take with food",
  "sideEffects": ["Drowsiness", "Constipation"],
  "isControlled": true,
  "controlledSubstanceClass": "Schedule II",
  "isComfortKit": true, // Specific to hospice
  "createdAt": "2023-05-16T10:00:00Z",
  "updatedAt": "2023-05-16T10:00:00Z"
}
```

## Subcollections

For deeply nested data, consider using subcollections:

### Hospice Patient Subcollections

- `hospice_patients/{patientId}/daily_logs` - Daily status logs
- `hospice_patients/{patientId}/family_communications` - Communication records with family
- `hospice_patients/{patientId}/equipment` - Medical equipment tracking

### Hospice Visit Subcollections

- `hospice_visits/{visitId}/images` - Photos taken during visits (e.g., wound documentation)
- `hospice_visits/{visitId}/signatures` - Signature captures

## Indexes

Consider creating the following composite indexes:

1. `hospice_patients` collection:
   - `status` + `hospicePhysicianId` + `createdAt` (DESC)
   - `status` + `nurseId` + `createdAt` (DESC)

2. `hospice_visits` collection:
   - `patientId` + `visitDate` (DESC)
   - `staffId` + `visitDate` (DESC)
   - `visitType` + `visitDate` (DESC)

## Data Relationships

### Patient Relationship

The relationship between regular patients and hospice patients is maintained through the `regularPatientId` field in the `hospice_patients` collection. This allows:

1. Accessing the patient's general medical history from the hospice context
2. Avoiding duplication of basic demographic information
3. Maintaining a single patient identity across the system

### Shared Collections

For collections that might be accessed by both systems (like medications), use a `type` field to distinguish between regular and hospice records. This allows:

1. Unified queries when needed (e.g., checking for medication interactions)
2. Filtered queries for system-specific views
3. Appropriate access control based on the record type

## Migration Considerations

When migrating patients from regular care to hospice care:

1. Create a new document in `hospice_patients` with a reference to the original patient
2. Update the patient status in the main `patients` collection
3. Create initial hospice-specific records (care plan, etc.)
4. Set up appropriate access permissions for hospice staff 