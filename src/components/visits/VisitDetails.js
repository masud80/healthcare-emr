import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVisitById } from '../../redux/slices/visitsSlice';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Divider,
  Button,
  Tab,
  Tabs
} from '@mui/material';
import format from 'date-fns/format';

const VisitDetails = () => {
  const { patientId, visitId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const visit = useSelector(state => state.visits.selectedVisit);
  const loading = useSelector(state => state.visits.loading);
  const [activeTab, setActiveTab] = React.useState(0);

  useEffect(() => {
    dispatch(fetchVisitById(visitId));
  }, [dispatch, visitId]);

  if (loading || !visit) {
    return <Typography>Loading visit details...</Typography>;
  }

  const renderVitals = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>Vitals</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="subtitle2">Blood Pressure</Typography>
          <Typography>{visit.vitals.bloodPressure}</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="subtitle2">Heart Rate</Typography>
          <Typography>{visit.vitals.heartRate} BPM</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="subtitle2">Temperature</Typography>
          <Typography>{visit.vitals.temperature}°F</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="subtitle2">Respiratory Rate</Typography>
          <Typography>{visit.vitals.respiratoryRate} breaths/min</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="subtitle2">Oxygen Saturation</Typography>
          <Typography>{visit.vitals.oxygenSaturation}%</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="subtitle2">Weight</Typography>
          <Typography>{visit.vitals.weight} lbs</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="subtitle2">Height</Typography>
          <Typography>{visit.vitals.height} inches</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="subtitle2">BMI</Typography>
          <Typography>{visit.vitals.bmi}</Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  const renderNotes = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        <Tab label="Consultation" />
        <Tab label="SOAP" />
        <Tab label="Progress" />
        <Tab label="Nurse" />
        <Tab label="Procedure" />
        <Tab label="Simple" />
        <Tab label="Phone" />
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {activeTab === 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>Consultation Notes</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {visit.notes.consultationNotes}
            </Typography>
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>SOAP Notes</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Subjective</Typography>
                <Typography sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                  {visit.notes.soapNotes.subjective}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Objective</Typography>
                <Typography sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                  {visit.notes.soapNotes.objective}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Assessment</Typography>
                <Typography sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                  {visit.notes.soapNotes.assessment}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Plan</Typography>
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                  {visit.notes.soapNotes.plan}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>Progress Notes</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {visit.notes.progressNotes}
            </Typography>
          </Box>
        )}

        {activeTab === 3 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>Nurse Notes</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {visit.notes.nurseNotes}
            </Typography>
          </Box>
        )}

        {activeTab === 4 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>Procedure Notes</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {visit.notes.procedureNotes}
            </Typography>
          </Box>
        )}

        {activeTab === 5 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>Simple Notes</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {visit.notes.simpleNotes}
            </Typography>
          </Box>
        )}

        {activeTab === 6 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>Phone Notes</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {visit.notes.phoneNotes}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );

  const renderSymptoms = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>Symptoms</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {visit.symptoms.map((symptom, index) => (
          <Chip
            key={index}
            label={symptom}
            color="secondary"
            variant="outlined"
          />
        ))}
      </Box>
    </Paper>
  );

  const renderActionPlan = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>Action Plan</Typography>
      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
        {visit.actionPlan}
      </Typography>
    </Paper>
  );

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
          Visit Details - {format(new Date(visit.createdAt), 'MMMM dd, yyyy')}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate(`/patients/${patientId}/visits`)}
        >
          Back to Visits
        </Button>
      </Box>

      {renderVitals()}
      {renderSymptoms()}
      {renderNotes()}
      {renderActionPlan()}

      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="textSecondary">
          Provider: {visit.provider.name} ({visit.provider.role})
        </Typography>
      </Box>
    </Box>
  );
};

export default VisitDetails;
