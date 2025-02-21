import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Divider,
  Switch,
  FormControlLabel,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon
} from '@mui/icons-material';

const defaultSettings = {
  company: {
    name: '',
    address: '',
    phone: '',
    email: '',
    taxId: '',
    logo: ''
  },
  billing: {
    defaultDueDate: 30,
    defaultPaymentTerms: 'net_30',
    defaultTaxRate: 0.1,
    enableLateFees: false,
    lateFeePercentage: 0.02,
    gracePeriod: 15,
    minimumPayment: 25,
    roundingMethod: 'round',
    currencyFormat: 'USD'
  },
  notifications: {
    enableEmailNotifications: true,
    enableSMSNotifications: false,
    paymentReminders: true,
    reminderDays: [1, 3, 7],
    sendReceipts: true,
    sendLateFeeNotifications: true
  },
  paymentMethods: {
    cash: { enabled: true, label: 'Cash' },
    credit_card: { enabled: true, label: 'Credit Card' },
    debit_card: { enabled: true, label: 'Debit Card' },
    bank_transfer: { enabled: true, label: 'Bank Transfer' },
    check: { enabled: true, label: 'Check' },
    insurance: { enabled: true, label: 'Insurance' }
  }
};

const BillingSettings = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [editingService, setEditingService] = useState(null);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [services, setServices] = useState([
    { code: 'CONSULT', name: 'Consultation', price: 150.00, taxable: true },
    { code: 'XRAY', name: 'X-Ray', price: 200.00, taxable: true },
    { code: 'LAB', name: 'Laboratory Test', price: 75.00, taxable: true }
  ]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSettingChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handlePaymentMethodToggle = (method) => {
    setSettings(prev => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        [method]: {
          ...prev.paymentMethods[method],
          enabled: !prev.paymentMethods[method].enabled
        }
      }
    }));
  };

  const handleServiceChange = (field, value) => {
    setEditingService(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateService = (service) => {
    if (!service.code || !service.name || !service.price) {
      setError('Please fill in all required fields');
      return false;
    }
    if (service.price <= 0) {
      setError('Price must be greater than 0');
      return false;
    }
    return true;
  };

  const handleSaveService = () => {
    if (!validateService(editingService)) return;

    if (editingService.id) {
      // Update existing service
      setServices(prev =>
        prev.map(service =>
          service.id === editingService.id ? editingService : service
        )
      );
    } else {
      // Add new service
      setServices(prev => [
        ...prev,
        { ...editingService, id: Date.now().toString() }
      ]);
    }

    setShowServiceDialog(false);
    setEditingService(null);
    setSuccess('Service saved successfully');
  };

  const handleDeleteService = (serviceId) => {
    setServices(prev => prev.filter(service => service.id !== serviceId));
    setSuccess('Service deleted successfully');
  };

  const handleSaveSettings = async () => {
    try {
      // TODO: Implement settings save to backend
      setSuccess('Settings saved successfully');
    } catch (err) {
      setError('Failed to save settings');
    }
  };

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Billing Settings
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

        <Grid container spacing={3}>
          {/* Company Information */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Company Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    value={settings.company.name}
                    onChange={(e) => handleSettingChange('company', 'name', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tax ID"
                    value={settings.company.taxId}
                    onChange={(e) => handleSettingChange('company', 'taxId', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Address"
                    value={settings.company.address}
                    onChange={(e) => handleSettingChange('company', 'address', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={settings.company.phone}
                    onChange={(e) => handleSettingChange('company', 'phone', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={settings.company.email}
                    onChange={(e) => handleSettingChange('company', 'email', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Billing Settings */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Billing Configuration
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Default Due Date (days)"
                    value={settings.billing.defaultDueDate}
                    onChange={(e) => handleSettingChange('billing', 'defaultDueDate', parseInt(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Default Payment Terms"
                    value={settings.billing.defaultPaymentTerms}
                    onChange={(e) => handleSettingChange('billing', 'defaultPaymentTerms', e.target.value)}
                  >
                    <MenuItem value="due_on_receipt">Due on Receipt</MenuItem>
                    <MenuItem value="net_15">Net 15</MenuItem>
                    <MenuItem value="net_30">Net 30</MenuItem>
                    <MenuItem value="net_45">Net 45</MenuItem>
                    <MenuItem value="net_60">Net 60</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Default Tax Rate"
                    value={settings.billing.defaultTaxRate}
                    onChange={(e) => handleSettingChange('billing', 'defaultTaxRate', parseFloat(e.target.value))}
                    InputProps={{
                      inputProps: { min: 0, max: 1, step: 0.01 }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Minimum Payment Amount"
                    value={settings.billing.minimumPayment}
                    onChange={(e) => handleSettingChange('billing', 'minimumPayment', parseFloat(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.billing.enableLateFees}
                        onChange={(e) => handleSettingChange('billing', 'enableLateFees', e.target.checked)}
                      />
                    }
                    label="Enable Late Fees"
                  />
                </Grid>
                {settings.billing.enableLateFees && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Late Fee Percentage"
                        value={settings.billing.lateFeePercentage}
                        onChange={(e) => handleSettingChange('billing', 'lateFeePercentage', parseFloat(e.target.value))}
                        InputProps={{
                          inputProps: { min: 0, max: 1, step: 0.01 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Grace Period (days)"
                        value={settings.billing.gracePeriod}
                        onChange={(e) => handleSettingChange('billing', 'gracePeriod', parseInt(e.target.value))}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>
          </Grid>

          {/* Payment Methods */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Payment Methods
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(settings.paymentMethods).map(([method, config]) => (
                  <Grid item xs={12} sm={6} md={4} key={method}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.enabled}
                          onChange={() => handlePaymentMethodToggle(method)}
                        />
                      }
                      label={config.label}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* Notification Settings */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Notifications
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.enableEmailNotifications}
                        onChange={(e) => handleSettingChange('notifications', 'enableEmailNotifications', e.target.checked)}
                      />
                    }
                    label="Enable Email Notifications"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.enableSMSNotifications}
                        onChange={(e) => handleSettingChange('notifications', 'enableSMSNotifications', e.target.checked)}
                      />
                    }
                    label="Enable SMS Notifications"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.paymentReminders}
                        onChange={(e) => handleSettingChange('notifications', 'paymentReminders', e.target.checked)}
                      />
                    }
                    label="Send Payment Reminders"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Services */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Services & Prices
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingService({
                      code: '',
                      name: '',
                      price: '',
                      taxable: true
                    });
                    setShowServiceDialog(true);
                  }}
                >
                  Add Service
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Code</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell>Taxable</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>{service.code}</TableCell>
                        <TableCell>{service.name}</TableCell>
                        <TableCell align="right">${service.price.toFixed(2)}</TableCell>
                        <TableCell>{service.taxable ? 'Yes' : 'No'}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingService(service);
                              setShowServiceDialog(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteService(service.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>

        <Box mt={4} display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveSettings}
          >
            Save Settings
          </Button>
        </Box>
      </Box>

      {/* Service Dialog */}
      <Dialog
        open={showServiceDialog}
        onClose={() => {
          setShowServiceDialog(false);
          setEditingService(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingService?.id ? 'Edit Service' : 'Add Service'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Service Code"
                value={editingService?.code || ''}
                onChange={(e) => handleServiceChange('code', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Service Name"
                value={editingService?.name || ''}
                onChange={(e) => handleServiceChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Price"
                value={editingService?.price || ''}
                onChange={(e) => handleServiceChange('price', parseFloat(e.target.value))}
                required
                InputProps={{
                  startAdornment: '$'
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editingService?.taxable || false}
                    onChange={(e) => handleServiceChange('taxable', e.target.checked)}
                  />
                }
                label="Taxable"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowServiceDialog(false);
              setEditingService(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveService}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BillingSettings;
