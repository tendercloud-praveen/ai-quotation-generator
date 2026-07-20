import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="text-center max-w-md">
        <div className="grid place-items-center h-20 w-20 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 mx-auto mb-6">
          <AlertTriangle size={36} />
        </div>
        <h1 className="text-6xl font-bold text-slate-800 dark:text-slate-100">404</h1>
        <p className="mt-2 text-lg font-semibold text-slate-700 dark:text-slate-200">Page not found</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/app/dashboard" className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition shadow-sm">
          <Home size={16} /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
