import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, selectRole } from '../redux/slices/authSlice';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { fetchUserFacilities } from '../redux/thunks/facilitiesThunks';
import '../styles/components.css';
import {
  LocalHospital as HospitalIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);
  const [recentPatients, setRecentPatients] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    activePatients: 0
  });

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
    const fetchStats = async (userFacilities) => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const patientsRef = collection(db, 'patients');
        const appointmentsRef = collection(db, 'appointments');

        let patientsQuery, appointmentsQuery;

        if (role === 'admin') {
          patientsQuery = query(patientsRef);
          appointmentsQuery = query(
            appointmentsRef,
            where('date', '>=', today),
            where('date', '<=', new Date(today.getTime() + 24 * 60 * 60 * 1000))
          );
        } else if (userFacilities.length > 0) {
          patientsQuery = query(
            patientsRef,
            where('facilityId', 'in', userFacilities.map(f => f.id))
          );
          appointmentsQuery = query(
            appointmentsRef,
            where('facilityId', 'in', userFacilities.map(f => f.id)),
            where('date', '>=', today),
            where('date', '<=', new Date(today.getTime() + 24 * 60 * 60 * 1000))
          );
        } else {
          patientsQuery = query(patientsRef, where('doctorId', '==', user.uid));
          appointmentsQuery = query(
            appointmentsRef,
            where('doctorId', '==', user.uid),
            where('date', '>=', today),
            where('date', '<=', new Date(today.getTime() + 24 * 60 * 60 * 1000))
          );
        }

        const [patientsSnapshot, appointmentsSnapshot] = await Promise.all([
          getDocs(patientsQuery),
          getDocs(appointmentsQuery)
        ]);

        setStats({
          totalPatients: patientsSnapshot.size,
          todayAppointments: appointmentsSnapshot.size,
          activePatients: patientsSnapshot.docs.filter(doc => 
            doc.data().status === 'active'
          ).length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    const fetchRecentPatients = async (userFacilities) => {
      try {
        const patientsRef = collection(db, 'patients');
        let q;

        if (role === 'admin') {
          q = query(patientsRef, orderBy('createdAt', 'desc'), limit(5));
        } else if (role === 'facility_admin' && userFacilities.length > 0) {
          q = query(
            patientsRef,
            where('facilityId', 'in', userFacilities.map(f => f.id)),
            limit(5)
          );
        } else {
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
          return [];
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
            where('facilityId', 'in', userFacilities.map(f => f.id)),
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
        const facilitiesResult = await dispatch(fetchUserFacilities({ page: 1, limit: 10 })).unwrap();
        const userFacilities = facilitiesResult.facilities;
        
        await Promise.all([
          fetchStats(userFacilities),
          fetchRecentPatients(userFacilities).then(setRecentPatients),
          fetchUpcomingAppointments(userFacilities).then(setUpcomingAppointments)
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAllData();
    }
  }, [user, role, dispatch]);

  if (loading) {
    return <div className="container loading">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="container error">{error}</div>;
  }

  return (
    <div className="container">
      <h1 className="title">Dashboard</h1>
      
      {/* Stats Section */}
      <div className="grid grid-3-cols stats-section">
        <div className="paper stats-card">
          <div className="stats-icon patients">
            <PersonIcon />
          </div>
          <div className="stats-content">
            <h3>{stats.totalPatients}</h3>
            <p>Total Patients</p>
          </div>
          <div className="stats-trend positive">
            <TrendingUpIcon />
          </div>
        </div>
        
        <div className="paper stats-card">
          <div className="stats-icon appointments">
            <CalendarIcon />
          </div>
          <div className="stats-content">
            <h3>{stats.todayAppointments}</h3>
            <p>Today's Appointments</p>
          </div>
          <div className="stats-indicator">
            <TimeIcon />
          </div>
        </div>
        
        <div className="paper stats-card">
          <div className="stats-icon active">
            <HospitalIcon />
          </div>
          <div className="stats-content">
            <h3>{stats.activePatients}</h3>
            <p>Active Patients</p>
          </div>
        </div>
      </div>

      <div className="grid grid-2-cols">
        {/* Recent Patients Card */}
        <div className="paper dashboard-card patients">
          <div className="card-header">
            <h2 className="subtitle">
              <PersonIcon className="card-icon" />
              Recent Patients
            </h2>
            <button 
              className="button button-primary button-small"
              onClick={() => navigate('/patients')}
            >
              View All
            </button>
          </div>
          <div className="list">
            {recentPatients.map(patient => (
              <div 
                key={patient.id} 
                className="list-item interactive"
                onClick={() => navigate(`/patients/${patient.id}`)}
              >
                <div className="list-item-content">
                  <p className="patient-name">{patient.name}</p>
                  <small>DOB: {formatDate(patient.dateOfBirth)}</small>
                  {patient.status && (
                    <span className={`status-badge ${patient.status}`}>
                      {patient.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {recentPatients.length === 0 && (
              <p className="empty-state">No recent patients</p>
            )}
          </div>
        </div>
        
        {/* Upcoming Appointments Card */}
        <div className="paper dashboard-card appointments">
          <div className="card-header">
            <h2 className="subtitle">
              <EventIcon className="card-icon" />
              Upcoming Appointments
            </h2>
            <button 
              className="button button-primary button-small"
              onClick={() => navigate('/appointments')}
            >
              View All
            </button>
          </div>
          <div className="list">
            {upcomingAppointments.map(appointment => (
              <div 
                key={appointment.id} 
                className="list-item interactive"
                onClick={() => navigate(`/appointments/${appointment.id}`)}
              >
                <div className="list-item-content">
                  <p className="appointment-title">{appointment.patientName}</p>
                  <small className="appointment-time">
                    {formatDateTime(appointment.date)}
                  </small>
                  {appointment.type && (
                    <span className={`appointment-type ${appointment.type}`}>
                      {appointment.type}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {upcomingAppointments.length === 0 && (
              <p className="empty-state">No upcoming appointments</p>
            )}
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="paper dashboard-card actions">
          <div className="card-header">
            <h2 className="subtitle">
              <AddIcon className="card-icon" />
              Quick Actions
            </h2>
          </div>
          <div className="quick-actions-grid">
            <button 
              className="action-button"
              onClick={() => navigate('/patients/new')}
            >
              <PersonIcon />
              Add Patient
            </button>
            <button 
              className="action-button"
              onClick={() => navigate('/appointments/new')}
            >
              <EventIcon />
              Schedule Appointment
            </button>
            <button 
              className="action-button"
              onClick={() => navigate('/facilities')}
            >
              <HospitalIcon />
              View Facilities
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

