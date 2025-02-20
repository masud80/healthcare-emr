import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { setSelectedPatient, setLoading, setError } from '../../redux/slices/patientsSlice';
import { format } from 'date-fns';
import '../../styles/components.css';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <div className="tab-content">{children}</div>}
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
    return <div className="container"><p>Loading patient details...</p></div>;
  }

  if (!selectedPatient) {
    return <div className="container"><p>Patient not found</p></div>;
  }

  return (
    <div className="container">
      <div className="paper">
        <h1 className="title">{selectedPatient.name}</h1>
        <p className="subtitle">Patient ID: {selectedPatient.id}</p>

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
          
          <h2 className="subtitle">Past Visits</h2>
          <ul className="list">
            {selectedPatient.visits?.map((visit, index) => (
              <li key={index} className="list-item">
                <strong>{format(new Date(visit.date), 'MM/dd/yyyy')}</strong>
                <p>{visit.reason}</p>
              </li>
            ))}
          </ul>
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
    </div>
  );
};

export default PatientDetails;
