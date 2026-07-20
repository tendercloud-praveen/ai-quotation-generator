import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Logo from "../components/Logo";
import { useTheme } from "../context/ThemeContext";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Workflow", href: "#workflow" },
  { label: "Benefits", href: "#benefits" },
  { label: "Contact", href: "#contact" },
];

const FEATURES = [
  {
    title: "AI-generated quotations",
    desc: "Describe the deal in plain language and Quota drafts line items, quantities, and pricing in seconds.",
    icon: (
      <path d="M11 3a1 1 0 10-2 0v2.1A6 6 0 004.1 9H2a1 1 0 100 2h2.1A6 6 0 009 17.9V20a1 1 0 102 0v-2.1a6 6 0 004.9-4.9H18a1 1 0 100-2h-2.1A6 6 0 0011 5.1V3zm0 4a4 4 0 110 8 4 4 0 010-8z" />
    ),
  },
  {
    title: "Team roles & permissions",
    desc: "Admins, Managers, and Sales Reps each see exactly what they need — nothing more, nothing less.",
    icon: (
      <path d="M9 11a4 4 0 100-8 4 4 0 000 8zm0 2c-3.3 0-6 1.8-6 4v1h12v-1c0-2.2-2.7-4-6-4zm6-1a3 3 0 100-6 3 3 0 000 6zm1 2c-.6 0-1.2.1-1.7.2 1 .8 1.7 1.8 1.7 2.8v1h4v-1c0-1.7-1.8-3-4-3z" />
    ),
  },
  {
    title: "Customer & product catalog",
    desc: "Keep every customer and product in one organized place. Reuse them across every quotation.",
    icon: (
      <path d="M4 5a2 2 0 012-2h8a2 2 0 012 2v3h-2V5H6v3H4V5zm0 6h12v8H4v-8zm2 2v4h8v-4H6z" />
    ),
  },
  {
    title: "Inquiry-to-quote pipeline",
    desc: "Capture inquiries, convert them to quotations, and track status from draft to approved.",
    icon: (
      <path d="M3 4a1 1 0 011-1h6a1 1 0 011 1v3h6a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v2h4V5H5zm0 4v7h14V9H5zm2 2h4v1H7v-1zm0 3h6v1H7v-1z" />
    ),
  },
  {
    title: "Reports & insights",
    desc: "See win rates, average deal size, and team performance at a glance with built-in reports.",
    icon: (
      <path d="M3 4h2v12h12v2H3V4zm4 8h2v4H7v-4zm4-4h2v8h-2V8zm4-2h2v10h-2V6z" />
    ),
  },
  {
    title: "Export-ready documents",
    desc: "Send polished, branded quotations as PDF to your customers straight from the platform.",
    icon: (
      <path d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6l-4-4H6zm6 1.5L16.5 8H12V3.5zM7 11h10v1H7v-1zm0 3h10v1H7v-1z" />
    ),
  },
];

const STATS = [
  { value: "10×", label: "Faster quotations" },
  { value: "98%", label: "Quote accuracy" },
  { value: "4.9/5", label: "Customer rating" },
  { value: "24/7", label: "AI assistance" },
];

const STEPS = [
  { n: "01", title: "Sign up your company", desc: "Create your workspace in under a minute. The first user becomes the Admin." },
  { n: "02", title: "Add your team", desc: "Invite Managers and Sales Reps. Assign roles without leaving the dashboard." },
  { n: "03", title: "Generate quotations", desc: "Turn inquiries into professional, branded quotations with AI assistance." },
];

