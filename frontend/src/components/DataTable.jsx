import { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';
import Pagination from './Pagination';

export default function DataTable({ columns, rows, pageSize = 8, emptyState, actions, sticky = true }) {
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = sorted.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  if (rows.length === 0 && emptyState) return emptyState;

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className={`${sticky ? 'sticky top-0 z-10' : ''} bg-slate-50 dark:bg-slate-800/80 backdrop-blur-sm`}>
            <tr className="border-b border-slate-200 dark:border-slate-700 text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {columns.map((col) => (
                <th key={col.key} className={`px-4 py-3 font-semibold whitespace-nowrap ${col.sortable ? 'cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200 transition' : ''}`} onClick={() => col.sortable && toggleSort(col.key)}>
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && (sortKey === col.key ? (sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={13} className="opacity-40" />)}
                  </span>
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right font-semibold">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {current.map((row, i) => (
              <tr key={row.id || i} className={`border-b border-slate-50 dark:border-slate-800/60 transition-colors ${i % 2 === 1 ? 'bg-slate-50/40 dark:bg-slate-800/20' : ''} hover:bg-brand-50/40 dark:hover:bg-brand-950/20`}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {col.render ? col.render(row) : (row[col.key] ?? '—')}
                  </td>
                ))}
                {actions && <td className="px-4 py-3 text-right whitespace-nowrap">{actions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pageCount={pageCount} onChange={setPage} />
    </div>
  );
}
