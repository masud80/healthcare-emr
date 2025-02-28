import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, Typography, Box } from '@mui/material';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/slices/authSlice';
import './ThreadList.css';

const ThreadList = ({ onThreadSelect, selectedThread }) => {
  const [threads, setThreads] = useState([]);
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
    });

    return () => unsubscribe();
  }, [currentUser]);

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

  return (
    <Box className="thread-list-container">
      <Typography variant="h6" className="thread-list-title">
        Conversations
      </Typography>
      <List>
        {threads.map(thread => (
          <ListItem
            key={thread.id}
            button
            selected={selectedThread?.id === thread.id}
            onClick={() => onThreadSelect(thread)}
            className="thread-list-item"
          >
            <ListItemText
              primary={
                <Typography variant="subtitle1">
                  {(thread.participantDetails || [])
                    .filter(p => p.id !== currentUser.uid)
                    .map(p => p.name)
                    .join(', ') || thread.subject || 'Conversation'}
                </Typography>
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
        {threads.length === 0 && (
          <ListItem>
            <ListItemText
              primary="No conversations yet"
              secondary="Start a new conversation using the New Message button"
            />
          </ListItem>
        )}
      </List>
    </Box>
  );
};

export default ThreadList;
