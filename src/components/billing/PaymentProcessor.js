import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  MenuItem,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { formatCurrency, generatePaymentReference } from '../../utils/billingUtils';

const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'check', label: 'Check' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'other', label: 'Other' }
];

const PaymentProcessor = ({ bill, onProcessPayment, onClose, open }) => {
  const [payment, setPayment] = useState({
    amount: '',
    method: '',
    reference: generatePaymentReference(),
    date: new Date(),
    notes: '',
    cardDetails: {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    },
    checkDetails: {
      checkNumber: '',
      bankName: ''
    }
  });

  const [error, setError] = useState(null);
  const [showCardFields, setShowCardFields] = useState(false);
  const [showCheckFields, setShowCheckFields] = useState(false);

  const handleInputChange = (field, value) => {
    setPayment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCardDetailsChange = (field, value) => {
    setPayment(prev => ({
      ...prev,
      cardDetails: {
        ...prev.cardDetails,
        [field]: value
      }
    }));
  };

  const handleCheckDetailsChange = (field, value) => {
    setPayment(prev => ({
      ...prev,
      checkDetails: {
        ...prev.checkDetails,
        [field]: value
      }
    }));
  };

  const handleMethodChange = (method) => {
    setShowCardFields(method === 'credit_card' || method === 'debit_card');
    setShowCheckFields(method === 'check');
    handleInputChange('method', method);
  };

  const validatePayment = () => {
    if (!payment.amount || !payment.method) {
      setError('Please fill in all required fields');
      return false;
    }

    const amount = parseFloat(payment.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid payment amount');
      return false;
    }

    const remainingBalance = bill.totalAmount - (bill.paidAmount || 0);
    if (amount > remainingBalance) {
      setError('Payment amount cannot exceed the remaining balance');
      return false;
    }

    if (showCardFields) {
      const { cardNumber, expiryDate, cvv, cardholderName } = payment.cardDetails;
      if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
        setError('Please fill in all card details');
        return false;
      }
    }

    if (showCheckFields) {
      const { checkNumber, bankName } = payment.checkDetails;
      if (!checkNumber || !bankName) {
        setError('Please fill in all check details');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validatePayment()) return;

    onProcessPayment({
      ...payment,
      amount: parseFloat(payment.amount)
    });
  };

  const renderPaymentHistory = () => {
    if (!bill.payments || bill.payments.length === 0) {
      return (
        <Typography variant="body2" color="textSecondary">
          No payment history available
        </Typography>
      );
    }

    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Reference</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bill.payments.map((payment, index) => (
              <TableRow key={index}>
                <TableCell>
                  {new Date(payment.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {paymentMethods.find(m => m.value === payment.method)?.label || payment.method}
                </TableCell>
                <TableCell>{payment.reference}</TableCell>
                <TableCell align="right">
                  {formatCurrency(payment.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Process Payment</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Bill Summary */}
          <Grid item xs={12}>
            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>
                Bill Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary">
                    Total Amount
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(bill.totalAmount)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary">
                    Paid Amount
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {formatCurrency(bill.paidAmount || 0)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary">
                    Remaining Balance
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    {formatCurrency(bill.totalAmount - (bill.paidAmount || 0))}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {error && (
            <Grid item xs={12}>
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            </Grid>
          )}

          {/* Payment Details */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Payment Amount"
              type="number"
              value={payment.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              required
              InputProps={{
                startAdornment: '$'
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Payment Method"
              value={payment.method}
              onChange={(e) => handleMethodChange(e.target.value)}
              required
            >
              {paymentMethods.map(method => (
                <MenuItem key={method.value} value={method.value}>
                  {method.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Card Details */}
          {showCardFields && (
            <>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Card Details
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Card Number"
                  value={payment.cardDetails.cardNumber}
                  onChange={(e) => handleCardDetailsChange('cardNumber', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Cardholder Name"
                  value={payment.cardDetails.cardholderName}
                  onChange={(e) => handleCardDetailsChange('cardholderName', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Expiry Date (MM/YY)"
                  value={payment.cardDetails.expiryDate}
                  onChange={(e) => handleCardDetailsChange('expiryDate', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="CVV"
                  type="password"
                  value={payment.cardDetails.cvv}
                  onChange={(e) => handleCardDetailsChange('cvv', e.target.value)}
                  required
                />
              </Grid>
            </>
          )}

          {/* Check Details */}
          {showCheckFields && (
            <>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Check Details
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Check Number"
                  value={payment.checkDetails.checkNumber}
                  onChange={(e) => handleCheckDetailsChange('checkNumber', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bank Name"
                  value={payment.checkDetails.bankName}
                  onChange={(e) => handleCheckDetailsChange('bankName', e.target.value)}
                  required
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <DatePicker
              label="Payment Date"
              value={payment.date}
              onChange={(date) => handleInputChange('date', date)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Notes"
              value={payment.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
            />
          </Grid>

          {/* Payment History */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Payment History
            </Typography>
            {renderPaymentHistory()}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Process Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentProcessor;
