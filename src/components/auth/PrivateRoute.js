import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser, selectLoading, selectRole } from '../../redux/slices/authSlice';
import '../../styles/components.css';

const PrivateRoute = ({ requireAdmin, requireFacilityAdmin }) => {
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);
  const loading = useSelector(selectLoading);
  const navigate = useNavigate();
  
  console.log('Current User:', user);
  console.log('User Role:', role);

  useEffect(() => {
    // Check if auth is initialized
    if (!loading && !user) {
      console.log('No user found, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="container">
        <div className="loading-spinner">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireFacilityAdmin && role !== 'facility_admin' && role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
