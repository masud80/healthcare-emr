import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText,
  Divider,
  CircularProgress
} from '@mui/material';
import { fetchThreadMessages, sendMessage } from '../../redux/slices/messagingSlice';

const ThreadDetails = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [newMessage, setNewMessage] = useState('');
  const { currentThread, messages, loading } = useSelector(state => state.messaging);

  useEffect(() => {
    if (threadId) {
      dispatch(fetchThreadMessages(threadId));
    }
  }, [threadId, dispatch]);

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
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <Button onClick={() => navigate('/messaging')} style={{ marginBottom: '20px' }}>
        Back to Messages
      </Button>

      <Paper style={{ padding: '20px', marginBottom: '20px' }}>
        <Typography variant="h5" gutterBottom>
          {currentThread?.subject}
        </Typography>
        
        <List>
          {messages.map((message) => (
            <React.Fragment key={message.id}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={message.senderName}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="textPrimary">
                        {message.content}
                      </Typography>
                      <br />
                      <Typography component="span" variant="caption" color="textSecondary">
                        {new Date(message.createdAt).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>

        <form onSubmit={handleSendMessage} style={{ marginTop: '20px' }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            style={{ marginBottom: '10px' }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={!newMessage.trim()}
          >
            Send Message
          </Button>
        </form>
      </Paper>
    </div>
  );
};

export default ThreadDetails;