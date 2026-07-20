import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react';
import Button from '../../components/Button';
import { Input } from '../../components/Field';
import { useToast } from '../../components/Toast';
import { requestPasswordReset, resetPassword } from '../../lib/auth';
import { validateEmail, validateStrongPassword } from '../../lib/validate';

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [step, setStep] = useState(1); // 1=request, 2=reset, 3=done
  const [form, setForm] = useState({ email: '', token: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [issuedToken, setIssuedToken] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };

  const requestReset = (ev) => {
    ev.preventDefault();
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!validateEmail(form.email)) e.email = 'Enter a valid email';
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setTimeout(() => {
      const res = requestPasswordReset(form.email);
      setLoading(false);
      if (!res.ok) { toast.error(res.error); return; }
      setIssuedToken(res.token);
      toast.info('Reset token generated. Check the demo token below.');
      setStep(2);
    }, 500);
  };

  const doReset = (ev) => {
    ev.preventDefault();
    const e = {};
    if (!form.token.trim()) e.token = 'Token is required';
    if (!form.password) e.password = 'Password is required';
    else if (!validateStrongPassword(form.password)) e.password = 'Use 8+ chars with upper, lower, number & symbol';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setTimeout(() => {
      const res = resetPassword(form.email, form.token, form.password);
      setLoading(false);
      if (!res.ok) { toast.error(res.error); return; }
      toast.success('Password reset! You can now sign in.');
      setStep(3);
    }, 500);
  };

  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Reset your password</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {step === 1 && 'Enter your email and we\'ll generate a reset token.'}
          {step === 2 && 'Use the token to set a new password.'}
          {step === 3 && 'Your password has been reset.'}
        </p>
      </div>

      {step === 1 && (
        <form onSubmit={requestReset} className="space-y-4">
          <Input label="Email Address" type="email" icon={Mail} placeholder="you@company.com" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} required />
          <Button type="submit" loading={loading} className="w-full" size="lg">Send Reset Token</Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={doReset} className="space-y-4">
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-2.5 text-sm text-amber-700 dark:text-amber-300">
            <span className="font-semibold">Demo token:</span> <code className="font-mono">{issuedToken}</code>
            <p className="text-xs mt-1 opacity-80">(No email server — use this token to continue.)</p>
          </div>
          <Input label="Reset Token" icon={KeyRound} placeholder="Enter token" value={form.token} onChange={(e) => set('token', e.target.value)} error={errors.token} required />
          <Input label="New Password" type="password" icon={KeyRound} placeholder="••••••••" value={form.password} onChange={(e) => set('password', e.target.value)} error={errors.password} required />
          <Input label="Confirm Password" type="password" icon={KeyRound} placeholder="••••••••" value={form.confirm} onChange={(e) => set('confirm', e.target.value)} error={errors.confirm} required />
          <Button type="submit" loading={loading} className="w-full" size="lg">Reset Password</Button>
        </form>
      )}

      {step === 3 && (
        <div className="text-center py-6">
          <div className="grid place-items-center h-16 w-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 mx-auto mb-4">
            <CheckCircle2 size={32} />
          </div>
          <p className="text-slate-600 dark:text-slate-300 mb-5">Your password has been reset successfully.</p>
          <Link to="/login" className="inline-flex items-center gap-2 font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">
            <ArrowLeft size={16} /> Back to sign in
          </Link>
        </div>
      )}

      {step !== 3 && (
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Remembered it? <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">Sign in</Link>
        </p>
      )}
    </div>
  );
}
