import React, { useState } from 'react';
import { Button } from '@mui/material';
import ParticipantSearch from './ParticipantSearch';
import { createThread } from '../../utils/messaging';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/slices/authSlice';
import './CreateThread.css';

const CreateThread = ({ onThreadCreated }) => {
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [showParticipantSearch, setShowParticipantSearch] = useState(false);
  const currentUser = useSelector(selectUser);

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
      const participants = [...selectedParticipants, currentUser];
      const threadRef = await createThread(participants);
      if (onThreadCreated) {
        onThreadCreated();
      }
    } catch (error) {
      console.error('Error creating thread:', error);
      alert('Failed to create thread');
    }
  };

  return (
    <div className="create-thread-container">
      <h2>Create New Thread</h2>
      {!showParticipantSearch ? (
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowParticipantSearch(true)}
          className="add-participant-btn"
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
              {participant.name}
              <Button
                size="small"
                onClick={() => handleRemoveParticipant(participant.id)}
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
          >
            Create Thread
          </Button>
        </div>
      )}
    </div>
  );
};

export default CreateThread;
