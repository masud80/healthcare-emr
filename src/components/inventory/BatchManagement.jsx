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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Typography,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { createBatch } from '../../redux/slices/inventorySlice';
import { inventoryService } from '../../services/inventoryService';

const BATCHES_PER_PAGE = 10;

const TRANSACTION_TYPES = [
  'STOCK_IN',
  'STOCK_OUT',
  'TRANSFER',
  'ADJUSTMENT',
  'EXPIRED',
  'DAMAGED',
];

export default function BatchManagement() {
  const dispatch = useDispatch();
  const { items, locations, suppliers } = useSelector((state) => state.inventory);
  const [page, setPage] = useState(0);
  const [batches, setBatches] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [transactionDialog, setTransactionDialog] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [formData, setFormData] = useState({
    itemId: '',
    batchNumber: '',
    expiryDate: null,
    manufacturingDate: null,
    quantity: 0,
    cost: 0,
    locationId: '',
    supplierId: '',
  });
  const [transactionData, setTransactionData] = useState({
    type: 'STOCK_IN',
    quantity: 0,
    fromLocationId: '',
    toLocationId: '',
    notes: '',
  });

  useEffect(() => {
    // Load batches for all items
    const loadBatches = async () => {
      const allBatches = [];
      for (const item of items) {
        const itemBatches = await inventoryService.getBatchesByItem(item.id);
        allBatches.push(...itemBatches);
      }
      setBatches(allBatches);
    };
    loadBatches();
  }, [items]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleOpenDialog = (batch) => {
    if (batch) {
      setSelectedBatch(batch);
      setFormData({
        itemId: batch.itemId,
        batchNumber: batch.batchNumber,
        expiryDate: batch.expiryDate.toDate(),
        manufacturingDate: batch.manufacturingDate.toDate(),
        quantity: batch.quantity,
        cost: batch.cost,
        locationId: batch.locationId,
        supplierId: batch.supplierId,
      });
    } else {
      setSelectedBatch(null);
      setFormData({
        itemId: '',
        batchNumber: '',
        expiryDate: null,
        manufacturingDate: null,
        quantity: 0,
        cost: 0,
        locationId: '',
        supplierId: '',
      });
    }
    setOpenDialog(true);
  };

  const handleOpenTransactionDialog = (batch) => {
    setSelectedBatch(batch);
    setTransactionData({
      type: 'STOCK_IN',
      quantity: 0,
      fromLocationId: '',
      toLocationId: '',
      notes: '',
    });
    setTransactionDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBatch(null);
  };

  const handleCloseTransactionDialog = () => {
    setTransactionDialog(false);
    setSelectedBatch(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'cost' ? Number(value) : value,
    }));
  };

  const handleTransactionInputChange = (e) => {
    const { name, value } = e.target;
    setTransactionData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? Number(value) : value,
    }));
  };

  const handleSubmit = () => {
    if (formData.expiryDate && formData.manufacturingDate) {
      dispatch(createBatch({
        ...formData,
        expiryDate: formData.expiryDate,
        manufacturingDate: formData.manufacturingDate,
      }));
    }
    handleCloseDialog();
  };

  const handleTransactionSubmit = async () => {
    if (selectedBatch) {
      try {
        await inventoryService.recordTransaction({
          itemId: selectedBatch.itemId,
          batchId: selectedBatch.id,
          ...transactionData,
          performedBy: 'current-user-id', // Replace with actual user ID
        });
        // Refresh batches after transaction
        const updatedBatches = await Promise.all(
          items.map(item => inventoryService.getBatchesByItem(item.id))
        );
        setBatches(updatedBatches.flat());
      } catch (error) {
        console.error('Failed to record transaction:', error);
      }
    }
    handleCloseTransactionDialog();
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Batch
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell>Batch Number</TableCell>
              <TableCell>Expiry Date</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {batches
              .slice(page * BATCHES_PER_PAGE, (page + 1) * BATCHES_PER_PAGE)
              .map((batch) => {
                const item = items.find(i => i.id === batch.itemId);
                const location = locations.find(l => l.id === batch.locationId);
                const supplier = suppliers.find(s => s.id === batch.supplierId);

                return (
                  <TableRow key={batch.id}>
                    <TableCell>{item?.name || 'Unknown Item'}</TableCell>
                    <TableCell>{batch.batchNumber}</TableCell>
                    <TableCell>
                      {batch.expiryDate.toDate().toLocaleDateString()}
                    </TableCell>
                    <TableCell>{batch.quantity}</TableCell>
                    <TableCell>{location?.name || 'Unknown Location'}</TableCell>
                    <TableCell>{supplier?.name || 'Unknown Supplier'}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(batch)}
                      >
                        <EditIcon />
                      </IconButton>
                      <Button
                        size="small"
                        onClick={() => handleOpenTransactionDialog(batch)}
                      >
                        Record Transaction
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={batches.length}
          rowsPerPage={BATCHES_PER_PAGE}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[BATCHES_PER_PAGE]}
        />
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedBatch ? 'Edit Batch' : 'Add New Batch'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'grid', gap: 2 }}>
            <TextField
              select
              name="itemId"
              label="Item"
              value={formData.itemId}
              onChange={handleInputChange}
              fullWidth
              required
            >
              {items.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              name="batchNumber"
              label="Batch Number"
              value={formData.batchNumber}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <DatePicker
              label="Manufacturing Date"
              value={formData.manufacturingDate}
              onChange={(date) => setFormData(prev => ({ ...prev, manufacturingDate: date }))}
              renderInput={(params) => <TextField {...params} fullWidth required />}
            />
            <DatePicker
              label="Expiry Date"
              value={formData.expiryDate}
              onChange={(date) => setFormData(prev => ({ ...prev, expiryDate: date }))}
              renderInput={(params) => <TextField {...params} fullWidth required />}
            />
            <TextField
              name="quantity"
              label="Quantity"
              type="number"
              value={formData.quantity}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              name="cost"
              label="Cost"
              type="number"
              value={formData.cost}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              select
              name="locationId"
              label="Location"
              value={formData.locationId}
              onChange={handleInputChange}
              fullWidth
              required
            >
              {locations.map((location) => (
                <MenuItem key={location.id} value={location.id}>
                  {location.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              name="supplierId"
              label="Supplier"
              value={formData.supplierId}
              onChange={handleInputChange}
              fullWidth
              required
            >
              {suppliers.map((supplier) => (
                <MenuItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.itemId || !formData.batchNumber}
          >
            {selectedBatch ? 'Save Changes' : 'Add Batch'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={transactionDialog} onClose={handleCloseTransactionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Record Transaction</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'grid', gap: 2 }}>
            <TextField
              select
              name="type"
              label="Transaction Type"
              value={transactionData.type}
              onChange={handleTransactionInputChange}
              fullWidth
              required
            >
              {TRANSACTION_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              name="quantity"
              label="Quantity"
              type="number"
              value={transactionData.quantity}
              onChange={handleTransactionInputChange}
              fullWidth
              required
            />
            {transactionData.type === 'TRANSFER' && (
              <>
                <TextField
                  select
                  name="fromLocationId"
                  label="From Location"
                  value={transactionData.fromLocationId}
                  onChange={handleTransactionInputChange}
                  fullWidth
                  required
                >
                  {locations.map((location) => (
                    <MenuItem key={location.id} value={location.id}>
                      {location.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  name="toLocationId"
                  label="To Location"
                  value={transactionData.toLocationId}
                  onChange={handleTransactionInputChange}
                  fullWidth
                  required
                >
                  {locations.map((location) => (
                    <MenuItem key={location.id} value={location.id}>
                      {location.name}
                    </MenuItem>
                  ))}
                </TextField>
              </>
            )}
            <TextField
              name="notes"
              label="Notes"
              value={transactionData.notes}
              onChange={handleTransactionInputChange}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTransactionDialog}>Cancel</Button>
          <Button
            onClick={handleTransactionSubmit}
            variant="contained"
            disabled={!transactionData.type || !transactionData.quantity}
          >
            Record Transaction
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 