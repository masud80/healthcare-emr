import React, { useState, useEffect } from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Box, 
  IconButton, 
  TextField,
  Tooltip,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import GroupIcon from '@mui/icons-material/Group';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/slices/authSlice';
import ParticipantSearch from './ParticipantSearch';
import './ThreadList.css';

const ThreadList = ({ onThreadSelect, selectedThread }) => {
  const [threads, setThreads] = useState([]);
  const [filteredThreads, setFilteredThreads] = useState([]);
  const [editingThread, setEditingThread] = useState(null);
  const [editSubject, setEditSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [managingParticipants, setManagingParticipants] = useState(null);
  const [showParticipantSearch, setShowParticipantSearch] = useState(false);
  const currentUser = useSelector(selectUser);

  useEffect(() => {
    if (!currentUser?.uid && !currentUser?.id) return;

    // Query threads where the current user is a participant
    const threadsRef = collection(db, 'messageThreads');
    const q = query(
      threadsRef,
      where('participants', 'array-contains', currentUser.uid || currentUser.id),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const threadList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Current user:', currentUser);
      console.log('Fetched threads:', threadList);
      setThreads(threadList);
      setFilteredThreads(threadList);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredThreads(threads);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = threads.filter(thread => {
      // Search in subject
      const subjectMatch = (thread.subject || '').toLowerCase().includes(query);
      
      // Search in participants
      const participantMatch = (thread.participantDetails || []).some(p => 
        (p.name || '').toLowerCase().includes(query) ||
        (p.email || '').toLowerCase().includes(query)
      );
      
      // Search in last message
      const messageMatch = (thread.lastMessage || '').toLowerCase().includes(query);

      return subjectMatch || participantMatch || messageMatch;
    });

    setFilteredThreads(filtered);
  }, [searchQuery, threads]);

  const handleEditClick = (thread) => {
    setEditingThread(thread.id);
    setEditSubject(thread.subject || '');
  };

  const handleSaveSubject = async (threadId) => {
    try {
      const threadRef = doc(db, 'messageThreads', threadId);
      await updateDoc(threadRef, {
        subject: editSubject.trim() || 'New Conversation'
      });
      setEditingThread(null);
      setEditSubject('');
    } catch (error) {
      console.error('Error updating subject:', error);
      alert('Failed to update subject');
    }
  };

  const handleCancelEdit = () => {
    setEditingThread(null);
    setEditSubject('');
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

  const handleManageParticipants = (thread, e) => {
    e.stopPropagation();
    setManagingParticipants(thread);
  };

  const handleAddParticipant = async (participant) => {
    if (!managingParticipants) return;

    try {
      const threadRef = doc(db, 'messageThreads', managingParticipants.id);
      const newParticipant = {
        id: participant.id,
        name: participant.firstName && participant.lastName 
          ? `${participant.firstName} ${participant.lastName}`
          : participant.email,
        role: participant.role
      };

      await updateDoc(threadRef, {
        participants: arrayUnion(participant.id),
        participantDetails: arrayUnion(newParticipant)
      });

      // Add system message about new participant
      const messagesRef = collection(db, 'messages');
      await addDoc(messagesRef, {
        threadId: managingParticipants.id,
        content: `${newParticipant.name} was added to the conversation`,
        type: 'system',
        sentAt: serverTimestamp(),
        sentBy: 'system'
      });

      setShowParticipantSearch(false);
    } catch (error) {
      console.error('Error adding participant:', error);
      alert('Failed to add participant');
    }
  };

  const handleRemoveParticipant = async (participantToRemove) => {
    if (!managingParticipants) return;

    try {
      const threadRef = doc(db, 'messageThreads', managingParticipants.id);
      await updateDoc(threadRef, {
        participants: arrayRemove(participantToRemove.id),
        participantDetails: arrayRemove(participantToRemove)
      });

      // Add system message about removed participant
      const messagesRef = collection(db, 'messages');
      await addDoc(messagesRef, {
        threadId: managingParticipants.id,
        content: `${participantToRemove.name} was removed from the conversation`,
        type: 'system',
        sentAt: serverTimestamp(),
        sentBy: 'system'
      });
    } catch (error) {
      console.error('Error removing participant:', error);
      alert('Failed to remove participant');
    }
  };

  return (
    <Box className="thread-list-container">
      <Box className="thread-list-header">
        <Typography variant="h6" className="thread-list-title">
          Conversations
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="thread-search-field"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <List>
        {filteredThreads.map(thread => (
          <ListItem
            key={thread.id}
            button
            selected={selectedThread?.id === thread.id}
            onClick={() => onThreadSelect(thread)}
            className="thread-list-item"
            secondaryAction={
              <Box sx={{ display: 'flex', gap: 1 }}>
                {editingThread !== thread.id ? (
                  <>
                    <Tooltip title="Manage participants">
                      <IconButton 
                        edge="end" 
                        onClick={(e) => handleManageParticipants(thread, e)}
                        size="small"
                      >
                        <GroupIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit subject">
                      <IconButton 
                        edge="end" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(thread);
                        }}
                        size="small"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Save">
                      <IconButton 
                        edge="end" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveSubject(thread.id);
                        }}
                        color="primary"
                        size="small"
                      >
                        <CheckIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Cancel">
                      <IconButton 
                        edge="end" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelEdit();
                        }}
                        color="error"
                        size="small"
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>
            }
          >
            <ListItemText
              primary={
                <Box>
                  {editingThread === thread.id ? (
                    <TextField
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveSubject(thread.id);
                        }
                      }}
                      placeholder="Enter subject"
                      size="small"
                      fullWidth
                      autoFocus
                    />
                  ) : (
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {thread.subject || 'New Conversation'}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {(thread.participantDetails || [])
                      .filter(p => p.id !== currentUser.uid)
                      .map(p => p.name)
                      .join(', ')}
                  </Typography>
                </Box>
              }
              secondary={
                thread.lastMessage ? (
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="textPrimary"
                    >
                      {thread.lastMessage.substring(0, 50)}
                      {thread.lastMessage.length > 50 ? '...' : ''}
                    </Typography>
                    <Typography
                      component="span"
                      variant="caption"
                      color="textSecondary"
                      className="thread-timestamp"
                    >
                      {formatDate(thread.lastMessageAt)}
                    </Typography>
                  </>
                ) : (
                  'No messages yet'
                )
              }
            />
          </ListItem>
        ))}
        {filteredThreads.length === 0 && (
          <ListItem>
            <ListItemText
              primary={searchQuery ? "No matching conversations found" : "No conversations yet"}
              secondary={searchQuery ? "Try a different search term" : "Start a new conversation using the New Message button"}
            />
          </ListItem>
        )}
      </List>

      {/* Manage Participants Dialog */}
      <Dialog 
        open={!!managingParticipants} 
        onClose={() => setManagingParticipants(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Manage Participants</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Button
              startIcon={<PersonAddIcon />}
              variant="outlined"
              onClick={() => setShowParticipantSearch(true)}
              sx={{ mb: 2 }}
            >
              Add Participant
            </Button>
            {showParticipantSearch && (
              <ParticipantSearch
                onSelect={handleAddParticipant}
                onClose={() => setShowParticipantSearch(false)}
              />
            )}
          </Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Current Participants:
          </Typography>
          <Stack spacing={1}>
            {managingParticipants?.participantDetails.map(participant => (
              <Chip
                key={participant.id}
                label={participant.name}
                onDelete={
                  participant.id !== currentUser.uid 
                    ? () => handleRemoveParticipant(participant)
                    : undefined
                }
                color={participant.id === currentUser.uid ? "primary" : "default"}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManagingParticipants(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ThreadList;
