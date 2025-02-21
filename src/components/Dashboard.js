import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import '../styles/components.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [recentPatients, setRecentPatients] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  useEffect(() => {
    const fetchRecentPatients = async () => {
      try {
        const patientsRef = collection(db, 'patients');
        const q = query(patientsRef, orderBy('createdAt', 'desc'), limit(5));
        const querySnapshot = await getDocs(q);
        const patientsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecentPatients(patientsList);
      } catch (error) {
        console.error('Error fetching recent patients:', error);
      }
    };

    const fetchUpcomingAppointments = async () => {
      try {
        const appointmentsRef = collection(db, 'appointments');
        const q = query(
          appointmentsRef,
          orderBy('date', 'asc'),
          limit(5)
        );
        const querySnapshot = await getDocs(q);
        const appointmentsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUpcomingAppointments(appointmentsList);
      } catch (error) {
        console.error('Error fetching upcoming appointments:', error);
      }
    };

    const fetchAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchRecentPatients(),
        fetchUpcomingAppointments()
      ]);
      setLoading(false);
    };

    fetchAllData();
  }, []);

  if (loading) {
    return <div className="container"><p>Loading dashboard data...</p></div>;
  }

  return (
    <div className="container">
      <h1 className="title">Dashboard</h1>
      <div className="grid grid-2-cols">
        <div className="paper">
          <h2 className="subtitle">Recent Patients</h2>
          <div className="list">
            {recentPatients.map(patient => (
              <div key={patient.id} className="list-item" onClick={() => navigate(`/patients/${patient.id}`)}>
                <p>{patient.name}</p>
                <small>DOB: {formatDate(patient.dateOfBirth)}</small>
              </div>
            ))}
            {recentPatients.length === 0 && <p>No recent patients</p>}
          </div>
        </div>
        
        <div className="paper">
          <h2 className="subtitle">Upcoming Appointments</h2>
          <div className="list">
            {upcomingAppointments.map(appointment => (
              <div key={appointment.id} className="list-item" onClick={() => navigate(`/appointments/${appointment.id}`)}>
                <p>{appointment.patientName}</p>
                <small>Date: {formatDateTime(appointment.date)}</small>
              </div>
            ))}
            {upcomingAppointments.length === 0 && <p>No upcoming appointments</p>}
          </div>
        </div>

        <div className="paper">
          <h2 className="subtitle">Facilities</h2>
          <button 
            className="button button-primary"
            onClick={() => navigate('/facilities')}
          >
            View All Facilities
          </button>
        </div>

        <div className="paper">
          <h2 className="subtitle">Quick Actions</h2>
          <div className="flex flex-between gap-2">
            <button 
              className="button button-primary"
              onClick={() => navigate('/patients/new')}
            >
              Add Patient
            </button>
            <button 
              className="button button-primary"
              onClick={() => navigate('/appointments/new')}
            >
              Schedule Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
