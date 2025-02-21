import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  FormControl,
  Button,
  CircularProgress,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import { collection, getDocs, query, where, getDoc, setDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2
};

const facilitiesListStyle = {
  maxHeight: '300px',
  overflow: 'auto',
  mt: 2,
  p: 2,
  bgcolor: '#f5f5f5',
  borderRadius: 1
};

const AssignFacilityModal = ({ open, onClose, user, currentUserRole, userFacilities }) => {
  const [facilities, setFacilities] = useState([]);
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  
  const filteredFacilities = facilities.filter(facility => 
    facility.name.toLowerCase().includes(filterText.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!open || !user) return;
      
      try {
        setLoading(true);
        
        // First fetch user's existing facilities
        const userFacilitiesRef = doc(db, 'user_facilities', user.id);
        const userFacilitiesDoc = await getDoc(userFacilitiesRef);
        const userConnectedFacilities = userFacilitiesDoc.exists() 
          ? userFacilitiesDoc.data().facilities || []
          : [];
        
        setSelectedFacilities(userConnectedFacilities);
        
        // Then fetch available facilities based on user role
        let facilitiesQuery;
        if (currentUserRole === 'admin') {
          facilitiesQuery = collection(db, 'facilities');
        } else if (currentUserRole === 'facility_admin') {
          // For facility admin, fetch both their assigned facilities and the user's existing facilities
          const combinedFacilities = [...new Set([...userFacilities, ...userConnectedFacilities])];
          facilitiesQuery = query(
            collection(db, 'facilities'),
            where('id', 'in', combinedFacilities)
          );
        }

        const facilitiesSnapshot = await getDocs(facilitiesQuery);
        const facilitiesData = facilitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFacilities(facilitiesData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [open, user, currentUserRole, userFacilities]);

  const handleCheckboxChange = (facilityId) => {
    setSelectedFacilities(prev => {
      if (prev.includes(facilityId)) {
        return prev.filter(id => id !== facilityId);
      } else {
        return [...prev, facilityId];
      }
    });
  };

  const handleFilterChange = (event) => {
    setFilterText(event.target.value);
  };

  const handleSubmit = async () => {
    try {
      // Save to user_facilities collection
      const userFacilitiesRef = doc(db, 'user_facilities', user.id);
      await setDoc(userFacilitiesRef, {
        userId: user.id,
        facilities: selectedFacilities,
        updatedAt: new Date().toISOString()
      });

      // Also update the facilities field in users collection for backward compatibility
      const userRef = doc(db, 'users', user.id);
      await setDoc(userRef, { facilities: selectedFacilities }, { merge: true });

      onClose(true); // Pass true to indicate successful update
    } catch (error) {
      console.error('Error updating user facilities:', error);
      onClose(false);
    }
  };

  if (loading) {
    return (
      <Modal open={open} onClose={() => onClose(false)}>
        <Box sx={modalStyle}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        </Box>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={() => onClose(false)}
      aria-labelledby="assign-facility-modal"
    >
      <Box sx={modalStyle}>
        <Typography variant="h6" component="h2" gutterBottom>
          Assign Facilities to {user?.email}
        </Typography>
        <FormControl fullWidth>
          <TextField
            fullWidth
            placeholder="Search facilities..."
            value={filterText}
            onChange={handleFilterChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Paper sx={facilitiesListStyle}>
            <FormGroup>
              {filteredFacilities.map((facility) => (
                <FormControlLabel
                  key={facility.id}
                  control={
                    <Checkbox
                      checked={selectedFacilities.includes(facility.id)}
                      onChange={() => handleCheckboxChange(facility.id)}
                    />
                  }
                  label={facility.name}
                />
              ))}
              {filteredFacilities.length === 0 && (
                <Typography color="text.secondary" sx={{ p: 1 }}>
                  No facilities found
                </Typography>
              )}
            </FormGroup>
          </Paper>
        </FormControl>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={() => onClose(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>Save</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AssignFacilityModal;
