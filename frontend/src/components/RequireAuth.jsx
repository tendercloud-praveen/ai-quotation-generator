import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRoleHome } from "../lib/navigation";

// Guards routes that require an authenticated user. Optionally restricts to
// specific roles (e.g. Admin-only). Unauthenticated users are sent to /login.
// Authenticated users without the required role are redirected to their own
// role's dashboard — never to someone else's.
export default function RequireAuth({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user.role)) {
    // Not authorized for this route — send the user to their own dashboard.
    return <Navigate to={getRoleHome(user.role)} replace />;
  }

  return children;
}