const BENEFITS = [
  { title: "Close deals faster", desc: "Cut quotation turnaround from days to minutes with reusable templates and smart pricing." },
  { title: "Stay on brand", desc: "Every quotation carries your logo, terms, and tone — automatically and consistently." },
  { title: "Scale with confidence", desc: "Role-based access keeps the right people in the loop as your team grows." },
  { title: "Never lose a lead", desc: "Every inquiry is tracked from first contact to closed deal, with full history." },
];

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-ink-900 transition-colors duration-300 dark:bg-ink-950 dark:text-ink-50">
      {/* ===== Navbar ===== */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-ink-200 bg-white/85 backdrop-blur-md shadow-soft dark:border-ink-800 dark:bg-ink-950/85"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-ink-50"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <button
              onClick={toggle}
              className="rounded-lg p-2 text-ink-600 transition-colors hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
              aria-label="Toggle dark mode"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-4-6a1 1 0 011 1v.01a1 1 0 11-2 0V5a1 1 0 011-1zm6 5a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM4 10a1 1 0 01-1 1H2a1 1 0 110-2h1a1 1 0 011 1zm12.5 5.5a1 1 0 01-1.4 0l-.7-.7a1 1 0 011.4-1.4l.7.7a1 1 0 010 1.4zM4.5 4.5a1 1 0 01-1.4 1.4l-.7-.7a1 1 0 011.4-1.4l.7.7zm12 12a1 1 0 01-1.4 1.4l-.7-.7a1 1 0 011.4-1.4l.7.7zM4.5 15.5a1 1 0 01-1.4 0l-.7-.7a1 1 0 011.4-1.4l.7.7a1 1 0 010 1.4z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.3 13a1 1 0 01-.9 1.4 6 6 0 01-6.5-8.5 1 1 0 011.6-.3A7 7 0 0017.3 13zM14 14.4a6 6 0 11-8-8 7 7 0 008 8z" />
                </svg>
              )}
            </button>
            <Link to="/login" className="btn-ghost">
              Login
            </Link>
            <Link to="/signup" className="btn-primary">
              Get Started
            </Link>
          </div>
          {/* Mobile menu button */}
          <button
            className="rounded-lg p-2 text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800 md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
              ) : (
                <path d="M3 6h14M3 10h14M3 14h14" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-ink-200 bg-white px-5 py-4 dark:border-ink-800 dark:bg-ink-950 md:hidden animate-fade-in-fast">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800"
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="mt-3 flex flex-col gap-2">
              <Link to="/login" className="btn-secondary w-full" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/signup" className="btn-primary w-full" onClick={() => setMenuOpen(false)}>
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
        {/* Background grid + glow */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div
            className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)",
            }}
          />
          <div className="absolute left-1/2 top-0 h-[480px] w-[680px] -translate-x-1/2 rounded-full bg-brand-500/15 blur-[120px] dark:bg-brand-500/20" />
        </div>

        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3.5 py-1.5 text-xs font-medium text-ink-600 shadow-soft animate-fade-in dark:border-ink-800 dark:bg-ink-900 dark:text-ink-300">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-brand-500" />
              Now with AI-assisted line items
            </div>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl animate-fade-in dark:text-ink-50">
              Quotations that{" "}
              <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                close themselves
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-500 sm:text-lg animate-fade-in dark:text-ink-400">
              Quota is the AI-powered quotation generator for modern sales teams.
              Turn product catalogs, customer details, and pricing rules into
              professional quotations in seconds.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row animate-fade-in">
              <Link to="/signup" className="btn-primary w-full px-6 py-3 text-base sm:w-auto">
                Get Started — free for 14 days
              </Link>
              <Link to="/login" className="btn-secondary w-full px-6 py-3 text-base sm:w-auto">
                Login
              </Link>
            </div>
            <p className="mt-4 text-xs text-ink-400 dark:text-ink-500">
              No credit card required · Cancel anytime
            </p>
          </div>

          {/* Hero product preview */}
          <div className="mx-auto mt-16 max-w-5xl animate-fade-in">
            <div className="relative rounded-2xl border border-ink-200 bg-white p-2 shadow-float dark:border-ink-800 dark:bg-ink-900">
              <div className="overflow-hidden rounded-xl border border-ink-200 bg-ink-50 dark:border-ink-800 dark:bg-ink-950">
                <div className="flex items-center gap-1.5 border-b border-ink-200 bg-white px-4 py-3 dark:border-ink-800 dark:bg-ink-900">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  <span className="ml-3 text-xs font-medium text-ink-400 dark:text-ink-500">
                    quota.app/dashboard
                  </span>
                </div>
                <div className="grid grid-cols-12 gap-0">
                  {/* Mini sidebar */}
                  <div className="col-span-3 hidden border-r border-ink-200 bg-white p-4 sm:block dark:border-ink-800 dark:bg-ink-900">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-brand-500 to-brand-700">
                        <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none">
                          <path d="M7 8.5C7 6.6 8.6 5 10.5 5h3C15.4 5 17 6.6 17 8.5v3c0 1.9-1.6 3.5-3.5 3.5H12l-2 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span className="text-sm font-bold dark:text-ink-50">Quota</span>
                    </div>
                    <div className="space-y-1.5">
                      {["Dashboard", "Users", "Products", "Quotations"].map((s, i) => (
                        <div
                          key={s}
                          className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium ${
                            i === 0 ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300" : "text-ink-500 dark:text-ink-400"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-brand-500" : "bg-ink-300 dark:bg-ink-600"}`} />
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Main */}
                  <div className="col-span-12 p-5 sm:col-span-9">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <div className="h-3 w-32 rounded bg-ink-300 dark:bg-ink-700" />
                        <div className="mt-2 h-2 w-20 rounded bg-ink-200 dark:bg-ink-800" />
                      </div>
                      <div className="h-8 w-24 rounded-lg bg-brand-600" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {[["Revenue", "₹4.2L"], ["Quotations", "128"], ["Win rate", "64%"], ["Active deals", "37"]].map(([k, v]) => (
                        <div key={k} className="rounded-lg border border-ink-200 bg-white p-3 dark:border-ink-800 dark:bg-ink-900">
                          <div className="text-[10px] font-medium uppercase tracking-wide text-ink-400 dark:text-ink-500">{k}</div>
                          <div className="mt-1 text-lg font-bold text-ink-900 dark:text-ink-50">{v}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-3 rounded-lg border border-ink-200 bg-white p-3 dark:border-ink-800 dark:bg-ink-900">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600" />
                          <div className="flex-1">
                            <div className="h-2.5 w-40 rounded bg-ink-200 dark:bg-ink-700" />
                            <div className="mt-1.5 h-2 w-24 rounded bg-ink-100 dark:bg-ink-800" />
                          </div>
                          <div className="h-5 w-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ink-200 bg-ink-200 sm:grid-cols-4 dark:border-ink-800 dark:bg-ink-800">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white px-4 py-6 text-center dark:bg-ink-900">
                <div className="text-2xl font-bold text-ink-900 sm:text-3xl dark:text-ink-50">{s.value}</div>
                <div className="mt-1 text-xs font-medium text-ink-500 dark:text-ink-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section id="features" className="border-t border-ink-100 bg-ink-50/50 py-20 sm:py-28 dark:border-ink-800 dark:bg-ink-900/30">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Features
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl dark:text-ink-50">
              Everything your sales team needs
            </h2>
            <p className="mt-4 text-base text-ink-500 dark:text-ink-400">
              A complete quotation platform — from inquiry to approved document —
              built for speed and clarity.
            </p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-ink-200 bg-white p-6 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card dark:border-ink-800 dark:bg-ink-900"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-500/15 dark:text-brand-400">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                    {f.icon}
                  </svg>
                </div>
                <h3 className="mt-4 text-base font-semibold text-ink-900 dark:text-ink-50">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Workflow ===== */}
      <section id="workflow" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Workflow
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl dark:text-ink-50">
              From inquiry to invoice in three steps
            </h2>
            <p className="mt-4 text-base text-ink-500 dark:text-ink-400">
              A workflow designed for sales teams that move fast without losing track.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative">
                <div className="rounded-2xl border border-ink-200 bg-white p-7 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card dark:border-ink-800 dark:bg-ink-900">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-bold text-white shadow-soft">
                    {s.n}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-ink-900 dark:text-ink-50">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-400">{s.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-ink-300 md:block dark:text-ink-700">
                    <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Benefits ===== */}
      <section id="benefits" className="border-t border-ink-100 bg-ink-50/50 py-20 sm:py-28 dark:border-ink-800 dark:bg-ink-900/30">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Benefits
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl dark:text-ink-50">
              Why teams choose Quota
            </h2>
            <p className="mt-4 text-base text-ink-500 dark:text-ink-400">
              Real outcomes for sales teams who want to spend more time selling and less time formatting.
            </p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="flex gap-4 rounded-xl border border-ink-200 bg-white p-6 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card dark:border-ink-800 dark:bg-ink-900"
              >
                <div className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 011.4-1.4l2.8 2.79 6.8-6.79a1 1 0 011.4 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-ink-900 dark:text-ink-50">{b.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-500 dark:text-ink-400">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== About ===== */}
      <section id="about" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                About
              </div>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl dark:text-ink-50">
                Built for teams who close deals, not paperwork
              </h2>
              <p className="mt-5 text-base leading-relaxed text-ink-500 dark:text-ink-400">
                Quota was born from a simple frustration: sales teams spend more
                time formatting quotations than selling. We built a platform that
                automates the busywork — pulling from your product catalog,
                applying pricing rules, and generating polished documents — so
                your team can focus on what matters.
              </p>
              <p className="mt-4 text-base leading-relaxed text-ink-500 dark:text-ink-400">
                With role-based access for Admins, Managers, and Sales Reps,
                Quota scales with your organization while keeping every
                quotation consistent, accurate, and on-brand.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/signup" className="btn-primary px-5 py-2.5">
                  Start your trial
                </Link>
                <a href="#contact" className="btn-secondary px-5 py-2.5">
                  Talk to us
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl border border-ink-200 bg-gradient-to-br from-ink-950 to-ink-900 p-8 shadow-float dark:border-ink-800">
                <div className="grid gap-4">
                  {STEPS.map((s) => (
                    <div key={s.n} className="flex gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-500/15 text-sm font-bold text-brand-300">
                        {s.n}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">{s.title}</h4>
                        <p className="mt-1 text-sm leading-relaxed text-ink-400">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-brand-500/20 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Contact ===== */}
      <section id="contact" className="border-t border-ink-100 bg-ink-50/50 py-20 sm:py-28 dark:border-ink-800 dark:bg-ink-900/30">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Contact
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl dark:text-ink-50">
            Get in touch
          </h2>
          <p className="mt-4 text-base text-ink-500 dark:text-ink-400">
            Questions about Quota? Want a demo for your team? Reach out — we
            usually reply within a business day.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Sales", value: "sales@quota.app", icon: "M2.5 5A1.5 1.5 0 014 3.5h12A1.5 1.5 0 0117.5 5v10a1.5 1.5 0 01-1.5 1.5H4A1.5 1.5 0 012.5 15V5zm1 1.2V15a.5.5 0 00.5.5h12a.5.5 0 00.5-.5V6.2l-6 4-6.5-4zM16 5.5H4l6 3.7 6-3.7z" },
              { label: "Support", value: "support@quota.app", icon: "M10 2a8 8 0 100 16 8 8 0 000-16zm1 12H9v-2h2v2zm0-3H9V6h2v5z" },
              { label: "General", value: "hello@quota.app", icon: "M3 4a1 1 0 011-1h12a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v2h10V5H5zm0 4v6h10V9H5z" },
            ].map((c) => (
              <a
                key={c.label}
                href={`mailto:${c.value}`}
                className="group rounded-xl border border-ink-200 bg-white p-5 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card dark:border-ink-800 dark:bg-ink-900"
              >
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-500/15 dark:text-brand-400">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path d={c.icon} />
                  </svg>
                </div>
                <div className="mt-3 text-xs font-medium uppercase tracking-wide text-ink-400 dark:text-ink-500">
                  {c.label}
                </div>
                <div className="mt-1 text-sm font-semibold text-ink-900 dark:text-ink-50">{c.value}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-950">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-1">
              <Logo />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-500 dark:text-ink-400">
                The AI quotation generator for modern sales teams.
              </p>
            </div>
            {[
              { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
              { title: "Company", links: ["About", "Careers", "Blog", "Contact"] },
              { title: "Legal", links: ["Privacy", "Terms", "Security", "Cookies"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-400 dark:text-ink-500">
                  {col.title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-sm text-ink-600 hover:text-ink-900 dark:text-ink-400 dark:hover:text-ink-50">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-ink-200 pt-6 sm:flex-row dark:border-ink-800">
            <p className="text-xs text-ink-400 dark:text-ink-500">
              © {new Date().getFullYear()} Quota Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-ink-400 dark:text-ink-500">
              {["twitter", "linkedin", "github"].map((s) => (
                <a key={s} href="#" className="hover:text-ink-700 dark:hover:text-ink-200" aria-label={s}>
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <circle cx="10" cy="10" r="3" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
