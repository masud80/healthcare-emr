import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert
} from '@mui/material';
import { useSelector } from 'react-redux';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

const roles = ['admin', 'facility_admin', 'doctor', 'nurse'];
const collections = [
  'facilities',
  'user_facilities',
  'users',
  'patients',
  'visits',
  'appointments',
  'prescriptions',
  'messages',
  'messageThreads'
];

const operations = ['read', 'write', 'create', 'update', 'delete'];

const RolePermissions = () => {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = useSelector(state => state.auth.user);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const permissionsRef = collection(db, 'defaultpermissions');
      const snapshot = await getDocs(permissionsRef);
      
      const permissionsData = {};
      snapshot.forEach(doc => {
        permissionsData[doc.id] = doc.data();
      });
      
      setPermissions(permissionsData);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError('Failed to load permissions');
    } finally {
      setLoading(false);
    }
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
      <Box mb={3}>
        <Typography variant="h5" component="h1">
          Role Permissions
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          This page shows the current permissions for each role. To modify permissions, update the firestore.rules file and run the initialization script.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Collection/Operation</TableCell>
              {roles.map(role => (
                <TableCell key={role} align="center">
                  {role.replace('_', ' ').toUpperCase()}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {collections.map(collection => (
              <React.Fragment key={collection}>
                {operations.map(operation => (
                  <TableRow key={`${collection}-${operation}`}>
                    <TableCell component="th" scope="row">
                      {collection} - {operation}
                    </TableCell>
                    {roles.map(role => (
                      <TableCell key={role} align="center">
                        <Checkbox
                          checked={permissions[role]?.[collection]?.[operation] || false}
                          disabled={true}
                          color="primary"
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RolePermissions; 