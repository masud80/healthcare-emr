import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { setup_logger } from '../../logger';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem
} from '@mui/material';

const logger = setup_logger();

const CreateFacility = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const role = useSelector((state) => state.auth.role);
  const [error, setError] = useState(null);
  
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

  const facilityTypes = [
    'Hospital',
    'Clinic',
    'Laboratory',
    'Pharmacy',
    'Rehabilitation Center',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Verify user and role
      if (!user) {
        logger.error('No user found');
        setError('You must be logged in to create a facility');
        return;
      }

      if (role !== 'admin' && role !== 'facility_admin') {
        logger.error(`User does not have permission. Current role: ${role}`);
        setError('You do not have permission to create facilities');
        return;
      }

      // Add adminIds array with current user's ID
      const facilityData = {
        ...formData,
        adminIds: [user.uid],
        connectedUserIds: [user.uid],
        createdAt: new Date(),
        createdBy: user.uid
      };
      
      const docRef = await addDoc(collection(db, 'facilities'), facilityData);
      
      // Create user_facilities connection
      await addDoc(collection(db, 'user_facilities'), {
        userId: user.uid,
        facilityId: docRef.id,
        role: 'facility_admin'
      });

      logger.info(`Facility created successfully: ${docRef.id}`);
      navigate('/facilities');
    } catch (err) {
      console.error('Error creating facility:', err);
      logger.error(`Failed to create facility: ${err.message}`);
      setError(`Failed to create facility: ${err.message}`);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Create New Facility
        </Typography>
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            required
            label="Facility Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            required
            select
            label="Type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            margin="normal"
          >
            {facilityTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            required
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Capacity"
            name="capacity"
            type="number"
            value={formData.capacity}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            required
            label="Contact Information"
            name="contact"
            value={formData.contact}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Fax"
            name="fax"
            value={formData.fax}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Services"
            name="services"
            value={formData.services}
            onChange={handleInputChange}
            margin="normal"
            multiline
            rows={4}
          />
          <Box sx={{ mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mr: 2 }}
            >
              Create Facility
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/facilities')}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateFacility;
