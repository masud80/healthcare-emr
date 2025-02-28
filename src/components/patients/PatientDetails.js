import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { doc, updateDoc } from 'firebase/firestore';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput
} from '@mui/material';
import { db } from '../../firebase/config';
import VisitList from '../visits/VisitList';
import { setSelectedPatient, fetchPatientDetails } from '../../redux/slices/patientsSlice';
import { fetchFacilities } from '../../redux/thunks/facilitiesThunks';
import { fetchPatientPrescriptions } from '../../redux/slices/prescriptionsSlice';
import PrescriptionForm from '../prescriptions/PrescriptionForm';
import format from 'date-fns/format';
import '../../styles/components.css';
import '../../styles/prescriptions.css';
import '../../styles/patientDetailsEnhancements.css';
import '../../styles/patientCardStyles.css';
import '../../styles/patientCardOutline.css';
import '../../styles/tabs.css';
import '../../styles/aiSummary.css';
import { isEmailUnique } from '../../utils/patientValidation';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <div className="tab-content">{children}</div>}
  </div>
);

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedPatient, loading, error } = useSelector((state) => state.patients);
  const { role } = useSelector((state) => state.auth);
  const facilities = useSelector((state) => state.facilities.facilities);
  const prescriptions = useSelector((state) => state.prescriptions.prescriptions);
  const [tabValue, setTabValue] = useState(0);
  const [openNoteDialog, setOpenNoteDialog] = useState(false);
  const [openPrescriptionDialog, setOpenPrescriptionDialog] = useState(false);
  const [openMedicalHistoryModal, setOpenMedicalHistoryModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [medicalHistory, setMedicalHistory] = useState({
    bloodType: '',
    allergies: [],
    chronicConditions: []
  });
  const [error, setError] = useState(null);

  const validateEmailForUpdate = async (email) => {
    if (!email) return true;
    if (email === selectedPatient.email) return true;
    
    return await isEmailUnique(email, id);
  };

  useEffect(() => {
    if (selectedPatient) {
      setMedicalHistory({
        bloodType: selectedPatient.bloodType || '',
        allergies: selectedPatient.allergies || [],
        chronicConditions: selectedPatient.chronicConditions || []
      });
    }
  }, [selectedPatient]);

  const handleMedicalHistoryChange = (event) => {
    const { name, value } = event.target;
    setMedicalHistory(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateMedicalHistory = async () => {
    try {
      await updateDoc(doc(db, 'patients', id), medicalHistory);
      dispatch(setSelectedPatient({
        ...selectedPatient,
        ...medicalHistory
      }));
      setOpenMedicalHistoryModal(false);
    } catch (error) {
      console.error('Error updating medical history:', error);
    }
  };
const [editingFacility, setEditingFacility] = useState(false);
const [selectedFacilityId, setSelectedFacilityId] = useState('');
const [editingBasicInfo, setEditingBasicInfo] = useState(false);
const [editingEmergencyContact, setEditingEmergencyContact] = useState(false);
const [editedBasicInfo, setEditedBasicInfo] = useState({});
const [editedEmergencyContact, setEditedEmergencyContact] = useState({});

  useEffect(() => {
    dispatch(fetchFacilities());
    dispatch(fetchPatientPrescriptions(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedPatient?.facilityId) {
      setSelectedFacilityId(selectedPatient.facilityId);
    }
  }, [selectedPatient]);

  useEffect(() => {
    dispatch(fetchPatientDetails(id))
      .unwrap()
      .catch(error => {
        console.error('Error fetching patient details:', error);
      });
  }, [dispatch, id]);

  const handleUpdateBasicInfo = async () => {
    try {
      // Validate email before update
      if (editedBasicInfo.email) {
        const isEmailValid = await validateEmailForUpdate(editedBasicInfo.email);
        if (!isEmailValid) {
          setError('This email is already registered to another patient');
          return;
        }
      }

      await updateDoc(doc(db, 'patients', id), {
        ...editedBasicInfo,
        email: editedBasicInfo.email?.toLowerCase(),
        updatedAt: new Date().toISOString()
      });
      
      dispatch(setSelectedPatient({
        ...selectedPatient,
        ...editedBasicInfo
      }));
      setEditingBasicInfo(false);
      setError(null);
    } catch (error) {
      console.error('Error updating basic information:', error);
      setError('Failed to update patient information');
    }
  };

  const handleUpdateEmergencyContact = async () => {
    try {
      await updateDoc(doc(db, 'patients', id), {
        emergencyContact: editedEmergencyContact
      });
      dispatch(setSelectedPatient({
        ...selectedPatient,
        emergencyContact: editedEmergencyContact
      }));
      setEditingEmergencyContact(false);
    } catch (error) {
      console.error('Error updating emergency contact:', error);
    }
  };

  const handleUpdateFacility = async () => {
    try {
      await updateDoc(doc(db, 'patients', id), {
        facilityId: selectedFacilityId
      });

      dispatch(setSelectedPatient({
        ...selectedPatient,
        facilityId: selectedFacilityId
      }));

      setEditingFacility(false);
    } catch (error) {
      console.error('Error updating facility:', error);
    }
  };

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
      console.error('Error adding note:', error);
    }
  };

  if (loading) {
    return <div className="container"><p>Loading patient details...</p></div>;
  }

  if (error) {
    return <div className="container"><p>Error: {error}</p></div>;
  }

  if (!selectedPatient) {
    return <div className="container"><p>Patient not found</p></div>;
  }

  return (
    <div className="container">
      <div className="paper">
        <div className="flex flex-between flex-center" style={{ marginBottom: '2rem' }}>
          <div className="flex flex-center" style={{ gap: '1rem' }}>
            <h1 className="title" style={{ margin: 0 }}>{selectedPatient.name}</h1>
            <Button
              variant="contained"
              sx={{ 
                backgroundColor: '#1a237e',
                '&:hover': {
                  backgroundColor: '#0d47a1'
                }
              }}
              onClick={() => navigate(`/patients/${id}/visits/new`)}
            >
              New Visit
            </Button>
          </div>
        </div>

        <div className="tabs" style={{ marginBottom: '2rem' }}>
          <button 
            className={`tab ${tabValue === 0 ? 'active' : ''}`}
            onClick={() => setTabValue(0)}
          >
            Personal Information
          </button>
          <button 
            className={`tab ${tabValue === 1 ? 'active' : ''}`}
            onClick={() => setTabValue(1)}
          >
            Medical History
          </button>
          <button 
            className={`tab ${tabValue === 2 ? 'active' : ''}`}
            onClick={() => setTabValue(2)}
          >
            Notes
          </button>
          <button 
            className={`tab ${tabValue === 3 ? 'active' : ''}`}
            onClick={() => setTabValue(3)}
          >
            Prescriptions
          </button>
          <button 
            className={`tab ${tabValue === 4 ? 'active' : ''}`}
            onClick={() => setTabValue(4)}
          >
            Visits
          </button>
        </div>

        <TabPanel value={tabValue} index={0}>
          <div className="ai-summary">
            <h2>AI Health Analysis</h2>
            <div className="ai-summary-section">
              <h3>1. Vital Signs Trends</h3>
              <ul>
                <li>Blood pressure: <span className="ai-summary-normal">Generally stable and within normal range (120/80 mmHg or lower)</span></li>
                <li>Heart rate: <span className="ai-summary-highlight">Higher than normal during the most recent visit (111 bpm)</span></li>
                <li>Temperature: <span className="ai-summary-normal">Within normal range for all visits (98.0 °F)</span></li>
              </ul>
            </div>
            <div className="ai-summary-section">
              <h3>2. Symptom Patterns</h3>
              <ul>
                <li>Headache was reported during the most recent visit only</li>
                <li>No symptoms were reported during the previous four visits</li>
              </ul>
            </div>
            <div className="ai-summary-section">
              <h3>3. Effectiveness of Previous Action Plans</h3>
              <p>The previous action plans recommended routine checkups and maintaining current health regimens.</p>
              <p>Since the patient's vitals were within normal range and there were no reported symptoms (except for the recent headache), these action plans seem to have been effective in maintaining the patient's health.</p>
            </div>
            <div className="ai-summary-section">
              <h3>4. Recommendations for Future Care</h3>
              <ul>
                <li>Schedule a follow-up visit in 6 months to monitor the patient's progress</li>
                <li>Based on the elevated heart rate during the most recent visit, consider performing an electrocardiogram (ECG) to assess heart health</li>
                <li>If the headache persists or worsens, further evaluation and treatment may be necessary</li>
                <li>Encourage the patient to maintain a healthy lifestyle, including regular exercise, a balanced diet, and adequate sleep</li>
              </ul>
            </div>
          </div>

          <div className="grid grid-2-cols">
              <div>
              <div className="flex flex-between flex-center">
                <h2 className="subtitle">Basic Information</h2>
                <Button
                  variant="contained"
                  size="medium"
              sx={{ 
                backgroundColor: '#1a237e',
                padding: '4px 16px',
                minWidth: '100px',
                '&:hover': {
                  backgroundColor: '#0d47a1'
                }
              }}
                  onClick={() => {
                    setEditedBasicInfo({
                      dateOfBirth: selectedPatient.dateOfBirth,
                      gender: selectedPatient.gender,
                      contact: selectedPatient.contact,
                      email: selectedPatient.email,
                      address: selectedPatient.address
                    });
                    setEditingBasicInfo(true);
                  }}
                >
                  Edit
                </Button>
              </div>
              <div className="paper">
                {!editingBasicInfo ? (
                  <>
                    <p>Date of Birth: {format(new Date(selectedPatient.dateOfBirth), 'MM/dd/yyyy')}</p>
                    <p>Gender: {selectedPatient.gender}</p>
                    <p>Contact: {selectedPatient.contact}</p>
                    <p>Email: {selectedPatient.email}</p>
                    <p>Address: {selectedPatient.address}</p>
                  </>
                ) : (
                  <>
                    <div style={{ marginBottom: '1rem' }}>
                      <label>Date of Birth</label>
                      <input
                        type="date"
                        className="input"
                        value={editedBasicInfo.dateOfBirth}
                        onChange={(e) => setEditedBasicInfo({...editedBasicInfo, dateOfBirth: e.target.value})}
                      />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label>Gender</label>
                      <select
                        className="select"
                        value={editedBasicInfo.gender}
                        onChange={(e) => setEditedBasicInfo({...editedBasicInfo, gender: e.target.value})}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label>Contact</label>
                      <input
                        type="tel"
                        className="input"
                        value={editedBasicInfo.contact}
                        onChange={(e) => setEditedBasicInfo({...editedBasicInfo, contact: e.target.value})}
                      />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label>Email</label>
                      <input
                        type="email"
                        className="input"
                        value={editedBasicInfo.email}
                        onChange={(e) => setEditedBasicInfo({...editedBasicInfo, email: e.target.value})}
                      />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label>Address</label>
                      <input
                        type="text"
                        className="input"
                        value={editedBasicInfo.address}
                        onChange={(e) => setEditedBasicInfo({...editedBasicInfo, address: e.target.value})}
                      />
                    </div>
                    <div className="dialog-actions">
                      <Button
                        variant="outlined"
                        onClick={() => setEditingBasicInfo(false)}
                        sx={{ 
                          mr: 1,
                          padding: '4px 16px',
                          minWidth: '100px'
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleUpdateBasicInfo}
                        sx={{ 
                          backgroundColor: '#1a237e',
                          padding: '4px 16px',
                          minWidth: '100px',
                          '&:hover': {
                            backgroundColor: '#0d47a1'
                          }
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  </>
                )}
                <div className="facility-section">
                  <h3>Facility</h3>
                  {!editingFacility && (
                    <div className="flex flex-between flex-center" style={{ marginTop: '0.5rem' }}>
                      <p style={{ margin: 0 }}>
                        {facilities.find(f => f.id === selectedPatient.facilityId)?.name || 'Not Assigned'}
                      </p>
                      {(role === 'admin' || role === 'doctor') && (
                        <Button
                          variant="contained"
                        sx={{ 
                          backgroundColor: '#1a237e',
                          padding: '4px 16px',
                          minWidth: '100px',
                          '&:hover': {
                            backgroundColor: '#0d47a1'
                          }
                        }}
                          onClick={() => setEditingFacility(true)}
                        >
                          Transfer to Another Facility
                        </Button>
                      )}
                    </div>
                  )}
                  {editingFacility && (
                    <div>
                      <select
                        className="select"
                        value={selectedFacilityId}
                        onChange={(e) => setSelectedFacilityId(e.target.value)}
                      >
                        <option value="">Select Facility</option>
                        {facilities.map((facility) => (
                          <option key={facility.id} value={facility.id}>
                            {facility.name}
                          </option>
                        ))}
                      </select>
                      <div className="dialog-actions">
                        <Button
                          variant="outlined"
                          onClick={() => setEditingFacility(false)}
                sx={{ 
                  mr: 1,
                  padding: '4px 16px',
                  minWidth: '100px'
                }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleUpdateFacility}
                sx={{ 
                  backgroundColor: '#1a237e',
                  padding: '4px 16px',
                  minWidth: '100px',
                  '&:hover': {
                    backgroundColor: '#0d47a1'
                  }
                }}
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div>
              <div className="flex flex-between flex-center">
                <h2 className="subtitle">Emergency Contact</h2>
                <Button
                  variant="contained"
                  size="medium"
                sx={{ 
                  backgroundColor: '#1a237e',
                  padding: '4px 16px',
                  minWidth: '100px',
                  '&:hover': {
                    backgroundColor: '#0d47a1'
                  }
                }}
                  onClick={() => {
                    setEditedEmergencyContact({
                      name: selectedPatient.emergencyContact?.name || '',
                      relationship: selectedPatient.emergencyContact?.relationship || '',
                      phone: selectedPatient.emergencyContact?.phone || ''
                    });
                    setEditingEmergencyContact(true);
                  }}
                >
                  Edit
                </Button>
              </div>
              <div className="paper">
                {!editingEmergencyContact ? (
                  <>
                    <p>Name: {selectedPatient.emergencyContact?.name}</p>
                    <p>Relationship: {selectedPatient.emergencyContact?.relationship}</p>
                    <p>Phone: {selectedPatient.emergencyContact?.phone}</p>
                  </>
                ) : (
                  <>
                    <div style={{ marginBottom: '1rem' }}>
                      <label>Name</label>
                      <input
                        type="text"
                        className="input"
                        value={editedEmergencyContact.name}
                        onChange={(e) => setEditedEmergencyContact({...editedEmergencyContact, name: e.target.value})}
                      />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label>Relationship</label>
                      <input
                        type="text"
                        className="input"
                        value={editedEmergencyContact.relationship}
                        onChange={(e) => setEditedEmergencyContact({...editedEmergencyContact, relationship: e.target.value})}
                      />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label>Phone</label>
                      <input
                        type="tel"
                        className="input"
                        value={editedEmergencyContact.phone}
                        onChange={(e) => setEditedEmergencyContact({...editedEmergencyContact, phone: e.target.value})}
                      />
                    </div>
                    <div className="dialog-actions">
                      <Button
                        variant="outlined"
                        onClick={() => setEditingEmergencyContact(false)}
                        sx={{ 
                          mr: 1,
                          padding: '4px 16px',
                          minWidth: '100px'
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleUpdateEmergencyContact}
                sx={{ 
                  backgroundColor: '#1a237e',
                  padding: '4px 16px',
                  minWidth: '100px',
                  '&:hover': {
                    backgroundColor: '#0d47a1'
                  }
                }}
                      >
                        Save
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <div className="flex flex-between flex-center" style={{ marginBottom: '1rem' }}>
            <h2 className="subtitle">Medical History</h2>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenMedicalHistoryModal(true)}
              sx={{ 
                backgroundColor: '#1a237e',
                '&:hover': {
                  backgroundColor: '#0d47a1'
                }
              }}
            >
              Update Medical History
            </Button>
          </div>
          <div className="paper">
            <p>Blood Type: {selectedPatient.bloodType}</p>
            <p>Allergies: {selectedPatient.allergies?.join(', ') || 'None'}</p>
            <p>Chronic Conditions: {selectedPatient.chronicConditions?.join(', ') || 'None'}</p>
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <div className="flex flex-center" style={{ gap: '1rem', marginBottom: '2rem' }}>
            <h2 className="subtitle" style={{ margin: 0 }}>Clinical Notes</h2>
            <Button
              variant="contained"
                sx={{ 
                  backgroundColor: '#1a237e',
                  padding: '4px 16px',
                  minWidth: '100px',
                  '&:hover': {
                    backgroundColor: '#0d47a1'
                  }
                }}
              onClick={() => setOpenNoteDialog(true)}
            >
              Add Note
            </Button>
          </div>
          <div className="paper">
            {selectedPatient.notes?.map((note, index) => (
              <div key={index} className="list-item">
                <p>{note.content}</p>
                <small>{note.author} - {new Date(note.timestamp).toLocaleString()}</small>
              </div>
            ))}
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <div className="flex flex-between flex-center">
            <h2 className="subtitle">Prescriptions</h2>
            {(role === 'doctor' || role === 'nurse') && (
              <Button
                variant="contained"
                sx={{ 
                  backgroundColor: '#1a237e',
                  padding: '4px 16px',
                  minWidth: '100px',
                  '&:hover': {
                    backgroundColor: '#0d47a1'
                  }
                }}
                onClick={() => setOpenPrescriptionDialog(true)}
              >
                New Prescription
              </Button>
            )}
          </div>
          <div className="paper">
            <h3>Current Pharmacy</h3>
            {selectedPatient.defaultPharmacy ? (
              <div>
                <p>Name: {selectedPatient.defaultPharmacy.name}</p>
                <p>Address: {selectedPatient.defaultPharmacy.address}</p>
                <p>Phone: {selectedPatient.defaultPharmacy.phone}</p>
              </div>
            ) : (
              <p>No default pharmacy set</p>
            )}
          </div>
          <div className="prescription-list">
            {prescriptions.map((prescription, index) => (
              <div key={index} className="paper">
                <div className="prescription-header">
                  <h4>Prescription {format(new Date(prescription.createdAt), 'MM/dd/yyyy')}</h4>
                  <span className={`status status-${prescription.status}`}>
                    {prescription.status}
                  </span>
                </div>
                <div className="medications-list">
                  {prescription.medications.map((med, idx) => (
                    <div key={idx} className="medication-item">
                      <h5>{med.name}</h5>
                      <p>Dosage: {med.dosage}</p>
                      <p>Route: {med.route}</p>
                      <p>Frequency: {med.frequency}</p>
                      <p>Duration: {med.duration}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <VisitList patientId={id} />
        </TabPanel>
      </div>

      {openNoteDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h3 className="dialog-title">Add Clinical Note</h3>
            <div className="dialog-content">
              <textarea
                className="input input-multiline"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Enter your note here..."
              />
            </div>
            <div className="dialog-actions">
              <Button
                variant="outlined"
                onClick={() => setOpenNoteDialog(false)}
                        sx={{ 
                          mr: 1,
                          padding: '4px 16px',
                          minWidth: '100px'
                        }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleAddNote}
                sx={{ 
                  backgroundColor: '#1a237e',
                  padding: '4px 16px',
                  minWidth: '100px',
                  '&:hover': {
                    backgroundColor: '#0d47a1'
                  }
                }}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog
        open={openPrescriptionDialog}
        onClose={() => setOpenPrescriptionDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>New Prescription</DialogTitle>
        <DialogContent>
          <PrescriptionForm
            patientId={id}
            defaultPharmacy={selectedPatient.defaultPharmacy}
            onClose={() => setOpenPrescriptionDialog(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={openMedicalHistoryModal}
        onClose={() => setOpenMedicalHistoryModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Update Medical History</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Blood Type</InputLabel>
            <Select
              name="bloodType"
              value={medicalHistory.bloodType}
              onChange={handleMedicalHistoryChange}
              label="Blood Type"
            >
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Allergies</InputLabel>
            <Select
              multiple
              name="allergies"
              value={medicalHistory.allergies}
              onChange={handleMedicalHistoryChange}
              input={<OutlinedInput label="Allergies" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {['Penicillin', 'Peanuts', 'Latex', 'Dairy', 'Eggs', 'Shellfish'].map((allergy) => (
                <MenuItem key={allergy} value={allergy}>
                  {allergy}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Chronic Conditions</InputLabel>
            <Select
              multiple
              name="chronicConditions"
              value={medicalHistory.chronicConditions}
              onChange={handleMedicalHistoryChange}
              input={<OutlinedInput label="Chronic Conditions" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {['Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 'Arthritis'].map((condition) => (
                <MenuItem key={condition} value={condition}>
                  {condition}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={() => setOpenMedicalHistoryModal(false)} variant="outlined">
              Cancel
            </Button>
            <Button onClick={handleUpdateMedicalHistory} variant="contained" color="primary">
              Save Changes
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientDetails;
