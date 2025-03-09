import { createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../../firebase/config';
import { collection, getDocs, doc, getDoc, updateDoc, query, where, orderBy, limit, startAfter, documentId } from 'firebase/firestore';

// Helper function to serialize Firestore timestamps
const serializeTimestamps = (obj) => {
  if (!obj) return obj;
  
  const newObj = { ...obj };
  
  Object.keys(newObj).forEach(key => {
    const value = newObj[key];
    
    // Check if value is a Firestore Timestamp
    if (value && typeof value === 'object' && value.seconds !== undefined && value.nanoseconds !== undefined) {
      // Convert Timestamp to ISO string
      newObj[key] = new Date(value.seconds * 1000 + value.nanoseconds / 1000000).toISOString();
    } 
    // Handle nested objects and arrays
    else if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        newObj[key] = value.map(item => 
          typeof item === 'object' ? serializeTimestamps(item) : item
        );
      } else {
        newObj[key] = serializeTimestamps(value);
      }
    }
  });
  
  return newObj;
};

// Fetch all facilities
export const fetchFacilities = createAsyncThunk(
  'facilities/fetchFacilities',
  async () => {
    try {
      const facilitiesRef = collection(db, 'facilities');
      const snapshot = await getDocs(facilitiesRef);
      const facilities = snapshot.docs.map(doc => serializeTimestamps({
        id: doc.id,
        ...doc.data()
      }));
      return facilities;
    } catch (error) {
      console.error('Error fetching facilities:', error);
      throw error;
    }
  }
);

// Fetch user facilities
export const fetchUserFacilities = createAsyncThunk(
  'facilities/fetchUserFacilities',
  async ({ page = 1, limit = 10 } = {}, { getState }) => {
    try {
      const { user, role } = getState().auth;
      console.log('Auth state:', getState().auth);
      console.log('User object:', user);
      console.log('User role from state:', role);
      console.log('Is admin?:', role === 'admin');
      console.log('Role type:', typeof role);

      if (!user) {
        throw new Error('No user found');
      }

      // Check for admin role first before any database queries
      if (role === 'admin') {
        console.log('Admin user detected - proceeding to fetch all facilities');
        const facilitiesRef = collection(db, 'facilities');
        const snapshot = await getDocs(facilitiesRef);
        const allFacilities = snapshot.docs.map(doc => serializeTimestamps({
          id: doc.id,
          ...doc.data()
        }));

        // Calculate total and apply pagination manually
        const total = allFacilities.length;
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedFacilities = allFacilities.slice(start, end);

        console.log(`Admin: Fetched ${total} total facilities, returning ${paginatedFacilities.length} for page ${page}`);
        
        return {
          facilities: paginatedFacilities,
          total,
          page,
          limit
        };
      }

      // Only non-admin users reach this point
      console.log('Non-admin user - checking user_facilities junction table');
      const userFacilitiesRef = collection(db, 'user_facilities');
      const userFacilitiesQuery = query(userFacilitiesRef, where('userId', '==', user.uid));
      const userFacilitiesSnapshot = await getDocs(userFacilitiesQuery);
      
      console.log(`Found ${userFacilitiesSnapshot.size} user_facilities documents`);
      
      // Extract facility IDs from the junction table
      const facilityIds = userFacilitiesSnapshot.docs.map(doc => doc.data().facilityId);
      console.log('Fetching facilities with IDs:', facilityIds);

      if (facilityIds.length === 0) {
        console.log('No facility IDs found for user');
        return {
          facilities: [],
          total: 0,
          page,
          limit
        };
      }

      // Fetch facilities in batches of 10 (Firestore limitation)
      const facilitiesRef = collection(db, 'facilities');
      const allFacilities = [];
      for (let i = 0; i < facilityIds.length; i += 10) {
        const batch = facilityIds.slice(i, i + 10);
        const batchQuery = query(facilitiesRef, where(documentId(), 'in', batch));
        const batchSnapshot = await getDocs(batchQuery);
        allFacilities.push(...batchSnapshot.docs.map(doc => serializeTimestamps({
          id: doc.id,
          ...doc.data()
        })));
      }

      // Apply pagination manually
      const total = allFacilities.length;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedFacilities = allFacilities.slice(start, end);

      console.log(`Non-admin: Fetched ${total} total facilities, returning ${paginatedFacilities.length} for page ${page}`);

      return {
        facilities: paginatedFacilities,
        total,
        page,
        limit
      };
    } catch (error) {
      console.error('Error in fetchUserFacilities:', error);
      throw error;
    }
  }
);

// Fetch facilities by IDs
export const fetchFacilitiesByIds = createAsyncThunk(
  'facilities/fetchFacilitiesByIds',
  async (facilityIds) => {
    try {
      const facilitiesRef = collection(db, 'facilities');
      const q = query(facilitiesRef, where('__name__', 'in', facilityIds));
      const snapshot = await getDocs(q);
      const facilities = snapshot.docs.map(doc => serializeTimestamps({
        id: doc.id,
        ...doc.data()
      }));
      return facilities;
    } catch (error) {
      console.error('Error fetching facilities by IDs:', error);
      throw error;
    }
  }
);

// Fetch a single facility by ID
export const fetchFacilityById = createAsyncThunk(
  'facilities/fetchFacilityById',
  async (facilityId) => {
    try {
      const facilityRef = doc(db, 'facilities', facilityId);
      const facilityDoc = await getDoc(facilityRef);
      if (facilityDoc.exists()) {
        return serializeTimestamps({
          id: facilityDoc.id,
          ...facilityDoc.data()
        });
      } else {
        throw new Error('Facility not found');
      }
    } catch (error) {
      console.error('Error fetching facility:', error);
      throw error;
    }
  }
);

// Update a facility
export const updateFacility = createAsyncThunk(
  'facilities/updateFacility',
  async ({ id, ...facilityData }, { rejectWithValue }) => {
    try {
      const facilityRef = doc(db, 'facilities', id);
      
      // First check if the facility exists
      const facilityDoc = await getDoc(facilityRef);
      if (!facilityDoc.exists()) {
        return rejectWithValue('Facility not found');
      }
      
      // Perform the update
      await updateDoc(facilityRef, facilityData);
      
      // Get the updated document to confirm changes
      const updatedDoc = await getDoc(facilityRef);
      
      // Return the complete updated facility data
      return serializeTimestamps({
        id,
        ...updatedDoc.data()
      });
    } catch (error) {
      console.error('Error updating facility:', error);
      return rejectWithValue(error.message || 'Failed to update facility');
    }
  }
);
