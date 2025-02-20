import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createVisit, fetchRecentVisits } from '../../redux/slices/visitsSlice';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  TextField, 
  Button, 
  Tab, 
  Tabs, 
  Box, 
  Typography,
  Grid,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import format from 'date-fns/format';

const CreateVisit = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const recentVisits = useSelector(state => state.visits.recentVisits);
  const [activeTab, setActiveTab] = useState(0);
  const [symptomInput, setSymptomInput] = useState('');
  const [medicalRecords, setMedicalRecords] = useState([]);
  
  const [formData, setFormData] = useState({
    patientId,
    vitals: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      weight: '',
      height: '',
      bmi: ''
    },
    notes: {
      consultationNotes: '',
      secondOpinionNotes: '',
      progressNotes: '',
      nurseNotes: '',
      procedureNotes: '',
      soapNotes: {
        subjective: '',
        objective: '',
        assessment: '',
        plan: ''
      },
      simpleNotes: '',
      phoneNotes: ''
    },
    symptoms: [],
    actionPlan: '',
    provider: {
      id: '', // Will be set from auth context
      name: '',
      role: ''
    }
  });

  useEffect(() => {
    dispatch(fetchRecentVisits(patientId));
    
    // Fetch medical records for the patient
    const fetchMedicalRecords = async () => {
      try {
        const recordsRef = collection(db, 'medical_records');
        const q = query(
          recordsRef, 
          where('patientId', '==', patientId),
          orderBy('date', 'desc')
        );
        const snapshot = await getDocs(q);
        const recordsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMedicalRecords(recordsData);
      } catch (error) {
        console.error('Error fetching medical records:', error);
      }
    };

    fetchMedicalRecords();
  }, [dispatch, patientId]);

  const handleVitalsChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        [name]: value
      }
    }));
  };

  const handleNotesChange = (e, noteType, subType = null) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      notes: {
        ...prev.notes,
        [noteType]: subType ? {
          ...prev.notes[noteType],
          [subType]: value
        } : value
      }
    }));
  };

  const handleAddSymptom = () => {
    if (symptomInput.trim()) {
      setFormData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, symptomInput.trim()]
      }));
      setSymptomInput('');
    }
  };

  const handleRemoveSymptom = (symptomToRemove) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter(symptom => symptom !== symptomToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createVisit(formData));
      navigate(`/patients/${patientId}`);
    } catch (error) {
      console.error('Error creating visit:', error);
    }
  };

  const renderVitalsForm = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>Vitals</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            margin="normal"
            label="Blood Pressure"
            name="bloodPressure"
            value={formData.vitals.bloodPressure}
            onChange={handleVitalsChange}
            placeholder="120/80"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            margin="normal"
            label="Heart Rate"
            name="heartRate"
            type="number"
            value={formData.vitals.heartRate}
            onChange={handleVitalsChange}
            placeholder="BPM"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            margin="normal"
            label="Temperature"
            name="temperature"
            type="number"
            value={formData.vitals.temperature}
            onChange={handleVitalsChange}
            placeholder="°F"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            margin="normal"
            label="Respiratory Rate"
            name="respiratoryRate"
            type="number"
            value={formData.vitals.respiratoryRate}
            onChange={handleVitalsChange}
            placeholder="breaths/min"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            margin="normal"
            label="Oxygen Saturation"
            name="oxygenSaturation"
            type="number"
            value={formData.vitals.oxygenSaturation}
            onChange={handleVitalsChange}
            placeholder="%"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            margin="normal"
            label="Weight"
            name="weight"
            type="number"
            value={formData.vitals.weight}
            onChange={handleVitalsChange}
            placeholder="lbs"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            margin="normal"
            label="Height"
            name="height"
            type="number"
            value={formData.vitals.height}
            onChange={handleVitalsChange}
            placeholder="inches"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            margin="normal"
            label="BMI"
            name="bmi"
            type="number"
            value={formData.vitals.bmi}
            onChange={handleVitalsChange}
            disabled
          />
        </Grid>
      </Grid>
    </Paper>
  );

  const renderNotesForm = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Tabs 
        value={activeTab} 
        onChange={(e, newValue) => setActiveTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Consultation" />
        <Tab label="SOAP" />
        <Tab label="Progress" />
        <Tab label="Nurse" />
        <Tab label="Procedure" />
        <Tab label="Simple" />
        <Tab label="Phone" />
        <Tab label="Medical History" />
      </Tabs>
      
      <Box sx={{ mt: 2 }}>
        {activeTab === 0 && (
          <>
            <TextField
              fullWidth
              multiline
              rows={4}
              margin="normal"
              label="Consultation Notes"
              value={formData.notes.consultationNotes}
              onChange={(e) => handleNotesChange(e, 'consultationNotes')}
            />
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Symptoms</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Add Symptom"
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSymptom()}
                />
                <Button variant="contained" onClick={handleAddSymptom}>
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {formData.symptoms.map((symptom, index) => (
                  <Chip
                    key={index}
                    label={symptom}
                    onDelete={() => handleRemoveSymptom(symptom)}
                  />
                ))}
              </Box>
              <Typography variant="h6" gutterBottom>Action Plan</Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                margin="normal"
                label="Action Plan"
                value={formData.actionPlan}
                onChange={(e) => setFormData(prev => ({ ...prev, actionPlan: e.target.value }))}
              />
            </Box>
          </>
        )}
        
        {activeTab === 1 && (
          <Box>
            <TextField
              fullWidth
              multiline
              rows={3}
              margin="normal"
              label="Subjective"
              value={formData.notes.soapNotes.subjective}
              onChange={(e) => handleNotesChange(e, 'soapNotes', 'subjective')}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              margin="normal"
              label="Objective"
              value={formData.notes.soapNotes.objective}
              onChange={(e) => handleNotesChange(e, 'soapNotes', 'objective')}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              margin="normal"
              label="Assessment"
              value={formData.notes.soapNotes.assessment}
              onChange={(e) => handleNotesChange(e, 'soapNotes', 'assessment')}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              margin="normal"
              label="Plan"
              value={formData.notes.soapNotes.plan}
              onChange={(e) => handleNotesChange(e, 'soapNotes', 'plan')}
            />
          </Box>
        )}

        {activeTab === 2 && (
          <TextField
            fullWidth
            multiline
            rows={4}
            margin="normal"
            label="Progress Notes"
            value={formData.notes.progressNotes}
            onChange={(e) => handleNotesChange(e, 'progressNotes')}
          />
        )}

        {activeTab === 3 && (
          <TextField
            fullWidth
            multiline
            rows={4}
            margin="normal"
            label="Nurse Notes"
            value={formData.notes.nurseNotes}
            onChange={(e) => handleNotesChange(e, 'nurseNotes')}
          />
        )}

        {activeTab === 4 && (
          <TextField
            fullWidth
            multiline
            rows={4}
            margin="normal"
            label="Procedure Notes"
            value={formData.notes.procedureNotes}
            onChange={(e) => handleNotesChange(e, 'procedureNotes')}
          />
        )}

        {activeTab === 5 && (
          <TextField
            fullWidth
            multiline
            rows={4}
            margin="normal"
            label="Simple Notes"
            value={formData.notes.simpleNotes}
            onChange={(e) => handleNotesChange(e, 'simpleNotes')}
          />
        )}

        {activeTab === 6 && (
          <TextField
            fullWidth
            multiline
            rows={4}
            margin="normal"
            label="Phone Notes"
            value={formData.notes.phoneNotes}
            onChange={(e) => handleNotesChange(e, 'phoneNotes')}
          />
        )}

        {activeTab === 7 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Patient Medical History</Typography>
            {medicalRecords.length === 0 ? (
              <Typography color="textSecondary">No medical history records found.</Typography>
            ) : (
              <List>
                {medicalRecords.map((record) => (
                  <React.Fragment key={record.id}>
                    <ListItem>
                      <ListItemText
                        primary={format(new Date(record.date), 'MMM dd, yyyy')}
                        secondary={
                          <>
                            <Typography variant="body2" color="textPrimary">
                              Type: {record.type}
                            </Typography>
                            {record.diagnosis && (
                              <Typography variant="body2">
                                Diagnosis: {record.diagnosis}
                              </Typography>
                            )}
                            {record.treatment && (
                              <Typography variant="body2">
                                Treatment: {record.treatment}
                              </Typography>
                            )}
                            <Typography variant="body2" color="textSecondary">
                              {record.description}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );

  const renderRecentVisits = () => (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Recent Visits (Last 10)</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <List>
          {recentVisits.map((visit, index) => (
            <React.Fragment key={visit.id}>
              <ListItem>
                <ListItemText
                  primary={format(new Date(visit.createdAt), 'MMM dd, yyyy')}
                  secondary={
                    <>
                      <Typography variant="body2">
                        BP: {visit.vitals.bloodPressure} | 
                        HR: {visit.vitals.heartRate} |
                        Temp: {visit.vitals.temperature}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {visit.notes.consultationNotes.substring(0, 100)}...
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              {index < recentVisits.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 2 }}>
      <Typography variant="h4" gutterBottom>New Visit</Typography>
      <form onSubmit={handleSubmit}>
        {renderVitalsForm()}
        {renderNotesForm()}
        {renderRecentVisits()}
        
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
          >
            Save Visit
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate(`/patients/${patientId}`)}
          >
            Cancel
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default CreateVisit;
