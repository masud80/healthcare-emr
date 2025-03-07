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
          q = query(patientsRef, orderBy('createdAt', 'desc'), limit(4));
        } else if (role === 'facility_admin' && userFacilities.length > 0) {
          q = query(
            patientsRef,
            where('facilityId', 'in', userFacilities.map(f => f.id)),
            limit(4)
          );
        } else {
          q = query(
            patientsRef,
            where('doctorId', '==', user.uid),
            limit(4)
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
            limit(4)
          );
        } else if (role === 'facility_admin' && userFacilities.length > 0) {
          q = query(
            appointmentsRef,
            where('facilityId', 'in', userFacilities.map(f => f.id)),
            where('date', '>=', new Date()),
            orderBy('date', 'asc'),
            limit(4)
          );
        } else {
          q = query(
            appointmentsRef,
            where('doctorId', '==', user.uid),
            where('date', '>=', new Date()),
            orderBy('date', 'asc'),
            limit(4)
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
            <PersonIcon fontSize="small" />
          </div>
          <div className="stats-content">
            <h3>{stats.totalPatients}</h3>
            <p>Total Patients</p>
          </div>
        </div>
        
        <div className="paper stats-card">
          <div className="stats-icon appointments">
            <CalendarIcon fontSize="small" />
          </div>
          <div className="stats-content">
            <h3>{stats.todayAppointments}</h3>
            <p>Today's Appointments</p>
          </div>
        </div>
        
        <div className="paper stats-card">
          <div className="stats-icon active">
            <HospitalIcon fontSize="small" />
          </div>
          <div className="stats-content">
            <h3>{stats.activePatients}</h3>
            <p>Active Patients</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-2-cols">
        {/* Recent Patients */}
        <div className="paper">
          <div className="card-header">
            <h2 className="subtitle">
              <PersonIcon className="card-icon" fontSize="small" />
              Recent Patients
            </h2>
            <button className="button-small" onClick={() => navigate('/patients')}>
              View All
            </button>
          </div>
          <div className="list">
            {recentPatients.length > 0 ? (
              recentPatients.map(patient => (
                <div 
                  key={patient.id} 
                  className="list-item interactive"
                  onClick={() => navigate(`/patients/${patient.id}`)}
                >
                  <div className="list-item-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 className="patient-name">{patient.name}</h3>
                      <span className="appointment-time" style={{ marginLeft: '8px' }}>
                        {formatDate(patient.dateOfBirth)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No recent patients</div>
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="paper">
          <div className="card-header">
            <h2 className="subtitle">
              <EventIcon className="card-icon" fontSize="small" />
              Upcoming Appointments
            </h2>
            <button className="button-small" onClick={() => navigate('/appointments')}>
              View All
            </button>
          </div>
          <div className="list">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map(appointment => (
                <div 
                  key={appointment.id} 
                  className="list-item interactive"
                  onClick={() => navigate(`/appointments/${appointment.id}`)}
                >
                  <div className="list-item-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 className="appointment-title">{appointment.patientName}</h3>
                      <span className="appointment-time" style={{ marginLeft: '8px' }}>
                        {formatDateTime(appointment.date)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No upcoming appointments</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

