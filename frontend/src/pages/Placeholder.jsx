// Lightweight placeholder for admin modules that ship as UI-only in Part 1.
// Keeps the sidebar navigation functional without building real features.
export default function Placeholder({ title, description, icon }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-ink-900 sm:text-2xl dark:text-ink-50">
          {title}
        </h1>
        {description && <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{description}</p>}
      </div>
      <div className="card-surface flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
          {icon || (
            <svg className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 4h14v12H3V4zm2 2v8h10V6H5z" />
            </svg>
          )}
        </div>
        <h2 className="mt-4 text-base font-semibold text-ink-900 dark:text-ink-50">Coming in Part 2</h2>
        <p className="mt-1.5 max-w-sm text-sm text-ink-500 dark:text-ink-400">
          This module is part of the next release. The UI is wired up and ready
          for when the feature lands.
        </p>
      </div>
    </div>
  );
}
