import { Link } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

export default function Breadcrumbs({ items = [] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
      <Link to="/app/dashboard" className="hover:text-brand-600 dark:hover:text-brand-300 inline-flex items-center gap-1">
        <Home size={14} /> <span className="hidden sm:inline">Home</span>
      </Link>
      {items.map((it, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          <ChevronRight size={14} className="opacity-50" />
          {it.to && i < items.length - 1 ? (
            <Link to={it.to} className="hover:text-brand-600 dark:hover:text-brand-300">{it.label}</Link>
          ) : (
            <span className="font-medium text-slate-700 dark:text-slate-200">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
