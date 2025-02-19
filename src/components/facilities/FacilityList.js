import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, where, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  Container,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { setFacilities, setLoading, setError } from '../../redux/slices/facilitiesSlice';

const FacilityList = () => {
  const dispatch = useDispatch();
  const { facilities, loading } = useSelector((state) => state.facilities);
  const { user, role } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [facilityData, setFacilityData] = useState({
    name: '',
    address: '',
    phone: '',
    type: '', // e.g., 'hospital', 'clinic'
  });

  useEffect(() => {
    if (user && role) {
      fetchFacilities();
    }
  }, [user, role]);

  const fetchFacilities = async () => {
    try {
      dispatch(setLoading());
      
      // First get all facilities
      const facilitiesSnapshot = await getDocs(collection(db, 'facilities'));
      const allFacilities = facilitiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      let facilitiesToShow = [];
      if (role === 'admin') {
        facilitiesToShow = allFacilities;
      } else if (user) {
        // Get user's assigned facilities
        const userFacilitiesRef = collection(db, 'user_facilities');
        const userFacilitiesQuery = query(userFacilitiesRef, where('userId', '==', user.uid));
        const userFacilitiesSnapshot = await getDocs(userFacilitiesQuery);
        const facilityIds = userFacilitiesSnapshot.docs.map(doc => doc.data().facilityId);
        
        // Filter facilities to only show assigned ones
        facilitiesToShow = allFacilities.filter(facility => 
          facilityIds.includes(facility.id)
        );
      }
      
      dispatch(setFacilities(facilitiesToShow));
    } catch (error) {
      dispatch(setError(error.message));
    }
  };

  const handleOpen = (facility = null) => {
    if (facility) {
      setEditingFacility(facility);
      setFacilityData(facility);
    } else {
      setEditingFacility(null);
      setFacilityData({
        name: '',
        address: '',
        phone: '',
        type: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingFacility(null);
    setFacilityData({
      name: '',
      address: '',
      phone: '',
      type: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(setLoading());
      if (editingFacility) {
        await updateDoc(doc(db, 'facilities', editingFacility.id), facilityData);
      } else {
        await addDoc(collection(db, 'facilities'), facilityData);
      }
      handleClose();
      fetchFacilities();
    } catch (error) {
      dispatch(setError(error.message));
    }
  };

  const handleDelete = async (facilityId) => {
    if (window.confirm('Are you sure you want to delete this facility?')) {
      try {
        dispatch(setLoading());
        await deleteDoc(doc(db, 'facilities', facilityId));
        fetchFacilities();
      } catch (error) {
        dispatch(setError(error.message));
      }
    }
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="h5" gutterBottom>
          Facilities
        </Typography>
        {role === 'admin' && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpen()}
            sx={{ mb: 2 }}
          >
            Add New Facility
          </Button>
        )}

        <List>
          {facilities.map((facility) => (
            <ListItem key={facility.id}>
              <ListItemText
                primary={facility.name}
                secondary={`${facility.type} | ${facility.address} | ${facility.phone}`}
              />
              {role === 'admin' && (
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => handleOpen(facility)} sx={{ mr: 1 }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" onClick={() => handleDelete(facility.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          ))}
        </List>

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>
            {editingFacility ? 'Edit Facility' : 'Add New Facility'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Facility Name"
              fullWidth
              value={facilityData.name}
              onChange={(e) => setFacilityData({ ...facilityData, name: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Address"
              fullWidth
              value={facilityData.address}
              onChange={(e) => setFacilityData({ ...facilityData, address: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Phone"
              fullWidth
              value={facilityData.phone}
              onChange={(e) => setFacilityData({ ...facilityData, phone: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Type"
              fullWidth
              value={facilityData.type}
              onChange={(e) => setFacilityData({ ...facilityData, type: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {editingFacility ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default FacilityList;
