import { Link, Outlet } from 'react-router-dom';
import { FileText, Sparkles, ShieldCheck, BarChart3 } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white p-12 flex-col justify-between">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 0, transparent 40%), radial-gradient(circle at 80% 70%, white 0, transparent 35%)' }} />
        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div className="grid place-items-center h-10 w-10 rounded-xl bg-white/15 backdrop-blur"><Sparkles size={22} /></div>
            <span className="text-xl font-bold tracking-tight">QuotaAI</span>
          </div>
        </div>
        <div className="relative space-y-6">
          <h1 className="text-4xl font-bold leading-tight">AI-powered quotations for modern manufacturing.</h1>
          <p className="text-brand-100 text-lg">Generate accurate quotations in seconds, streamline approvals, and close deals faster — all from one elegant workspace.</p>
          <div className="grid grid-cols-2 gap-4 pt-4">
            {[
              { icon: Sparkles, t: 'AI Match', d: 'Smart product matching from inquiry text' },
              { icon: ShieldCheck, t: 'Approvals', d: 'Multi-role review & margin control' },
              { icon: FileText, t: 'Quotations', d: 'Draft to dispatch in one flow' },
              { icon: BarChart3, t: 'Insights', d: 'Real-time dashboards & reports' },
            ].map((f) => (
              <div key={f.t} className="rounded-xl bg-white/10 backdrop-blur p-4 border border-white/10">
                <f.icon size={20} className="mb-2" />
                <p className="font-semibold">{f.t}</p>
                <p className="text-sm text-brand-100">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-sm text-brand-200">© {new Date().getFullYear()} QuotaAI. Crafted for manufacturers.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="grid place-items-center h-10 w-10 rounded-xl bg-brand-600 text-white"><Sparkles size={22} /></div>
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">QuotaAI</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
