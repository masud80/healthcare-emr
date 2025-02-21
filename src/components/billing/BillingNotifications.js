import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Checkbox,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

const BillingNotifications = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: false,
    paymentReminders: true,
    lateFeeAlerts: false
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  const handleToggleNotification = (field) => {
    setNotifications(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSaveNotifications = () => {
    // TODO: Implement save logic to backend
    setSuccess('Notification settings saved successfully');
    setShowDialog(false);
  };

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Billing Notifications
        </Typography>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6">Notification Preferences</Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={notifications.email}
                    onChange={() => handleToggleNotification('email')}
                  />
                }
                label="Email Notifications"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={notifications.sms}
                    onChange={() => handleToggleNotification('sms')}
                  />
                }
                label="SMS Notifications"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={notifications.push}
                    onChange={() => handleToggleNotification('push')}
                  />
                }
                label="Push Notifications"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={notifications.paymentReminders}
                    onChange={() => handleToggleNotification('paymentReminders')}
                  />
                }
                label="Payment Reminders"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={notifications.lateFeeAlerts}
                    onChange={() => handleToggleNotification('lateFeeAlerts')}
                  />
                }
                label="Late Fee Alerts"
              />
            </Grid>
          </Grid>

          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              onClick={() => setShowDialog(true)}
            >
              Save Settings
            </Button>
          </Box>
        </Paper>
      </Box>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogTitle>Confirm Save</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to save these notification settings?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveNotifications} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BillingNotifications;
