import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import '../../styles/records.css';

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const { role } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const recordsRef = collection(db, 'medical_records');
        const q = query(recordsRef, orderBy('date', 'desc'));
        const snapshot = await getDocs(q);
        const recordsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecords(recordsData);
      } catch (error) {
        console.error('Error fetching medical records:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  if (loading) {
    return <div className="container">Loading medical records...</div>;
  }

  return (
    <div className="container">
      <h1>Medical Records</h1>
      <div className="paper">
        {records.length === 0 ? (
          <p>No medical records found.</p>
        ) : (
          <div className="records-list">
            {records.map((record) => (
              <div key={record.id} className="record-item paper">
                <h3>Patient: {record.patientName}</h3>
                <p>Date: {new Date(record.date).toLocaleDateString()}</p>
                <p>Type: {record.type}</p>
                <p>Description: {record.description}</p>
                {record.diagnosis && <p>Diagnosis: {record.diagnosis}</p>}
                {record.treatment && <p>Treatment: {record.treatment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalRecords;
