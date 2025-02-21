import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { jsPDF } from 'jspdf';
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
import { 
  fetchBillById, 
  processPayment,
  emailBill
} from '../../redux/thunks/billingThunks';

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

  const handleEmailBill = async () => {
    try {
      await dispatch(emailBill(billId));
    } catch (error) {
      console.error('Error emailing bill:', error);
    }
  };

  const handlePrintBill = async () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;

      // Add header
      doc.setFontSize(20);
      doc.text('Healthcare EMR Bill', pageWidth / 2, yPos, { align: 'center' });
      
      // Add bill details
      yPos += 20;
      doc.setFontSize(12);
      doc.text(`Bill Number: ${currentBill.billNumber}`, 20, yPos);
      yPos += 10;
      doc.text(`Date: ${currentBill.createdAt ? format(new Date(currentBill.createdAt), 'MMM dd, yyyy') : 'N/A'}`, 20, yPos);
      yPos += 10;
      doc.text(`Patient: ${currentBill.patientName}`, 20, yPos);
      yPos += 10;
      doc.text(`Patient ID: ${currentBill.patientId}`, 20, yPos);
      
      // Add items table
      yPos += 20;
      doc.text('Items:', 20, yPos);
      yPos += 10;
      
      // Table headers
      const columns = ['Description', 'Qty', 'Unit Price', 'Amount'];
      let startX = 20;
      columns.forEach(column => {
        doc.text(column, startX, yPos);
        startX += 45;
      });
      
      // Table rows
      yPos += 10;
      currentBill.items.forEach(item => {
        startX = 20;
        doc.text(item.description, startX, yPos);
        startX += 45;
        doc.text(item.quantity.toString(), startX, yPos);
        startX += 45;
        doc.text(`$${item.unitPrice.toFixed(2)}`, startX, yPos);
        startX += 45;
        doc.text(`$${item.amount.toFixed(2)}`, startX, yPos);
        yPos += 10;
      });
      
      // Add totals
      yPos += 10;
      doc.text(`Subtotal: $${currentBill.subtotal.toFixed(2)}`, pageWidth - 60, yPos);
      yPos += 10;
      doc.text(`Tax: $${currentBill.tax.toFixed(2)}`, pageWidth - 60, yPos);
      yPos += 10;
      doc.text(`Total Amount: $${currentBill.totalAmount.toFixed(2)}`, pageWidth - 60, yPos);
      yPos += 10;
      doc.text(`Amount Paid: $${(currentBill.paidAmount || 0).toFixed(2)}`, pageWidth - 60, yPos);
      yPos += 10;
      const remainingAmount = (currentBill.totalAmount || 0) - (currentBill.paidAmount || 0);
      doc.text(`Remaining Balance: $${remainingAmount.toFixed(2)}`, pageWidth - 60, yPos);
      
      // Save the PDF
      doc.save(`bill-${currentBill.billNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
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

    const remainingAmount = (currentBill.totalAmount || 0) - (currentBill.paidAmount || 0);
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

  const remainingAmount = (currentBill.totalAmount || 0) - (currentBill.paidAmount || 0);

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 3 }}>
        {/* Header */}
        <Grid container justifyContent="space-between" alignItems="center" mb={3}>
          <Grid item>
            <Typography variant="h5">Bill Details</Typography>
            <Typography color="textSecondary">
              #{currentBill.billNumber || ''}
            </Typography>
          </Grid>
          <Grid item>
            <Box display="flex" gap={2}>
              <Button
                startIcon={<EmailIcon />}
                variant="outlined"
                onClick={handleEmailBill}
                disabled={loading}
              >
                Email Bill
              </Button>
              <Button
                startIcon={<PrintIcon />}
                variant="outlined"
                onClick={handlePrintBill}
                disabled={loading}
              >
                Print Bill
              </Button>
              {(currentBill.status || 'pending') !== 'paid' && (
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
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Patient Information</Typography>
            <Typography>Name: {currentBill.patientName}</Typography>
            <Typography>ID: {currentBill.patientId}</Typography>
            <Typography>Date: {currentBill.createdAt ? format(new Date(currentBill.createdAt), 'MMM dd, yyyy') : 'N/A'}</Typography>
            <Typography>Due Date: {currentBill.dueDate ? format(new Date(currentBill.dueDate), 'MMM dd, yyyy') : 'N/A'}</Typography>
            <Typography>Payment Terms: {currentBill.paymentTerms}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Bill Status</Typography>
            <Typography>
              Status: <Chip 
                label={currentBill.status || 'pending'} 
                color={currentBill.status === 'paid' ? 'success' : 'warning'}
              />
            </Typography>
            <Typography>Subtotal: ${currentBill.subtotal.toFixed(2)}</Typography>
            <Typography>Tax: ${currentBill.tax.toFixed(2)}</Typography>
            <Typography>Total Amount: ${currentBill.totalAmount.toFixed(2)}</Typography>
            <Typography>Amount Paid: ${(currentBill.paidAmount || 0).toFixed(2)}</Typography>
            <Typography>Remaining Balance: ${remainingAmount.toFixed(2)}</Typography>
          </Grid>
          
          {/* Bill Items */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Items</Typography>
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
          </Grid>

          {/* Notes */}
          {currentBill.notes && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Notes</Typography>
              <Typography>{currentBill.notes}</Typography>
            </Grid>
          )}
        </Grid>
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
