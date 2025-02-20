import { createSlice } from '@reduxjs/toolkit';

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
  },
});

export const {
  setFacilities,
  setUserFacilities,
  setSelectedFacility,
  setSelectedFacilities,
  setLoading,
  setError,
} = facilitiesSlice.actions;

export default facilitiesSlice.reducer;
