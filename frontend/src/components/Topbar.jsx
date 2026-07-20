import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Menu, Bell, Sun, Moon, ChevronDown, LogOut, UserCircle, Settings, CheckCheck } from 'lucide-react';
import { useTheme } from '../lib/useTheme';
import { useRole } from '../lib/RoleContext';
import { clearSession } from '../lib/auth';
import { ROLE_LABELS } from '../lib/nav';
import Avatar from './Avatar';
import { useToast } from './Toast';
import { useStore } from '../lib/useStore';
import { getNotificationsFor, getUnreadCount, markNotificationRead, markAllRead } from '../lib/notifications';

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

const TONE = {
  assigned: 'bg-brand-500',
  approved: 'bg-emerald-500',
  rejected: 'bg-red-500',
  changes_requested: 'bg-amber-500',
};

export default function Topbar({ onMenu }) {
  const { theme, toggle } = useTheme();
  const { user, actualRole } = useRole();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  useStore(() => {});

  const notifications = user ? getNotificationsFor(user.id) : [];
  const unread = user ? getUnreadCount(user.id) : 0;

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const logout = () => {
    clearSession();
    toast.info('You have been signed out.');
    navigate('/login');
  };

  const openNotification = (n) => {
    markNotificationRead(n.id);
    setNotifOpen(false);
    navigate(`/app/quotations?id=${n.quotationId}`);
  };

  const pageName = location.pathname.split('/').pop() || 'dashboard';
  const pageTitle = pageName.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
          <Menu size={20} />
        </button>
        <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200 hidden sm:block">{pageTitle}</h2>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <button onClick={toggle} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900 text-[10px] font-bold text-white grid place-items-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 animate-scale-in overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-100">Notifications</span>
                <div className="flex items-center gap-3">
                  {unread > 0 && (
                    <button onClick={() => markAllRead(user.id)} className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium flex items-center gap-1">
                      <CheckCheck size={12} /> Mark all read
                    </button>
                  )}
                  <span className="text-xs text-slate-400">{unread} new</span>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-400">
                    <Bell size={24} className="mx-auto mb-2 opacity-40" />
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => openNotification(n)}
                      className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-50 dark:border-slate-800/60 last:border-0 transition ${!n.read ? 'bg-brand-50/40 dark:bg-brand-950/20' : ''}`}
                    >
                      <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${TONE[n.type] || 'bg-slate-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{n.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{n.desc}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-brand-500 shrink-0" />}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 pl-1.5 pr-1 sm:pr-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <Avatar name={user?.fullName} color={user?.avatarColor} size={32} src={user?.avatarImage} />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight max-w-[120px] truncate">{user?.fullName}</p>
              <p className="text-xs text-slate-400 leading-tight">{ROLE_LABELS[actualRole]}</p>
            </div>
            <ChevronDown size={16} className="text-slate-400 hidden sm:block" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 animate-scale-in">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{user?.fullName}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
              <Link to="/app/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                <UserCircle size={16} /> My Profile
              </Link>
              {actualRole === 'admin' && (
                <Link to="/app/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <Settings size={16} /> Settings
                </Link>
              )}
              <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-t border-slate-100 dark:border-slate-800 mt-1">
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
