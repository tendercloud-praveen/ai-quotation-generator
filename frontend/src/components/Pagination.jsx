import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pageCount, onChange }) {
  if (pageCount <= 1) return null;
  const pages = [];
  const start = Math.max(1, page - 1);
  const end = Math.min(pageCount, page + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-sm">
      <span className="text-slate-500 dark:text-slate-400 hidden sm:block">
        Page {page} of {pageCount}
      </span>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page === 1} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition">
          <ChevronLeft size={18} />
        </button>
        {start > 1 && <button onClick={() => onChange(1)} className="px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition">1</button>}
        {start > 2 && <span className="px-1 text-slate-400">…</span>}
        {pages.map((p) => (
          <button key={p} onClick={() => onChange(p)} className={`px-3 py-1.5 rounded-xl font-medium transition ${p === page ? 'bg-brand-600 text-white shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
            {p}
          </button>
        ))}
        {end < pageCount - 1 && <span className="px-1 text-slate-400">…</span>}
        {end < pageCount && <button onClick={() => onChange(pageCount)} className="px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition">{pageCount}</button>}
        <button onClick={() => onChange(page + 1)} disabled={page === pageCount} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
