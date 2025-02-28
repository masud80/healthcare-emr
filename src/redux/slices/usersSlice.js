import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

export const fetchAvailableUsers = createAsyncThunk(
  'users/fetchAvailable',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const currentUser = state.auth.user;
      const userRole = state.auth.role;

      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      // If user is admin, fetch all users
      if (userRole === 'admin') {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, 
          where('role', 'in', ['doctor', 'nurse', 'admin', 'facility_admin'])
        );
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          name: `${doc.data().firstName} ${doc.data().lastName} (${doc.data().role})`
        }));
      }

      // For non-admin users, first get their facility IDs from user_facilities
      const userFacilitiesRef = collection(db, 'user_facilities');
      const userFacilitiesQuery = query(
        userFacilitiesRef,
        where('userId', '==', currentUser.uid)
      );
      const userFacilitiesSnapshot = await getDocs(userFacilitiesQuery);

      if (userFacilitiesSnapshot.empty) {
        return []; // User has no facilities assigned
      }

      // Get all facility IDs this user has access to
      const facilityIds = userFacilitiesSnapshot.docs.map(doc => doc.data().facilityId);

      // Get all user_facilities documents for these facilities
      const allFacilityUsersQuery = query(
        userFacilitiesRef,
        where('facilityId', 'in', facilityIds)
      );
      const allFacilityUsersSnapshot = await getDocs(allFacilityUsersQuery);

      // Get unique user IDs from the facility users
      const userIds = [...new Set(
        allFacilityUsersSnapshot.docs.map(doc => doc.data().userId)
      )];

      // Finally, get the user documents for these IDs
      const usersRef = collection(db, 'users');
      const usersQuery = query(
        usersRef,
        where('role', 'in', ['doctor', 'nurse', 'admin', 'facility_admin']),
        where('__name__', 'in', userIds)
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      
      return usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        name: `${doc.data().firstName} ${doc.data().lastName} (${doc.data().role})`
      }));

    } catch (error) {
      console.error('Error fetching available users:', error);
      return rejectWithValue(error.message);
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    availableUsers: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailableUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableUsers.fulfilled, (state, action) => {
        state.availableUsers = action.payload;
        state.loading = false;
      })
      .addCase(fetchAvailableUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default usersSlice.reducer;
