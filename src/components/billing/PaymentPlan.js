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
  Chip,
  Switch,
  FormControlLabel
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { formatCurrency } from '../../utils/billingUtils';

const frequencies = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' }
];

const PaymentPlan = ({ bill, onCreatePlan, onClose, open }) => {
  const [plan, setPlan] = useState({
    totalAmount: bill.totalAmount - (bill.paidAmount || 0),
    numberOfPayments: 12,
    frequency: 'monthly',
    startDate: new Date(),
    automaticPayment: false,
    paymentMethod: '',
    notes: '',
    paymentSchedule: []
  });

  const [error, setError] = useState(null);

  const handleInputChange = (field, value) => {
    setPlan(prev => {
      const newPlan = {
        ...prev,
        [field]: value
      };
      // Recalculate payment schedule when relevant fields change
      if (['totalAmount', 'numberOfPayments', 'frequency', 'startDate'].includes(field)) {
        newPlan.paymentSchedule = calculatePaymentSchedule(newPlan);
      }
      return newPlan;
    });
  };

  const calculatePaymentSchedule = (planData) => {
    const {
      totalAmount,
      numberOfPayments,
      frequency,
      startDate
    } = planData;

    const paymentAmount = parseFloat((totalAmount / numberOfPayments).toFixed(2));
    const remainingCents = Math.round((totalAmount - (paymentAmount * numberOfPayments)) * 100);

    const schedule = [];
    let currentDate = new Date(startDate);

    for (let i = 0; i < numberOfPayments; i++) {
      schedule.push({
        paymentNumber: i + 1,
        dueDate: new Date(currentDate),
        amount: i === numberOfPayments - 1 
          ? paymentAmount + (remainingCents / 100)
          : paymentAmount,
        status: 'pending'
      });

      // Calculate next payment date based on frequency
      switch (frequency) {
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'biweekly':
          currentDate.setDate(currentDate.getDate() + 14);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        case 'quarterly':
          currentDate.setMonth(currentDate.getMonth() + 3);
          break;
        default:
          currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    return schedule;
  };

  const validatePlan = () => {
    if (!plan.numberOfPayments || plan.numberOfPayments < 1) {
      setError('Please enter a valid number of payments');
      return false;
    }

    if (!plan.frequency) {
      setError('Please select a payment frequency');
      return false;
    }

    if (!plan.startDate) {
      setError('Please select a start date');
      return false;
    }

    if (plan.automaticPayment && !plan.paymentMethod) {
      setError('Please select a payment method for automatic payments');
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validatePlan()) return;

    onCreatePlan({
      ...plan,
      billId: bill.id,
      createdAt: new Date().toISOString(),
      status: 'active'
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create Payment Plan</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Summary */}
          <Grid item xs={12}>
            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>
                Payment Plan Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} md={4}>
                  <Typography variant="body2" color="textSecondary">
                    Total Outstanding
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(plan.totalAmount)}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={4}>
                  <Typography variant="body2" color="textSecondary">
                    Estimated Monthly Payment
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(plan.totalAmount / plan.numberOfPayments)}
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

          {/* Plan Details */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Number of Payments"
              value={plan.numberOfPayments}
              onChange={(e) => handleInputChange('numberOfPayments', parseInt(e.target.value))}
              required
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Payment Frequency"
              value={plan.frequency}
              onChange={(e) => handleInputChange('frequency', e.target.value)}
              required
            >
              {frequencies.map(freq => (
                <MenuItem key={freq.value} value={freq.value}>
                  {freq.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="Start Date"
              value={plan.startDate}
              onChange={(date) => handleInputChange('startDate', date)}
              renderInput={(params) => <TextField {...params} fullWidth required />}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={plan.automaticPayment}
                  onChange={(e) => handleInputChange('automaticPayment', e.target.checked)}
                />
              }
              label="Enable Automatic Payments"
            />
          </Grid>

          {plan.automaticPayment && (
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Payment Method"
                value={plan.paymentMethod}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                required
              >
                <MenuItem value="credit_card">Credit Card</MenuItem>
                <MenuItem value="debit_card">Debit Card</MenuItem>
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
              </TextField>
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Notes"
              value={plan.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
            />
          </Grid>

          {/* Payment Schedule */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Payment Schedule
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Payment #</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {plan.paymentSchedule.map((payment) => (
                    <TableRow key={payment.paymentNumber}>
                      <TableCell>{payment.paymentNumber}</TableCell>
                      <TableCell>
                        {payment.dueDate.toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={payment.status}
                          color={payment.status === 'pending' ? 'default' : 'success'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Create Payment Plan
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentPlan;
