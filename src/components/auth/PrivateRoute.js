import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser, selectLoading, selectRole } from '../../redux/slices/authSlice';

const PrivateRoute = ({ requireAdmin }) => {
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);
  const loading = useSelector(selectLoading);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
