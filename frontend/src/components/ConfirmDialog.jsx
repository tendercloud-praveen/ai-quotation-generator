export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  danger = true,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-scale-in">
        <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
          {title}
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {message}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold text-white ${danger ? "bg-red-600 hover:bg-red-700" : "bg-brand-600 hover:bg-brand-700"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
