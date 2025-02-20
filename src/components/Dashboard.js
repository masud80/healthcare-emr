import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import '../styles/components.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'someCollection'));
        const dataList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setData(dataList);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
          <button 
            className="button button-primary"
            onClick={() => navigate('/patients')}
          >
            View All Patients
          </button>
        </div>
        
        <div className="paper">
          <h2 className="subtitle">Upcoming Appointments</h2>
          <button 
            className="button button-primary"
            onClick={() => navigate('/appointments')}
          >
            View All Appointments
          </button>
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
