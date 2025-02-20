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
  const isAdmin = user?.role === 'admin';
  const isFacilityAdmin = user?.role === 'facility_admin';

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        let facilitiesQuery;
        
        if (isAdmin) {
          // Admins can see all facilities
          facilitiesQuery = collection(db, 'facilities');
        } else if (isFacilityAdmin) {
          // Facility admins can see facilities they manage
          facilitiesQuery = query(
            collection(db, 'facilities'),
            where('adminIds', 'array-contains', user.uid)
          );
        } else {
          // Regular users can only see their connected facilities that are active
          facilitiesQuery = query(
            collection(db, 'facilities'),
            where('status', '==', 'active'),
            where('connectedUserIds', 'array-contains', user.uid)
          );
        }

        const snapshot = await getDocs(facilitiesQuery);
        const facilitiesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

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
            <Card>
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
                <Button
                  component={Link}
                  to={`/facilities/${facility.id}`}
                  variant="outlined"
                  sx={{ mt: 2 }}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FacilityList;
