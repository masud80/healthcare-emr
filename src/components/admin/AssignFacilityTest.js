import { useState } from 'react';
import { collection, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import '../../styles/components.css';

const AssignFacilityTest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedFacility, setSelectedFacility] = useState('');
  const [isFacilityAdmin, setIsFacilityAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [facilities, setFacilities] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersSnapshot, facilitiesSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'facilities'))
      ]);

      setUsers(usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));

      setFacilities(facilitiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedUser || !selectedFacility) {
      setError('Please select both a user and a facility');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const userRef = doc(db, 'users', selectedUser);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      
      // If user is being made a facility admin, add to facilities array
      if (isFacilityAdmin) {
        const facilities = userData.facilities || [];
        if (!facilities.includes(selectedFacility)) {
          await updateDoc(userRef, {
            facilities: [...facilities, selectedFacility],
            role: 'facility_admin'
          });
        }
      } else {
        // If not admin, just set single facility
        await updateDoc(userRef, {
          facilityId: selectedFacility,
          role: 'user'
        });
      }
      setSuccess('Facility and role assigned successfully');
      setSelectedUser('');
      setSelectedFacility('');
    } catch (error) {
      console.error('Error assigning facility:', error);
      setError('Failed to assign facility');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="paper">
        <h1 className="title">Assign Facility Test</h1>
        
        <button
          className="button button-primary"
          onClick={fetchData}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Fetch Data'}
        </button>

        {error && (
          <div className="error-message" style={{ color: '#f44336', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        
        {success && (
          <div className="success-message" style={{ color: '#4caf50', marginBottom: '1rem' }}>
            {success}
          </div>
        )}

        <div className="form-control">
          <label htmlFor="user">User</label>
          <select
            id="user"
            className="select"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">Select User</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.email}
              </option>
            ))}
          </select>
        </div>

        <div className="form-control">
          <label htmlFor="facility">Facility</label>
          <select
            id="facility"
            className="select"
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
          >
            <option value="">Select Facility</option>
            {facilities.map(facility => (
              <option key={facility.id} value={facility.id}>
                {facility.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-control">
          <label>
            <input
              type="checkbox"
              checked={isFacilityAdmin}
              onChange={(e) => setIsFacilityAdmin(e.target.checked)}
            />
            Assign as Facility Admin
          </label>
        </div>

        <button
          className="button button-primary"
          onClick={handleAssign}
          disabled={loading || !selectedUser || !selectedFacility}
        >
          {loading ? 'Assigning...' : 'Assign Facility'}
        </button>
      </div>
    </div>
  );
};

export default AssignFacilityTest;
