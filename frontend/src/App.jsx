import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider, useRole } from './lib/RoleContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute, { AuthRedirect } from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import { ROUTE_ROLES } from './lib/nav';

import AuthLayout from './pages/auth/AuthLayout';
import SignupPage from './pages/auth/SignupPage';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

import DashboardPage from './pages/app/DashboardPage';
import UsersPage from './pages/app/UsersPage';
import ProductsPage from './pages/app/ProductsPage';
import CustomersPage from './pages/app/CustomersPage';
import InquiriesPage from './pages/app/InquiriesPage';
import QuotationsPage from './pages/app/QuotationsPage';
import ApprovalsPage from './pages/app/ApprovalsPage';
import ReportsPage from './pages/app/ReportsPage';
import SettingsPage from './pages/app/SettingsPage';
import ProfilePage from './pages/app/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import LandingPage from './pages/LandingPage';

// Role guard: redirects unauthorized users to their dashboard
function RG({ routeKey, children }) {
  const { effectiveRole } = useRole();
  const allowed = ROUTE_ROLES[routeKey] || [];
  if (!allowed.includes(effectiveRole)) return <Navigate to="/app/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <RoleProvider>
          <Routes>
            {/* Auth routes */}
            <Route element={<AuthLayout />}>
              <Route path="/signup" element={<AuthRedirect><SignupPage /></AuthRedirect>} />
              <Route path="/login" element={<AuthRedirect><LoginPage /></AuthRedirect>} />
              <Route path="/forgot-password" element={<AuthRedirect><ForgotPasswordPage /></AuthRedirect>} />
            </Route>

            {/* App routes — all protected */}
            <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<DashboardPage />} />

              {/* Admin-only */}
              <Route path="users" element={<RG routeKey="users"><UsersPage /></RG>} />
              <Route path="products" element={<RG routeKey="products"><ProductsPage /></RG>} />
              <Route path="customers" element={<RG routeKey="customers"><CustomersPage /></RG>} />
              <Route path="settings" element={<RG routeKey="settings"><SettingsPage /></RG>} />

              {/* Admin + Manager */}
              <Route path="approvals" element={<RG routeKey="approvals"><ApprovalsPage /></RG>} />
              <Route path="reports" element={<RG routeKey="reports"><ReportsPage /></RG>} />

              {/* Admin + Sales Rep */}
              <Route path="inquiries" element={<RG routeKey="inquiries"><InquiriesPage /></RG>} />
              <Route path="quotations" element={<RG routeKey="quotations"><QuotationsPage /></RG>} />

              {/* All roles */}
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Defaults & 404 */}
            <Route path="/" element={<LandingPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </RoleProvider>
      </BrowserRouter>
    </ToastProvider>
  );
}
