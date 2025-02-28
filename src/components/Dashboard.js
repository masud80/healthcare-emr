import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  where,
  doc,
  getDoc 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { selectUser, selectRole } from '../redux/slices/authSlice';
import '../styles/components.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [recentPatients, setRecentPatients] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);

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
    const fetchUserFacilities = async () => {
      try {
        const facilityUsersRef = doc(db, 'facilityUsers', user.uid);
        const facilityUsersDoc = await getDoc(facilityUsersRef);
        return facilityUsersDoc.exists() ? facilityUsersDoc.data().facilities : [];
      } catch (error) {
        console.error('Error fetching user facilities:', error);
        return [];
      }
    };

    const fetchRecentPatients = async (userFacilities) => {
      try {
        const patientsRef = collection(db, 'patients');
        let q;

        if (role === 'admin') {
          q = query(patientsRef, orderBy('createdAt', 'desc'), limit(5));
        } else if (role === 'facility_admin' && userFacilities.length > 0) {
          // Temporarily simplify query while index is building
          q = query(
            patientsRef,
            where('facilityId', 'in', userFacilities),
            limit(5)
          );
        } else {
          // Temporarily simplify query while index is building
          q = query(
            patientsRef,
            where('doctorId', '==', user.uid),
            limit(5)
          );
        }

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Error fetching recent patients:', error);
        if (error.message.includes('requires an index')) {
          return []; // Return empty array while index is building
        }
        throw error;
      }
    };

    const fetchUpcomingAppointments = async (userFacilities) => {
      try {
        const appointmentsRef = collection(db, 'appointments');
        let q;

        if (role === 'admin') {
          q = query(
            appointmentsRef,
            where('date', '>=', new Date()),
            orderBy('date', 'asc'),
            limit(5)
          );
        } else if (role === 'facility_admin' && userFacilities.length > 0) {
          q = query(
            appointmentsRef,
            where('facilityId', 'in', userFacilities),
            where('date', '>=', new Date()),
            orderBy('date', 'asc'),
            limit(5)
          );
        } else {
          q = query(
            appointmentsRef,
            where('doctorId', '==', user.uid),
            where('date', '>=', new Date()),
            orderBy('date', 'asc'),
            limit(5)
          );
        }

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Error fetching upcoming appointments:', error);
        throw error;
      }
    };

    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const userFacilities = await fetchUserFacilities();
        const [patients, appointments] = await Promise.all([
          fetchRecentPatients(userFacilities),
          fetchUpcomingAppointments(userFacilities)
        ]);
        setRecentPatients(patients);
        setUpcomingAppointments(appointments);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user, role]);

  if (loading) {
    return <div className="container"><p>Loading dashboard data...</p></div>;
  }

  if (error) {
    return <div className="container"><p className="error">{error}</p></div>;
  }

  return (
    <div className="container">
      <h1 className="title">Dashboard</h1>
      <div className="grid grid-2-cols">
        <div className="paper dashboard-card patients">
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
        
        <div className="paper dashboard-card appointments">
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

        <div className="paper dashboard-card facilities">
          <h2 className="subtitle">Facilities</h2>
          <button 
            className="button button-primary"
            onClick={() => navigate('/facilities')}
          >
            View All Facilities
          </button>
        </div>

        <div className="paper dashboard-card actions">
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
