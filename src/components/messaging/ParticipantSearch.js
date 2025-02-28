import React, { useState, useEffect } from 'react';
import { TextField, List, ListItem, ListItemText, Button, Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAvailableUsers } from '../../redux/slices/usersSlice';
import './ParticipantSearch.css';

const ParticipantSearch = ({ onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const dispatch = useDispatch();
  const { availableUsers = [], loading = false } = useSelector(state => state.users || {});

  useEffect(() => {
    dispatch(fetchAvailableUsers());
  }, [dispatch]);

  const filteredUsers = (availableUsers || []).filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box className="participant-search-container">
      <Box className="search-header">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <Button
          variant="outlined"
          onClick={onClose}
          className="close-button"
        >
          Close
        </Button>
      </Box>
      
      <List className="users-list">
        {loading ? (
          <ListItem>
            <ListItemText primary="Loading users..." />
          </ListItem>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <ListItem
              key={user.id}
              button
              onClick={() => {
                onSelect(user);
                setSearchTerm('');
              }}
              className="user-item"
            >
              <ListItemText 
                primary={user.name}
                secondary={user.role}
              />
            </ListItem>
          ))
        ) : (
          <ListItem>
            <ListItemText primary="No users found" />
          </ListItem>
        )}
      </List>
    </Box>
  );
};

export default ParticipantSearch;
