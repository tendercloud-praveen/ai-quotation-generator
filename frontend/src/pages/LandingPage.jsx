import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, FileText, ShieldCheck, BarChart3, Bell, Users, Zap,
  CheckCircle2, ArrowRight, Star, Menu, X, Sun, Moon, Plus, Minus,
  Workflow, Lock, TrendingUp, MessageSquare,
} from 'lucide-react';
import { useTheme } from '../lib/useTheme';

const FEATURES = [
  { icon: Sparkles, title: 'AI-Powered Matching', desc: 'Smart product matching from inquiry text — generate accurate quotations in seconds, not hours.' },
  { icon: ShieldCheck, title: 'Approval Workflows', desc: 'Multi-role review with manager assignment, margin control, and full audit trail.' },
  { icon: FileText, title: 'Quotation Management', desc: 'Draft to dispatch in one elegant flow. PDF export, customer history, and status tracking.' },
  { icon: Bell, title: 'Real-time Notifications', desc: 'Managers get notified on assignment. Sales reps get notified on approval, rejection, or change requests.' },
  { icon: BarChart3, title: 'Insights & Reports', desc: 'Real-time dashboards with revenue, margin, and pipeline visibility across your team.' },
  { icon: Lock, title: 'Role-Based Access', desc: 'Admin, Manager, and Sales Rep roles with strict data isolation and route protection.' },
];

const STEPS = [
  { icon: FileText, title: 'Create Inquiry', desc: 'Sales reps log customer requirements with a single click.' },
  { icon: Sparkles, title: 'Generate Quotation', desc: 'AI matches products from your catalog and builds the quote automatically.' },
  { icon: Users, title: 'Assign Manager', desc: 'Choose the right manager to review the quotation before sending.' },
  { icon: Bell, title: 'Manager Reviews', desc: 'The assigned manager gets notified and approves, rejects, or requests changes.' },
  { icon: CheckCircle2, title: 'Download & Dispatch', desc: 'Sales rep downloads the PDF and sends it to the customer.' },
];

const STATS = [
  { value: '10x', label: 'Faster Quotations' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '3', label: 'Role Types' },
  { value: '24/7', label: 'Access Anywhere' },
];

const TESTIMONIALS = [
  { name: 'Rahul Mehta', role: 'Sales Lead, TechNova Industries', quote: 'QuotaAI cut our quotation turnaround from 2 days to 20 minutes. The AI matching is remarkably accurate.', rating: 5 },
  { name: 'Anita Desai', role: 'Operations Manager, GreenField Agro', quote: 'The approval workflow is exactly what we needed. Managers see only what is assigned to them — no more noise.', rating: 5 },
  { name: 'Karan Singh', role: 'Director, Orbit Aerospace', quote: 'Real-time notifications mean nothing falls through the cracks. Our team stays aligned effortlessly.', rating: 5 },
];

const FAQS = [
  { q: 'How does the role-based access work?', a: 'Every user logs into their own account with a specific role — Admin, Manager, or Sales Rep. Each role sees only the data and routes relevant to them. Admins see everything, Managers see approvals assigned to them, and Sales Reps see only their own inquiries and quotations.' },
  { q: 'Can a sales rep assign quotations to a specific manager?', a: 'Yes. When a sales rep clicks Send for Approval, they choose from a list of managers in their company. The selected manager receives a notification and reviews the quotation.' },
  { q: 'How do notifications work?', a: 'Notifications are stored locally and tied to each user. Managers are notified when a quotation is assigned to them. Sales reps are notified when a manager approves, rejects, or requests changes. The bell icon shows unread counts and clicking a notification opens the related quotation.' },
  { q: 'Is my company data isolated?', a: 'Absolutely. Each company has its own users, products, customers, and quotations. No user ever sees another company data, and data isolation is enforced at the role level.' },
  { q: 'Do I need to install anything?', a: 'No. QuotaAI runs entirely in your browser. Your account, users, and data are stored locally and persist across sessions.' },
  { q: 'Can I export quotations as PDF?', a: 'Yes. Once a quotation is approved, the sales rep can download a professionally formatted PDF and send it to the customer.' },
];

function FaqItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left">
        <span className="font-semibold text-slate-800 dark:text-slate-100">{item.q}</span>
        {open ? <Minus size={18} className="text-slate-400 shrink-0" /> : <Plus size={18} className="text-slate-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed animate-fade-in">
          {item.a}
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid place-items-center h-9 w-9 rounded-xl bg-brand-600 text-white"><Sparkles size={20} /></div>
            <span className="text-lg font-bold tracking-tight">QuotaAI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-brand-600 dark:hover:text-brand-400 transition">Features</a>
            <a href="#workflow" className="hover:text-brand-600 dark:hover:text-brand-400 transition">Workflow</a>
            <a href="#testimonials" className="hover:text-brand-600 dark:hover:text-brand-400 transition">Testimonials</a>
            <a href="#faq" className="hover:text-brand-600 dark:hover:text-brand-400 transition">FAQ</a>
            <a href="#contact" className="hover:text-brand-600 dark:hover:text-brand-400 transition">Contact</a>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to="/login" className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition">Sign in</Link>
            <Link to="/signup" className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 transition shadow-sm">Get started</Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 space-y-2">
            <a href="#features" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-slate-600 dark:text-slate-300">Features</a>
            <a href="#workflow" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-slate-600 dark:text-slate-300">Workflow</a>
            <a href="#testimonials" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-slate-600 dark:text-slate-300">Testimonials</a>
            <a href="#faq" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-slate-600 dark:text-slate-300">FAQ</a>
            <a href="#contact" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-slate-600 dark:text-slate-300">Contact</a>
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="flex-1 text-center py-2 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700">Sign in</Link>
              <Link to="/signup" className="flex-1 text-center py-2 rounded-lg text-sm font-semibold bg-brand-600 text-white">Get started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 dark:opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #3385ff 0, transparent 40%), radial-gradient(circle at 80% 60%, #22c55e 0, transparent 35%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-6">
            <Zap size={14} /> AI-powered quotation engine
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto leading-tight">
            Generate accurate quotations in <span className="bg-gradient-to-r from-brand-600 to-emerald-500 bg-clip-text text-transparent">seconds</span>, not hours.
          </h1>
          <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            QuotaAI streamlines the entire quotation workflow for modern manufacturers — from AI-powered product matching to multi-role approvals, notifications, and PDF dispatch.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/signup" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition shadow-lg shadow-brand-600/20">
              Start free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
              Sign in
            </Link>
          </div>
          <div className="mt-10 flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500" /> No credit card</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500" /> Setup in minutes</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500" /> Role-based access</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-brand-600 to-emerald-500 bg-clip-text text-transparent">{s.value}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Everything you need to close deals faster</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400">A complete quotation platform built for modern manufacturing teams.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 hover:shadow-xl hover:border-brand-300 dark:hover:border-brand-700 transition-all">
              <div className="grid place-items-center h-12 w-12 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 mb-4 group-hover:scale-110 transition-transform">
                <f.icon size={24} />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-4">
              <Workflow size={14} /> The workflow
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">From inquiry to dispatch in five steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative">
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 h-full">
                  <div className="flex items-center justify-between mb-3">
                    <div className="grid place-items-center h-10 w-10 rounded-xl bg-brand-600 text-white"><s.icon size={20} /></div>
                    <span className="text-2xl font-bold text-slate-200 dark:text-slate-700">{i + 1}</span>
                  </div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100">{s.title}</h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 text-slate-300 dark:text-slate-700">
                    <ArrowRight size={18} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Loved by manufacturing teams</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400">See what our customers have to say.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={16} className="fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">"{t.quote}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="grid place-items-center h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-semibold">
                  {t.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Frequently asked questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((item) => <FaqItem key={item.q} item={item} />)}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 p-8 sm:p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 0, transparent 40%), radial-gradient(circle at 80% 70%, white 0, transparent 35%)' }} />
          <div className="relative">
            <MessageSquare size={32} className="mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-bold">Ready to transform your quotation process?</h2>
            <p className="mt-3 text-brand-100 max-w-xl mx-auto">Get started in minutes. Create your company account and invite your team.</p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/signup" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-brand-700 font-semibold hover:bg-brand-50 transition shadow-lg">
                Create your account <ArrowRight size={18} />
              </Link>
              <a href="mailto:hello@quotaai.app" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/30 text-white font-semibold hover:bg-white/10 transition">
                Contact sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="grid place-items-center h-9 w-9 rounded-xl bg-brand-600 text-white"><Sparkles size={20} /></div>
                <span className="text-lg font-bold tracking-tight">QuotaAI</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">AI-powered quotations for modern manufacturing teams.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Product</p>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li><a href="#features" className="hover:text-brand-600 dark:hover:text-brand-400">Features</a></li>
                <li><a href="#workflow" className="hover:text-brand-600 dark:hover:text-brand-400">Workflow</a></li>
                <li><a href="#faq" className="hover:text-brand-600 dark:hover:text-brand-400">FAQ</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Company</p>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li><a href="#testimonials" className="hover:text-brand-600 dark:hover:text-brand-400">Testimonials</a></li>
                <li><a href="#contact" className="hover:text-brand-600 dark:hover:text-brand-400">Contact</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Get started</p>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li><Link to="/login" className="hover:text-brand-600 dark:hover:text-brand-400">Sign in</Link></li>
                <li><Link to="/signup" className="hover:text-brand-600 dark:hover:text-brand-400">Create account</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-400">
            <p>© {new Date().getFullYear()} QuotaAI. Crafted for manufacturers.</p>
            <p className="flex items-center gap-1.5"><TrendingUp size={14} /> Built with care</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
