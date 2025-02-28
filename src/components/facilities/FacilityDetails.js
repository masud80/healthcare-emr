import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { TextField, Button, Container, Typography, Box, Grid, Paper, Alert, CircularProgress, MenuItem } from '@mui/material';
import { updateFacility, fetchFacilityById } from '../../redux/thunks/facilitiesThunks';
import { selectLoading, selectError, clearError } from '../../redux/slices/facilitiesSlice';

const facilityTypes = [
  'Hospital',
  'Clinic',
  'Laboratory',
  'Pharmacy',
  'Rehabilitation Center',
  'Other'
];

const FacilityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const facility = useSelector((state) => state.facilities.selectedFacility);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    location: '',
    capacity: '',
    contact: '',
    phone: '',
    fax: '',
    services: '',
    status: 'active'
  });

  // Clear any errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(fetchFacilityById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (facility) {
      setFormData({
        name: facility.name || '',
        type: facility.type || '',
        location: facility.location || '',
        capacity: facility.capacity || '',
        contact: facility.contact || '',
        phone: facility.phone || '',
        fax: facility.fax || '',
        services: facility.services || '',
        status: facility.status || 'active'
      });
    }
  }, [facility]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError()); // Clear any previous errors
    
    const resultAction = await dispatch(updateFacility({ id, ...formData }));
    
    if (!resultAction.error) {
      // Only navigate if the update was successful
      navigate('/facilities');
    }
  };

  if (!facility && !error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h4" gutterBottom>
          Edit Facility
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                select
                label="Type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                disabled={loading}
              >
                {facilityTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Contact Information"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Fax"
                name="fax"
                value={formData.fax}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Services"
                name="services"
                value={formData.services}
                onChange={handleChange}
                disabled={loading}
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ mr: 2 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Save'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/facilities')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default FacilityDetails;
