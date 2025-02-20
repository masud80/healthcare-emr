import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createAppointment } from '../../redux/slices/appointmentsSlice';
import { fetchPatients } from '../../redux/slices/patientsSlice';
import { 
  TextField, 
  Button, 
  Box, 
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  CircularProgress
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const CreateAppointment = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const patients = useSelector(state => state.patients.patients);
  const loading = useSelector(state => state.appointments.loading);
  const patientsLoading = useSelector(state => state.patients.loading);
  const patientsError = useSelector(state => state.patients.error);
  const [fetchError, setFetchError] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    dispatch(fetchPatients())
      .unwrap()
      .catch(error => {
        console.error('Error fetching patients:', error);
        setFetchError('Failed to load patients. Please refresh the page.');
      });
  }, [dispatch]);

  const [formData, setFormData] = useState({
    patientId: '',
    date: new Date(),
    purpose: '',
    status: 'scheduled',
    notes: ''
  });

  const handleDateChange = (newDate) => {
    setFormData(prev => ({ ...prev, date: newDate }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const selectedPatient = patients.find(p => p.id === formData.patientId);
      
      const appointmentData = {
        ...formData,
        patientName: selectedPatient.name,
        date: formData.date.toISOString()
      };

      const result = await dispatch(createAppointment(appointmentData)).unwrap();
      navigate(`/appointments/${result.id}`);
    } catch (err) {
      setError('Failed to create appointment. Please try again.');
      console.error('Error creating appointment:', err);
    }
  };

  // Remove duplicate patients by ID
  const uniquePatients = Array.from(
    new Map(patients.map(patient => [patient.id, patient])).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        New Appointment
      </Typography>

      <Paper sx={{ p: 3 }}>
        {(error || fetchError || patientsError) && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error || fetchError || patientsError}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="patient-select-label">Patient</InputLabel>
            <Select
              labelId="patient-select-label"
              id="patient-select"
              name="patientId"
              value={formData.patientId}
              onChange={handleInputChange}
              required
              label="Patient"
              disabled={patientsLoading}
            >
              {patientsLoading ? (
                <MenuItem disabled>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading patients...
                  </Box>
                </MenuItem>
              ) : uniquePatients.length > 0 ? (
                uniquePatients.map((patient) => (
                  <MenuItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No patients available</MenuItem>
              )}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Appointment Date & Time"
                value={formData.date}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    required: true,
                    fullWidth: true
                  }
                }}
              />
            </LocalizationProvider>
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            label="Purpose"
            name="purpose"
            value={formData.purpose}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              id="status-select"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
              label="Status"
            >
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={4}
            margin="normal"
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />

          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading || patientsLoading}
            >
              {loading ? 'Creating...' : 'Create Appointment'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/appointments')}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateAppointment;
