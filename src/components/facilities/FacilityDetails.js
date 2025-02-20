import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';

const FacilityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role === 'admin';
  const isFacilityAdmin = user?.role === 'facility_admin';
  
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    location: '',
    capacity: '',
    contact: '',
    services: '',
    status: 'active'
  });

  const canEdit = isAdmin || (isFacilityAdmin && facility?.adminIds?.includes(user.uid));

  useEffect(() => {
    const fetchFacility = async () => {
      try {
        const facilityDoc = await getDoc(doc(db, 'facilities', id));
        if (facilityDoc.exists()) {
          const data = facilityDoc.data();
          setFacility(data);
          setFormData(data);
        } else {
          setError('Facility not found');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching facility:', err);
        setError('Failed to fetch facility details');
        setLoading(false);
      }
    };

    fetchFacility();
  }, [id]);

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
      // Preserve adminIds and connectedUserIds when updating
      const updateData = {
        ...formData,
        adminIds: facility.adminIds,
        connectedUserIds: facility.connectedUserIds
      };
      
      await updateDoc(doc(db, 'facilities', id), updateData);
      setFacility(updateData);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating facility:', err);
      setError('Failed to update facility');
    }
  };

  const handleStatusChange = async () => {
    try {
      const newStatus = facility.status === 'active' ? 'inactive' : 'active';
      await updateDoc(doc(db, 'facilities', id), {
        status: newStatus
      });
      setFacility({ ...facility, status: newStatus });
      setFormData({ ...formData, status: newStatus });
      setConfirmDialog(false);
    } catch (err) {
      console.error('Error updating facility status:', err);
      setError('Failed to update facility status');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!facility) return <div>Facility not found</div>;

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        {!isEditing ? (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" gutterBottom>
                {facility.name}
              </Typography>
              <Chip 
                label={facility.status}
                color={facility.status === 'active' ? 'success' : 'error'}
              />
            </Box>
            <Typography variant="body1" paragraph>
              <strong>Type:</strong> {facility.type}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Location:</strong> {facility.location}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Capacity:</strong> {facility.capacity}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Contact:</strong> {facility.contact}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Services:</strong> {facility.services}
            </Typography>
            <Box sx={{ mt: 2 }}>
              {canEdit && (
                <>
                  <Button
                    variant="contained"
                    onClick={() => setIsEditing(true)}
                    sx={{ mr: 2 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color={facility.status === 'active' ? 'error' : 'success'}
                    onClick={() => setConfirmDialog(true)}
                    sx={{ mr: 2 }}
                  >
                    {facility.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>
                </>
              )}
              <Button
                variant="outlined"
                onClick={() => navigate('/facilities')}
              >
                Back to List
              </Button>
            </Box>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              margin="normal"
            />
            <TextField
              fullWidth
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
              value={formData.capacity}
              onChange={handleInputChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Contact"
              name="contact"
              value={formData.contact}
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
                Save
              </Button>
              <Button
                variant="outlined"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </Box>
          </form>
        )}
      </Paper>

      <Dialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
      >
        <DialogTitle>
          {facility.status === 'active' ? 'Deactivate Facility?' : 'Activate Facility?'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {facility.status === 'active' ? 'deactivate' : 'activate'} {facility.name}?
            {facility.status === 'active' && ' This will hide the facility from regular users.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleStatusChange}
            color={facility.status === 'active' ? 'error' : 'success'}
            variant="contained"
          >
            {facility.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FacilityDetails;
