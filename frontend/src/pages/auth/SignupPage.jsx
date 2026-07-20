import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle2, Sparkles } from 'lucide-react';
import Button from '../../components/Button';
import { Input } from '../../components/Field';
import { useToast } from '../../components/Toast';
import { createUser, findUserByEmail, isAdminPresent } from '../../lib/users';
import { setSession } from '../../lib/auth';
import { validateEmail, validateMobile, validateStrongPassword, passwordStrength } from '../../lib/validate';
import { maybeSeed } from '../../lib/data';

export default function SignupPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ companyName: '', fullName: '', email: '', mobile: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const firstUser = !isAdminPresent();

  // After the first admin exists, no one can self-register — admin creates all other users.
  if (!firstUser) {
    return (
      <div className="animate-slide-up text-center">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Registration is closed</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">New accounts are created by your company admin.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 px-3 py-2.5 text-xs text-slate-500 dark:text-slate-400 justify-center">
          <Sparkles size={14} className="text-brand-500" /> Already have an account? <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">Sign in</Link>
        </div>
      </div>
    );
  }

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };

  const validate = () => {
    const e = {};
    if (!form.companyName.trim()) e.companyName = 'Company name is required';
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!validateEmail(form.email)) e.email = 'Enter a valid email address';
    else if (findUserByEmail(form.email)) e.email = 'An account with this email already exists';
    if (!form.mobile.trim()) e.mobile = 'Mobile number is required';
    else if (!validateMobile(form.mobile)) e.mobile = 'Mobile must be exactly 10 digits';
    if (!form.password) e.password = 'Password is required';
    else if (!validateStrongPassword(form.password)) e.password = 'Use 8+ chars with upper, lower, number & symbol';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      const user = createUser({ ...form, role: 'sales_rep' });
      maybeSeed();
      setSession(user.id);
      toast.success(firstUser ? 'Admin account created! Welcome to QuotaAI.' : 'Account created successfully.');
      navigate('/app/dashboard');
      setLoading(false);
    }, 600);
  };

  const strength = passwordStrength(form.password);

  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Create your company account</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {firstUser ? 'You\'re the first user — you\'ll become the Admin.' : 'Join your team workspace.'}
        </p>
        {firstUser && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 px-3 py-2 text-sm text-brand-700 dark:text-brand-300">
            <Sparkles size={16} /> First signup becomes the Admin automatically.
          </div>
        )}
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Input label="Company Name" icon={Building2} placeholder="Acme Manufacturing Pvt Ltd" value={form.companyName} onChange={(e) => set('companyName', e.target.value)} error={errors.companyName} required />
        <Input label="Full Name" icon={User} placeholder="Rahul Sharma" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} error={errors.fullName} required />
        <Input label="Email Address" type="email" icon={Mail} placeholder="you@company.com" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} required />
        <Input label="Mobile Number" icon={Phone} placeholder="9876543210" maxLength={10} value={form.mobile} onChange={(e) => set('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))} error={errors.mobile} hint="Exactly 10 digits" required />
        <div>
          <Input
            label="Password" type={show ? 'text' : 'password'} icon={Lock} placeholder="••••••••" value={form.password}
            onChange={(e) => set('password', e.target.value)} error={errors.password} required
            rightSlot={<button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
          />
          {form.password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div className={`h-full transition-all ${strength.color}`} style={{ width: `${(strength.score / 5) * 100}%` }} />
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 w-20">{strength.label}</span>
            </div>
          )}
        </div>
        <Input label="Confirm Password" type={show ? 'text' : 'password'} icon={Lock} placeholder="••••••••" value={form.confirm} onChange={(e) => set('confirm', e.target.value)} error={errors.confirm} required />
        <Button type="submit" loading={loading} className="w-full" size="lg">Create Account</Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account? <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">Sign in</Link>
      </p>
    </div>
  );
}
