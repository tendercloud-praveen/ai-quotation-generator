import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import Button from '../../components/Button';
import { Input } from '../../components/Field';
import { useToast } from '../../components/Toast';
import { login } from '../../lib/auth';
import { validateEmail } from '../../lib/validate';
import { ROLE_HOME } from '../../lib/nav';

export default function LoginPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };

  const submit = (ev) => {
    ev.preventDefault();
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!validateEmail(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setTimeout(() => {
      const res = login(form.email, form.password);
      setLoading(false);
      if (!res.ok) { toast.error(res.error); return; }
      toast.success(`Welcome back, ${res.user.fullName.split(' ')[0]}!`);
      const from = location.state?.from;
      navigate(from || ROLE_HOME[res.user.role] || '/app/dashboard');
    }, 500);
  };

  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Welcome back</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign in to your QuotaAI workspace.</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Input label="Email Address" type="email" icon={Mail} placeholder="you@company.com" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} required />
        <div>
          <Input
            label="Password" type={show ? 'text' : 'password'} icon={Lock} placeholder="••••••••" value={form.password}
            onChange={(e) => set('password', e.target.value)} error={errors.password} required
            rightSlot={<button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
          />
          <div className="mt-1.5 text-right">
            <Link to="/forgot-password" className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">Forgot password?</Link>
          </div>
        </div>
        <Button type="submit" loading={loading} className="w-full" size="lg">Sign In</Button>
      </form>

      <div className="mt-6 flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 px-3 py-2.5 text-xs text-slate-500 dark:text-slate-400">
        <Sparkles size={14} className="text-brand-500" /> New here? <Link to="/signup" className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">Create your company account</Link>
      </div>

      <button
        type="button"
        onClick={() => {
          if (confirm('Clear all demo data and start fresh? This removes all users, sessions, and sample data from this browser.')) {
            Object.keys(localStorage).filter((k) => k.startsWith('quotaai:')).forEach((k) => localStorage.removeItem(k));
            toast.info('Demo data cleared. You can now create a new company account.');
            navigate('/signup');
          }
        }}
        className="mt-4 w-full text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
      >
        Reset demo data & start fresh
      </button>
    </div>
  );
}
