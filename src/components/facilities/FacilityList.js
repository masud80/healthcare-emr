import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  CardActions,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import AssignUsersModal from '../admin/AssignUsersModal';

const FacilityList = () => {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  
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
      let groupsData = [];
      
      // Fetch facility groups first
      const groupsSnapshot = await getDocs(collection(db, 'facilityGroups'));
      groupsData = groupsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      if (isAdmin) {
        const snapshot = await getDocs(collection(db, 'facilities'));
        facilitiesData = snapshot.docs.map(doc => {
          const facility = {
            id: doc.id,
            ...doc.data()
          };
          // Find the group this facility belongs to
          const group = groupsData.find(g => g.facilities?.includes(doc.id));
          facility.groupName = group?.name || '';
          return facility;
        });
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
            .map(doc => {
              const facility = {
                id: doc.id,
                ...doc.data()
              };
              // Find the group this facility belongs to
              const group = groupsData.find(g => g.facilities?.includes(doc.id));
              facility.groupName = group?.name || '';
              return facility;
            });
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

  const handleAssignUsers = (facility) => {
    setSelectedFacility(facility);
    setModalOpen(true);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSort = (event) => {
    setSortBy(event.target.value);
  };

  const filteredAndSortedFacilities = facilities
    .filter(facility => {
      const searchLower = searchTerm.toLowerCase();
      return (
        facility.name?.toLowerCase().includes(searchLower) ||
        facility.location?.toLowerCase().includes(searchLower) ||
        facility.groupName?.toLowerCase().includes(searchLower) ||
        facility.type?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'location':
          return (a.location || '').localeCompare(b.location || '');
        case 'group':
          return (a.groupName || '').localeCompare(b.groupName || '');
        default:
          return 0;
      }
    });

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

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="Search facilities..."
          value={searchTerm}
          onChange={handleSearch}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="sort-select-label">Sort by</InputLabel>
          <Select
            labelId="sort-select-label"
            value={sortBy}
            label="Sort by"
            onChange={handleSort}
          >
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="location">Location</MenuItem>
            <MenuItem value="group">Group</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {filteredAndSortedFacilities.map(facility => (
          <Grid item xs={12} sm={6} md={4} key={facility.id}>
            <Card sx={{ 
              border: '1px solid rgba(0, 0, 0, 0.23)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6">{facility.name}</Typography>
                <Typography color="textSecondary" gutterBottom>
                  {facility.type}
                </Typography>
                <Typography variant="body2">
                  Location: {facility.location}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Group: {facility.groupName || '-'}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip 
                    label={facility.status} 
                    color={facility.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </CardContent>
              {(isAdmin || (isFacilityAdmin && facility.adminIds?.includes(user.uid))) && (
                <CardActions sx={{ 
                  justifyContent: 'flex-end', 
                  gap: 1, 
                  p: 2,
                  borderTop: '1px solid rgba(0, 0, 0, 0.12)'
                }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleAssignUsers(facility)}
                    data-testid={`assign-users-${facility.id}`}
                  >
                    Assign Users
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate(`/facilities/${facility.id}`)}
                    data-testid={`edit-facility-${facility.id}`}
                  >
                    Edit
                  </Button>
                </CardActions>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
      <AssignUsersModal
        open={modalOpen}
        onClose={(updated) => {
          setModalOpen(false);
          setSelectedFacility(null);
          if (updated) {
            fetchFacilities();
          }
        }}
        facility={selectedFacility}
        currentUserRole={role}
      />
    </Box>
  );
};

export default FacilityList;
