import { Link } from "react-router-dom";
import Logo from "../components/Logo";

// Shared split-screen layout for Login and Signup.
// Left: brand panel with marketing copy. Right: the form card.
export default function AuthLayout({ children, title, subtitle, altLink }) {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-ink-950 lg:flex-row">
      {/* Brand panel — hidden on small screens */}
      <aside className="relative hidden overflow-hidden bg-ink-950 lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(51,102,255,0.25), transparent 40%), radial-gradient(circle at 80% 60%, rgba(51,102,255,0.18), transparent 45%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative z-10">
          <Link to="/" className="inline-flex">
            <span className="inline-flex items-center gap-2.5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 shadow-glow">
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
              <span className="text-xl font-bold tracking-tight text-white">
                Quota
              </span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-bold leading-tight text-white xl:text-4xl">
            Quotations that close themselves.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-300">
            Quota turns product catalogs, customer details, and pricing rules
            into polished, professional quotations in seconds — so your sales
            team spends time selling, not formatting.
          </p>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-ink-400">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-brand-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" clipRule="evenodd" />
              </svg>
              AI-generated line items
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-brand-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" clipRule="evenodd" />
              </svg>
              Team roles & permissions
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-brand-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" clipRule="evenodd" />
              </svg>
              Export-ready PDF
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-ink-500">
          © {new Date().getFullYear()} Quota Inc. All rights reserved.
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:w-1/2 lg:px-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <div className="mb-7">
            <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl dark:text-ink-50">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">{subtitle}</p>
            )}
          </div>
          {children}
          {altLink && (
            <div className="mt-6 text-sm text-ink-500 dark:text-ink-400">{altLink}</div>
          )}
        </div>
      </main>
    </div>
  );
}
