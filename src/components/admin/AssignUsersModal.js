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

const userListStyle = {
  maxHeight: '300px',
  overflow: 'auto',
  mt: 2,
  p: 2,
  bgcolor: '#f5f5f5',
  borderRadius: 1
};

const AssignUsersModal = ({ open, onClose, facility, currentUserRole }) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  
  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(filterText.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!open || !facility) return;
      
      try {
        setLoading(true);
        
        // Fetch all users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);

        // Fetch facility's assigned users
        const facilityDoc = await getDoc(doc(db, 'facilities', facility.id));
        if (facilityDoc.exists()) {
          const assignedUsers = facilityDoc.data().assignedUsers || [];
          setSelectedUsers(assignedUsers);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [open, facility]);

  const handleCheckboxChange = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleFilterChange = (event) => {
    setFilterText(event.target.value);
  };

  const handleSubmit = async () => {
    try {
      // Update facility with assigned users
      const facilityRef = doc(db, 'facilities', facility.id);
      await setDoc(facilityRef, {
        assignedUsers: selectedUsers
      }, { merge: true });

      // Update user_facilities collection for each user
      for (const userId of selectedUsers) {
        const userFacilitiesRef = doc(db, 'user_facilities', userId);
        const userFacilitiesDoc = await getDoc(userFacilitiesRef);
        
        if (userFacilitiesDoc.exists()) {
          const facilities = userFacilitiesDoc.data().facilities || [];
          if (!facilities.includes(facility.id)) {
            await setDoc(userFacilitiesRef, {
              userId,
              facilities: [...facilities, facility.id],
              updatedAt: new Date().toISOString()
            }, { merge: true });
          }
        } else {
          await setDoc(userFacilitiesRef, {
            userId,
            facilities: [facility.id],
            updatedAt: new Date().toISOString()
          });
        }
      }

      // Remove facility from unselected users
      const unselectedUsers = users
        .map(user => user.id)
        .filter(userId => !selectedUsers.includes(userId));

      for (const userId of unselectedUsers) {
        const userFacilitiesRef = doc(db, 'user_facilities', userId);
        const userFacilitiesDoc = await getDoc(userFacilitiesRef);
        
        if (userFacilitiesDoc.exists()) {
          const facilities = userFacilitiesDoc.data().facilities || [];
          if (facilities.includes(facility.id)) {
            await setDoc(userFacilitiesRef, {
              userId,
              facilities: facilities.filter(id => id !== facility.id),
              updatedAt: new Date().toISOString()
            }, { merge: true });
          }
        }
      }

      onClose(true);
    } catch (error) {
      console.error('Error updating facility users:', error);
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
      aria-labelledby="assign-users-modal"
    >
      <Box sx={modalStyle}>
        <Typography variant="h6" component="h2" gutterBottom>
          Assign Users to {facility?.name}
        </Typography>
        <FormControl fullWidth>
          <TextField
            fullWidth
            placeholder="Search users..."
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
          <Paper sx={userListStyle}>
            <FormGroup>
              {filteredUsers.map((user) => (
                <FormControlLabel
                  key={user.id}
                  control={
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleCheckboxChange(user.id)}
                    />
                  }
                  label={`${user.email} (${user.role || 'user'})`}
                />
              ))}
              {filteredUsers.length === 0 && (
                <Typography color="text.secondary" sx={{ p: 1 }}>
                  No users found
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

export default AssignUsersModal; 