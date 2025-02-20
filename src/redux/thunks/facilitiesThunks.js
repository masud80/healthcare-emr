import { createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../../firebase/config';
import { collection, getDocs, doc, getDoc, updateDoc, query, where } from 'firebase/firestore';

// Fetch all facilities
export const fetchFacilities = createAsyncThunk(
  'facilities/fetchFacilities',
  async () => {
    try {
      const facilitiesRef = collection(db, 'facilities');
      const snapshot = await getDocs(facilitiesRef);
      const facilities = snapshot.docs.map(doc => ({
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
  async (_, { getState }) => {
    try {
      const state = getState();
      const user = state.auth.user;
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const facilitiesRef = collection(db, 'facilities');
      let snapshot;

      if (user.role === 'admin') {
        // Admin can see all facilities
        snapshot = await getDocs(facilitiesRef);
      } else {
        // Regular users only see assigned facilities
        const q = query(facilitiesRef, where('assignedUsers', 'array-contains', user.uid));
        snapshot = await getDocs(q);
      }

      const facilities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return facilities;
    } catch (error) {
      console.error('Error fetching user facilities:', error);
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
      const facilities = snapshot.docs.map(doc => ({
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
        return {
          id: facilityDoc.id,
          ...facilityDoc.data()
        };
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
      
      await updateDoc(facilityRef, facilityData);
      
      // Return the complete updated facility data
      return {
        id,
        ...facilityDoc.data(),
        ...facilityData
      };
    } catch (error) {
      console.error('Error updating facility:', error);
      return rejectWithValue(error.message || 'Failed to update facility');
    }
  }
);
