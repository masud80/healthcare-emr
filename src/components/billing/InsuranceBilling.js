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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { formatCurrency } from '../../utils/billingUtils';
import '../../styles/billingDashboard.css'; // Importing the CSS file

const insuranceTypes = [
  { value: 'private', label: 'Private Insurance' },
  { value: 'medicare', label: 'Medicare' },
  { value: 'medicaid', label: 'Medicaid' },
  { value: 'workers_comp', label: "Worker's Compensation" },
  { value: 'other', label: 'Other Insurance' }
];

const claimStatus = {
  pending: { label: 'Pending', color: 'warning' },
  submitted: { label: 'Submitted', color: 'info' },
  approved: { label: 'Approved', color: 'success' },
  denied: { label: 'Denied', color: 'error' },
  resubmitted: { label: 'Resubmitted', color: 'warning' },
  partial: { label: 'Partially Approved', color: 'warning' }
};

const InsuranceBilling = ({ bill = null }) => {
  const [insuranceClaim, setInsuranceClaim] = useState({
    insuranceProvider: '',
    policyNumber: '',
    groupNumber: '',
    subscriberId: '',
    subscriberName: '',
    relationToSubscriber: 'self',
    insuranceType: '',
    preAuthNumber: '',
    claimNumber: '',
    submissionDate: null,
    status: 'pending',
    coveredAmount: '',
    deductible: '',
    copay: '',
    notes: ''
  });

  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [error, setError] = useState(null);

  if (!bill) {
    return (
      <Paper className="paper" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">Insurance Claims</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          No bill selected
        </Typography>
      </Paper>
    );
  }

  const handleInputChange = (field, value) => {
    setInsuranceClaim(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitClaim = async () => {
    try {
      // Validate required fields
      const requiredFields = [
        'insuranceProvider',
        'policyNumber',
        'subscriberId',
        'subscriberName',
        'insuranceType'
      ];

      const missingFields = requiredFields.filter(field => !insuranceClaim[field]);
      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

      // TODO: Implement claim submission logic
      // This would typically involve:
      // 1. Formatting claim data according to insurance provider's requirements
      // 2. Submitting to insurance provider's API or generating claim forms
      // 3. Updating bill status and claim tracking information
      
      setShowClaimDialog(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleViewClaimDetails = (claim) => {
    // Logic to view claim details
    console.log('Viewing claim details for:', claim);
  };

  const renderClaimHistory = () => {
    if (!bill.claims || bill.claims.length === 0) {
      return (
        <Typography variant="body2" color="textSecondary">
          No claims history available
        </Typography>
      );
    }

    return (
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Claim Number</TableCell>
              <TableCell>Insurance</TableCell>
              <TableCell>Submission Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bill.claims.map((claim, index) => (
              <TableRow key={index}>
                <TableCell>{claim.claimNumber}</TableCell>
                <TableCell>{claim.insuranceProvider}</TableCell>
                <TableCell>{new Date(claim.submissionDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip
                    label={claimStatus[claim.status].label}
                    color={claimStatus[claim.status].color}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(claim.coveredAmount)}
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => handleViewClaimDetails(claim)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Container>
<Paper className="paper" sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">Insurance Claims</Typography>
          <Button
            variant="contained"
            onClick={() => setShowClaimDialog(true)}
          >
            Submit New Claim
          </Button>
        </Box>

        {renderClaimHistory()}
      </Paper>

      <Dialog
        open={showClaimDialog}
        onClose={() => setShowClaimDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Submit Insurance Claim</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Insurance Provider"
                value={insuranceClaim.insuranceProvider}
                onChange={(e) => handleInputChange('insuranceProvider', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Insurance Type"
                value={insuranceClaim.insuranceType}
                onChange={(e) => handleInputChange('insuranceType', e.target.value)}
                required
              >
                {insuranceTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Policy Number"
                value={insuranceClaim.policyNumber}
                onChange={(e) => handleInputChange('policyNumber', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Group Number"
                value={insuranceClaim.groupNumber}
                onChange={(e) => handleInputChange('groupNumber', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Subscriber ID"
                value={insuranceClaim.subscriberId}
                onChange={(e) => handleInputChange('subscriberId', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Subscriber Name"
                value={insuranceClaim.subscriberName}
                onChange={(e) => handleInputChange('subscriberName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Relation to Subscriber"
                value={insuranceClaim.relationToSubscriber}
                onChange={(e) => handleInputChange('relationToSubscriber', e.target.value)}
              >
                <MenuItem value="self">Self</MenuItem>
                <MenuItem value="spouse">Spouse</MenuItem>
                <MenuItem value="child">Child</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Pre-Authorization Number"
                value={insuranceClaim.preAuthNumber}
                onChange={(e) => handleInputChange('preAuthNumber', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Submission Date"
                value={insuranceClaim.submissionDate}
                onChange={(date) => handleInputChange('submissionDate', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Expected Coverage Amount"
                value={insuranceClaim.coveredAmount}
                onChange={(e) => handleInputChange('coveredAmount', e.target.value)}
                InputProps={{
                  startAdornment: '$'
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Deductible"
                value={insuranceClaim.deductible}
                onChange={(e) => handleInputChange('deductible', e.target.value)}
                InputProps={{
                  startAdornment: '$'
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Copay"
                value={insuranceClaim.copay}
                onChange={(e) => handleInputChange('copay', e.target.value)}
                InputProps={{
                  startAdornment: '$'
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notes"
                value={insuranceClaim.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowClaimDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitClaim}
          >
            Submit Claim
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InsuranceBilling;
