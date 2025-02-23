import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { selectUser, selectRole } from '../../redux/slices/authSlice';
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress
} from '@mui/material';

const FacilityList = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);
  
  // Convert role strings to booleans - fix the comparison
  const isAdmin = role === 'admin';
  const isFacilityAdmin = role === 'facility_admin'; // Fixed comparison

  console.log('Current user:', user);
  console.log('Current role:', role);
  console.log('isAdmin:', isAdmin);
  console.log('isFacilityAdmin:', isFacilityAdmin);
  console.log('Exact role string:', role); // Add this to verify the exact string

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      let facilitiesData = [];
      
      if (isAdmin) {
        const snapshot = await getDocs(collection(db, 'facilities'));
        facilitiesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } else {
        const userFacilitiesQuery = query(
          collection(db, 'user_facilities'),
          where('userId', '==', user.uid)
        );
        const userFacilitiesSnapshot = await getDocs(userFacilitiesQuery);
        
        const facilityIds = userFacilitiesSnapshot.docs.map(doc => doc.data().facilityId);
        
        if (facilityIds.length > 0) {
          const facilitiesSnapshot = await getDocs(collection(db, 'facilities'));
          facilitiesData = facilitiesSnapshot.docs
            .filter(doc => facilityIds.includes(doc.id))
            .map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
        }
      }

      setFacilities(facilitiesData);
      setError(null);
    } catch (err) {
      console.error('Error fetching facilities:', err);
      setError('Failed to fetch facilities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFacilities();
    }
  }, [user]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Healthcare Facilities</Typography>
        {/* Debug info */}
       
        {(isAdmin || isFacilityAdmin) && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              component={Link}
              to="/facilities/new"
              variant="contained"
              color="primary"
            >
              Add New Facility
            </Button>
            <Button
              component={Link}
              to="/facilities/branding"
              variant="contained"
              color="secondary"
            >
              Apply Branding
            </Button>
          </Box>
        )}
      </Box>

      <Grid container spacing={3}>
        {facilities.map(facility => (
          <Grid item xs={12} sm={6} md={4} key={facility.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{facility.name}</Typography>
                <Typography color="textSecondary" gutterBottom>
                  {facility.type}
                </Typography>
                <Typography variant="body2">
                  Location: {facility.location}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip 
                    label={facility.status} 
                    color={facility.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FacilityList;
