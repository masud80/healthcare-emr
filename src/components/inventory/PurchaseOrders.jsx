import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton as MuiIconButton,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Timestamp } from 'firebase/firestore';
import { createPurchaseOrder, fetchSuppliers, fetchItems, fetchPurchaseOrders } from '../../redux/slices/inventorySlice';

const ORDERS_PER_PAGE = 10;

const ORDER_STATUSES = [
  'DRAFT',
  'PENDING',
  'APPROVED',
  'ORDERED',
  'RECEIVED',
  'CANCELLED',
];

const getStatusColor = (status) => {
  switch (status) {
    case 'DRAFT':
      return 'default';
    case 'PENDING':
      return 'warning';
    case 'APPROVED':
      return 'info';
    case 'ORDERED':
      return 'primary';
    case 'RECEIVED':
      return 'success';
    case 'CANCELLED':
      return 'error';
    default:
      return 'default';
  }
};

export default function PurchaseOrders() {
  console.log('PurchaseOrders component rendering');
  
  const dispatch = useDispatch();
  console.log('Dispatch initialized');
  
  const inventoryState = useSelector((state) => {
    console.log('Redux state:', state);
    return state.inventory;
  });
  console.log('Inventory state:', inventoryState);
  
  const { purchaseOrders, items, suppliers, loading } = inventoryState;
  
  const [page, setPage] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [formData, setFormData] = useState({
    supplierId: '',
    status: 'DRAFT',
    items: [],
    totalAmount: 0,
    expectedDeliveryDate: null,
    notes: '',
  });
  const [newItem, setNewItem] = useState({
    itemId: '',
    quantity: 0,
    unitPrice: 0,
    notes: '',
  });

  useEffect(() => {
    console.log('Component mounted, fetching data...');
    console.log('Initial Redux state:', { purchaseOrders, items, suppliers, loading });
    dispatch(fetchSuppliers());
    dispatch(fetchItems());
    dispatch(fetchPurchaseOrders());
  }, [dispatch]);

  useEffect(() => {
    console.log('Redux state updated:', { 
      purchaseOrdersCount: purchaseOrders.length,
      suppliersCount: suppliers.length,
      itemsCount: items.length,
      loading,
      suppliersList: suppliers
    });
  }, [purchaseOrders, suppliers, items, loading]);

  useEffect(() => {
    if (suppliers.length === 0) {
      console.log('No suppliers loaded, fetching again...');
      dispatch(fetchSuppliers());
    } else {
      console.log('Suppliers loaded:', suppliers);
    }
  }, []); // Run once when component mounts

  useEffect(() => {
    console.log('Suppliers updated:', {
      suppliersCount: suppliers.length,
      suppliersList: suppliers.map(s => ({ id: s.id, name: s.name })),
      rawSuppliers: suppliers // Log the full supplier objects
    });
  }, [suppliers]);

  useEffect(() => {
    console.log('Purchase Orders updated:', {
      ordersCount: purchaseOrders.length,
      ordersList: purchaseOrders.map(o => ({ id: o.id, supplierId: o.supplierId }))
    });
  }, [purchaseOrders]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleOpenDialog = (order) => {
    if (order) {
      setEditingOrder(order);
      setFormData({
        supplierId: order.supplierId,
        status: order.status,
        items: [...order.items],
        totalAmount: order.totalAmount,
        expectedDeliveryDate: new Date(order.expectedDeliveryDate),
        notes: order.notes || '',
      });
    } else {
      setEditingOrder(null);
      setFormData({
        supplierId: '',
        status: 'DRAFT',
        items: [],
        totalAmount: 0,
        expectedDeliveryDate: null,
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingOrder(null);
    setNewItem({
      itemId: '',
      quantity: 0,
      unitPrice: 0,
      notes: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'unitPrice' ? Number(value) : value,
    }));
  };

  const handleAddItem = () => {
    if (newItem.itemId && newItem.quantity > 0 && newItem.unitPrice > 0) {
      const totalPrice = newItem.quantity * newItem.unitPrice;
      const newOrderItem = {
        ...newItem,
        totalPrice,
      };

      setFormData(prev => ({
        ...prev,
        items: [...prev.items, newOrderItem],
        totalAmount: prev.totalAmount + totalPrice,
      }));

      setNewItem({
        itemId: '',
        quantity: 0,
        unitPrice: 0,
        notes: '',
      });
    }
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      const removedItem = newItems.splice(index, 1)[0];
      return {
        ...prev,
        items: newItems,
        totalAmount: prev.totalAmount - removedItem.totalPrice,
      };
    });
  };

  const handleSubmit = () => {
    if (formData.supplierId && formData.items.length > 0 && formData.expectedDeliveryDate) {
      dispatch(createPurchaseOrder({
        ...formData,
        expectedDeliveryDate: Timestamp.fromDate(formData.expectedDeliveryDate),
        createdBy: 'system', // TODO: Replace with actual user ID when auth is implemented
      })).then(() => {
        // Fetch updated purchase orders after creating a new one
        dispatch(fetchPurchaseOrders());
      });
    }
    handleCloseDialog();
  };

  const validateForm = () => {
    return (
      formData.supplierId &&
      formData.items.length > 0 &&
      formData.expectedDeliveryDate
    );
  };

  if (loading && !suppliers.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Purchase Orders</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Order
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Supplier</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Expected Delivery</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {purchaseOrders
              .slice(page * ORDERS_PER_PAGE, (page + 1) * ORDERS_PER_PAGE)
              .map((order) => {
                const supplier = suppliers.find(s => s.id === order.supplierId);
                console.log('Processing order:', {
                  orderId: order.id,
                  supplierId: order.supplierId,
                  foundSupplier: supplier,
                  supplierMatch: suppliers.map(s => `${s.id}:${s.name}`),
                });
                
                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      {supplier && supplier.name ? supplier.name : `Unknown Supplier (${order.supplierId})`}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{order.items.length} items</TableCell>
                    <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(order)}
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={purchaseOrders.length}
          rowsPerPage={ORDERS_PER_PAGE}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[ORDERS_PER_PAGE]}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingOrder ? 'Edit Purchase Order' : 'Create Purchase Order'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'grid', gap: 2 }}>
            {suppliers.length > 0 ? (
              <TextField
                select
                name="supplierId"
                label="Supplier"
                value={formData.supplierId}
                onChange={handleInputChange}
                fullWidth
                required
                error={!formData.supplierId}
                helperText={!formData.supplierId ? 'Please select a supplier' : ''}
              >
                {suppliers.map((supplier) => (
                  <MenuItem key={supplier.id} value={supplier.id}>
                    {supplier.name || 'Unnamed Supplier'}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                label="Supplier"
                value="Loading suppliers..."
                disabled
                fullWidth
              />
            )}

            {!editingOrder && (
              <Box sx={{ border: 1, borderColor: 'divider', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Add Items
                </Typography>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <TextField
                    select
                    name="itemId"
                    label="Item"
                    value={newItem.itemId}
                    onChange={handleNewItemChange}
                    fullWidth
                  >
                    {items.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <TextField
                      name="quantity"
                      label="Quantity"
                      type="number"
                      value={newItem.quantity}
                      onChange={handleNewItemChange}
                      fullWidth
                    />
                    <TextField
                      name="unitPrice"
                      label="Unit Price"
                      type="number"
                      value={newItem.unitPrice}
                      onChange={handleNewItemChange}
                      fullWidth
                    />
                  </Box>
                  <TextField
                    name="notes"
                    label="Item Notes"
                    value={newItem.notes}
                    onChange={handleNewItemChange}
                    fullWidth
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddItem}
                    disabled={!newItem.itemId || newItem.quantity <= 0 || newItem.unitPrice <= 0}
                  >
                    Add Item
                  </Button>
                </Box>
              </Box>
            )}

            <Box sx={{ border: 1, borderColor: 'divider', p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Order Items
              </Typography>
              <List dense>
                {formData.items.map((item, index) => {
                  const inventoryItem = items.find(i => i.id === item.itemId);
                  return (
                    <ListItem key={index}>
                      <ListItemText
                        primary={inventoryItem?.name || 'Unknown Item'}
                        secondary={`${item.quantity} units × $${item.unitPrice} = $${item.totalPrice}`}
                      />
                      {!editingOrder && (
                        <ListItemSecondaryAction>
                          <MuiIconButton
                            edge="end"
                            size="small"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <DeleteIcon />
                          </MuiIconButton>
                        </ListItemSecondaryAction>
                      )}
                    </ListItem>
                  );
                })}
              </List>
              <Typography variant="subtitle1" align="right" sx={{ mt: 1 }}>
                Total: ${formData.totalAmount.toFixed(2)}
              </Typography>
            </Box>

            <DatePicker
              label="Expected Delivery Date"
              value={formData.expectedDeliveryDate}
              onChange={(date) => setFormData(prev => ({ ...prev, expectedDeliveryDate: date }))}
            />

            <TextField
              name="notes"
              label="Order Notes"
              value={formData.notes}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={3}
            />

            {editingOrder && (
              <TextField
                select
                name="status"
                label="Order Status"
                value={formData.status}
                onChange={handleInputChange}
                fullWidth
              >
                {ORDER_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!validateForm()}
          >
            {editingOrder ? 'Save Changes' : 'Create Order'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 