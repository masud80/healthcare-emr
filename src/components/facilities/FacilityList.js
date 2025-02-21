import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Box, Button, Card, CardContent, Typography, Grid, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import FacilityFilter from './FacilityFilter';

const FacilityList = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const user = useSelector((state) => state.auth.user);
  const role = useSelector((state) => state.auth.role);
  const isAdmin = role === 'admin';
  const isFacilityAdmin = role === 'facility_admin';

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        let facilitiesData = [];
        
        if (isAdmin) {
          // Admins can see all facilities
          const snapshot = await getDocs(collection(db, 'facilities'));
          facilitiesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        } else {
          // Get user's facilities from user_facilities collection
          const userFacilitiesQuery = query(
            collection(db, 'user_facilities'),
            where('userId', '==', user.uid)
          );
          const userFacilitiesSnapshot = await getDocs(userFacilitiesQuery);
          
          // Get facility IDs assigned to user
          const facilityIds = userFacilitiesSnapshot.docs.map(doc => doc.data().facilityId);
          
          // If user has facilities assigned, fetch their details
          if (facilityIds.length > 0) {
            const facilitiesSnapshot = await getDocs(collection(db, 'facilities'));
            facilitiesData = facilitiesSnapshot.docs
              .filter(doc => facilityIds.includes(doc.id))
              .map(doc => ({
                id: doc.id,
                ...doc.data(),
                isAdmin: doc.data().adminIds?.includes(user.uid) || false
              }));
          }
        }

        // Filter out inactive facilities for non-admin users
        const filteredFacilities = facilitiesData.filter(facility => 
          isAdmin || isFacilityAdmin ? true : facility.status === 'active'
        );

        setFacilities(filteredFacilities);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching facilities:', err);
        setError('Failed to fetch facilities');
        setLoading(false);
      }
    };

    fetchFacilities();
  }, [user, isAdmin, isFacilityAdmin]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const filteredFacilities = facilities.filter(facility => {
    if (filter === 'all') return true;
    return facility.type === filter;
  });

  if (loading) {
    return <div>Loading facilities...</div>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Healthcare Facilities</Typography>
        {(isAdmin || isFacilityAdmin) && (
          <Button
            component={Link}
            to="/facilities/new"
            variant="contained"
            color="primary"
          >
            Add New Facility
          </Button>
        )}
      </Box>

      <FacilityFilter currentFilter={filter} onFilterChange={handleFilterChange} />

      <Grid container spacing={3}>
        {filteredFacilities.map(facility => (
          <Grid item xs={12} sm={6} md={4} key={facility.id}>
            <Card sx={{ border: '2px solid #333' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="h6" component="div">
                    {facility.name}
                  </Typography>
                  <Chip 
                    label={facility.status} 
                    color={facility.status === 'active' ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
                <Typography color="text.secondary">
                  Type: {facility.type}
                </Typography>
                <Typography color="text.secondary">
                  Location: {facility.location}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button
                    component={Link}
                    to={`/facilities/${facility.id}`}
                    variant="outlined"
                  >
                    View Details
                  </Button>
                  {(isAdmin || (isFacilityAdmin && (facility.adminIds?.includes(user.uid) || facility.createdBy === user.uid))) && (
                    <Button
                      component={Link}
                      to={`/facilities/${facility.id}`}
                      variant="contained"
                      color="primary"
                      state={{ isEditing: true }}
                    >
                      Edit
                    </Button>
                  )}
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
