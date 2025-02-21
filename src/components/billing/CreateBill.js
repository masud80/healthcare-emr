import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { createBill } from '../../redux/thunks/billingThunks';

const initialItemState = {
  description: '',
  quantity: 1,
  unitPrice: 0,
  amount: 0
};

const CreateBill = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [billData, setBillData] = useState({
    patientId: '',
    patientName: '',
    billNumber: `BILL-${Date.now()}`,
    items: [{ ...initialItemState }],
    subtotal: 0,
    tax: 0,
    discount: 0,
    totalAmount: 0,
    notes: '',
    paymentTerms: 'due_on_receipt',
    dueDate: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const paymentTermsOptions = [
    { value: 'due_on_receipt', label: 'Due on Receipt' },
    { value: 'net_15', label: 'Net 15' },
    { value: 'net_30', label: 'Net 30' },
    { value: 'net_45', label: 'Net 45' },
    { value: 'net_60', label: 'Net 60' }
  ];

  const [patientError, setPatientError] = useState('');

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setBillData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate patient ID when it changes
    if (name === 'patientId' && value) {
      try {
        const db = getFirestore(getApp());
        const patientDoc = await getDoc(doc(db, 'patients', value));
        if (!patientDoc.exists()) {
          setPatientError('Patient ID not found');
        } else {
          const patientData = patientDoc.data();
          setBillData(prev => ({
            ...prev,
            patientName: patientData.name
          }));
          setPatientError('');
        }
      } catch (err) {
        setPatientError('Error validating patient ID');
      }
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...billData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    // Recalculate amount for the item
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].amount = 
        updatedItems[index].quantity * updatedItems[index].unitPrice;
    }

    // Update bill data and recalculate totals
    setBillData(prev => {
      const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
      const totalAmount = subtotal + prev.tax - prev.discount;
      
      return {
        ...prev,
        items: updatedItems,
        subtotal,
        totalAmount
      };
    });
  };

  const addItem = () => {
    setBillData(prev => ({
      ...prev,
      items: [...prev.items, { ...initialItemState }]
    }));
  };

  const removeItem = (index) => {
    if (billData.items.length === 1) {
      return; // Keep at least one item
    }

    const updatedItems = billData.items.filter((_, i) => i !== index);
    
    // Recalculate totals
    setBillData(prev => {
      const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
      const totalAmount = subtotal + prev.tax - prev.discount;
      
      return {
        ...prev,
        items: updatedItems,
        subtotal,
        totalAmount
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate patient ID before submitting
    if (patientError) {
      setError('Please fix the patient ID error before submitting');
      setLoading(false);
      return;
    }

    try {
      await dispatch(createBill({
        ...billData,
        createdAt: new Date().toISOString()
      }));
      navigate('/billing');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Create New Bill
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Patient ID"
                name="patientId"
                value={billData.patientId}
                onChange={handleInputChange}
                required
                error={!!patientError}
                helperText={patientError}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Patient Name"
                name="patientName"
                value={billData.patientName}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bill Number"
                name="billNumber"
                value={billData.billNumber}
                onChange={handleInputChange}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Payment Terms"
                name="paymentTerms"
                value={billData.paymentTerms}
                onChange={handleInputChange}
              >
                {paymentTermsOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Items Table */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Bill Items
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Unit Price</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {billData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <TextField
                            fullWidth
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            required
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                            required
                            inputProps={{ min: 1 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                            required
                            inputProps={{ min: 0, step: 0.01 }}
                          />
                        </TableCell>
                        <TableCell>
                          ${item.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => removeItem(index)}
                            disabled={billData.items.length === 1}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box mt={2}>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addItem}
                >
                  Add Item
                </Button>
              </Box>
            </Grid>

            {/* Totals */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notes"
                name="notes"
                value={billData.notes}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography>Subtotal:</Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography>${billData.subtotal.toFixed(2)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>Tax:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      type="number"
                      size="small"
                      name="tax"
                      value={billData.tax}
                      onChange={handleInputChange}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>Discount:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      type="number"
                      size="small"
                      name="discount"
                      value={billData.discount}
                      onChange={handleInputChange}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6">Total:</Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography variant="h6">
                      ${billData.totalAmount.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Error Message */}
            {error && (
              <Grid item xs={12}>
                <Typography color="error">{error}</Typography>
              </Grid>
            )}

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/billing')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Bill'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateBill;
