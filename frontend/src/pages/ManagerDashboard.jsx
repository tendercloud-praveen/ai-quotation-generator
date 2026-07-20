import { useAuth } from "../context/AuthContext";

const CARDS = [
  { label: "Pending Approvals", value: "—", delta: "Awaiting your review", icon: "M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-3.5H9V6h2v3.5z", tone: "amber" },
  { label: "Approved Quotations", value: "—", delta: "This month", icon: "M10 2a8 8 0 100 16 8 8 0 000-16zm3.7 6.3a1 1 0 00-1.4-1.4L9 10.2 7.7 8.9a1 1 0 10-1.4 1.4l2 2a1 1 0 001.4 0l4-4z", tone: "emerald" },
  { label: "Rejected Quotations", value: "—", delta: "This month", icon: "M10 2a8 8 0 100 16 8 8 0 000-16zm3 10H7v-2h6v2z", tone: "violet" },
  { label: "Team Sales Reps", value: "—", delta: "Active members", icon: "M9 11a4 4 0 100-8 4 4 0 000 8zm0 2c-3.3 0-6 1.8-6 4v1h12v-1c0-2.2-2.7-4-6-4z", tone: "brand" },
];

const TONES = {
  brand: "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  violet: "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
};

const TASKS = [
  { title: "Review pending quotations", desc: "Approvals waiting for your decision.", time: "Action needed", tone: "amber" },
  { title: "Check rejected quotations", desc: "See why quotations were turned down.", time: "Review", tone: "violet" },
  { title: "Monitor team performance", desc: "Track Sales Rep activity in reports.", time: "Ongoing", tone: "brand" },
];

export default function ManagerDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome banner */}
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-gradient-to-br from-ink-950 to-ink-900 p-6 sm:p-8">
        <div className="relative">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-brand-200">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              {user?.role}
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Welcome back, {user?.fullName?.split(" ")[0] || "Manager"}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-300">
              Review and approve quotations from your sales team. Keep an eye on
              pending approvals and team performance.
            </p>
          </div>
        </div>
      </div>

      {/* Manager info cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-surface p-5">
          <div className="text-xs font-medium uppercase tracking-wide text-ink-400 dark:text-ink-500">Name</div>
          <div className="mt-1.5 text-lg font-semibold text-ink-900 dark:text-ink-50">{user?.fullName}</div>
        </div>
        <div className="card-surface p-5">
          <div className="text-xs font-medium uppercase tracking-wide text-ink-400 dark:text-ink-500">Email</div>
          <div className="mt-1.5 truncate text-lg font-semibold text-ink-900 dark:text-ink-50">{user?.email}</div>
        </div>
        <div className="card-surface p-5">
          <div className="text-xs font-medium uppercase tracking-wide text-ink-400 dark:text-ink-500">Role</div>
          <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-sm font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            {user?.role}
          </div>
        </div>
      </div>

      {/* Dashboard cards */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((c) => (
            <div key={c.label} className="card-surface p-5 transition-shadow hover:shadow-float">
              <div className="flex items-center justify-between">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${TONES[c.tone]}`}>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                    <path d={c.icon} />
                  </svg>
                </div>
              </div>
              <div className="mt-4 text-2xl font-bold text-ink-900 dark:text-ink-50">{c.value}</div>
              <div className="mt-1 text-sm font-medium text-ink-700 dark:text-ink-200">{c.label}</div>
              <div className="mt-0.5 text-xs text-ink-400 dark:text-ink-500">{c.delta}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">Your focus</h2>
        <div className="card-surface divide-y divide-ink-100 dark:divide-ink-800">
          {TASKS.map((a) => (
            <div key={a.title} className="flex items-start gap-4 p-5">
              <div className={`mt-0.5 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${TONES[a.tone]}`}>
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">{a.title}</div>
                <div className="mt-0.5 text-sm text-ink-500 dark:text-ink-400">{a.desc}</div>
              </div>
              <div className="text-xs font-medium text-ink-400 dark:text-ink-500">{a.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
