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
  Alert
} from '@mui/material';

const disputeStatuses = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' }
];

const BillingDisputes = ({ bill }) => {
  const [dispute, setDispute] = useState({
    reason: '',
    status: 'open',
    notes: ''
  });

  const [error, setError] = useState(null);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);

  const handleInputChange = (field, value) => {
    setDispute(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitDispute = async () => {
    if (!dispute.reason) {
      setError('Please provide a reason for the dispute');
      return;
    }

    // TODO: Implement dispute submission logic
    // This would typically involve:
    // 1. Saving the dispute to the database
    // 2. Updating the bill status if necessary

    setShowDisputeDialog(false);
    setError(null);
  };

  const renderDisputeHistory = () => {
    if (!bill.disputes || bill.disputes.length === 0) {
      return (
        <Typography variant="body2" color="textSecondary">
          No disputes recorded for this bill.
        </Typography>
      );
    }

    return (
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bill.disputes.map((dispute, index) => (
              <TableRow key={index}>
                <TableCell>{dispute.reason}</TableCell>
                <TableCell>{dispute.status}</TableCell>
                <TableCell>{dispute.notes}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleViewDisputeDetails(dispute)}>
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
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">Billing Disputes</Typography>
          <Button
            variant="contained"
            onClick={() => setShowDisputeDialog(true)}
          >
            Submit New Dispute
          </Button>
        </Box>

        {renderDisputeHistory()}
      </Paper>

      <Dialog open={showDisputeDialog} onClose={() => setShowDisputeDialog(false)}>
        <DialogTitle>Submit Billing Dispute</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dispute Reason"
                value={dispute.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Status"
                value={dispute.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                {disputeStatuses.map(status => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notes"
                value={dispute.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDisputeDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitDispute}>
            Submit Dispute
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BillingDisputes;
