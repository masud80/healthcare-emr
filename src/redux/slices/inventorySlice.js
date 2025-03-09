import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { inventoryService } from '../../services/inventoryService';

const initialState = {
  items: [],
  batches: [],
  suppliers: [],
  purchaseOrders: [],
  locations: [],
  lowStockItems: [],
  expiringBatches: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchItems = createAsyncThunk(
  'inventory/fetchItems',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching items...');
      const items = await inventoryService.getAllItems();
      console.log('Fetched items:', items);
      return items;
    } catch (error) {
      console.error('Error fetching items:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPurchaseOrders = createAsyncThunk(
  'inventory/fetchPurchaseOrders',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching purchase orders...');
      const orders = await inventoryService.getAllPurchaseOrders();
      console.log('Fetched purchase orders:', orders);
      return orders;
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchLowStockItems = createAsyncThunk(
  'inventory/fetchLowStockItems',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching low stock items...');
      const items = await inventoryService.getLowStockItems();
      console.log('Fetched low stock items:', items);
      return items;
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchExpiringBatches = createAsyncThunk(
  'inventory/fetchExpiringBatches',
  async (daysThreshold) => {
    return await inventoryService.getExpiringBatches(daysThreshold);
  }
);

export const createItem = createAsyncThunk(
  'inventory/createItem',
  async (item) => {
    const id = await inventoryService.createItem(item);
    return { id, ...item };
  }
);

export const updateItem = createAsyncThunk(
  'inventory/updateItem',
  async ({ id, item }) => {
    await inventoryService.updateItem(id, item);
    return { id, ...item };
  }
);

export const createBatch = createAsyncThunk(
  'inventory/createBatch',
  async (batch) => {
    const id = await inventoryService.createBatch(batch);
    return { id, ...batch };
  }
);

export const fetchSuppliers = createAsyncThunk(
  'inventory/fetchSuppliers',
  async () => {
    return await inventoryService.getAllSuppliers();
  }
);

export const createSupplier = createAsyncThunk(
  'inventory/createSupplier',
  async (supplier) => {
    const id = await inventoryService.createSupplier(supplier);
    return { id, ...supplier };
  }
);

export const updateSupplier = createAsyncThunk(
  'inventory/updateSupplier',
  async ({ id, supplier }) => {
    await inventoryService.updateSupplier(id, supplier);
    return { id, ...supplier };
  }
);

export const deleteSupplier = createAsyncThunk(
  'inventory/deleteSupplier',
  async (id) => {
    await inventoryService.deleteSupplier(id);
    return id;
  }
);

export const createPurchaseOrder = createAsyncThunk(
  'inventory/createPurchaseOrder',
  async (order) => {
    const id = await inventoryService.createPurchaseOrder(order);
    return { id, ...order };
  }
);

export const createLocation = createAsyncThunk(
  'inventory/createLocation',
  async (location) => {
    const id = await inventoryService.createLocation(location);
    return { id, ...location };
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Items
      .addCase(fetchItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch items';
        console.error('Failed to fetch items:', action.payload);
      })

      // Fetch Purchase Orders
      .addCase(fetchPurchaseOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchaseOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.purchaseOrders = action.payload;
      })
      .addCase(fetchPurchaseOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch purchase orders';
        console.error('Failed to fetch purchase orders:', action.payload);
      })

      // Fetch Low Stock Items
      .addCase(fetchLowStockItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLowStockItems.fulfilled, (state, action) => {
        state.loading = false;
        state.lowStockItems = action.payload;
      })
      .addCase(fetchLowStockItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch low stock items';
        console.error('Failed to fetch low stock items:', action.payload);
      })

      // Fetch Expiring Batches
      .addCase(fetchExpiringBatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpiringBatches.fulfilled, (state, action) => {
        state.loading = false;
        state.expiringBatches = action.payload;
      })
      .addCase(fetchExpiringBatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch expiring batches';
      })

      // Create Item
      .addCase(createItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push({ ...action.payload, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      })
      .addCase(createItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create item';
      })

      // Update Item
      .addCase(updateItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            ...action.payload,
            updatedAt: new Date().toISOString()
          };
        }
      })
      .addCase(updateItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update item';
      })

      // Create Batch
      .addCase(createBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBatch.fulfilled, (state, action) => {
        state.loading = false;
        state.batches.push({ ...action.payload, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      })
      .addCase(createBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create batch';
      })

      // Fetch Suppliers
      .addCase(fetchSuppliers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = action.payload;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch suppliers';
      })

      // Create Supplier
      .addCase(createSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers.push({ ...action.payload, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create supplier';
      })

      // Update Supplier
      .addCase(updateSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.suppliers.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.suppliers[index] = { ...state.suppliers[index], ...action.payload };
        }
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update supplier';
      })

      // Delete Supplier
      .addCase(deleteSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = state.suppliers.filter(s => s.id !== action.payload);
      })
      .addCase(deleteSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete supplier';
      })

      // Create Purchase Order
      .addCase(createPurchaseOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPurchaseOrder.fulfilled, (state, action) => {
        state.loading = false;
        // Convert Timestamp to ISO string for Redux state
        const payload = { ...action.payload };
        if (payload.expectedDeliveryDate && typeof payload.expectedDeliveryDate.toDate === 'function') {
          payload.expectedDeliveryDate = payload.expectedDeliveryDate.toDate().toISOString();
        }
        state.purchaseOrders.push({ 
          ...payload, 
          createdAt: new Date().toISOString(), 
          updatedAt: new Date().toISOString() 
        });
      })
      .addCase(createPurchaseOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create purchase order';
      })

      // Create Location
      .addCase(createLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.locations.push({ ...action.payload, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      })
      .addCase(createLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create location';
      });
  },
});

// Export regular actions
export const { clearError } = inventorySlice.actions;

export default inventorySlice.reducer; 