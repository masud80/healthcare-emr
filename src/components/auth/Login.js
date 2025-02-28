import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/components.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically make an API call to verify credentials
    // For now, we'll just simulate a successful login
    navigate('/dashboard');
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
                />
              </div>
              <button type="submit" className="login-submit-button">
                Sign In
              </button>
            </form>
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
