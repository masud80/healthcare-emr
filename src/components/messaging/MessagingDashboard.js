import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Button, Typography, IconButton } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CreateThread from './CreateThread';
import ThreadList from './ThreadList';
import ParticipantSearch from './ParticipantSearch';
import { selectUser } from '../../redux/slices/authSlice';
import { updateThreadParticipants } from '../../utils/messaging';
import './MessagingDashboard.css';

const MessagingDashboard = () => {
  const [showCreateThread, setShowCreateThread] = useState(false);
  const [showAddParticipants, setShowAddParticipants] = useState(false);
  const [selectedThread, setSelectedThread] = useState(null);
  const currentUser = useSelector(selectUser);

  const handleAddParticipant = async (participant) => {
    if (selectedThread) {
      try {
        await updateThreadParticipants(selectedThread.id, participant);
        setShowAddParticipants(false);
      } catch (error) {
        console.error('Error adding participant:', error);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box className="messaging-header">
        <Typography variant="h4" gutterBottom>
          Secure Messaging
        </Typography>
        {selectedThread && (
          <IconButton 
            color="primary"
            onClick={() => setShowAddParticipants(true)}
            className="add-participant-icon"
          >
            <PersonAddIcon />
          </IconButton>
        )}
      </Box>

      {!showCreateThread ? (
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowCreateThread(true)}
          sx={{ mb: 2 }}
        >
          New Message
        </Button>
      ) : (
        <CreateThread
          onThreadCreated={() => setShowCreateThread(false)}
        />
      )}

      {showAddParticipants && (
        <Box className="add-participants-modal">
          <ParticipantSearch
            onSelect={handleAddParticipant}
            onClose={() => setShowAddParticipants(false)}
          />
        </Box>
      )}

      <ThreadList 
        onThreadSelect={(thread) => setSelectedThread(thread)}
        selectedThread={selectedThread}
      />
    </Box>
  );
};

export default MessagingDashboard;
