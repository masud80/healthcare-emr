import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { setSelectedPatient, fetchPatientDetails } from '../../redux/slices/patientsSlice';
import { fetchFacilities } from '../../redux/thunks/facilitiesThunks';
import { fetchPatientPrescriptions } from '../../redux/slices/prescriptionsSlice';
import PrescriptionForm from '../prescriptions/PrescriptionForm';
import format from 'date-fns/format';
import '../../styles/components.css';
import '../../styles/prescriptions.css';

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
        <div className="flex flex-between flex-center">
          <div>
            <h1 className="title">{selectedPatient.name}</h1>
            <p className="subtitle">Patient ID: {selectedPatient.id}</p>
          </div>
          <button
            className="button button-primary"
            onClick={() => navigate(`/patients/${id}/visits/new`)}
          >
            New Visit
          </button>
        </div>

        <div className="tabs">
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
                  <div className="flex flex-between flex-center">
                    <h3>Facility</h3>
                    {(role === 'admin' || role === 'doctor') && !editingFacility && (
                      <button
                        className="button button-secondary"
                        onClick={() => setEditingFacility(true)}
                      >
                        Change Facility
                      </button>
                    )}
                  </div>
                  {editingFacility ? (
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
                        <button
                          className="button button-secondary"
                          onClick={() => setEditingFacility(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className="button button-primary"
                          onClick={handleUpdateFacility}
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p>
                      {facilities.find(f => f.id === selectedPatient.facilityId)?.name || 'Not Assigned'}
                    </p>
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
          
          <div>
            <div className="flex flex-between flex-center">
              <h2 className="subtitle">Visits</h2>
              <button
                className="button button-secondary"
                onClick={() => navigate(`/patients/${id}/visits`)}
              >
                View All Visits
              </button>
            </div>
            <ul className="list">
              {selectedPatient.visits?.map((visit, index) => (
                <li key={index} className="list-item">
                  <strong>{format(new Date(visit.date), 'MM/dd/yyyy')}</strong>
                  <p>{visit.reason}</p>
                </li>
              ))}
            </ul>
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <div className="flex flex-between flex-center">
            <h2 className="subtitle">Clinical Notes</h2>
            <button
              className="button button-primary"
              onClick={() => setOpenNoteDialog(true)}
            >
              Add Note
            </button>
          </div>
          <ul className="list">
            {selectedPatient.notes?.map((note, index) => (
              <li key={index} className="list-item">
                <p>{note.content}</p>
                <small>{note.author} - {new Date(note.timestamp).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <div className="flex flex-between flex-center">
            <h2 className="subtitle">Prescriptions</h2>
            {(role === 'doctor' || role === 'nurse') && (
              <button
                className="button button-primary"
                onClick={() => setOpenPrescriptionDialog(true)}
              >
                New Prescription
              </button>
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
              <button 
                className="button button-secondary"
                onClick={() => setOpenNoteDialog(false)}
              >
                Cancel
              </button>
              <button 
                className="button button-primary"
                onClick={handleAddNote}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {openPrescriptionDialog && (
        <div className="dialog-overlay">
          <div className="dialog dialog-large">
            <h3 className="dialog-title">New Prescription</h3>
            <div className="dialog-content">
              <PrescriptionForm
                patientId={id}
                defaultPharmacy={selectedPatient.defaultPharmacy}
                onClose={() => setOpenPrescriptionDialog(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetails;
