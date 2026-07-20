export function Input({ label, error, hint, icon: Icon, rightSlot, floating = true, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}{props.required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      <div className="relative">
        {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><Icon size={18} /></div>}
        <input
          className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-all duration-200 focus-ring dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 ${Icon ? 'pl-10' : ''} ${rightSlot ? 'pr-10' : ''} ${error ? 'border-red-400 dark:border-red-600' : 'border-slate-200 dark:border-slate-700'}`}
          {...props}
        />
        {rightSlot}
      </div>
      {error ? <p className="mt-1 text-xs text-red-600 dark:text-red-400 animate-fade-in">{error}</p> : hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

export function Select({ label, error, children, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}{props.required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      <select
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 transition-all duration-200 focus-ring dark:bg-slate-800 dark:text-slate-100 ${error ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400 animate-fade-in">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}{props.required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      <textarea
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-all duration-200 focus-ring dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 resize-y min-h-[90px] ${error ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400 animate-fade-in">{error}</p>}
    </div>
  );
}
