import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { fetchUserFacilities } from '../../redux/thunks/facilitiesThunks';
import '../../styles/components.css';

const PatientList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { role } = useSelector((state) => state.auth);
  const { userFacilities } = useSelector((state) => state.facilities);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchUserFacilities());
  }, [dispatch]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError(null);

        let patientsQuery;
        
        if (role === 'admin') {
          // Admin can see all patients
          console.log('Admin user - fetching all patients');
          patientsQuery = query(
            collection(db, 'patients'),
            orderBy('name', 'asc')
          );
        } else {
          // Non-admin users can only see patients from their facilities
          if (!userFacilities || userFacilities.length === 0) {
            console.log('No facilities assigned');
            setPatients([]);
            return;
          }

          const facilityIds = userFacilities.map(f => f.id);
          console.log('Fetching patients for facilities:', facilityIds);
          
          patientsQuery = query(
            collection(db, 'patients'),
            where('facilityId', 'in', facilityIds),
            orderBy('name', 'asc')
          );
        }

        const querySnapshot = await getDocs(patientsQuery);
        
        if (querySnapshot.empty) {
          console.log('No patients found in assigned facilities');
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
  }, [userFacilities, role]);

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

        {(role !== 'admin' && userFacilities.length === 0) ? (
          <div className="text-center">
            <p>No facilities assigned. Please contact an administrator.</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center">
            <p>{role === 'admin' ? 'No patients found in the system' : 'No patients found in your assigned facilities'}</p>
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
