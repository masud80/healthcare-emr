import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { collection, getDocs, doc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useSelector } from 'react-redux';

const FacilityGroups = () => {
  const [groups, setGroups] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    fax: '',
    email: '',
    facilities: []
  });
  const currentUser = useSelector(state => state.auth.user);

  useEffect(() => {
    fetchGroups();
    fetchFacilities();
  }, []);

  const fetchGroups = async () => {
    try {
      const groupsRef = collection(db, 'facilityGroups');
      const snapshot = await getDocs(groupsRef);
      const groupsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGroups(groupsData);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError('Failed to load facility groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchFacilities = async () => {
    try {
      const facilitiesRef = collection(db, 'facilities');
      const snapshot = await getDocs(facilitiesRef);
      const facilitiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFacilities(facilitiesData);
    } catch (err) {
      console.error('Error fetching facilities:', err);
      setError('Failed to load facilities');
    }
  };

  const handleOpenDialog = (group = null) => {
    if (group) {
      setSelectedGroup(group);
      setFormData({
        name: group.name,
        address: group.address || '',
        phone: group.phone || '',
        fax: group.fax || '',
        email: group.email || '',
        facilities: group.facilities || []
      });
    } else {
      setSelectedGroup(null);
      setFormData({
        name: '',
        address: '',
        phone: '',
        fax: '',
        email: '',
        facilities: []
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedGroup(null);
    setFormData({
      name: '',
      address: '',
      phone: '',
      fax: '',
      email: '',
      facilities: []
    });
  };

  const handleSave = async () => {
    try {
      const groupData = {
        ...formData,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.uid
      };

      if (!selectedGroup) {
        groupData.createdAt = new Date().toISOString();
        groupData.createdBy = currentUser.uid;
      }

      const groupRef = doc(db, 'facilityGroups', selectedGroup?.id || Math.random().toString(36).substr(2, 9));
      await setDoc(groupRef, groupData);

      fetchGroups();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving group:', err);
      setError('Failed to save facility group');
    }
  };

  const handleDelete = async (groupId) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await deleteDoc(doc(db, 'facilityGroups', groupId));
        fetchGroups();
      } catch (err) {
        console.error('Error deleting group:', err);
        setError('Failed to delete facility group');
      }
    }
  };

  const toggleFacility = (facilityId) => {
    setFormData(prev => {
      const facilities = prev.facilities.includes(facilityId)
        ? prev.facilities.filter(id => id !== facilityId)
        : [...prev.facilities, facilityId];
      return { ...prev, facilities };
    });
  };

  if (!currentUser?.role === 'admin') {
    return (
      <Box p={3}>
        <Typography variant="h6" color="error">
          Access Denied. Admin privileges required.
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Facility Groups
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Group
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ border: '1px solid rgba(0, 0, 0, 0.2)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Facilities</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groups.map(group => (
              <TableRow key={group.id}>
                <TableCell>{group.name}</TableCell>
                <TableCell>{group.address}</TableCell>
                <TableCell>
                  <div>Phone: {group.phone}</div>
                  <div>Fax: {group.fax}</div>
                  <div>Email: {group.email}</div>
                </TableCell>
                <TableCell>
                  {group.facilities?.map(facilityId => {
                    const facility = facilities.find(f => f.id === facilityId);
                    return facility ? (
                      <Chip
                        key={facilityId}
                        label={facility.name}
                        icon={<BusinessIcon />}
                        size="small"
                        sx={{ m: 0.5 }}
                      />
                    ) : null;
                  })}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(group)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(group.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedGroup ? 'Edit Facility Group' : 'Create Facility Group'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Group Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Fax"
              value={formData.fax}
              onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
            />

            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Assign Facilities
            </Typography>
            <List>
              {facilities.map(facility => (
                <ListItem
                  key={facility.id}
                  button
                  onClick={() => toggleFacility(facility.id)}
                  selected={formData.facilities.includes(facility.id)}
                >
                  <ListItemText primary={facility.name} />
                  <ListItemSecondaryAction>
                    <Chip
                      label={formData.facilities.includes(facility.id) ? 'Assigned' : 'Unassigned'}
                      color={formData.facilities.includes(facility.id) ? 'primary' : 'default'}
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FacilityGroups; 