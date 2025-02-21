import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers';
import { Add as AddIcon, FilterList as FilterIcon } from '@mui/icons-material';
import { fetchBills } from '../../redux/thunks/billingThunks';
import InsuranceBilling from './InsuranceBilling'; // Single import
import { setFilters } from '../../redux/slices/billingSlice';
import '../../styles/billingDashboard.css'; // Importing the CSS file

const BillingDashboard = () => {
  const navigate = useNavigate();
  const role = useSelector(state => state.auth.role);
  const user = useSelector(state => state.auth.user);
  
  console.log('Current User:', user);
  console.log('User Role:', role);
  const dispatch = useDispatch();
  const { bills, loading, error, filters } = useSelector(state => state.billing);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchBills());
  }, [dispatch]);

  // Calculate summary statistics
  const summaryStats = bills.reduce((acc, bill) => {
    acc.totalBilled += parseFloat(bill.totalAmount || 0);
    acc.totalPaid += parseFloat(bill.paidAmount || 0);
    acc.totalPending += parseFloat(bill.totalAmount || 0) - parseFloat(bill.paidAmount || 0);
    
    // Handle undefined status as 'pending'
    const status = bill.status || 'pending';
    acc[status] = (acc[status] || 0) + 1;
    
    return acc;
  }, {
    totalBilled: 0,
    totalPaid: 0,
    totalPending: 0,
    pending: 0,
    partial: 0,
    paid: 0
  });

  console.log('Bills:', bills);
  console.log('Summary Stats:', summaryStats);

  const handleFilterChange = (field, value) => {
    dispatch(setFilters({ [field]: value }));
  };

  const handleDateRangeChange = (field, date) => {
    dispatch(setFilters({ 
      dateRange: {
        ...filters.dateRange,
        [field]: date?.toISOString() || null
      }
    }));
  };

  if (error) {
    return (
      <Container>
        <Typography color="error">Error: {error}</Typography>
      </Container>
    );
  }

  if (bills.length === 0) {
    return (
      <Container>
        <Typography>No billing information available.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Grid container spacing={3} alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h4" component="h1">Billing Dashboard</Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              href="/billing/create"
            >
              Create New Bill
            </Button>
            <IconButton 
              onClick={() => setShowFilters(!showFilters)}
              className="ml-1"
            >
              <FilterIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Box>

      {/* Filters */}
      {showFilters && (
        <Paper className="p-2 mb-3">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                label="Status"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="partial">Partial</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <DatePicker
                label="From Date"
                value={filters.dateRange?.start || null}
                onChange={(date) => handleDateRangeChange('start', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <DatePicker
                label="To Date"
                value={filters.dateRange?.end || null}
                onChange={(date) => handleDateRangeChange('end', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
  <Grid item xs={12} sm={6} md={3}>
    <Card className="border-solid">
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
          Total Billed
        </Typography>
        <Typography variant="h5">
          ${summaryStats.totalBilled.toFixed(2)}
        </Typography>
      </CardContent>
    </Card>
  </Grid>
  <Grid item xs={12} sm={6} md={3}>
    <Card className="border-solid">
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
          Total Paid
        </Typography>
        <Typography variant="h5" color="success.main">
          ${summaryStats.totalPaid.toFixed(2)}
        </Typography>
      </CardContent>
    </Card>
  </Grid>
  <Grid item xs={12} sm={6} md={3}>
    <Card className="border-solid">
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
          Total Pending
        </Typography>
        <Typography variant="h5" color="error.main">
          ${summaryStats.totalPending.toFixed(2)}
        </Typography>
      </CardContent>
    </Card>
  </Grid>
  <Grid item xs={12} sm={6} md={3}>
    <Card className="border-solid">
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
          Bills Status
        </Typography>
        <Typography variant="body2">
          Pending: {summaryStats.pending}
        </Typography>
        <Typography variant="body2">
          Partial: {summaryStats.partial}
        </Typography>
        <Typography variant="body2">
          Paid: {summaryStats.paid}
        </Typography>
      </CardContent>
    </Card>
  </Grid>
</Grid>
      {/* Bills List */}
      <Card>
        <CardContent className='border-solid'>     
          <Typography variant="h6" gutterBottom>
            Recent Bills
          </Typography>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Bill Number</TableCell>
                  <TableCell>Patient Name</TableCell>
                  <TableCell>Facility</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell>{bill.billNumber}</TableCell>
                    <TableCell>{bill.patientName}</TableCell>
                    <TableCell>{bill.facilityId}</TableCell>
                    <TableCell>{new Date(bill.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">${(parseFloat(bill.totalAmount || 0)).toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={bill.status ? bill.status.charAt(0).toUpperCase() + bill.status.slice(1) : 'Pending'}
                        color={
                          !bill.status || bill.status === 'pending' ? 'error' :
                          bill.status === 'paid' ? 'success' :
                          bill.status === 'partial' ? 'warning' : 'error'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/billing/${bill.id}`)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}    
        </CardContent>
      </Card>

      {/* Insurance Claims Section */}
      <Box mt={4}>
        <InsuranceBilling bill={bills[0]} />
      </Box>
    </Container>
  );
};

export default BillingDashboard;
