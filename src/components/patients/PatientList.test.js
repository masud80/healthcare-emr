import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import '../../styles/components.css';

const PatientList = () => {
  const navigate = useNavigate();
  const { role } = useSelector((state) => state.auth);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError(null);

        // Create a query with orderBy to ensure we get a consistent order
        const patientsQuery = query(
          collection(db, 'patients'),
          orderBy('name', 'asc')
        );

        const querySnapshot = await getDocs(patientsQuery);
        
        if (querySnapshot.empty) {
          console.log('No patients found');
          setPatients([]);
          return;
        }

        const patientList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Unknown',
            dateOfBirth: data.dateOfBirth || null,
            contact: data.contact || '',
            email: data.email || '',
            bloodType: data.bloodType || '',
            facilityId: data.facilityId || ''
          };
        });

        console.log('Fetched patients:', patientList);
        setPatients(patientList);
      } catch (error) {
        console.error('Error fetching patients:', error);
        setError(error.message || 'Error fetching patients');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container">
        <div className="loading-spinner">
          <p>Loading patients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">
          <p>Error: {error}</p>
          <button 
            className="button button-secondary"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="flex flex-between flex-center">
        <h1 className="title">Patients</h1>
        {(role === 'admin' || role === 'doctor') && (
          <button
            className="button button-primary"
            onClick={() => navigate('/patients/new')}
          >
            + Add Patient
          </button>
        )}
      </div>

      <div className="paper">
        <div className="form-control">
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
          />
        </div>

        {filteredPatients.length === 0 ? (
          <div className="text-center">
            <p>No patients found</p>
            {searchTerm && (
              <button
                className="button button-secondary"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Date of Birth</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Blood Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td>{patient.name}</td>
                    <td>{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}</td>
                    <td>{patient.contact || 'N/A'}</td>
                    <td>{patient.email || 'N/A'}</td>
                    <td>{patient.bloodType || 'N/A'}</td>
                    <td>
                      <button
                        className="button button-secondary"
                        onClick={() => navigate(`/patients/${patient.id}`)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientList;
