import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../lib/auth';
import { ROLE_HOME } from '../lib/nav';

export default function ProtectedRoute({ children }) {
  const user = getCurrentUser();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
}

// Redirects logged-in users away from auth pages (login/signup/forgot)
export function AuthRedirect({ children }) {
  const user = getCurrentUser();
  if (user) return <Navigate to={ROLE_HOME[user.role] || '/app/dashboard'} replace />;
  return children;
}
