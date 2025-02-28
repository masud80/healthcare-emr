import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchThreads, archiveThread, selectMessaging } from '../../redux/slices/messagingSlice';
import { 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton,
  Paper,
  Typography,
  CircularProgress
} from '@mui/material';
import { Archive as ArchiveIcon, Add as AddIcon } from '@mui/icons-material';

const MessagingDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { threads, loading, error } = useSelector(selectMessaging);

  useEffect(() => {
    dispatch(fetchThreads());
  }, [dispatch]);

  const handleArchive = async (threadId, event) => {
    event.stopPropagation();
    await dispatch(archiveThread(threadId));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <Typography color="error">Error: {error}</Typography>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <Typography variant="h5">Secure Messages</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/messaging/create')}
        >
          New Thread
        </Button>
      </div>

      <Paper>
        <List>
          {threads?.length === 0 ? (
            <ListItem>
              <ListItemText primary="No message threads found" />
            </ListItem>
          ) : (
            threads?.map(thread => (
              <ListItem
                key={thread.id}
                button
                onClick={() => navigate(`/messaging/${thread.id}`)}
                divider
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={(e) => handleArchive(thread.id, e)}
                    title="Archive thread"
                  >
                    <ArchiveIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={thread.subject}
                  secondary={`Created ${new Date(thread.createdAt).toLocaleDateString()} • ${thread.participants.length} participants`}
                />
              </ListItem>
            ))
          )}
        </List>
      </Paper>
    </div>
  );
};

export default MessagingDashboard;
