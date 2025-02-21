import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useSelector, useDispatch } from 'react-redux';
import { selectRole } from '../../redux/slices/authSlice';
import AssignFacilityModal from './AssignFacilityModal';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db, auth } from '../../firebase/config';
import { createAuditLog } from '../../redux/thunks/auditThunks';
import { 
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  Select,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Stack,
  FormControl,
  InputLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.grey[100]
}));

const FormPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3)
}));

const ActionButton = styled(Button)(({ theme }) => ({
  minWidth: 'auto',
  marginRight: theme.spacing(1)
}));

const UserManagement = () => {
  const userRole = useSelector(selectRole);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [facilityUser, setFacilityUser] = useState(null);
  const [roleUpdate, setRoleUpdate] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(null);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user'
  });
  const [editingUser, setEditingUser] = useState({
    name: '',
    email: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower)
    );
  });

  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(userList);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const dispatch = useDispatch();

  const handleRoleUpdate = async (userId, newRole) => {
    if (userRole !== 'admin') {
      setError('Only administrators can update user roles');
      return;
    }
    try {
      const userRef = doc(db, 'users', userId);
      const currentUser = users.find(user => user.id === userId);
      const oldRole = currentUser.role || 'user';

      await updateDoc(userRef, {
        role: newRole
      });

      await dispatch(createAuditLog({
        userId: auth.currentUser.uid,
        action: 'UPDATE_USER_ROLE',
        targetId: userId,
        targetType: 'USER',
        details: {
          before: { role: oldRole },
          after: { role: newRole },
          userName: currentUser.name,
          userEmail: currentUser.email
        }
      }));

      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      setSelectedUser(null);
      setRoleUpdate('');
    } catch (error) {
      console.error('Error updating role:', error);
      setError('Failed to update role');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (userRole !== 'admin') {
      setError('Only administrators can add new users');
      setLoading(false);
      return;
    }

    try {
      const functions = getFunctions();
      const createUserFunction = httpsCallable(functions, 'createUser');
      
      await createUserFunction(newUser);
      
      setNewUser({
        email: '',
        password: '',
        name: '',
        role: 'user'
      });
      setShowAddUser(false);
      await fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      setError(error instanceof Error ? error.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (userId) => {
    if (userRole !== 'admin') {
      setError('Only administrators can edit users');
      return;
    }
    try {
      const currentUser = users.find(user => user.id === userId);
      const userRef = doc(db, 'users', userId);

      await updateDoc(userRef, {
        name: editingUser.name,
        email: editingUser.email
      });

      await dispatch(createAuditLog({
        userId: auth.currentUser.uid,
        action: 'UPDATE_USER_DETAILS',
        targetId: userId,
        targetType: 'USER',
        details: {
          before: {
            name: currentUser.name,
            email: currentUser.email
          },
          after: {
            name: editingUser.name,
            email: editingUser.email
          },
          userName: editingUser.name
        }
      }));
      
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, name: editingUser.name, email: editingUser.email }
          : user
      ));
      setShowEditUser(null);
      setEditingUser({ name: '', email: '' });
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user');
    }
  };

  const startEditingUser = (user) => {
    setEditingUser({
      name: user.name || '',
      email: user.email
    });
    setShowEditUser(user.id);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          User Management
        </Typography>
        {userRole === 'admin' ? (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowAddUser(true)}
            startIcon={<span>+</span>}
          >
            Add User
          </Button>
        ) : (
          <Alert severity="info">Only administrators can add new users</Alert>
        )}
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {showAddUser && (
        <FormPaper elevation={2}>
          <Typography variant="h6" gutterBottom>Add New User</Typography>
          <Box component="form" onSubmit={handleAddUser} sx={{ mt: 2 }}>
            <Stack spacing={2}>
              <TextField
                label="Name"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                required
                fullWidth
              />
              <TextField
                label="Email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                required
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                required
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  label="Role"
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="facility_admin">Facility Admin</MenuItem>
                  <MenuItem value="doctor">Doctor</MenuItem>
                  <MenuItem value="nurse">Nurse</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => setShowAddUser(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Add User
                </Button>
              </Box>
            </Stack>
          </Box>
        </FormPaper>
      )}
      
      <Box mb={3}>
        <TextField
          fullWidth
          label="Search users"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, or role"
          size="small"
          InputProps={{
            startAdornment: (
              <Box component="span" sx={{ color: 'action.active', mr: 1 }}>
                🔍
              </Box>
            ),
          }}
        />
      </Box>

      <TableContainer component={Paper} sx={{ border: '2px solid #333' }}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell>Email</StyledTableCell>
              <StyledTableCell>Role</StyledTableCell>
              <StyledTableCell>Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.map(user => (
              <TableRow key={user.id}>
                <TableCell>
                  {showEditUser === user.id ? (
                    <TextField
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                      size="small"
                      fullWidth
                    />
                  ) : (
                    user.name || 'N/A'
                  )}
                </TableCell>
                <TableCell>
                  {showEditUser === user.id ? (
                    <TextField
                      type="email"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                      size="small"
                      fullWidth
                    />
                  ) : (
                    user.email
                  )}
                </TableCell>
                <TableCell>
                  <Box
                    component="span"
                    sx={{
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      display: 'inline-block',
                      bgcolor: (theme) => {
                        switch(user.role) {
                          case 'admin': return theme.palette.error.light;
                          case 'doctor': return theme.palette.primary.light;
                          case 'nurse': return theme.palette.success.light;
                          case 'facility_admin': return theme.palette.warning.light;
                          default: return theme.palette.grey[200];
                        }
                      },
                      color: '#000000',
                      fontWeight: 500
                    }}
                  >
                    {user.role || 'user'}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {selectedUser === user.id ? (
                      <>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={roleUpdate}
                            onChange={(e) => setRoleUpdate(e.target.value)}
                            size="small"
                          >
                            <MenuItem value="">Select Role</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="facility_admin">Facility Admin</MenuItem>
                            <MenuItem value="doctor">Doctor</MenuItem>
                            <MenuItem value="nurse">Nurse</MenuItem>
                            <MenuItem value="user">User</MenuItem>
                          </Select>
                        </FormControl>
                        <ActionButton
                          variant="contained"
                          size="small"
                          onClick={() => handleRoleUpdate(user.id, roleUpdate)}
                          disabled={!roleUpdate}
                        >
                          Save
                        </ActionButton>
                        <ActionButton
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setSelectedUser(null);
                            setRoleUpdate('');
                          }}
                        >
                          Cancel
                        </ActionButton>
                      </>
                    ) : showEditUser === user.id ? (
                      <>
                        <ActionButton
                          variant="contained"
                          size="small"
                          onClick={() => handleEditUser(user.id)}
                        >
                          Save
                        </ActionButton>
                        <ActionButton
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setShowEditUser(null);
                            setEditingUser({ name: '', email: '' });
                          }}
                        >
                          Cancel
                        </ActionButton>
                      </>
                    ) : (
                      <>
                        {userRole === 'admin' && (
                          <>
                            <ActionButton
                              variant="outlined"
                              size="small"
                              onClick={() => startEditingUser(user)}
                            >
                              Edit
                            </ActionButton>
                            <ActionButton
                              variant="outlined"
                              size="small"
                              onClick={() => {
                                setSelectedUser(user.id);
                                setRoleUpdate(user.role || 'user');
                              }}
                            >
                              Change Role
                            </ActionButton>
                            <ActionButton
                              variant="outlined"
                              size="small"
                              onClick={() => {
                                setFacilityUser(user);
                                setModalOpen(true);
                              }}
                            >
                              Assign Facility
                            </ActionButton>
                          </>
                        )}
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      <AssignFacilityModal
        open={modalOpen}
        onClose={(updated) => {
          setModalOpen(false);
          setFacilityUser(null);
          if (updated) {
            fetchUsers();
          }
        }}
        user={facilityUser}
        currentUserRole={userRole}
        userFacilities={users.find(u => u.id === auth.currentUser?.uid)?.facilities || []}
      />
    </Container>
  );
};

export default UserManagement;
