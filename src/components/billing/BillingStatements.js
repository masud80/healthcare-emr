import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Print as PrintIcon,
  Email as EmailIcon,
  Download as DownloadIcon,
  Preview as PreviewIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { formatCurrency, formatDate } from '../../utils/billingUtils';

const statementTypes = [
  { value: 'individual', label: 'Individual Statement' },
  { value: 'batch', label: 'Batch Statements' },
  { value: 'aging', label: 'Aging Report' },
  { value: 'collection', label: 'Collection Report' },
  { value: 'revenue', label: 'Revenue Report' }
];

const BillingStatements = () => {
  const [filters, setFilters] = useState({
    type: 'individual',
    patientId: '',
    dateRange: {
      start: null,
      end: null
    },
    status: 'all',
    facility: 'all'
  });

  const [selectedBills, setSelectedBills] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [statementOptions, setStatementOptions] = useState({
    includePaidBills: false,
    includePaymentHistory: true,
    includeInsuranceInfo: true,
    showLogo: true,
    detailedTransactions: true
  });

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateRangeChange = (field, date) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: date
      }
    }));
  };

  const handleOptionChange = (option) => {
    setStatementOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleBillSelection = (billId) => {
    setSelectedBills(prev => {
      if (prev.includes(billId)) {
        return prev.filter(id => id !== billId);
      }
      return [...prev, billId];
    });
  };

  const handleGenerateStatements = () => {
    // TODO: Implement statement generation logic
    console.log('Generating statements with options:', statementOptions);
  };

  const handleEmailStatements = () => {
    // TODO: Implement email sending logic
    console.log('Emailing statements to selected patients');
  };

  const renderStatementPreview = () => {
    return (
      <Dialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Statement Preview</DialogTitle>
        <DialogContent>
          {/* Statement Preview Content */}
          <Box sx={{ minHeight: '60vh', p: 2, border: '1px solid #ddd' }}>
            {statementOptions.showLogo && (
              <Box textAlign="center" mb={3}>
                <Typography variant="h5">QuantumLeap EMR System</Typography>
                <Typography variant="body2">123 Medical Center Drive</Typography>
                <Typography variant="body2">City, State 12345</Typography>
              </Box>
            )}

            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Statement Date:</Typography>
                <Typography>{formatDate(new Date())}</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography variant="subtitle2">Account Number:</Typography>
                <Typography>ACC-12345</Typography>
              </Grid>
            </Grid>

            <Box mt={4}>
              <Typography variant="h6">Account Summary</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Charges</TableCell>
                      <TableCell align="right">Payments</TableCell>
                      <TableCell align="right">Balance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* Sample data */}
                    <TableRow>
                      <TableCell>{formatDate(new Date())}</TableCell>
                      <TableCell>Office Visit</TableCell>
                      <TableCell align="right">$150.00</TableCell>
                      <TableCell align="right">$0.00</TableCell>
                      <TableCell align="right">$150.00</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {statementOptions.includePaymentHistory && (
              <Box mt={4}>
                <Typography variant="h6">Payment History</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Method</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {/* Sample data */}
                      <TableRow>
                        <TableCell>{formatDate(new Date())}</TableCell>
                        <TableCell>Credit Card</TableCell>
                        <TableCell align="right">$50.00</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handleGenerateStatements}
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Billing Statements
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Statement Type"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                {statementTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <DatePicker
                label="Start Date"
                value={filters.dateRange.start}
                onChange={(date) => handleDateRangeChange('start', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <DatePicker
                label="End Date"
                value={filters.dateRange.end}
                onChange={(date) => handleDateRangeChange('end', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
          </Grid>

          <Box mt={3}>
            <Typography variant="subtitle1" gutterBottom>
              Statement Options
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={statementOptions.includePaidBills}
                      onChange={() => handleOptionChange('includePaidBills')}
                    />
                  }
                  label="Include Paid Bills"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={statementOptions.includePaymentHistory}
                      onChange={() => handleOptionChange('includePaymentHistory')}
                    />
                  }
                  label="Include Payment History"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={statementOptions.includeInsuranceInfo}
                      onChange={() => handleOptionChange('includeInsuranceInfo')}
                    />
                  }
                  label="Include Insurance Info"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={statementOptions.showLogo}
                      onChange={() => handleOptionChange('showLogo')}
                    />
                  }
                  label="Show Logo"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={statementOptions.detailedTransactions}
                      onChange={() => handleOptionChange('detailedTransactions')}
                    />
                  }
                  label="Detailed Transactions"
                />
              </Grid>
            </Grid>
          </Box>
        </Paper>

        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="h6">
            Selected Bills: {selectedBills.length}
          </Typography>
          <Box>
            <Button
              startIcon={<PreviewIcon />}
              onClick={() => setShowPreview(true)}
              sx={{ mr: 1 }}
            >
              Preview
            </Button>
            <Button
              startIcon={<PrintIcon />}
              onClick={handleGenerateStatements}
              sx={{ mr: 1 }}
            >
              Print
            </Button>
            <Button
              startIcon={<EmailIcon />}
              onClick={handleEmailStatements}
              sx={{ mr: 1 }}
            >
              Email
            </Button>
            <Button
              startIcon={<DownloadIcon />}
              onClick={handleGenerateStatements}
            >
              Download
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    onChange={(e) => {
                      // TODO: Implement select all
                    }}
                  />
                </TableCell>
                <TableCell>Bill #</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Sample data - replace with actual bills */}
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedBills.includes('BILL-001')}
                    onChange={() => handleBillSelection('BILL-001')}
                  />
                </TableCell>
                <TableCell>BILL-001</TableCell>
                <TableCell>John Doe</TableCell>
                <TableCell>{formatDate(new Date())}</TableCell>
                <TableCell align="right">{formatCurrency(150.00)}</TableCell>
                <TableCell>
                  <Chip label="Pending" color="warning" size="small" />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => setShowPreview(true)}>
                    <PreviewIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {renderStatementPreview()}
    </Container>
  );
};

export default BillingStatements;
