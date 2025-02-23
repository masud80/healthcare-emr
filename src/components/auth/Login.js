import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { loginUser } from '../../redux/actions/authActions';
import '../../styles/components.css';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Force token refresh to get latest claims
      await userCredential.user.getIdToken(true);
      const idTokenResult = await userCredential.user.getIdTokenResult();
      
      // Get user document from Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (userDoc.exists()) {
        const firestoreData = userDoc.data();
        console.log('User data:', firestoreData);
        console.log('Token claims:', idTokenResult.claims);
        
        // Determine role - check both claims and Firestore data
        const role = idTokenResult.claims.admin === true ? 'admin' : 
                     firestoreData.role || 'user';
        
        console.log('Determined role:', role);
        
        // Create minimal serializable user data
        const userData = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          role: role  // Make sure role is included here
        };

        // Update Redux state using action creator
        await dispatch(loginUser(userData));
        navigate('/dashboard');
      } else {
        setError('User data not found');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="paper" style={{ maxWidth: '400px', margin: '100px auto' }}>
        <h1 className="title">Login</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-control">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="error-message" style={{ color: '#f44336', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="button button-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="link-button"
              style={{
                background: 'none',
                border: 'none',
                color: '#1976d2',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0,
                font: 'inherit'
              }}
            >
              Forgot Password?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
