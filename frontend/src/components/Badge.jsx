const tones = {
  default: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  danger: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300',
  info: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
};

export default function Badge({ children, tone = 'default', dot = false, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]} ${className}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}

export const QUOTATION_STATUS = {
  draft: { label: 'Draft', tone: 'default' },
  pending_approval: { label: 'Pending Approval', tone: 'warning' },
  approved: { label: 'Approved', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
  dispatched: { label: 'Dispatched', tone: 'info' },
};

export function QuotationStatusBadge({ status }) {
  const s = QUOTATION_STATUS[status] || QUOTATION_STATUS.draft;
  return <Badge tone={s.tone} dot>{s.label}</Badge>;
}
