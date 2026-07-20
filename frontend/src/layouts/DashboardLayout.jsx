import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Logo from "../components/Logo";
import {
  NAV_BY_ROLE,
  ROLE_CONSOLE_TITLE,
  getRoleHome,
} from "../lib/navigation";

// Shared shell for every authenticated role (Admin, Manager, Sales Rep).
// The sidebar items, console title, and profile links are all derived from
// the current user's role — so each role sees only its own navigation and
// always lands on its own dashboard.
export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile menu on outside click.
  useEffect(() => {
    function onClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const navItems = NAV_BY_ROLE[user?.role] || [];
  const consoleTitle = ROLE_CONSOLE_TITLE[user?.role] || "Console";
  // Profile + Settings live under the user's own role prefix.
  const roleHome = getRoleHome(user?.role);
  const profilePath = `${roleHome.split("/").slice(0, 2).join("/")}/profile`;
  const settingsPath = `${roleHome.split("/").slice(0, 2).join("/")}/settings`;

  const initials = (user?.fullName || "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-ink-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-ink-200 px-5">
          <Logo />
          <button
            className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col gap-0.5 overflow-y-auto p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <svg
                    className={isActive ? "text-brand-600" : "text-ink-400 group-hover:text-ink-600"}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    style={{ width: 18, height: 18 }}
                  >
                    <path d={item.icon} />
                  </svg>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="absolute inset-x-0 bottom-0 border-t border-ink-200 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 18, height: 18 }}>
              <path d="M3 4a1 1 0 011-1h7a1 1 0 011 1v2h-1V4H4v12h7v-2h1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm6.7 4.3a1 1 0 000 1.4l1.3 1.3H8a1 1 0 100 2h3.3l-1.3 1.3a1 1 0 001.4 1.4l3-3a1 1 0 000-1.4l-3-3a1 1 0 00-1.4 0z" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-ink-200 bg-white/85 px-4 backdrop-blur-md dark:border-ink-800 dark:bg-ink-900/85 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h14M3 10h14M3 14h14" strokeLinecap="round" />
              </svg>
            </button>
            <div className="hidden items-center gap-2 text-sm text-ink-500 sm:flex dark:text-ink-400">
              <span className="font-medium text-ink-900 dark:text-ink-50">{consoleTitle}</span>
              <span className="text-ink-300 dark:text-ink-600">/</span>
              <span>Workspace</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search (decorative) */}
            <div className="hidden items-center gap-2 rounded-lg border border-ink-200 bg-ink-50 px-3 py-1.5 text-sm text-ink-400 dark:border-ink-700 dark:bg-ink-800 sm:flex">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zm-6 4a6 6 0 1110.9 3.5l3.3 3.3a1 1 0 01-1.4 1.4l-3.3-3.3A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <span className="text-xs">Search…</span>
              <kbd className="rounded border border-ink-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-ink-400 dark:border-ink-700 dark:bg-ink-900">
                ⌘K
              </kbd>
            </div>

            {/* Dark mode toggle */}
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

            {/* Notifications (decorative) */}
            <button className="relative rounded-lg p-2 text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800" aria-label="Notifications">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3l-1.5 2A1 1 0 003.3 15h13.4a1 1 0 00.8-1.6L16 11V8a6 6 0 00-6-6zm0 16a2.5 2.5 0 002.5-2.5h-5A2.5 2.5 0 0010 18z" />
              </svg>
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white dark:ring-ink-900" />
            </button>

            {/* Profile menu */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-ink-100"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white">
                  {initials}
                </span>
                <span className="hidden text-sm font-medium text-ink-800 sm:block">
                  {user?.fullName}
                </span>
                <svg className="h-4 w-4 text-ink-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5.5 7.5L10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl border border-ink-200 bg-white p-1.5 shadow-float animate-scale-in dark:border-ink-800 dark:bg-ink-900">
                  <div className="border-b border-ink-100 px-3 py-2.5 dark:border-ink-800">
                    <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">{user?.fullName}</div>
                    <div className="mt-0.5 truncate text-xs text-ink-500 dark:text-ink-400">{user?.email}</div>
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                      {user?.role}
                    </div>
                  </div>
                  <div className="py-1">
                    <Link
                      to={profilePath}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800"
                    >
                      <svg className="h-4 w-4 text-ink-400 dark:text-ink-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm-6 9c0-2.2 2.7-4 6-4s6 1.8 6 4v1H4v-1z" />
                      </svg>
                      Your profile
                    </Link>
                    <Link
                      to={settingsPath}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800"
                    >
                      <svg className="h-4 w-4 text-ink-400 dark:text-ink-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 4a2 2 0 100 4 2 2 0 000-4zm0 6c-2.2 0-4 .9-4 2v1h8v-1c0-1.1-1.8-2-4-2z" />
                      </svg>
                      Settings
                    </Link>
                  </div>
                  <div className="border-t border-ink-100 pt-1 dark:border-ink-800">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3 4a1 1 0 011-1h7a1 1 0 011 1v2h-1V4H4v12h7v-2h1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm6.7 4.3a1 1 0 000 1.4l1.3 1.3H8a1 1 0 100 2h3.3l-1.3 1.3a1 1 0 001.4 1.4l3-3a1 1 0 000-1.4l-3-3a1 1 0 00-1.4 0z" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
