import {
  LayoutDashboard,
  Users,
  Package,
  Building2,
  FileText,
  FileCheck2,
  ClipboardCheck,
  BarChart3,
  Settings,
  UserCircle,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export const NAV_ITEMS = [
  // All roles
  {
    to: "/app/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "manager", "sales_rep"],
  },

  // Admin-only
  { to: "/app/users", label: "Users", icon: Users, roles: ["admin"] },
  {
    to: "/app/products",
    label: "Products",
    icon: Package,
    roles: ["admin", "manager", "sales_rep"],
  },
  {
    to: "/app/customers",
    label: "Customers",
    icon: Building2,
    roles: ["admin"],
  },
  {
    to: "/app/approvals",
    label: "Approvals",
    icon: ClipboardCheck,
    roles: ["admin"],
  },

  // Admin + Manager
  // {
  //   to: "/app/reports",
  //   label: "Reports",
  //   icon: BarChart3,
  //   roles: ["admin", "manager"],
  // },

  // Settings (admin only)
  { to: "/app/settings", label: "Settings", icon: Settings, roles: ["admin"] },

  // All roles
  {
    to: "/app/profile",
    label: "Profile",
    icon: UserCircle,
    roles: ["admin", "manager", "sales_rep"],
  },

  // Manager-specific (link to approvals with tab query param)
  {
    to: "/app/approvals?tab=pending_approval",
    label: "Pending Approvals",
    icon: Clock,
    roles: ["manager"],
  },
  {
    to: "/app/approvals?tab=approved",
    label: "Approved Quotations",
    icon: CheckCircle2,
    roles: ["manager"],
  },
  {
    to: "/app/approvals?tab=rejected",
    label: "Rejected Quotations",
    icon: XCircle,
    roles: ["manager"],
  },

  // Sales Rep-specific
  {
    to: "/app/inquiries",
    label: "New Inquiry",
    icon: Sparkles,
    roles: ["sales_rep"],
  },
  {
    to: "/app/inquiries?filter=my",
    label: "My Inquiries",
    icon: FileText,
    roles: ["sales_rep"],
  },
  {
    to: "/app/quotations?filter=my",
    label: "My Quotations",
    icon: FileCheck2,
    roles: ["sales_rep"],
  },
  {
    to: "/app/quotations?status=pending_approval",
    label: "Pending Approval",
    icon: Clock,
    roles: ["sales_rep"],
  },
  {
    to: "/app/quotations?status=approved",
    label: "Approved Quotations",
    icon: CheckCircle2,
    roles: ["sales_rep"],
  },
];

export const ROLE_LABELS = {
  admin: "Admin",
  manager: "Manager",
  sales_rep: "Sales Rep",
};

// Default landing path per role after login
export const ROLE_HOME = {
  admin: "/app/dashboard",
  manager: "/app/dashboard",
  sales_rep: "/app/dashboard",
};

// Route guard: roles that are allowed to access each /app/* path.
// A user hitting a path not listed for their role is redirected to their dashboard.
export const ROUTE_ROLES = {
  dashboard: ["admin", "manager", "sales_rep"],
  users: ["admin"],
  products: ["admin", "manager", "sales_rep"],
  customers: ["admin"],
  inquiries: ["admin", "sales_rep"],
  quotations: ["admin", "sales_rep"],
  approvals: ["admin", "manager"],
  // reports: ['admin', 'manager'],
  settings: ["admin"],
  profile: ["admin", "manager", "sales_rep"],
};
