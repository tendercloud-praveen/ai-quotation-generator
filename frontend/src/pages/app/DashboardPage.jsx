import { useMemo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  IndianRupee,
  Package,
  Users,
  TrendingUp,
  FileText,
  Sparkles,
} from "lucide-react";
import StatCard from "../../components/StatCard";
import { Card, CardHeader, CardBody } from "../../components/Card";
import { QuotationStatusBadge } from "../../components/Badge";
import Breadcrumbs from "../../components/Breadcrumbs";
import { useRole } from "../../lib/RoleContext";
import { useStore } from "../../lib/useStore";
import {
  getQuotations,
  getProducts,
  getCustomers,
  getInquiries,
} from "../../lib/data";
import {
  getManagerDashboardApi,
  getAdminDashboardApi,
  getSalesDashboardApi,
} from "../../services/dashboardService";
import { getUsers } from "../../lib/users";
import { formatINR, formatDate } from "../../lib/validate";
import { ROLE_LABELS } from "../../lib/nav";

const PIE_COLORS = ["#3385ff", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4"];

export default function DashboardPage() {
  useStore(() => {});

  const { user, effectiveRole } = useRole();
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setDashboardLoading(true);

        let response;

        if (effectiveRole === "admin") {
          response = await getAdminDashboardApi();
        } else if (effectiveRole === "manager") {
          response = await getManagerDashboardApi();
        } else if (effectiveRole === "sales_rep") {
          response = await getSalesDashboardApi();
        }

        setDashboardData(response);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setDashboardLoading(false);
      }
    };

    if (effectiveRole) {
      loadDashboard();
    }
  }, [effectiveRole]);

  const quotations = getQuotations();
  const products = getProducts();
  const customers = getCustomers();
  const inquiries = getInquiries();
  const users = getUsers();

  const stats = useMemo(() => {
    if (!dashboardData) {
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        dispatched: 0,
        revenue: 0,
        margin: 0,
        myInquiries: 0,
      };
    }

    if (effectiveRole === "admin") {
      return {
        total: dashboardData.total_quotations ?? 0,
        pending: dashboardData.pending_quotations ?? 0,
        approved: dashboardData.approved_quotations ?? 0,
        rejected: dashboardData.rejected_quotations ?? 0,
        dispatched: dashboardData.dispatched_quotations ?? 0,
        revenue: dashboardData.total_revenue ?? 0,
        margin: dashboardData.total_margin ?? 0,
        productCount: dashboardData.product_count ?? 0,
        teamMembers: dashboardData.total_team_members ?? 0,
        myInquiries: 0,
      };
    }

    if (effectiveRole === "manager") {
      return {
        total:
          (dashboardData.pending_quotations ?? 0) +
          (dashboardData.approved_quotations ?? 0) +
          (dashboardData.rejected_quotations ?? 0),

        pending: dashboardData.pending_quotations ?? 0,
        approved: dashboardData.approved_quotations ?? 0,
        rejected: dashboardData.rejected_quotations ?? 0,
        dispatched: 0,
        revenue: dashboardData.total_revenue ?? 0,
        margin: dashboardData.total_margin ?? 0,
        myInquiries: 0,
      };
    }

    if (effectiveRole === "sales_rep") {
      return {
        total:
          (dashboardData.pending_quotations ?? 0) +
          (dashboardData.approved_quotations ?? 0),

        pending: dashboardData.pending_quotations ?? 0,
        approved: dashboardData.approved_quotations ?? 0,
        rejected: 0,
        dispatched: 0,
        revenue: 0,
        margin: 0,
        myInquiries: 0,
      };
    }

    return {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      dispatched: 0,
      revenue: 0,
      margin: 0,
      myInquiries: 0,
    };
  }, [dashboardData, effectiveRole]);

  const myQuotations =
    effectiveRole === "sales_rep"
      ? quotations.filter((q) => q.salesRepId === user?.id)
      : quotations;

  const statusData = [
    {
      name: "Draft",
      value: myQuotations.filter((q) => q.status === "draft").length,
    },
    { name: "Pending", value: stats.pending },
    { name: "Approved", value: stats.approved },
    { name: "Rejected", value: stats.rejected },
    { name: "Dispatched", value: stats.dispatched },
  ];

  const monthlyData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    return months.map((m, i) => ({
      month: m,
      quotations: 8 + Math.round(Math.sin(i) * 4 + i * 2),
      revenue: 120000 + Math.round(Math.cos(i) * 40000 + i * 25000),
    }));
  }, []);

  const categoryData = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      map[p.category] = (map[p.category] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .slice(0, 6);
  }, [products]);

  const recentQuotations = [...myQuotations]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const isDark = document.documentElement.classList.contains("dark");
  const axisColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "#1e293b" : "#f1f5f9";

  // WAIT FOR ROLE + API
  if (!effectiveRole || dashboardLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-slate-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Dashboard" }]} />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Welcome back, {user?.fullName?.split(" ")[0]}!
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {effectiveRole === "sales_rep"
              ? `Track your inquiries and quotations at ${user?.companyName}.`
              : effectiveRole === "manager"
                ? `Review and approve quotations at ${user?.companyName}.`
                : `Here's what's happening at ${user?.companyName}.`}
          </p>
        </div>
        {effectiveRole === "sales_rep" && (
          <Link
            to="/app/inquiries"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition shadow-sm hover:shadow-md"
          >
            <Sparkles size={16} /> New Inquiry
          </Link>
        )}
      </div>

      {/* Stat cards — role-specific */}
      {/* Stat cards — role-specific */}
      {effectiveRole === "admin" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Row 1 */}
          <StatCard
            label="Total Quotations"
            value={stats.total}
            icon={FileCheck2}
            tone="brand"
            trend={12}
          />

          <StatCard
            label="Pending Approval"
            value={stats.pending}
            icon={Clock}
            tone="warning"
            trend={-4}
          />

          <StatCard
            label="Approved"
            value={stats.approved}
            icon={CheckCircle2}
            tone="success"
            trend={8}
          />

          <StatCard
            label="Dispatched"
            value={stats.dispatched}
            icon={Send}
            tone="info"
            trend={15}
          />

          {/* Row 2 */}
          <StatCard
            label="Products"
            value={stats.productCount}
            icon={Package}
            tone="brand"
          />

          <StatCard
            label="Team Members"
            value={stats.teamMembers}
            icon={Users}
            tone="info"
          />

          <StatCard
            label="Total Revenue"
            value={formatINR(stats.revenue)}
            icon={IndianRupee}
            tone="success"
            trend={9}
          />

          <StatCard
            label="Total Margin"
            value={formatINR(stats.margin)}
            icon={TrendingUp}
            tone="accent"
            trend={6}
          />
        </div>
      )}

      {effectiveRole === "manager" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Row 1 */}
          <StatCard
            label="Pending Approvals"
            value={stats.pending}
            icon={Clock}
            tone="warning"
          />

          <StatCard
            label="Approved Quotations"
            value={stats.approved}
            icon={CheckCircle2}
            tone="success"
          />

          <StatCard
            label="Rejected"
            value={stats.rejected}
            icon={XCircle}
            tone="danger"
          />

          {/* Row 2 */}
          <StatCard
            label="Total Revenue"
            value={formatINR(stats.revenue)}
            icon={IndianRupee}
            tone="success"
            trend={9}
          />

          <StatCard
            label="Total Margin"
            value={formatINR(stats.margin)}
            icon={TrendingUp}
            tone="accent"
            trend={6}
          />
        </div>
      )}

      {effectiveRole === "sales_rep" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="My Inquiries"
            value={stats.myInquiries}
            icon={FileText}
            tone="brand"
          />

          <StatCard
            label="My Quotations"
            value={stats.total}
            icon={FileCheck2}
            tone="info"
          />

          <StatCard
            label="Pending Approval"
            value={stats.pending}
            icon={Clock}
            tone="warning"
          />

          <StatCard
            label="Approved"
            value={stats.approved}
            icon={CheckCircle2}
            tone="success"
          />
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Quotations & Revenue Trend"
            subtitle="Last 7 months"
            icon={TrendingUp}
          />
          <CardBody>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3385ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3385ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="month" stroke={axisColor} fontSize={12} />
                <YAxis stroke={axisColor} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "none",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3385ff"
                  strokeWidth={2}
                  fill="url(#revGrad)"
                  name="Revenue (₹)"
                />
                <Line
                  type="monotone"
                  dataKey="quotations"
                  stroke="#22c55e"
                  strokeWidth={2}
                  name="Quotations"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Status Breakdown"
            subtitle="Quotation pipeline"
            icon={FileCheck2}
          />
          <CardBody>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent quotations */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent Quotations"
            subtitle="Latest activity"
            icon={FileText}
            action={
              <Link
                to="/app/quotations"
                className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                View all
              </Link>
            }
          />
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-left text-xs uppercase text-slate-500 dark:text-slate-400">
                    <th className="px-5 py-3 font-semibold">Customer</th>
                    <th className="px-5 py-3 font-semibold">Amount</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentQuotations.map((q) => {
                    const cust = customers.find((c) => c.id === q.customerId);
                    return (
                      <tr
                        key={q.id}
                        className="border-b border-slate-50 dark:border-slate-800/60 hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-5 py-3 text-slate-700 dark:text-slate-200 font-medium truncate max-w-[160px]">
                          {cust?.name || "—"}
                        </td>
                        <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                          {formatINR(q.grandTotal)}
                        </td>
                        <td className="px-5 py-3">
                          <QuotationStatusBadge status={q.status} />
                        </td>
                        <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                          {formatDate(q.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        {/* Category distribution */}
        <Card>
          <CardHeader
            title="Product Categories"
            subtitle="By inventory"
            icon={Package}
          />
          <CardBody>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ left: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={gridColor}
                  horizontal={false}
                />
                <XAxis type="number" stroke={axisColor} fontSize={11} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke={axisColor}
                  fontSize={11}
                  width={70}
                />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
                <Bar
                  dataKey="value"
                  fill="#3385ff"
                  radius={[0, 6, 6, 0]}
                  name="Products"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Sales rep quick actions */}
      {effectiveRole === "sales_rep" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              to: "/app/inquiries",
              icon: FileText,
              label: "Create Inquiry",
              desc: "Start a new customer inquiry",
              cls: "bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-300",
            },
            {
              to: "/app/quotations",
              icon: FileCheck2,
              label: "Generate Quotation",
              desc: "AI-match products & quote",
              cls: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300",
            },
            {
              to: "/app/customers",
              icon: Users,
              label: "Add Customer",
              desc: "Register a new customer",
              cls: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300",
            },
          ].map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700 transition-all"
            >
              <div
                className={`grid place-items-center h-11 w-11 rounded-xl mb-3 ${a.cls}`}
              >
                <a.icon size={22} />
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-brand-600 transition">
                {a.label}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {a.desc}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
