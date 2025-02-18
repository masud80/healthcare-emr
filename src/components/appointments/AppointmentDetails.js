import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { doc, getDoc, updateDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { useFormik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object({
  patientId: yup.string().required('Patient is required'),
  doctorId: yup.string().required('Doctor is required'),
  date: yup.date().required('Date and time are required'),
  purpose: yup.string().required('Purpose is required'),
  status: yup.string().required('Status is required'),
  notes: yup.string(),
});

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useSelector((state) => state.auth);
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch doctors
        const doctorsSnapshot = await getDocs(collection(db, 'users'));
        const doctorsList = doctorsSnapshot.docs
          .filter(doc => doc.data().role === 'doctor')
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        setDoctors(doctorsList);

        // Fetch patients
        const patientsSnapshot = await getDocs(collection(db, 'patients'));
        const patientsList = patientsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPatients(patientsList);

        if (id !== 'new') {
          const appointmentDoc = await getDoc(doc(db, 'appointments', id));
          if (appointmentDoc.exists()) {
            setAppointment({ id: appointmentDoc.id, ...appointmentDoc.data() });
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formik = useFormik({
    initialValues: {
      patientId: appointment?.patientId || '',
      doctorId: appointment?.doctorId || '',
      date: appointment?.date ? new Date(appointment.date) : new Date(),
      purpose: appointment?.purpose || '',
      status: appointment?.status || 'scheduled',
      notes: appointment?.notes || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const appointmentData = {
          ...values,
          date: values.date.toISOString(),
          patientName: patients.find(p => p.id === values.patientId)?.name,
          doctorName: doctors.find(d => d.id === values.doctorId)?.name,
          updatedAt: new Date().toISOString(),
        };

        if (id === 'new') {
          appointmentData.createdAt = new Date().toISOString();
          await addDoc(collection(db, 'appointments'), appointmentData);
        } else {
          await updateDoc(doc(db, 'appointments', id), appointmentData);
        }

        navigate('/appointments');
      } catch (error) {
        console.error('Error saving appointment:', error);
      }
    },
  });

  const handleCancel = async () => {
    try {
      await updateDoc(doc(db, 'appointments', id), {
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
      });
      navigate('/appointments');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading appointment details...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          {id === 'new' ? 'New Appointment' : 'Edit Appointment'}
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Patient</InputLabel>
                <Select
                  name="patientId"
                  value={formik.values.patientId}
                  onChange={formik.handleChange}
                  error={formik.touched.patientId && Boolean(formik.errors.patientId)}
                >
                  {patients.map((patient) => (
                    <MenuItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Doctor</InputLabel>
                <Select
                  name="doctorId"
                  value={formik.values.doctorId}
                  onChange={formik.handleChange}
                  error={formik.touched.doctorId && Boolean(formik.errors.doctorId)}
                >
                  {doctors.map((doctor) => (
                    <MenuItem key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Date & Time"
                  value={formik.values.date}
                  onChange={(value) => formik.setFieldValue('date', value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={formik.touched.date && Boolean(formik.errors.date)}
                      helperText={formik.touched.date && formik.errors.date}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="purpose"
                label="Purpose"
                multiline
                rows={2}
                value={formik.values.purpose}
                onChange={formik.handleChange}
                error={formik.touched.purpose && Boolean(formik.errors.purpose)}
                helperText={formik.touched.purpose && formik.errors.purpose}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  error={formik.touched.status && Boolean(formik.errors.status)}
                >
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="notes"
                label="Notes"
                multiline
                rows={3}
                value={formik.values.notes}
                onChange={formik.handleChange}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
                helperText={formik.touched.notes && formik.errors.notes}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                {id !== 'new' && (role === 'admin' || role === 'doctor') && (
                  <Button
                    color="error"
                    onClick={() => setOpenCancelDialog(true)}
                  >
                    Cancel Appointment
                  </Button>
                )}
                <Button onClick={() => navigate('/appointments')}>
                  Back
                </Button>
                <Button type="submit" variant="contained">
                  {id === 'new' ? 'Create Appointment' : 'Update Appointment'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Dialog
        open={openCancelDialog}
        onClose={() => setOpenCancelDialog(false)}
      >
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this appointment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)}>No</Button>
          <Button onClick={handleCancel} color="error" autoFocus>
            Yes, Cancel Appointment
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AppointmentDetails;
