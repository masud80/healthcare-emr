import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { formatDate } from '../../utils/billingUtils';

const BillingAudit = () => {
  const { bills } = useSelector(state => state.billing);
  const [auditLogs, setAuditLogs] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch audit logs from the backend or generate sample logs
    fetchAuditLogs();
  }, [bills]);

  const fetchAuditLogs = () => {
    // TODO: Implement fetching audit logs from the backend
    // For now, we will generate sample logs
    const sampleLogs = bills.map(bill => ({
      id: bill.id,
      action: 'Created Bill',
      timestamp: new Date(bill.createdAt).toISOString(),
      user: 'admin', // Replace with actual user data
      details: `Bill ${bill.billNumber} created for ${bill.patientName}`
    }));
    setAuditLogs(sampleLogs);
  };

  const handleViewLogDetails = (log) => {
    setSelectedLog(log);
    setShowDialog(true);
  };

  const renderAuditLogDetails = () => {
    if (!selectedLog) return null;

    return (
      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogTitle>Audit Log Details</DialogTitle>
        <DialogContent>
          <Typography variant="body1"><strong>Action:</strong> {selectedLog.action}</Typography>
          <Typography variant="body1"><strong>Timestamp:</strong> {formatDate(selectedLog.timestamp)}</Typography>
          <Typography variant="body1"><strong>User:</strong> {selectedLog.user}</Typography>
          <Typography variant="body1"><strong>Details:</strong> {selectedLog.details}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Billing Audit Logs
        </Typography>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Action</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditLogs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>{formatDate(log.timestamp)}</TableCell>
                    <TableCell>{log.details}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleViewLogDetails(log)}>View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {renderAuditLogDetails()}
    </Container>
  );
};

export default BillingAudit;
