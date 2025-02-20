import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { searchPharmacies } from '../../utils/googlePlaces';

// Async thunks
export const fetchPharmacies = createAsyncThunk(
  'pharmacy/fetchPharmacies',
  async () => {
    const querySnapshot = await getDocs(collection(db, 'pharmacies'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
);

export const addPharmacy = createAsyncThunk(
  'pharmacy/addPharmacy',
  async (pharmacyData) => {
    const docRef = await addDoc(collection(db, 'pharmacies'), {
      ...pharmacyData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return {
      id: docRef.id,
      ...pharmacyData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
);

export const updatePharmacy = createAsyncThunk(
  'pharmacy/updatePharmacy',
  async ({ id, data }) => {
    const pharmacyRef = doc(db, 'pharmacies', id);
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    await updateDoc(pharmacyRef, updateData);
    return {
      id,
      ...updateData
    };
  }
);

export const searchPharmaciesOnline = createAsyncThunk(
  'pharmacy/searchPharmaciesOnline',
  async (searchText, { rejectWithValue }) => {
    try {
      const results = await searchPharmacies(searchText);
      return results;
    } catch (error) {
      console.error('Search error:', error);
      return rejectWithValue(error.message);
    }
  }
);

const pharmacySlice = createSlice({
  name: 'pharmacy',
  initialState: {
    pharmacies: [],
    searchResults: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    searchStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    searchError: null
  },
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchStatus = 'idle';
      state.searchError = null;
    }
  },
  extraReducers: (builder) => {
    // Search reducers
    builder
      .addCase(searchPharmaciesOnline.pending, (state) => {
        state.searchStatus = 'loading';
        state.searchError = null;
      })
      .addCase(searchPharmaciesOnline.fulfilled, (state, action) => {
        state.searchStatus = 'succeeded';
        state.searchResults = action.payload;
        state.searchError = null;
      })
      .addCase(searchPharmaciesOnline.rejected, (state, action) => {
        state.searchStatus = 'failed';
        state.searchError = action.payload || 'Failed to search pharmacies';
        state.searchResults = [];
      });

    // Fetch reducers
    builder
      .addCase(fetchPharmacies.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPharmacies.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.pharmacies = action.payload;
      })
      .addCase(fetchPharmacies.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });

    // Add pharmacy reducers
    builder
      .addCase(addPharmacy.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addPharmacy.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.pharmacies.push(action.payload);
      })
      .addCase(addPharmacy.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });

    // Update pharmacy reducers
    builder
      .addCase(updatePharmacy.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updatePharmacy.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.pharmacies.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.pharmacies[index] = action.payload;
        }
      })
      .addCase(updatePharmacy.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { clearSearchResults } = pharmacySlice.actions;
export default pharmacySlice.reducer;
