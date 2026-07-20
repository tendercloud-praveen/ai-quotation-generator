import { Link } from "react-router-dom";

// Brand mark: a compact gradient square with the "Q" glyph.
export default function Logo({ className = "", showWordmark = true }) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2.5 ${className}`}>
      <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 shadow-soft transition-transform duration-200 group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none">
          <path
            d="M7 8.5C7 6.6 8.6 5 10.5 5h3C15.4 5 17 6.6 17 8.5v3c0 1.9-1.6 3.5-3.5 3.5H12l-2 3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {showWordmark && (
        <span className="text-lg font-bold tracking-tight text-ink-900 dark:text-ink-50">
          Quota
        </span>
      )}
    </Link>
  );
}
