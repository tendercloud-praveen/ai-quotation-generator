import { useAuth } from "../context/AuthContext";

const CARDS = [
  {
    label: "Total Users",
    value: "—",
    delta: "Manager & Sales Rep",
    icon: "M9 11a4 4 0 100-8 4 4 0 000 8zm0 2c-3.3 0-6 1.8-6 4v1h12v-1c0-2.2-2.7-4-6-4z",
    tone: "brand",
  },
  {
    label: "Products",
    value: "—",
    delta: "Catalog coming in Part 2",
    icon: "M4 5a2 2 0 012-2h8a2 2 0 012 2v3h-2V5H6v3H4V5zm0 6h12v8H4v-8z",
    tone: "emerald",
  },
  {
    label: "Customers",
    value: "—",
    delta: "Available in Part 2",
    icon: "M7 8a3 3 0 116 0 3 3 0 01-6 0zm-4 9c0-2.2 2.7-4 6-4s6 1.8 6 4v1H3v-1z",
    tone: "amber",
  },
  {
    label: "Quotations",
    value: "—",
    delta: "AI generation in Part 2",
    icon: "M6 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6l-4-4H6z",
    tone: "violet",
  },
];

const TONES = {
  brand: "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  violet: "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
};

const ACTIVITY = [
  { title: "Workspace created", desc: "Your Quota workspace is ready to go.", time: "Just now", tone: "emerald" },
  { title: "Add your team", desc: "Invite Managers and Sales Reps from the Users page.", time: "Next step", tone: "brand" },
  { title: "Part 2 incoming", desc: "Products, customers, and quotations arrive next.", time: "Soon", tone: "amber" },
];

export default function AdminDashboard() {
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
              Welcome back, {user?.fullName?.split(" ")[0] || "Admin"}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-300">
              Here&apos;s what&apos;s happening in your workspace. Start by adding your
              team, then watch for Products and Quotations in Part 2.
            </p>
          </div>
        </div>
      </div>

      {/* Admin info cards */}
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
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
          Overview
        </h2>
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

      {/* Activity / next steps */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">
          Getting started
        </h2>
        <div className="card-surface divide-y divide-ink-100 dark:divide-ink-800">
          {ACTIVITY.map((a) => (
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
