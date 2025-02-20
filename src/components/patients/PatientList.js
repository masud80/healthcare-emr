import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import '../../styles/components.css';

const PatientList = () => {
  const navigate = useNavigate();
  const { role } = useSelector((state) => state.auth);
  const { selectedFacilities } = useSelector((state) => state.facilities);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPatients = async () => {
    try {
      let patientsQuery;
      
      if (selectedFacilities.length > 0) {
        patientsQuery = query(
          collection(db, 'patients'),
          where('facilityId', 'in', selectedFacilities),
          orderBy('name')
        );
      } else {
        patientsQuery = query(
          collection(db, 'patients'),
          orderBy('name')
        );
      }
      
      const querySnapshot = await getDocs(patientsQuery);
      const patientList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPatients(patientList);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [selectedFacilities]);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container">
        <p>Loading patients...</p>
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
                  <td>{new Date(patient.dateOfBirth).toLocaleDateString()}</td>
                  <td>{patient.contact}</td>
                  <td>{patient.email}</td>
                  <td>{patient.bloodType}</td>
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

        {filteredPatients.length === 0 && (
          <p className="text-center">No patients found.</p>
        )}
      </div>
    </div>
  );
};

export default PatientList;
