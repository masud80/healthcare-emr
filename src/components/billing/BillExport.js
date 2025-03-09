import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Typography,
  Box,
  Divider
} from '@mui/material';
import { formatCurrency, formatDate } from '../../utils/billingUtils';

const BillExport = ({ bill, open, onClose }) => {
  const [exportOptions, setExportOptions] = useState({
    format: 'pdf',
    includePaymentHistory: true,
    includeInsuranceDetails: true,
    includeLogo: true,
    includeLetterhead: true
  });

  const handleOptionChange = (option, value) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  const generateBillHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Medical Bill - ${bill.billNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 40px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              max-width: 200px;
              margin-bottom: 20px;
            }
            .bill-info {
              margin-bottom: 30px;
            }
            .patient-info {
              float: left;
              width: 50%;
            }
            .bill-details {
              float: right;
              width: 50%;
              text-align: right;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              padding: 10px;
              border: 1px solid #ddd;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
            }
            .totals {
              text-align: right;
              margin-top: 20px;
            }
            .payment-history {
              margin-top: 30px;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          ${exportOptions.includeLogo || exportOptions.includeLetterhead ? `
            <div class="header">
              ${exportOptions.includeLogo ? `
                <img src="/logo.svg" alt="QuantumLeap Logo" class="logo" />
              ` : ''}
              ${exportOptions.includeLetterhead ? `
                <h1>QuantumLeap EMR System</h1>
                <p>123 Medical Center Drive<br/>
                City, State 12345<br/>
                Phone: (555) 123-4567</p>
              ` : ''}
            </div>
          ` : ''}

          <div class="bill-info">
            <div class="patient-info">
              <h3>Bill To:</h3>
              <p>
                ${bill.patientName}<br/>
                Patient ID: ${bill.patientId}<br/>
                ${bill.patientAddress || ''}
              </p>
            </div>
            <div class="bill-details">
              <h2>Medical Bill</h2>
              <p>
                Bill Number: ${bill.billNumber}<br/>
                Date: ${formatDate(bill.createdAt)}<br/>
                Due Date: ${formatDate(bill.dueDate)}
              </p>
            </div>
          </div>

          <div style="clear: both;"></div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${bill.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.unitPrice)}</td>
                  <td>${formatCurrency(item.amount)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <p>
              Subtotal: ${formatCurrency(bill.subtotal)}<br/>
              Tax: ${formatCurrency(bill.tax)}<br/>
              ${bill.discount > 0 ? `Discount: ${formatCurrency(bill.discount)}<br/>` : ''}
              <strong>Total: ${formatCurrency(bill.totalAmount)}</strong><br/>
              Paid Amount: ${formatCurrency(bill.paidAmount || 0)}<br/>
              Balance Due: ${formatCurrency(bill.totalAmount - (bill.paidAmount || 0))}
            </p>
          </div>

          ${exportOptions.includePaymentHistory && bill.payments?.length > 0 ? `
            <div class="payment-history">
              <h3>Payment History</h3>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Method</th>
                    <th>Reference</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${bill.payments.map(payment => `
                    <tr>
                      <td>${formatDate(payment.date)}</td>
                      <td>${payment.method}</td>
                      <td>${payment.reference}</td>
                      <td>${formatCurrency(payment.amount)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}

          ${exportOptions.includeInsuranceDetails && bill.insurance ? `
            <div class="insurance-details">
              <h3>Insurance Information</h3>
              <p>
                Provider: ${bill.insurance.provider}<br/>
                Policy Number: ${bill.insurance.policyNumber}<br/>
                ${bill.insurance.groupNumber ? `Group Number: ${bill.insurance.groupNumber}<br/>` : ''}
                Status: ${bill.insurance.status}
              </p>
            </div>
          ` : ''}

          <div class="footer">
            <p>Thank you for choosing our healthcare services.</p>
            <p>Please contact our billing department for any questions.</p>
          </div>
        </body>
      </html>
    `;
  };

  const handleExport = () => {
    const html = generateBillHTML();
    
    if (exportOptions.format === 'pdf') {
      // TODO: Implement PDF generation
      console.log('Generating PDF...');
    } else {
      // Download as HTML
      const blob = new Blob([html], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bill-${bill.billNumber}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Export Bill</DialogTitle>
      <DialogContent>
        <Box mb={3}>
          <Typography variant="subtitle1" gutterBottom>
            Export Format
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              value={exportOptions.format}
              onChange={(e) => handleOptionChange('format', e.target.value)}
            >
              <FormControlLabel 
                value="pdf" 
                control={<Radio />} 
                label="PDF Document" 
              />
              <FormControlLabel 
                value="html" 
                control={<Radio />} 
                label="HTML Document" 
              />
            </RadioGroup>
          </FormControl>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Include in Export
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={exportOptions.includePaymentHistory}
                onChange={(e) => handleOptionChange('includePaymentHistory', e.target.checked)}
              />
            }
            label="Payment History"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={exportOptions.includeInsuranceDetails}
                onChange={(e) => handleOptionChange('includeInsuranceDetails', e.target.checked)}
              />
            }
            label="Insurance Details"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={exportOptions.includeLogo}
                onChange={(e) => handleOptionChange('includeLogo', e.target.checked)}
              />
            }
            label="Company Logo"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={exportOptions.includeLetterhead}
                onChange={(e) => handleOptionChange('includeLetterhead', e.target.checked)}
              />
            }
            label="Letterhead"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleExport}>
          Export
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BillExport;
