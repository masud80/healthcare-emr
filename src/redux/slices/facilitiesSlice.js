import { createSlice } from '@reduxjs/toolkit';
import { 
  updateFacility, 
  fetchFacilities, 
  fetchUserFacilities, 
  fetchFacilitiesByIds,
  fetchFacilityById
} from '../thunks/facilitiesThunks';

const initialState = {
  facilities: [],
  userFacilities: [],
  selectedFacility: null,
  selectedFacilities: [],
  loading: false,
  error: null,
};

const facilitiesSlice = createSlice({
  name: 'facilities',
  initialState,
  reducers: {
    setSelectedFacilities: (state, action) => {
      state.selectedFacilities = action.payload;
      state.loading = false;
      state.error = null;
    },
    setFacilities: (state, action) => {
      state.facilities = action.payload;
      state.loading = false;
      state.error = null;
    },
    setUserFacilities: (state, action) => {
      state.userFacilities = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSelectedFacility: (state, action) => {
      state.selectedFacility = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Handle fetchFacilities
    builder
      .addCase(fetchFacilities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFacilities.fulfilled, (state, action) => {
        state.loading = false;
        state.facilities = action.payload;
        state.error = null;
      })
      .addCase(fetchFacilities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

    // Handle fetchUserFacilities
      .addCase(fetchUserFacilities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserFacilities.fulfilled, (state, action) => {
        state.loading = false;
        state.userFacilities = action.payload;
        state.error = null;
      })
      .addCase(fetchUserFacilities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

    // Handle fetchFacilitiesByIds
      .addCase(fetchFacilitiesByIds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFacilitiesByIds.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedFacilities = action.payload;
        state.error = null;
      })
      .addCase(fetchFacilitiesByIds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

    // Handle fetchFacilityById
      .addCase(fetchFacilityById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFacilityById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedFacility = action.payload;
        state.error = null;
      })
      .addCase(fetchFacilityById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

    // Handle updateFacility
      .addCase(updateFacility.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFacility.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const updatedFacility = action.payload;
        
        // Update selectedFacility
        state.selectedFacility = updatedFacility;
        
        // Update in facilities array
        state.facilities = state.facilities.map(facility => 
          facility.id === updatedFacility.id ? updatedFacility : facility
        );
        
        // Update in userFacilities array
        state.userFacilities = state.userFacilities.map(facility => 
          facility.id === updatedFacility.id ? updatedFacility : facility
        );
      })
      .addCase(updateFacility.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update facility';
      });
  },
});

export const {
  setFacilities,
  setUserFacilities,
  setSelectedFacility,
  setSelectedFacilities,
  setLoading,
  setError,
  clearError,
} = facilitiesSlice.actions;

// Selectors
export const selectFacilities = (state) => state.facilities.facilities;
export const selectUserFacilities = (state) => state.facilities.userFacilities;
export const selectSelectedFacility = (state) => state.facilities.selectedFacility;
export const selectSelectedFacilities = (state) => state.facilities.selectedFacilities;
export const selectLoading = (state) => state.facilities.loading;
export const selectError = (state) => state.facilities.error;

export default facilitiesSlice.reducer;
