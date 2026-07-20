export function Card({ children, className = '', ...props }) {
  return (
    <div className={`rounded-xl bg-white border border-slate-200/70 shadow-sm dark:bg-slate-900 dark:border-slate-800 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, icon: Icon }) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-5">
      <div className="flex items-start gap-3">
        {Icon && <div className="grid place-items-center h-9 w-9 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-300"><Icon size={18} /></div>}
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`px-5 py-5 ${className}`}>{children}</div>;
}
