import { NavLink, useLocation } from "react-router-dom";
import { Sparkles, X } from "lucide-react";
import { NAV_ITEMS } from "../lib/nav";
import { useRole } from "../lib/RoleContext";
import { ROLE_LABELS } from "../lib/nav";

export default function Sidebar({ open, onClose }) {
  const { effectiveRole, user } = useRole();
  const location = useLocation();
  const items = NAV_ITEMS.filter((i) => i.roles.includes(effectiveRole));

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={`
    fixed
    inset-y-0
    left-0
    z-50
    w-64
    bg-white
    dark:bg-slate-900
    border-r
    border-slate-200
    dark:border-slate-800
    flex
    flex-col
    transition-transform
    duration-300
    ${open ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0
  `}
      >
        {" "}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm shadow-brand-600/30">
              <Sparkles size={20} />
            </div>
            <span className="text-lg font-display font-semibold tracking-tight text-slate-800 dark:text-slate-100">
              QuotaAI
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {items.map((item) => {
            const [path, query] = item.to.split("?");
            const q = new URLSearchParams(location.search);
            const qMatch = query
              ? q.get(query.split("=")[0]) === query.split("=")[1]
              : true;
            const active = location.pathname === path && qMatch;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-brand-600 text-white shadow-sm shadow-brand-600/30"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:translate-x-0.5"
                }`}
              >
                <item.icon
                  size={18}
                  className="shrink-0 transition-transform group-hover:scale-110"
                />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800">
          <div className="rounded-xl bg-gradient-to-br from-brand-50 to-slate-100 dark:from-brand-950/40 dark:to-slate-800 p-4">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {user?.companyName || "QuotaAI"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Signed in as {ROLE_LABELS[effectiveRole]}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
