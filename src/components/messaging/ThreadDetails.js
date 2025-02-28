import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { selectRole } from '../../redux/slices/authSlice';
import { fetchAvailableUsers } from '../../redux/slices/usersSlice';
import { fetchThreadMessages, sendMessage } from '../../redux/slices/messagingSlice';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { addSystemMessage } from '../../utils/messaging';

const ThreadDetails = () => {
  const { threadId } = useParams();
  const dispatch = useDispatch();
  const role = useSelector(selectRole);
  
  const [newMessage, setNewMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  
  // Debug log
  console.log('Current role:', role);
  console.log('Can manage participants:', ['admin', 'doctor', 'nurse'].includes(role));

  const currentThread = useSelector(state => state.messaging.currentThread);
  const availableUsers = useSelector(state => state.users.availableUsers);
  const loading = useSelector(state => state.messaging.loading);

  useEffect(() => {
    dispatch(fetchAvailableUsers());
    dispatch(fetchThreadMessages(threadId));
  }, [dispatch, threadId]);

  const canManageParticipants = ['admin', 'doctor', 'nurse'].includes(role);

  // Filter out users who are already participants
  const availableParticipants = availableUsers.filter(user => 
    !currentThread?.participants.includes(user.id)
  );

  const handleAddParticipants = async () => {
    try {
      const threadRef = doc(db, 'messageThreads', threadId);
      
      await updateDoc(threadRef, {
        participants: arrayUnion(...selectedParticipants.map(p => p.id))
      });

      const participantNames = selectedParticipants.map(p => p.name).join(', ');
      await addSystemMessage(threadId, `Added participants: ${participantNames}`);

      setSelectedParticipants([]);
      setOpenDialog(false);
      dispatch(fetchThreadMessages(threadId));
    } catch (error) {
      console.error('Error adding participants:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await dispatch(sendMessage({
      threadId,
      content: newMessage
    }));
    setNewMessage('');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          {currentThread?.subject || 'Thread Details'}
        </Typography>
        {canManageParticipants && (
          <Button
            startIcon={<PersonAddIcon />}
            variant="outlined"
            onClick={() => setOpenDialog(true)}
            sx={{ ml: 2 }}
          >
            Add Participants
          </Button>
        )}
      </Box>

      {/* Messages List */}
      <List>
        {currentThread?.messages?.map((message, index) => (
          <React.Fragment key={message.id}>
            <ListItem>
              <ListItemText
                primary={message.content}
                secondary={`${message.senderName || 'Unknown'} - ${new Date(message.sentAt?.toDate()).toLocaleString()}`}
              />
            </ListItem>
            {index < currentThread.messages.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>

      {/* Message Input */}
      <Box component="form" onSubmit={handleSendMessage} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <Button 
          type="submit" 
          variant="contained" 
          disabled={!newMessage.trim()}
        >
          Send Message
        </Button>
      </Box>

      {/* Add Participants Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add Participants</DialogTitle>
        <DialogContent>
          <Autocomplete
            multiple
            options={availableUsers || []}
            getOptionLabel={(option) => option.name || option.email}
            value={selectedParticipants}
            onChange={(_, newValue) => setSelectedParticipants(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Select Participants"
                fullWidth
                sx={{ mt: 2 }}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddParticipants}
            disabled={selectedParticipants.length === 0}
            variant="contained"
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ThreadDetails;
