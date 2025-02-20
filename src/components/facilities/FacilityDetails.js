import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { TextField, Button, Container, Typography, Box, Grid, Paper, Alert } from '@mui/material';
import { updateFacility, fetchFacilityById } from '../../redux/thunks/facilitiesThunks';

const FacilityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const facility = useSelector((state) => state.facilities.selectedFacility);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    type: '',
  });
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchFacilityById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (facility) {
      setFormData({
        name: facility.name || '',
        address: facility.address || '',
        phone: facility.phone || '',
        email: facility.email || '',
        type: facility.type || '',
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
    setSubmitError(null);
    
    try {
      const resultAction = await dispatch(updateFacility({ id, ...formData }));
      if (updateFacility.fulfilled.match(resultAction)) {
        navigate('/facilities');
      } else if (updateFacility.rejected.match(resultAction)) {
        setSubmitError(resultAction.payload || 'Failed to update facility');
      }
    } catch (error) {
      setSubmitError('Failed to update facility. Please try again.');
      console.error('Failed to update facility:', error);
    }
  };

  if (!facility) {
    return <div>Loading...</div>;
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h4" gutterBottom>
          Edit Facility
        </Typography>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ mr: 2 }}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/facilities')}
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
