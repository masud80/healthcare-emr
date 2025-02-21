import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Print as PrintIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fetchBillById, processPayment } from '../../redux/thunks/billingThunks';

const BillDetails = () => {
  const { billId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentBill, loading, error } = useSelector(state => state.billing);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    dispatch(fetchBillById(billId));
  }, [dispatch, billId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'partial':
        return 'warning';
      case 'pending':
        return 'error';
      default:
        return 'default';
    }
  };

  const handlePaymentSubmit = async () => {
    if (!paymentAmount || !paymentMethod) {
      setPaymentError('Please fill in all payment details');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setPaymentError('Please enter a valid payment amount');
      return;
    }

    const remainingAmount = currentBill.totalAmount - (currentBill.paidAmount || 0);
    if (amount > remainingAmount) {
      setPaymentError('Payment amount cannot exceed the remaining balance');
      return;
    }

    try {
      await dispatch(processPayment(billId, {
        amount,
        method: paymentMethod,
        reference: `PAY-${Date.now()}`
      }));
      setPaymentDialogOpen(false);
      dispatch(fetchBillById(billId)); // Refresh bill details
    } catch (err) {
      setPaymentError(err.message);
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  if (!currentBill) {
    return (
      <Container>
        <Typography>Bill not found</Typography>
      </Container>
    );
  }

  const remainingAmount = currentBill.totalAmount - (currentBill.paidAmount || 0);

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 3 }}>
        {/* Header */}
        <Grid container justifyContent="space-between" alignItems="center" mb={3}>
          <Grid item>
            <Typography variant="h5">Bill Details</Typography>
            <Typography color="textSecondary">
              #{currentBill.billNumber}
            </Typography>
          </Grid>
          <Grid item>
            <Box display="flex" gap={2}>
              <Button
                startIcon={<EmailIcon />}
                variant="outlined"
              >
                Email Bill
              </Button>
              <Button
                startIcon={<PrintIcon />}
                variant="outlined"
              >
                Print Bill
              </Button>
              {currentBill.status !== 'paid' && (
                <Button
                  startIcon={<PaymentIcon />}
                  variant="contained"
                  onClick={() => setPaymentDialogOpen(true)}
                >
                  Process Payment
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Bill Information */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">Bill To:</Typography>
            <Typography>{currentBill.patientName}</Typography>
            <Typography color="textSecondary">
              Patient ID: {currentBill.patientId}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} textAlign="right">
            <Typography variant="subtitle2">Bill Details:</Typography>
            <Typography>
              Date: {format(new Date(currentBill.createdAt), 'MMM dd, yyyy')}
            </Typography>
            <Typography>
              Status: <Chip 
                label={currentBill.status} 
                color={getStatusColor(currentBill.status)}
                size="small"
              />
            </Typography>
          </Grid>
        </Grid>

        {/* Items Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentBill.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">${item.unitPrice.toFixed(2)}</TableCell>
                  <TableCell align="right">${item.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Totals */}
        <Box mt={3}>
          <Grid container justifyContent="flex-end">
            <Grid item xs={12} md={4}>
              <Box p={2}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography>Subtotal:</Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography>${currentBill.subtotal.toFixed(2)}</Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography>Tax:</Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography>${currentBill.tax.toFixed(2)}</Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography>Discount:</Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography>${currentBill.discount.toFixed(2)}</Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle1">Total:</Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography variant="subtitle1">
                      ${currentBill.totalAmount.toFixed(2)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography>Paid Amount:</Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography color="success.main">
                      ${(currentBill.paidAmount || 0).toFixed(2)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography>Remaining:</Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography color="error.main">
                      ${remainingAmount.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Payment History */}
        {currentBill.payments && currentBill.payments.length > 0 && (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Payment History
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Reference</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentBill.payments.map((payment, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {format(new Date(payment.date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>{payment.reference}</TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell align="right">
                        ${payment.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Notes */}
        {currentBill.notes && (
          <Box mt={4}>
            <Typography variant="subtitle2">Notes:</Typography>
            <Typography>{currentBill.notes}</Typography>
          </Box>
        )}
      </Paper>

      {/* Payment Dialog */}
      <Dialog 
        open={paymentDialogOpen} 
        onClose={() => setPaymentDialogOpen(false)}
      >
        <DialogTitle>Process Payment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Payment Amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
                error={!!paymentError}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Payment Method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                error={!!paymentError}
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="credit_card">Credit Card</MenuItem>
                <MenuItem value="debit_card">Debit Card</MenuItem>
                <MenuItem value="insurance">Insurance</MenuItem>
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
              </TextField>
            </Grid>
            {paymentError && (
              <Grid item xs={12}>
                <Typography color="error">{paymentError}</Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handlePaymentSubmit} variant="contained">
            Process Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BillDetails;
