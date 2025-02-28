import React, { useEffect, useState, useRef } from 'react';
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
  Autocomplete,
  Paper,
  IconButton,
  Avatar
} from '@mui/material';
import { PersonAdd as PersonAddIcon, Send as SendIcon } from '@mui/icons-material';
import { selectRole, selectUser } from '../../redux/slices/authSlice';
import { fetchAvailableUsers } from '../../redux/slices/usersSlice';
import { fetchThreadMessages, sendMessage } from '../../redux/slices/messagingSlice';
import { doc, updateDoc, arrayUnion, collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { addSystemMessage } from '../../utils/messaging';
import './ThreadDetails.css';

const ThreadDetails = ({ threadId }) => {
  const dispatch = useDispatch();
  const role = useSelector(selectRole);
  const currentUser = useSelector(selectUser);
  
  const [newMessage, setNewMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [thread, setThread] = useState(null);
  const [userData, setUserData] = useState(null);
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch complete user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser?.uid) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [currentUser?.uid]);

  // Debug logs
  console.log('Current user:', currentUser);
  console.log('User data:', userData);
  console.log('Can manage participants:', ['admin', 'doctor', 'nurse'].includes(role));

  const currentThread = useSelector(state => state.messaging.currentThread);
  const availableUsers = useSelector(state => state.users.availableUsers);

  useEffect(() => {
    dispatch(fetchAvailableUsers());
    dispatch(fetchThreadMessages(threadId));
  }, [dispatch, threadId]);

  const canManageParticipants = ['admin', 'doctor', 'nurse'].includes(role);

  // Filter out users who are already participants
  const availableParticipants = availableUsers.filter(user => 
    !currentThread?.participants?.some(p => p.id === user.id)
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!threadId) return;

    // Subscribe to thread details
    const threadRef = doc(db, 'messageThreads', threadId);
    const unsubThread = onSnapshot(threadRef, (doc) => {
      if (doc.exists()) {
        setThread(doc.data());
      }
    });

    // Subscribe to messages
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('threadId', '==', threadId),
      orderBy('sentAt', 'asc')
    );

    const unsubMessages = onSnapshot(q, (snapshot) => {
      const messageList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messageList);
      setLoading(false);
      scrollToBottom();
    });

    return () => {
      unsubThread();
      unsubMessages();
    };
  }, [threadId]);

  const handleAddParticipants = async () => {
    try {
      const threadRef = doc(db, 'messageThreads', threadId);
      
      const participantsToAdd = selectedParticipants.map(p => ({
        id: p.id,
        name: p.firstName && p.lastName ? `${p.firstName} ${p.lastName}` : p.email,
        role: p.role
      }));

      await updateDoc(threadRef, {
        participants: arrayUnion(...participantsToAdd)
      });

      const participantNames = participantsToAdd.map(p => p.name).join(', ');
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
    if (!newMessage.trim() || !userData) return;

    try {
      // Use userData for sender name
      const senderName = userData.firstName && userData.lastName 
        ? `${userData.firstName} ${userData.lastName}`
        : userData.email || currentUser.email;

      const messageData = {
        threadId,
        content: newMessage.trim(),
        sentAt: serverTimestamp(),
        sentBy: currentUser.uid,
        senderName,
        type: 'message'
      };

      await addDoc(collection(db, 'messages'), messageData);

      // Update thread's last message
      await updateDoc(doc(db, 'messageThreads', threadId), {
        lastMessage: newMessage.trim(),
        lastMessageAt: serverTimestamp()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="thread-details-container">
      {thread && (
        <Box className="thread-header">
          <Typography variant="h6">
            {thread.subject || 'Conversation'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {thread.participantDetails
              .filter(p => p.id !== currentUser.uid)
              .map(p => p.name)
              .join(', ')}
          </Typography>
        </Box>
      )}

      <Paper className="messages-container">
        <List>
          {messages.map((message, index) => (
            <React.Fragment key={message.id}>
              <ListItem className={message.sentBy === currentUser.uid ? 'sent' : 'received'}>
                <Box className="message-content">
                  {message.type !== 'system' && (
                    <Typography variant="caption" className="sender-name">
                      {message.senderName}
                    </Typography>
                  )}
                  <Paper className={`message-bubble ${message.type === 'system' ? 'system' : ''}`}>
                    <Typography>{message.content}</Typography>
                  </Paper>
                  <Typography variant="caption" className="message-time">
                    {formatDate(message.sentAt)}
                  </Typography>
                </Box>
              </ListItem>
              {index < messages.length - 1 && <Divider variant="middle" />}
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Paper>

      <Box component="form" onSubmit={handleSendMessage} className="message-input-container">
        <TextField
          fullWidth
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          variant="outlined"
          size="small"
        />
        <IconButton 
          type="submit" 
          color="primary" 
          disabled={!newMessage.trim()}
          className="send-button"
        >
          <SendIcon />
        </IconButton>
      </Box>

      {/* Add Participants Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add Participants</DialogTitle>
        <DialogContent>
          <Autocomplete
            multiple
            options={availableParticipants || []}
            getOptionLabel={(option) => 
              option.firstName && option.lastName 
                ? `${option.firstName} ${option.lastName} (${option.role})`
                : option.email
            }
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
