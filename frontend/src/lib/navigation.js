// Centralized route + navigation config for all roles.
// Single source of truth so RequireAuth, Login, and the sidebar all agree
// on where a given role should land and which menu items it can see.
import { ROLES } from "./storage";

// The "home" route for each role — used for post-login redirect and as the
// fallback when a user hits a route they're not allowed to access.
export const ROLE_HOME = {
  [ROLES.ADMIN]: "/admin/dashboard",
  [ROLES.MANAGER]: "/manager/dashboard",
  [ROLES.SALES]: "/sales/dashboard",
};

export function getRoleHome(role) {
  return ROLE_HOME[role] || "/login";
}

// Per-role sidebar navigation. Each entry: { label, to, icon (svg path) }.
// Only these items render for the logged-in role.
export const NAV_BY_ROLE = {
  [ROLES.ADMIN]: [
    { label: "Dashboard", to: "/admin/dashboard", icon: "M3 10h7V3H3v7zm0 7h7v-7H3v7zm11 0h7v-7h-7v7zm0-17v7h7V3h-7z" },
    { label: "Users", to: "/admin/users", icon: "M9 11a4 4 0 100-8 4 4 0 000 8zm0 2c-3.3 0-6 1.8-6 4v1h12v-1c0-2.2-2.7-4-6-4zm6-1a3 3 0 100-6 3 3 0 000 6zm1 2c-.6 0-1.2.1-1.7.2 1 .8 1.7 1.8 1.7 2.8v1h4v-1c0-1.7-1.8-3-4-3z" },
    { label: "Products", to: "/admin/products", icon: "M4 5a2 2 0 012-2h8a2 2 0 012 2v3h-2V5H6v3H4V5zm0 6h12v8H4v-8zm2 2v4h8v-4H6z" },
    { label: "Customers", to: "/admin/customers", icon: "M7 8a3 3 0 116 0 3 3 0 01-6 0zm-4 9c0-2.2 2.7-4 6-4s6 1.8 6 4v1H3v-1z" },
    { label: "Inquiries", to: "/admin/inquiries", icon: "M3 4h14v12H3V4zm0 0L2 3m1 1l-1 1m15-1l1-1m-1 1l1 1M5 8h10v1H5V8zm0 3h10v1H5v-1z" },
    { label: "Quotations", to: "/admin/quotations", icon: "M6 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6l-4-4H6zm6 1.5L16.5 8H12V3.5zM7 11h10v1H7v-1zm0 3h10v1H7v-1z" },
    { label: "Approvals", to: "/admin/approvals", icon: "M10 2a8 8 0 100 16 8 8 0 000-16zm3.7 6.3a1 1 0 00-1.4-1.4L9 10.2 7.7 8.9a1 1 0 10-1.4 1.4l2 2a1 1 0 001.4 0l4-4z" },
    { label: "Reports", to: "/admin/reports", icon: "M3 4h2v12h12v2H3V4zm4 8h2v4H7v-4zm4-4h2v8h-2V8zm4-2h2v10h-2V6z" },
    { label: "Settings", to: "/admin/settings", icon: "M10 4a2 2 0 100 4 2 2 0 000-4zm0 6c-2.2 0-4 .9-4 2v1h8v-1c0-1.1-1.8-2-4-2zm6-6a1 1 0 100 2 1 1 0 000-2zm0 4c-1 0-2 .4-2 1v1h4v-1c0-.6-1-1-2-1z" },
    { label: "Profile", to: "/admin/profile", icon: "M10 10a4 4 0 100-8 4 4 0 000 8zm-6 9c0-2.2 2.7-4 6-4s6 1.8 6 4v1H4v-1z" },
  ],
  [ROLES.MANAGER]: [
    { label: "Dashboard", to: "/manager/dashboard", icon: "M3 10h7V3H3v7zm0 7h7v-7H3v7zm11 0h7v-7h-7v7zm0-17v7h7V3h-7z" },
    { label: "Pending Approvals", to: "/manager/pending-approvals", icon: "M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-3.5H9V6h2v3.5z" },
    { label: "Approved Quotations", to: "/manager/approved-quotations", icon: "M10 2a8 8 0 100 16 8 8 0 000-16zm3.7 6.3a1 1 0 00-1.4-1.4L9 10.2 7.7 8.9a1 1 0 10-1.4 1.4l2 2a1 1 0 001.4 0l4-4z" },
    { label: "Rejected Quotations", to: "/manager/rejected-quotations", icon: "M10 2a8 8 0 100 16 8 8 0 000-16zm3 10H7v-2h6v2z" },
    { label: "Reports", to: "/manager/reports", icon: "M3 4h2v12h12v2H3V4zm4 8h2v4H7v-4zm4-4h2v8h-2V8zm4-2h2v10h-2V6z" },
    { label: "Profile", to: "/manager/profile", icon: "M10 10a4 4 0 100-8 4 4 0 000 8zm-6 9c0-2.2 2.7-4 6-4s6 1.8 6 4v1H4v-1z" },
  ],
  [ROLES.SALES]: [
    { label: "Dashboard", to: "/sales/dashboard", icon: "M3 10h7V3H3v7zm0 7h7v-7H3v7zm11 0h7v-7h-7v7zm0-17v7h7V3h-7z" },
    { label: "New Inquiry", to: "/sales/new-inquiry", icon: "M10 4a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V5a1 1 0 011-1z" },
    { label: "My Quotations", to: "/sales/my-quotations", icon: "M6 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6l-4-4H6zm6 1.5L16.5 8H12V3.5zM7 11h10v1H7v-1zm0 3h10v1H7v-1z" },
    { label: "Pending Approval", to: "/sales/pending-approval", icon: "M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-3.5H9V6h2v3.5z" },
    { label: "Approved Quotations", to: "/sales/approved-quotations", icon: "M10 2a8 8 0 100 16 8 8 0 000-16zm3.7 6.3a1 1 0 00-1.4-1.4L9 10.2 7.7 8.9a1 1 0 10-1.4 1.4l2 2a1 1 0 001.4 0l4-4z" },
    { label: "Profile", to: "/sales/profile", icon: "M10 10a4 4 0 100-8 4 4 0 000 8zm-6 9c0-2.2 2.7-4 6-4s6 1.8 6 4v1H4v-1z" },
  ],
};

// The set of routes a role is allowed to access. Derived from NAV_BY_ROLE
// so there's a single source of truth. Used by RequireAuth.
export function getAllowedRoutes(role) {
  return (NAV_BY_ROLE[role] || []).map((item) => item.to);
}

// Console title shown in the top navbar for the logged-in role.
export const ROLE_CONSOLE_TITLE = {
  [ROLES.ADMIN]: "Admin Console",
  [ROLES.MANAGER]: "Manager Console",
  [ROLES.SALES]: "Sales Console",
};
