import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';
import { BarChart3, TrendingUp, IndianRupee, Package, Users, FileCheck2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/Breadcrumbs';
import { Card, CardHeader, CardBody } from '../../components/Card';
import StatCard from '../../components/StatCard';
import { useStore } from '../../lib/useStore';
import { getQuotations, getProducts, getCustomers, getInquiries } from '../../lib/data';
import { getUsers } from '../../lib/users';
import { formatINR } from '../../lib/validate';

export default function ReportsPage() {
  useStore(() => {});
  const quotations = getQuotations();
  const products = getProducts();
  const customers = getCustomers();
  const users = getUsers();
  const inquiries = getInquiries();

  const isDark = document.documentElement.classList.contains('dark');
  const axisColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#1e293b' : '#f1f5f9';

  const totalRevenue = quotations.filter((q) => q.status === 'dispatched' || q.status === 'approved').reduce((s, q) => s + q.grandTotal, 0);
  const totalMargin = quotations.reduce((s, q) => s + q.lines.reduce((m, l) => m + l.margin, 0), 0);
  const avgOrderValue = quotations.length ? totalRevenue / quotations.length : 0;
  const conversionRate = quotations.length ? ((quotations.filter((q) => q.status === 'dispatched').length) / quotations.length * 100) : 0;

  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    return months.map((m, i) => ({
      month: m,
      revenue: 120000 + Math.round(Math.cos(i) * 40000 + i * 25000),
      margin: 40000 + Math.round(Math.sin(i) * 15000 + i * 8000),
      count: 8 + Math.round(Math.sin(i) * 4 + i * 2),
    }));
  }, []);

  const categoryRevenue = useMemo(() => {
    const map = {};
    quotations.forEach((q) => {
      q.lines.forEach((l) => {
        const p = products.find((x) => x.id === l.productId);
        const cat = p?.category || 'Other';
        map[cat] = (map[cat] || 0) + l.total;
      });
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [quotations, products]);

  const topProducts = useMemo(() => {
    const map = {};
    quotations.forEach((q) => {
      q.lines.forEach((l) => {
        if (!map[l.productId]) map[l.productId] = { name: l.name, sku: l.sku, qty: 0, revenue: 0 };
        map[l.productId].qty += l.qty;
        map[l.productId].revenue += l.total;
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [quotations]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Reports' }]} />
      <PageHeader title="Reports & Analytics" subtitle="Business insights across quotations, revenue, and product performance." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={formatINR(totalRevenue)} icon={IndianRupee} tone="success" trend={9} />
        <StatCard label="Total Margin" value={formatINR(totalMargin)} icon={TrendingUp} tone="accent" trend={6} />
        <StatCard label="Avg Order Value" value={formatINR(avgOrderValue)} icon={BarChart3} tone="brand" trend={4} />
        <StatCard label="Conversion Rate" value={`${conversionRate.toFixed(1)}%`} icon={FileCheck2} tone="info" trend={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Revenue & Margin Trend" subtitle="Monthly performance" icon={TrendingUp} />
          <CardBody>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="month" stroke={axisColor} fontSize={12} />
                <YAxis stroke={axisColor} fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} formatter={(v) => formatINR(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="revenue" stroke="#3385ff" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="margin" stroke="#22c55e" strokeWidth={2} name="Margin" />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Revenue by Category" subtitle="Top performing categories" icon={Package} />
          <CardBody>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" stroke={axisColor} fontSize={11} angle={-15} textAnchor="end" height={60} />
                <YAxis stroke={axisColor} fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} formatter={(v) => formatINR(v)} />
                <Bar dataKey="value" fill="#3385ff" radius={[6, 6, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Top Products by Revenue" subtitle="Best performing SKUs" icon={Package} />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-left text-xs uppercase text-slate-500 dark:text-slate-400">
                  <th className="px-5 py-3 font-semibold">#</th>
                  <th className="px-5 py-3 font-semibold">Product</th>
                  <th className="px-5 py-3 font-semibold">SKU</th>
                  <th className="px-5 py-3 font-semibold text-right">Qty Sold</th>
                  <th className="px-5 py-3 font-semibold text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={i} className="border-b border-slate-50 dark:border-slate-800/60 hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3 text-slate-400 font-medium">{i + 1}</td>
                    <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-200">{p.name}</td>
                    <td className="px-5 py-3 font-mono text-xs text-brand-600 dark:text-brand-400">{p.sku}</td>
                    <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-300">{p.qty}</td>
                    <td className="px-5 py-3 text-right font-semibold text-slate-700 dark:text-slate-200">{formatINR(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Products" value={products.length} icon={Package} tone="brand" />
        <StatCard label="Total Customers" value={customers.length} icon={Users} tone="info" />
        <StatCard label="Total Inquiries" value={inquiries.length} icon={FileCheck2} tone="warning" />
        <StatCard label="Team Members" value={users.length} icon={Users} tone="accent" />
      </div>
    </div>
  );
}
