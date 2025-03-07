import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { setUser, setRole, setError } from '../../redux/slices/authSlice';
import '../../styles/components.css';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        throw new Error('User document not found');
      }

      const userData = userDoc.data();
      
      // Update Redux state
      dispatch(setUser({
        uid: user.uid,
        email: user.email
      }));
      dispatch(setRole(userData.role));

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      dispatch(setError(error.message));
      // Show error to user
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <header className="login-header">
        <img 
          src="/logo-icon-title.webp" 
          alt="Healthcare EMR" 
          className="login-logo"
        />
      </header>
      
      <div className="login-columns">
        {/* Left Column - Staff Login */}
        <div className="login-column staff-login">
          <div className="login-form">
            <h2 className="form-title">EMR Staff Login</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email"
                  name="email" 
                  className="form-input"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input 
                  type="password" 
                  id="password"
                  name="password" 
                  className="form-input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <button 
                type="submit" 
                className="login-submit-button"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
            <div className="login-links">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
          </div>
        </div>

        {/* Right Column - Patient Portal */}
        <div className="login-column patient-portal">
          <div className="login-content">
            <h1 className="login-title">
              Manage your healthcare anytime, anywhere with Care360™
            </h1>
            
            <p className="login-description">
              Meet Care360, the free app that allows you to use your mobile device to:
            </p>
            
            <ul className="feature-list">
              <li>Access your personal health information</li>
              <li>Securely message your care team</li>
              <li>View upcoming appointments</li>
              <li>Self-schedule your appointments</li>
              <li>And more</li>
            </ul>

            <div className="app-store-buttons">
              <a href="#" className="app-store-link">
                <img src="/google-play-badge.png" alt="Get it on Google Play" />
              </a>
              <a href="#" className="app-store-link">
                <img src="/app-store-badge.png" alt="Download on the App Store" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
