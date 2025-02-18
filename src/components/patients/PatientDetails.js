import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { setSelectedPatient, setLoading, setError } from '../../redux/slices/patientsSlice';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Tabs,
  Tab,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const PatientDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedPatient, loading } = useSelector((state) => state.patients);
  const { role } = useSelector((state) => state.auth);
  const [tabValue, setTabValue] = useState(0);
  const [openNoteDialog, setOpenNoteDialog] = useState(false);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    const fetchPatientDetails = async () => {
      dispatch(setLoading(true));
      try {
        const docRef = doc(db, 'patients', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          dispatch(setSelectedPatient({ id: docSnap.id, ...docSnap.data() }));
        } else {
          dispatch(setError('Patient not found'));
        }
      } catch (error) {
        dispatch(setError(error.message));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchPatientDetails();
  }, [dispatch, id]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const updatedNotes = [
        ...(selectedPatient.notes || []),
        {
          content: newNote,
          timestamp: new Date().toISOString(),
          author: role,
        },
      ];

      await updateDoc(doc(db, 'patients', id), {
        notes: updatedNotes,
      });

      dispatch(setSelectedPatient({
        ...selectedPatient,
        notes: updatedNotes,
      }));

      setNewNote('');
      setOpenNoteDialog(false);
    } catch (error) {
      dispatch(setError(error.message));
    }
  };

  if (loading) {
    return <Container><Typography>Loading patient details...</Typography></Container>;
  }

  if (!selectedPatient) {
    return <Container><Typography>Patient not found</Typography></Container>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {selectedPatient.name}
        </Typography>
        <Typography color="textSecondary" gutterBottom>
          Patient ID: {selectedPatient.id}
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Personal Information" />
            <Tab label="Medical History" />
            <Tab label="Notes" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
              <Box sx={{ ml: 2 }}>
                <Typography>Date of Birth: {selectedPatient.dateOfBirth}</Typography>
                <Typography>Gender: {selectedPatient.gender}</Typography>
                <Typography>Contact: {selectedPatient.contact}</Typography>
                <Typography>Email: {selectedPatient.email}</Typography>
                <Typography>Address: {selectedPatient.address}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Emergency Contact</Typography>
              <Box sx={{ ml: 2 }}>
                <Typography>Name: {selectedPatient.emergencyContact?.name}</Typography>
                <Typography>Relationship: {selectedPatient.emergencyContact?.relationship}</Typography>
                <Typography>Phone: {selectedPatient.emergencyContact?.phone}</Typography>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Medical History</Typography>
          <Box sx={{ ml: 2 }}>
            <Typography>Blood Type: {selectedPatient.bloodType}</Typography>
            <Typography>Allergies: {selectedPatient.allergies?.join(', ') || 'None'}</Typography>
            <Typography>Chronic Conditions: {selectedPatient.chronicConditions?.join(', ') || 'None'}</Typography>
          </Box>
          
          <Typography variant="h6" sx={{ mt: 3 }} gutterBottom>Past Visits</Typography>
          <List>
            {selectedPatient.visits?.map((visit, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={new Date(visit.date).toLocaleDateString()}
                  secondary={visit.reason}
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Clinical Notes</Typography>
            <Button
              variant="contained"
              onClick={() => setOpenNoteDialog(true)}
            >
              Add Note
            </Button>
          </Box>
          <List>
            {selectedPatient.notes?.map((note, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={note.content}
                  secondary={`${note.author} - ${new Date(note.timestamp).toLocaleString()}`}
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>
      </Paper>

      <Dialog open={openNoteDialog} onClose={() => setOpenNoteDialog(false)}>
        <DialogTitle>Add Clinical Note</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Note"
            fullWidth
            multiline
            rows={4}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNoteDialog(false)}>Cancel</Button>
          <Button onClick={handleAddNote} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PatientDetails;
