import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm shadow-brand-600/20 hover:shadow-md hover:shadow-brand-600/30',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700',
  ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm shadow-red-600/20 hover:shadow-md hover:shadow-red-600/30',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 hover:shadow-md hover:shadow-emerald-600/30',
  outline: 'border border-brand-600 text-brand-700 hover:bg-brand-50 dark:text-brand-300 dark:border-brand-500 dark:hover:bg-brand-950/40',
};
const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2',
  icon: 'p-2',
};

export default function Button({ variant = 'primary', size = 'md', loading = false, children, className = '', disabled, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-ring ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}
