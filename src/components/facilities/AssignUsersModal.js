import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  CircularProgress,
  TextField,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { collection, getDocs, query, where, doc, updateDoc, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase/config';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 1000,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  maxHeight: '90vh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column'
};

const columnStyle = {
  flex: 1,
  p: 2,
  m: 1,
  bgcolor: '#f5f5f5',
  borderRadius: 1,
  height: '60vh',
  display: 'flex',
  flexDirection: 'column'
};

const listStyle = {
  overflow: 'auto',
  minHeight: 100,
  bgcolor: 'background.paper',
  flex: 1
};

const AssignUsersModal = ({ open, onClose, facility }) => {
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnassigned, setSelectedUnassigned] = useState([]);
  const [selectedAssigned, setSelectedAssigned] = useState([]);

  useEffect(() => {
    if (open && facility) {
      fetchUsers();
    }
  }, [open, facility]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const allUsers = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Get facility's assigned users
      const facilityDoc = await getDoc(doc(db, 'facilities', facility.id));
      const assignedUserIds = facilityDoc.data()?.assignedUsers || [];

      // Split users into assigned and unassigned
      const assigned = allUsers.filter(user => assignedUserIds.includes(user.id));
      const unassigned = allUsers.filter(user => !assignedUserIds.includes(user.id));

      setAssignedUsers(assigned);
      setUnassignedUsers(unassigned);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId === destination.droppableId) {
      // Reordering within the same list
      const items = source.droppableId === 'unassigned' 
        ? Array.from(unassignedUsers)
        : Array.from(assignedUsers);
      
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      if (source.droppableId === 'unassigned') {
        setUnassignedUsers(items);
      } else {
        setAssignedUsers(items);
      }
    } else {
      // Moving between lists
      const sourceItems = source.droppableId === 'unassigned'
        ? Array.from(unassignedUsers)
        : Array.from(assignedUsers);
      
      const destItems = destination.droppableId === 'unassigned'
        ? Array.from(unassignedUsers)
        : Array.from(assignedUsers);
      
      const [movedItem] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, movedItem);

      if (source.droppableId === 'unassigned') {
        setUnassignedUsers(sourceItems);
        setAssignedUsers(destItems);
      } else {
        setAssignedUsers(sourceItems);
        setUnassignedUsers(destItems);
      }
    }
  };

  const handleSave = async () => {
    try {
      // Update facility with assigned users
      const facilityRef = doc(db, 'facilities', facility.id);
      await updateDoc(facilityRef, {
        assignedUsers: assignedUsers.map(user => user.id)
      });

      // Update user_facilities collection for each assigned user
      const batch = writeBatch(db);

      for (const user of assignedUsers) {
        const userFacilitiesRef = doc(db, 'user_facilities', user.id);
        const userFacilitiesDoc = await getDoc(userFacilitiesRef);
        
        if (userFacilitiesDoc.exists()) {
          const facilities = userFacilitiesDoc.data().facilities || [];
          if (!facilities.includes(facility.id)) {
            batch.update(userFacilitiesRef, {
              facilities: [...facilities, facility.id]
            });
          }
        } else {
          batch.set(userFacilitiesRef, {
            userId: user.id,
            facilities: [facility.id]
          });
        }
      }

      // Remove facility from unassigned users' facilities
      for (const user of unassignedUsers) {
        const userFacilitiesRef = doc(db, 'user_facilities', user.id);
        const userFacilitiesDoc = await getDoc(userFacilitiesRef);
        
        if (userFacilitiesDoc.exists()) {
          const facilities = userFacilitiesDoc.data().facilities || [];
          if (facilities.includes(facility.id)) {
            batch.update(userFacilitiesRef, {
              facilities: facilities.filter(id => id !== facility.id)
            });
          }
        }
      }

      // Commit all the batched writes
      await batch.commit();

      onClose(true);
    } catch (error) {
      console.error('Error saving user assignments:', error);
    }
  };

  const moveSelectedUsers = (direction) => {
    if (direction === 'right') {
      const usersToMove = unassignedUsers.filter(user => selectedUnassigned.includes(user.id));
      setAssignedUsers([...assignedUsers, ...usersToMove]);
      setUnassignedUsers(unassignedUsers.filter(user => !selectedUnassigned.includes(user.id)));
      setSelectedUnassigned([]);
    } else {
      const usersToMove = assignedUsers.filter(user => selectedAssigned.includes(user.id));
      setUnassignedUsers([...unassignedUsers, ...usersToMove]);
      setAssignedUsers(assignedUsers.filter(user => !selectedAssigned.includes(user.id)));
      setSelectedAssigned([]);
    }
  };

  const toggleUserSelection = (userId, list) => {
    if (list === 'unassigned') {
      setSelectedUnassigned(prev => 
        prev.includes(userId) 
          ? prev.filter(id => id !== userId)
          : [...prev, userId]
      );
    } else {
      setSelectedAssigned(prev => 
        prev.includes(userId) 
          ? prev.filter(id => id !== userId)
          : [...prev, userId]
      );
    }
  };

  const filterUsers = (users) => {
    return users.filter(user => 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
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

        <TextField
          fullWidth
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Paper sx={columnStyle}>
              <Typography variant="subtitle1" gutterBottom>
                Unassigned Users ({filterUsers(unassignedUsers).length})
              </Typography>
              <Droppable droppableId="unassigned">
                {(provided) => (
                  <List
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={listStyle}
                  >
                    {filterUsers(unassignedUsers).map((user, index) => (
                      <Draggable key={user.id} draggableId={user.id} index={index}>
                        {(provided) => (
                          <ListItem
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{ bgcolor: 'white', mb: 1, borderRadius: 1 }}
                          >
                            <Checkbox
                              checked={selectedUnassigned.includes(user.id)}
                              onChange={() => toggleUserSelection(user.id, 'unassigned')}
                            />
                            <ListItemText
                              primary={user.name || 'Unnamed User'}
                              secondary={user.email}
                            />
                          </ListItem>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </Paper>

            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 2 }}>
              <Button
                onClick={() => moveSelectedUsers('right')}
                disabled={selectedUnassigned.length === 0}
                sx={{ mb: 1 }}
              >
                {'>>'}
              </Button>
              <Button
                onClick={() => moveSelectedUsers('left')}
                disabled={selectedAssigned.length === 0}
              >
                {'<<'}
              </Button>
            </Box>

            <Paper sx={columnStyle}>
              <Typography variant="subtitle1" gutterBottom>
                Assigned Users ({filterUsers(assignedUsers).length})
              </Typography>
              <Droppable droppableId="assigned">
                {(provided) => (
                  <List
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={listStyle}
                  >
                    {filterUsers(assignedUsers).map((user, index) => (
                      <Draggable key={user.id} draggableId={user.id} index={index}>
                        {(provided) => (
                          <ListItem
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{ bgcolor: 'white', mb: 1, borderRadius: 1 }}
                          >
                            <Checkbox
                              checked={selectedAssigned.includes(user.id)}
                              onChange={() => toggleUserSelection(user.id, 'assigned')}
                            />
                            <ListItemText
                              primary={user.name || 'Unnamed User'}
                              secondary={user.email}
                            />
                          </ListItem>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </Paper>
          </DragDropContext>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={() => onClose(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AssignUsersModal;
