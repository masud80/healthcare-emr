import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { collection, getDocs, query, where, deleteDoc, addDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../firebase/config';
import '../../styles/components.css';

const DatabaseInitializer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const role = useSelector((state) => state.auth.role);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, role, navigate]);

  if (role !== 'admin') {
    return null;
  }

  const clearDatabase = async () => {
    // Clear users collection
    const usersSnapshot = await getDocs(collection(db, 'users'));
    for (const doc of usersSnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // Clear facilities collection
    const facilitiesSnapshot = await getDocs(collection(db, 'facilities'));
    for (const doc of facilitiesSnapshot.docs) {
      await deleteDoc(doc.ref);
    }
  };

  const initializeDatabase = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Check if data already exists
      const usersQuery = query(collection(db, 'users'), where('role', '==', 'admin'));
      const usersSnapshot = await getDocs(usersQuery);

      if (!usersSnapshot.empty) {
        setError('Database is already initialized');
        return;
      }

      // Add sample data
      const sampleData = {
        users: [
          { email: 'admin@healthcare.com', password: 'admin123', role: 'admin' },
          { email: 'doctor@healthcare.com', password: 'doctor123', role: 'doctor' },
          { email: 'nurse@healthcare.com', password: 'nurse123', role: 'nurse' },
        ],
        facilities: [
          { name: 'Main Hospital', location: 'Downtown', contact: '555-0100' },
          { name: 'North Clinic', location: 'North Side', contact: '555-0200' },
        ],
      };

      // Add users
      for (const user of sampleData.users) {
        try {
          // Create Firebase Auth user
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            user.email,
            user.password
          );

          // Create Firestore user document
          await addDoc(collection(db, 'users'), {
            uid: userCredential.user.uid,
            email: user.email,
            role: user.role,
          });
        } catch (error) {
          // If user already exists, continue with next user
          if (error.code === 'auth/email-already-in-use') {
            console.log(`User ${user.email} already exists`);
            continue;
          }
          throw error;
        }
      }

      // Add facilities
      for (const facility of sampleData.facilities) {
        await addDoc(collection(db, 'facilities'), facility);
      }

      setSuccess('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      setError('Failed to initialize database: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset the database? This will delete all existing data.')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await clearDatabase();
      await initializeDatabase();
      setSuccess('Database has been reset and reinitialized successfully');
    } catch (error) {
      console.error('Error resetting database:', error);
      setError('Failed to reset database: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="paper">
        <h1 className="title">Database Initializer</h1>
        <p>This utility will populate the database with sample data.</p>
        
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

        <div className="flex gap-2">
          <button
            className="button button-primary"
            onClick={initializeDatabase}
            disabled={loading}
          >
            {loading ? 'Initializing...' : 'Initialize Database'}
          </button>

          <button
            className="button button-secondary"
            onClick={handleReset}
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Database'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatabaseInitializer;
