import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import '../../styles/components.css';

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'appointments', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAppointment({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError('Appointment not found');
        }
      } catch (error) {
        setError('Error fetching appointment details');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentDetails();
  }, [id]);

  const handleUpdate = async () => {
    // Logic for updating the appointment
  };

  if (loading) {
    return <div className="container"><p>Loading appointment details...</p></div>;
  }

  if (error) {
    return <div className="container"><p>{error}</p></div>;
  }

  return (
    <div className="container">
      <div className="paper">
        <div className="flex flex-between flex-center">
          <h1 className="title">Appointment Details</h1>
          <button
            className="button button-primary"
            onClick={() => navigate(`/patients/${appointment.patientId}/visits/new`)}
          >
            Create Visit
          </button>
        </div>
        <p><strong>Date:</strong> {new Date(appointment.date).toLocaleString()}</p>
        <p><strong>Patient:</strong> {appointment.patientName}</p>
        <p><strong>Doctor:</strong> {appointment.doctorName}</p>
        <p><strong>Purpose:</strong> {appointment.purpose}</p>
        <p><strong>Status:</strong> {appointment.status}</p>
        <button className="button button-primary" onClick={() => handleUpdate()}>
          Update Appointment
        </button>
        <button className="button button-secondary" onClick={() => navigate('/appointments')}>
          Back to Appointments
        </button>
      </div>
    </div>
  );
};

export default AppointmentDetails;
