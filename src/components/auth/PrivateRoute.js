import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser, selectRole } from '../../redux/slices/authSlice';

const PrivateRoute = ({ requireAdmin = false, requireFacilityAdmin = false, allowedRoles = [] }) => {
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check for specific role requirements
  if (allowedRoles.length > 0) {
    if (!allowedRoles.includes(role)) {
      return <Navigate to="/dashboard" />;
    }
  } else {
    // Check for admin/facility_admin requirements if no specific roles are provided
    if (requireAdmin && role !== 'admin') {
      return <Navigate to="/dashboard" />;
    }

    if (requireFacilityAdmin && role !== 'admin' && role !== 'facility_admin') {
      return <Navigate to="/dashboard" />;
    }
  }

  return <Outlet />;
};

export default PrivateRoute;
