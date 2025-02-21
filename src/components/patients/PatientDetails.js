import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import VisitList from '../visits/VisitList';
import { setSelectedPatient, fetchPatientDetails } from '../../redux/slices/patientsSlice';
import { fetchFacilities } from '../../redux/thunks/facilitiesThunks';
import { fetchPatientPrescriptions } from '../../redux/slices/prescriptionsSlice';
import PrescriptionForm from '../prescriptions/PrescriptionForm';
import format from 'date-fns/format';
import { Dialog, DialogTitle, DialogContent, Button } from '@mui/material';
import '../../styles/components.css';
import '../../styles/prescriptions.css';
import '../../styles/patientDetailsEnhancements.css';
import '../../styles/patientCardStyles.css';
import '../../styles/patientCardOutline.css';
import '../../styles/tabs.css';

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
  const [newNote, setNewNote] = useState('');
  const [editingFacility, setEditingFacility] = useState(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState('');

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
          <div className="grid grid-2-cols">
            <div>
              <h2 className="subtitle">Basic Information</h2>
              <div className="paper">
                <p>Date of Birth: {format(new Date(selectedPatient.dateOfBirth), 'MM/dd/yyyy')}</p>
                <p>Gender: {selectedPatient.gender}</p>
                <p>Contact: {selectedPatient.contact}</p>
                <p>Email: {selectedPatient.email}</p>
                <p>Address: {selectedPatient.address}</p>
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
                          sx={{ mr: 1 }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleUpdateFacility}
                          sx={{ 
                            backgroundColor: '#1a237e',
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
              <h2 className="subtitle">Emergency Contact</h2>
              <div className="paper">
                <p>Name: {selectedPatient.emergencyContact?.name}</p>
                <p>Relationship: {selectedPatient.emergencyContact?.relationship}</p>
                <p>Phone: {selectedPatient.emergencyContact?.phone}</p>
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <h2 className="subtitle">Medical History</h2>
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
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleAddNote}
                sx={{ 
                  backgroundColor: '#1a237e',
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
    </div>
  );
};

export default PatientDetails;
