import { useEffect, useState } from "react";

// Small toast/notification banner used inside auth forms.
// `type` can be "success" | "error". Auto-dismisses after `duration` ms.
export default function Alert({ type = "error", message, duration = 4000, onClose }) {
  const [visible, setVisible] = useState(Boolean(message));

  useEffect(() => {
    setVisible(Boolean(message));
    if (!message || !duration) return undefined;
    const t = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!visible || !message) return null;

  const styles = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error: "bg-red-50 border-red-200 text-red-800",
  }[type];

  const icon = {
    success: (
      <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 10-1.4 1.4l2 2a1 1 0 001.4 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
    error: (
      <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.7 7.3a1 1 0 00-1.4 1.4L8.6 10l-1.3 1.3a1 1 0 101.4 1.4L10 11.4l1.3 1.3a1 1 0 001.4-1.4L11.4 10l1.3-1.3a1 1 0 00-1.4-1.4L10 8.6 8.7 7.3z"
          clipRule="evenodd"
        />
      </svg>
    ),
  }[type];

  return (
    <div
      className={`flex items-start gap-2 rounded-lg border px-3.5 py-2.5 text-sm font-medium shadow-soft animate-fade-in-fast ${styles}`}
      role="alert"
    >
      {icon}
      <span className="leading-snug">{message}</span>
    </div>
  );
}
