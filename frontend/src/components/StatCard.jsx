import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ label, value, icon: Icon, tone = 'brand', trend, hint }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-300',
    success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300',
    warning: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300',
    danger: 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-300',
    info: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300',
    accent: 'bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-300',
  };
  return (
    <div className="rounded-xl bg-white border border-slate-200/70 shadow-sm dark:bg-slate-900 dark:border-slate-800 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
        <div className={`grid place-items-center h-11 w-11 rounded-xl ${tones[tone]}`}>
          {Icon && <Icon size={22} />}
        </div>
      </div>
      {trend != null && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {trend >= 0 ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium"><TrendingUp size={14} /> +{trend}%</span>
          ) : (
            <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-medium"><TrendingDown size={14} /> {trend}%</span>
          )}
          <span className="text-slate-400">vs last month</span>
        </div>
      )}
    </div>
  );
}
