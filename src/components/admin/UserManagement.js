import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { collection, getDocs, doc, setDoc, deleteDoc, query, where, addDoc } from 'firebase/firestore';
import { setFacilities } from '../../redux/slices/facilitiesSlice';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebase/config';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Box,
  Alert,
  FormHelperText,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  name: yup.string().required('Name is required'),
  role: yup.string().required('Role is required'),
  facilities: yup.array().min(1, 'At least one facility must be selected').required('Facilities are required'),
});

const UserManagement = () => {
  const dispatch = useDispatch();
  const { role } = useSelector((state) => state.auth);
  const { facilities } = useSelector((state) => state.facilities);
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userFacilities, setUserFacilities] = useState({});

  const fetchFacilities = useCallback(async () => {
    try {
      const facilitiesSnapshot = await getDocs(collection(db, 'facilities'));
      const facilitiesData = facilitiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      dispatch(setFacilities(facilitiesData));
    } catch (error) {
      console.error('Error fetching facilities:', error);
      setError('Failed to fetch facilities');
    }
  }, [dispatch]);

  const fetchUsers = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(userList);

      // Fetch user facilities
      const userFacilitiesMap = {};
      const userFacilitiesPromises = userList.map(async user => {
        try {
          const userFacilitiesSnapshot = await getDocs(
            query(collection(db, 'user_facilities'), where('userId', '==', user.id))
          );
          userFacilitiesMap[user.id] = userFacilitiesSnapshot.docs.map(doc => doc.data().facilityId);
        } catch (error) {
          console.error(`Error fetching facilities for user ${user.id}:`, error);
          userFacilitiesMap[user.id] = [];
        }
      });
      
      await Promise.all(userFacilitiesPromises);
      setUserFacilities(userFacilitiesMap);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchFacilities();
        await fetchUsers();
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data');
      }
    };
    loadData();
  }, [fetchFacilities, fetchUsers]);

  const formik = useFormik({
    initialValues: {
      email: selectedUser?.email || '',
      password: '',
      name: selectedUser?.name || '',
      role: selectedUser?.role || 'nurse',
      facilities: selectedUser ? userFacilities[selectedUser.id] || [] : [],
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      setError(null);
      setLoading(true);
      try {
        if (selectedUser) {
          // Update existing user
          await setDoc(doc(db, 'users', selectedUser.id), {
            email: values.email,
            name: values.name,
            role: values.role,
          });

          // Update user facilities
          const userFacilitiesRef = collection(db, 'user_facilities');
          
          // First, get existing facility assignments
          const userFacilitiesSnapshot = await getDocs(
            query(userFacilitiesRef, where('userId', '==', selectedUser.id))
          );
          
          // Delete all existing facility assignments first
          const deletePromises = userFacilitiesSnapshot.docs.map(doc => deleteDoc(doc.ref));
          await Promise.all(deletePromises);
          
          // Add all selected facilities
          const addPromises = values.facilities.map(facilityId => 
            addDoc(userFacilitiesRef, {
              userId: selectedUser.id,
              facilityId: facilityId,
              createdAt: new Date().toISOString()
            })
          );
          await Promise.all(addPromises);
          
          // Update local state and refetch to ensure data is current
          await fetchUsers();
        } else {
          // Create new user
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            values.email,
            values.password
          );

          await setDoc(doc(db, 'users', userCredential.user.uid), {
            email: values.email,
            name: values.name,
            role: values.role,
          });

          // Add facility assignments for new user
          const userFacilitiesRef = collection(db, 'user_facilities');
          const addPromises = values.facilities.map(facilityId => 
            addDoc(userFacilitiesRef, {
              userId: userCredential.user.uid,
              facilityId: facilityId,
              createdAt: new Date().toISOString()
            })
          );
          await Promise.all(addPromises);
          
          // Update local state and refetch to ensure data is current
          await fetchUsers();
        }

        resetForm();
        setSelectedUser(null);
        setOpenDialog(false);
      } catch (error) {
        console.error('Error saving user:', error);
        setError(error.message || 'Failed to save user');
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    },
  });

  const handleEdit = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // Delete user document
        await deleteDoc(doc(db, 'users', userId));
        
        // Delete user's facility assignments
        const userFacilitiesRef = collection(db, 'user_facilities');
        const userFacilitiesSnapshot = await getDocs(
          query(userFacilitiesRef, where('userId', '==', userId))
        );
        
        const deletePromises = userFacilitiesSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        
        // Update local state
        setUsers(users.filter(user => user.id !== userId));
        setUserFacilities(prev => {
          const newState = { ...prev };
          delete newState[userId];
          return newState;
        });
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Failed to delete user');
      }
    }
  };

  if (role !== 'admin') {
    return (
      <Container>
        <Typography>You do not have permission to access this page.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          User Management
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            setSelectedUser(null);
            setOpenDialog(true);
          }}
        >
          Add New User
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Facilities</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {userFacilities[user.id]?.map(facilityId => 
                    facilities.find(f => f.id === facilityId)?.name
                  ).join(', ')}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => handleEdit(user)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(user.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {selectedUser ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <TextField
                fullWidth
                name="email"
                label="Email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
              {!selectedUser && (
                <TextField
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                />
              )}
              <TextField
                fullWidth
                name="name"
                label="Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formik.values.role}
                  onChange={formik.handleChange}
                  error={formik.touched.role && Boolean(formik.errors.role)}
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="doctor">Doctor</MenuItem>
                  <MenuItem value="nurse">Nurse</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth error={formik.touched.facilities && Boolean(formik.errors.facilities)}>
                <InputLabel>Facilities</InputLabel>
                <Select
                  multiple
                  name="facilities"
                  value={formik.values.facilities}
                  onChange={formik.handleChange}
                  error={formik.touched.facilities && Boolean(formik.errors.facilities)}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Typography key={value} component="span">
                          {facilities.find(f => f.id === value)?.name}
                        </Typography>
                      ))}
                    </Box>
                  )}
                >
                  {facilities.map((facility) => (
                    <MenuItem key={facility.id} value={facility.id}>
                      {facility.name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.facilities && formik.errors.facilities && (
                  <FormHelperText error>{formik.errors.facilities}</FormHelperText>
                )}
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setOpenDialog(false)} 
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
            >
              {loading ? 'Saving...' : selectedUser ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default UserManagement;
