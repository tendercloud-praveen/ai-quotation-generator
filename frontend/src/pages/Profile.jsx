import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const initials = (user?.fullName || "A")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-ink-900 sm:text-2xl dark:text-ink-50">
          Profile
        </h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Your account details.</p>
      </div>

      <div className="card-surface p-6">
        <div className="flex items-center gap-4">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xl font-bold text-white">
            {initials}
          </span>
          <div>
            <div className="text-lg font-semibold text-ink-900 dark:text-ink-50">{user?.fullName}</div>
            <div className="text-sm text-ink-500 dark:text-ink-400">{user?.email}</div>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              {user?.role}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-ink-400 dark:text-ink-500">Full name</div>
            <div className="mt-1 text-sm font-medium text-ink-900 dark:text-ink-50">{user?.fullName}</div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-ink-400 dark:text-ink-500">Email</div>
            <div className="mt-1 text-sm font-medium text-ink-900 dark:text-ink-50">{user?.email}</div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-ink-400 dark:text-ink-500">Role</div>
            <div className="mt-1 text-sm font-medium text-ink-900 dark:text-ink-50">{user?.role}</div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-ink-400 dark:text-ink-500">User ID</div>
            <div className="mt-1 truncate text-sm font-medium text-ink-900 dark:text-ink-50">{user?.id}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
