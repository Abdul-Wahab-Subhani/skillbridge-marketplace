import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

/**
 * Wraps routes that require authentication. If `roles` is provided,
 * also enforces that the logged-in user's role is in that list.
 */
const ProtectedRoute = ({ roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader label="Checking session..." />;

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
