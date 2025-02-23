import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser, selectRole, selectLoading } from '../../redux/slices/authSlice';

const PrivateRoute = ({ requireAdmin = false, requireFacilityAdmin = false }) => {
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);
  const loading = useSelector(selectLoading);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if the route requires specific roles
  if (requireAdmin || requireFacilityAdmin) {
    const hasRequiredRole = (
      (requireAdmin && role === 'admin') ||
      (requireFacilityAdmin && role === 'facility_admin')
    );

    if (!hasRequiredRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
};

export default PrivateRoute;
