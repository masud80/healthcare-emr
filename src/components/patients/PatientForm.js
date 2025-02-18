import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { setError } from '../../redux/slices/patientsSlice';
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
  Chip,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
  dateOfBirth: yup.string().required('Date of birth is required'),
  gender: yup.string().required('Gender is required'),
  contact: yup.string().required('Contact number is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  address: yup.string().required('Address is required'),
  bloodType: yup.string().required('Blood type is required'),
  emergencyContact: yup.object({
    name: yup.string().required('Emergency contact name is required'),
    relationship: yup.string().required('Relationship is required'),
    phone: yup.string().required('Emergency contact phone is required'),
  }),
});

const PatientForm = ({ patient }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [allergies, setAllergies] = useState(patient?.allergies || []);
  const [newAllergy, setNewAllergy] = useState('');
  const [chronicConditions, setChronicConditions] = useState(patient?.chronicConditions || []);
  const [newCondition, setNewCondition] = useState('');

  const formik = useFormik({
    initialValues: {
      name: patient?.name || '',
      dateOfBirth: patient?.dateOfBirth || '',
      gender: patient?.gender || '',
      contact: patient?.contact || '',
      email: patient?.email || '',
      address: patient?.address || '',
      bloodType: patient?.bloodType || '',
      emergencyContact: {
        name: patient?.emergencyContact?.name || '',
        relationship: patient?.emergencyContact?.relationship || '',
        phone: patient?.emergencyContact?.phone || '',
      },
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const patientData = {
          ...values,
          allergies,
          chronicConditions,
          createdAt: patient?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (patient?.id) {
          await updateDoc(doc(db, 'patients', patient.id), patientData);
        } else {
          await addDoc(collection(db, 'patients'), patientData);
        }

        navigate('/patients');
      } catch (error) {
        dispatch(setError(error.message));
      }
    },
  });

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (index) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const handleAddCondition = () => {
    if (newCondition.trim()) {
      setChronicConditions([...chronicConditions, newCondition.trim()]);
      setNewCondition('');
    }
  };

  const handleRemoveCondition = (index) => {
    setChronicConditions(chronicConditions.filter((_, i) => i !== index));
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          {patient ? 'Edit Patient' : 'Add New Patient'}
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="name"
                label="Full Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="dateOfBirth"
                label="Date of Birth"
                type="date"
                value={formik.values.dateOfBirth}
                onChange={formik.handleChange}
                error={formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)}
                helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                  error={formik.touched.gender && Boolean(formik.errors.gender)}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="contact"
                label="Contact Number"
                value={formik.values.contact}
                onChange={formik.handleChange}
                error={formik.touched.contact && Boolean(formik.errors.contact)}
                helperText={formik.touched.contact && formik.errors.contact}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="email"
                label="Email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="address"
                label="Address"
                multiline
                rows={2}
                value={formik.values.address}
                onChange={formik.handleChange}
                error={formik.touched.address && Boolean(formik.errors.address)}
                helperText={formik.touched.address && formik.errors.address}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Blood Type</InputLabel>
                <Select
                  name="bloodType"
                  value={formik.values.bloodType}
                  onChange={formik.handleChange}
                  error={formik.touched.bloodType && Boolean(formik.errors.bloodType)}
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Emergency Contact</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    name="emergencyContact.name"
                    label="Name"
                    value={formik.values.emergencyContact.name}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.emergencyContact?.name &&
                      Boolean(formik.errors.emergencyContact?.name)
                    }
                    helperText={
                      formik.touched.emergencyContact?.name &&
                      formik.errors.emergencyContact?.name
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    name="emergencyContact.relationship"
                    label="Relationship"
                    value={formik.values.emergencyContact.relationship}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.emergencyContact?.relationship &&
                      Boolean(formik.errors.emergencyContact?.relationship)
                    }
                    helperText={
                      formik.touched.emergencyContact?.relationship &&
                      formik.errors.emergencyContact?.relationship
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    name="emergencyContact.phone"
                    label="Phone"
                    value={formik.values.emergencyContact.phone}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.emergencyContact?.phone &&
                      Boolean(formik.errors.emergencyContact?.phone)
                    }
                    helperText={
                      formik.touched.emergencyContact?.phone &&
                      formik.errors.emergencyContact?.phone
                    }
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Allergies</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  label="Add Allergy"
                  size="small"
                />
                <Button variant="contained" onClick={handleAddAllergy}>
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {allergies.map((allergy, index) => (
                  <Chip
                    key={index}
                    label={allergy}
                    onDelete={() => handleRemoveAllergy(index)}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Chronic Conditions</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  label="Add Condition"
                  size="small"
                />
                <Button variant="contained" onClick={handleAddCondition}>
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {chronicConditions.map((condition, index) => (
                  <Chip
                    key={index}
                    label={condition}
                    onDelete={() => handleRemoveCondition(index)}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button onClick={() => navigate('/patients')}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained">
                  {patient ? 'Update Patient' : 'Add Patient'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default PatientForm;
