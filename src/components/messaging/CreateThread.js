import React, { useState } from 'react';
import { Button, TextField } from '@mui/material';
import ParticipantSearch from './ParticipantSearch';
import { createThread } from '../../utils/messaging';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/slices/authSlice';
import './CreateThread.css';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const CreateThread = ({ onThreadCreated }) => {
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [showParticipantSearch, setShowParticipantSearch] = useState(false);
  const [subject, setSubject] = useState('');
  const currentUser = useSelector(selectUser);
  const [loading, setLoading] = useState(false);

  const handleAddParticipant = (participant) => {
    if (!selectedParticipants.find(p => p.id === participant.id)) {
      setSelectedParticipants([...selectedParticipants, participant]);
    }
  };

  const handleRemoveParticipant = (participantId) => {
    setSelectedParticipants(selectedParticipants.filter(p => p.id !== participantId));
  };

  const handleCreateThread = async () => {
    if (selectedParticipants.length === 0) {
      alert('Please add at least one participant');
      return;
    }

    try {
      setLoading(true);
      // Get current user's complete data from Firestore
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (!userDoc.exists()) {
        throw new Error('Current user data not found');
      }
      const userData = userDoc.data();
      
      // Format current user data to match participant structure
      const formattedCurrentUser = {
        id: currentUser.uid,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email || currentUser.email,
        role: userData.role
      };
      
      const participants = [...selectedParticipants, formattedCurrentUser];
      const threadRef = await createThread(participants, subject || 'New Conversation');
      if (onThreadCreated) {
        onThreadCreated();
      }
    } catch (error) {
      console.error('Error creating thread:', error);
      alert('Failed to create thread');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-thread-container">
      <h2>Create New Thread</h2>
      <TextField
        fullWidth
        label="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Enter conversation subject"
        margin="normal"
        variant="outlined"
      />
      {!showParticipantSearch ? (
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowParticipantSearch(true)}
          className="add-participant-btn"
          disabled={loading}
        >
          Add Participants
        </Button>
      ) : (
        <ParticipantSearch
          onSelect={handleAddParticipant}
          onClose={() => setShowParticipantSearch(false)}
        />
      )}
      {selectedParticipants.length > 0 && (
        <div className="selected-participants">
          <h3>Selected Participants:</h3>
          {selectedParticipants.map(participant => (
            <div key={participant.id} className="participant-chip">
              {participant.firstName && participant.lastName 
                ? `${participant.firstName} ${participant.lastName}`
                : participant.email}
              <Button
                size="small"
                onClick={() => handleRemoveParticipant(participant.id)}
                disabled={loading}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateThread}
            className="create-thread-btn"
            disabled={loading}
          >
            Create Thread
          </Button>
        </div>
      )}
    </div>
  );
};

export default CreateThread;
