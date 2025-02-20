import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
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
  const [facilities, setFacilities] = useState({});

  useEffect(() => {
    // Fetch user facilities on component mount
    dispatch(fetchUserFacilities());
  }, [dispatch]);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const facilitiesSnapshot = await getDocs(collection(db, 'facilities'));
        const facilitiesMap = {};
        facilitiesSnapshot.docs.forEach(doc => {
          facilitiesMap[doc.id] = doc.data().name;
        });
        setFacilities(facilitiesMap);
      } catch (error) {
        console.error('Error fetching facilities:', error);
        setError('Error fetching facilities');
      }
    };

    fetchFacilities();
  }, []);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError(null);

        if (userFacilities.length === 0) {
          setPatients([]);
          return;
        }

        const facilityIds = userFacilities.map(f => f.id);
        console.log('Fetching patients for facilities:', facilityIds);

        const patientsQuery = query(
          collection(db, 'patients'),
          where('facilityId', 'in', facilityIds),
          orderBy('name')
        );

        const querySnapshot = await getDocs(patientsQuery);
        const patientList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log('Fetched patients:', patientList);
        setPatients(patientList);
      } catch (error) {
        console.error('Error fetching patients:', error);
        setError('Error fetching patients');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [userFacilities]);

  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container">
        <p>Loading patients...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <p className="error-message">{error}</p>
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

        {userFacilities.length === 0 ? (
          <p className="text-center">No facilities assigned. Please contact an administrator.</p>
        ) : filteredPatients.length === 0 ? (
          <p className="text-center">No patients found in your assigned facilities.</p>
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
                  <th>Facility</th>
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
                    <td>{facilities[patient.facilityId] || 'Not Assigned'}</td>
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
