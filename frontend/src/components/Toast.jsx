import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};
const colors = {
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800',
  error: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-200 dark:border-red-800',
  info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-800',
  warning: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((type, message) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  const toast = useCallback((type, message) => push(type, message), [push]);
  toast.success = (m) => push('success', m);
  toast.error = (m) => push('error', m);
  toast.info = (m) => push('info', m);
  toast.warning = (m) => push('warning', m);

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100vw-2rem)] sm:w-auto sm:max-w-sm">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <div key={t.id} className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg animate-slide-in-right ${colors[t.type]}`}>
              <Icon size={20} className="mt-0.5 shrink-0" />
              <p className="text-sm font-medium flex-1">{t.message}</p>
              <button onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))} className="opacity-60 hover:opacity-100">
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}
