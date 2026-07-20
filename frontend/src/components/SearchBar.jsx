import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="relative w-full sm:w-64">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus-ring dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
      />
    </div>
  );
}
