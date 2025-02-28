import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { createThread } from '../../redux/slices/messagingSlice';

const CreateThread = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [subject, setSubject] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !initialMessage.trim()) return;

    setLoading(true);
    try {
      const result = await dispatch(createThread({
        subject: subject.trim(),
        initialMessage: initialMessage.trim(),
        participants: [] // Initialize empty participants array
      })).unwrap();
      
      navigate(`/messaging/${result.id}`);
    } catch (error) {
      console.error('Failed to create thread:', error);
      // Handle error (show notification, etc.)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Button 
        onClick={() => navigate('/messaging')} 
        style={{ marginBottom: '20px' }}
      >
        Back to Messages
      </Button>

      <Paper style={{ padding: '20px' }}>
        <Typography variant="h5" gutterBottom>
          Create New Message Thread
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box mb={3}>
            <TextField
              fullWidth
              label="Subject"
              variant="outlined"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </Box>

          <Box mb={3}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Message"
              variant="outlined"
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              required
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !subject.trim() || !initialMessage.trim()}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Thread'}
          </Button>
        </form>
      </Paper>
    </div>
  );
};

export default CreateThread;
