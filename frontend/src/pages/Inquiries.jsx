import { useEffect, useMemo, useState } from "react";
import {
  getInquiriesByCompany,
  createInquiry,
  updateInquiryById,
  deleteInquiryById,
  generateInquiryNumber,
  INQUIRY_STATUS,
  INQUIRY_PRIORITY,
} from "../lib/inquiries";import { getCustomersByCompany } from "../lib/customers";
import { getProductsByCompany } from "../lib/products";
import { getUsersByCompany } from "../lib/users";
import { validateInquiryForm } from "../lib/validation";
import { ROLES } from "../lib/storage";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";

const STATUS_STYLES = {
  [INQUIRY_STATUS.NEW]: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  [INQUIRY_STATUS.IN_PROGRESS]: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  [INQUIRY_STATUS.QUOTED]: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  [INQUIRY_STATUS.CLOSED]: "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300",
};

function emptyForm(companyId) {
  return {
    inquiryNumber: generateInquiryNumber(companyId),
    inquiryDate: new Date().toISOString().slice(0, 10),
    customerId: "",
    contactPerson: "",
    productId: "",
    quantity: "",
    unit: "",
    expectedPrice: "",
    priority: INQUIRY_PRIORITY.MEDIUM,
    status: INQUIRY_STATUS.NEW,
    notes: "",
  };
}

export default function Inquiries() {
  const { user: currentUser } = useAuth();
  const role = currentUser?.role;
  const canAdd = role === ROLES.ADMIN || role === ROLES.SALES;
  const canDelete = role === ROLES.ADMIN;

  const [inquiries, setInquiries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(() => emptyForm(currentUser?.companyId));
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  function refresh() {
    const all = getInquiriesByCompany(currentUser?.companyId);
    setInquiries(all);
    setCustomers(getCustomersByCompany(currentUser?.companyId));
    setProducts(getProductsByCompany(currentUser?.companyId));
    setUsers(getUsersByCompany(currentUser?.companyId));
  }
  useEffect(refresh, [currentUser?.companyId]);

  // Sales Reps only see their own inquiries.
  const visible = useMemo(() => {
    if (role === ROLES.SALES) {
      return inquiries.filter((i) => i.createdBy === currentUser?.id);
    }
    return inquiries;
  }, [inquiries, role, currentUser?.id]);

  const userMap = useMemo(() => {
    const m = new Map();
    for (const u of users) m.set(u.id, u.fullName || u.email);
    return m;
  }, [users]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visible;
    return visible.filter((i) =>
      [i.inquiryNumber, i.customerName, i.productName, i.status]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [visible, query]);

  // Admins can edit all; Sales Reps only their own.
  function canEditInquiry(i) {
    if (role === ROLES.ADMIN) return true;
    if (role === ROLES.SALES) return i.createdBy === currentUser?.id;
    return false;
  }

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm(currentUser?.companyId));
    setErrors({});
    setServerError("");
    setModalOpen(true);
  }

  function openEdit(i) {
    setEditingId(i.id);
    setForm({
      inquiryNumber: i.inquiryNumber,
      inquiryDate: i.inquiryDate,
      customerId: i.customerId || "",
      contactPerson: i.contactPerson || "",
      productId: i.productId || "",
      quantity: i.quantity,
      unit: i.unit || "",
      expectedPrice: i.expectedPrice ?? "",
      priority: i.priority,
      status: i.status,
      notes: i.notes || "",
    });
    setErrors({});
    setServerError("");
    setModalOpen(true);
  }

  function update(field, value) {
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === "customerId") {
        const c = customers.find((c) => c.id === value);
        next.contactPerson = c?.contactPerson || "";
      }
      if (field === "productId") {
        const p = products.find((p) => p.id === value);
        if (p && !next.unit) next.unit = p.unit || "";
      }
      return next;
    });
    setErrors((e) => ({ ...e, [field]: undefined }));
    if (serverError) setServerError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    const fieldErrors = validateInquiryForm(form);
    setErrors(fieldErrors);
    if (Object.values(fieldErrors).some(Boolean)) return;

    const customer = customers.find((c) => c.id === form.customerId);
    const product = products.find((p) => p.id === form.productId);

    const payload = {
      inquiryNumber: form.inquiryNumber,
      inquiryDate: form.inquiryDate,
      customerId: form.customerId,
      customerName: customer?.customerName || "",
      contactPerson: form.contactPerson,
      productId: form.productId,
      productName: product?.productName || "",
      quantity: Number(form.quantity),
      unit: form.unit,
      expectedPrice: form.expectedPrice === "" ? null : Number(form.expectedPrice),
      priority: form.priority,
      status: form.status,
      notes: form.notes,
    };

    if (editingId) {
      updateInquiryById(editingId, payload);
    } else {
      createInquiry({
        ...payload,
        companyId: currentUser?.companyId,
        createdBy: currentUser?.id,
      });
    }
    setModalOpen(false);
    setForm(emptyForm(currentUser?.companyId));
    setEditingId(null);
    refresh();
  }

  function handleDelete() {
    if (!confirmDelete) return;
    deleteInquiryById(confirmDelete.id);
    setConfirmDelete(null);
    refresh();
  }

  function formatDate(date) {
    if (!date) return "—";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink-900 sm:text-2xl dark:text-ink-50">
            Inquiry Management
          </h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            Track and manage incoming customer inquiries.
          </p>
        </div>
        {canAdd && (
          <button onClick={openAdd} className="btn-primary">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 4a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V5a1 1 0 011-1z" />
            </svg>
            Add Inquiry
          </button>
        )}
      </div>

      <div className="relative max-w-md">
        <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zm-6 4a6 6 0 1110.9 3.5l3.3 3.3a1 1 0 01-1.4 1.4l-3.3-3.3A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by inquiry number, customer, product, or status…"
          className="input-field pl-9"
        />
      </div>

      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50/60 dark:border-ink-800 dark:bg-ink-900/60">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Inquiry Number</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Customer</th>
                <th className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500 md:table-cell">Product</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Quantity</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Status</th>
                <th className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500 sm:table-cell">Sales Rep</th>
                <th className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500 sm:table-cell">Inquiry Date</th>
                {(canAdd || canDelete) && (
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-500">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={(canAdd || canDelete) ? 8 : 7} className="px-5 py-12 text-center">
                    <div className="mx-auto max-w-sm">
                      <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-400 dark:bg-ink-800 dark:text-ink-500">
                        <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M3 4a1 1 0 011-1h6a1 1 0 011 1v3h6a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v2h4V5H5zm0 4v7h14V9H5z" />
                        </svg>
                      </div>
                      <div className="text-sm font-medium text-ink-700 dark:text-ink-200">No inquiries found</div>
                      <div className="mt-1 text-xs text-ink-400 dark:text-ink-500">
                        {query
                          ? "Try a different search."
                          : canAdd
                            ? 'Click "Add Inquiry" to create your first inquiry.'
                            : "No inquiries have been added yet."}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map((i) => {
                const editable = canEditInquiry(i);
                return (
                  <tr key={i.id} className="transition-colors hover:bg-ink-50/50 dark:hover:bg-ink-800/40">
                    <td className="px-5 py-3.5 font-medium text-ink-900 dark:text-ink-50">{i.inquiryNumber}</td>
                    <td className="px-5 py-3.5 text-ink-700 dark:text-ink-200">{i.customerName || "—"}</td>
                    <td className="hidden px-5 py-3.5 text-ink-600 md:table-cell dark:text-ink-300">{i.productName || "—"}</td>
                    <td className="px-5 py-3.5 text-ink-600 dark:text-ink-300">
                      {i.quantity}{i.unit ? ` ${i.unit}` : ""}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[i.status] || "bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-300"}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                        {i.status}
                      </span>
                    </td>
                    <td className="hidden px-5 py-3.5 text-ink-600 sm:table-cell dark:text-ink-300">{userMap.get(i.createdBy) || "—"}</td>
                    <td className="hidden px-5 py-3.5 text-ink-600 sm:table-cell dark:text-ink-300">{formatDate(i.inquiryDate)}</td>
                    {(canAdd || canDelete) && (
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          {editable ? (
                            <button
                              onClick={() => openEdit(i)}
                              className="rounded-lg p-1.5 text-ink-500 hover:bg-brand-50 hover:text-brand-600 dark:text-ink-400 dark:hover:bg-brand-500/15 dark:hover:text-brand-300"
                              aria-label={`Edit ${i.inquiryNumber}`}
                              title="Edit"
                            >
                              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.6 2.9a1 1 0 011.4 0l1.1 1.1a1 1 0 010 1.4l-.7.7-2.5-2.5.7-.7zM3 14.5V17h2.5l8.2-8.2-2.5-2.5L3 14.5z" />
                              </svg>
                            </button>
                          ) : null}
                          {canDelete && (
                            <button
                              onClick={() => setConfirmDelete(i)}
                              className="rounded-lg p-1.5 text-ink-500 hover:bg-red-50 hover:text-red-600 dark:text-ink-400 dark:hover:bg-red-500/15 dark:hover:text-red-400"
                              aria-label={`Delete ${i.inquiryNumber}`}
                              title="Delete"
                            >
                              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M8 3h4a1 1 0 011 1v1h3a1 1 0 110 2h-.5l-.7 8.1A2 2 0 0112.8 17H7.2a2 2 0 01-2-1.9L4.5 7H4a1 1 0 110-2h3V4a1 1 0 011-1zm1 5a1 1 0 011 1v5a1 1 0 11-2 0V9a1 1 0 011-1zm4 0a1 1 0 011 1v5a1 1 0 11-2 0V9a1 1 0 011-1z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/50 p-0 backdrop-blur-sm dark:bg-black/60 sm:items-center sm:p-4">
          <div className="w-full max-w-lg rounded-t-2xl border border-ink-200 bg-white shadow-float animate-slide-in-right dark:border-ink-700 dark:bg-ink-900 sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-ink-200 px-5 py-4 dark:border-ink-700">
              <h2 className="text-base font-semibold text-ink-900 dark:text-ink-50">
                {editingId ? "Edit inquiry" : "Add inquiry"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
                aria-label="Close"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto p-5">
              {serverError && <div className="mb-4"><Alert type="error" message={serverError} /></div>}
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label-text" htmlFor="i-number">Inquiry Number</label>
                    <input
                      id="i-number"
                      type="text"
                      className="input-field"
                      value={form.inquiryNumber}
                      readOnly
                      aria-readonly="true"
                    />
                    <p className="mt-1.5 text-xs text-ink-400">Auto-generated.</p>
                  </div>
                  <div>
                    <label className="label-text" htmlFor="i-date">Inquiry Date</label>
                    <input
                      id="i-date"
                      type="date"
                      className={`input-field ${errors.inquiryDate ? "input-error" : ""}`}
                      value={form.inquiryDate}
                      onChange={(e) => update("inquiryDate", e.target.value)}
                    />
                    {errors.inquiryDate && <p className="error-text">{errors.inquiryDate}</p>}
                  </div>
                  <div>
                    <label className="label-text" htmlFor="i-customer">Customer</label>
                    <select
                      id="i-customer"
                      className={`input-field ${errors.customerId ? "input-error" : ""}`}
                      value={form.customerId}
                      onChange={(e) => update("customerId", e.target.value)}
                    >
                      <option value="">Select a customer…</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.customerName} {c.companyName ? `· ${c.companyName}` : ""}
                        </option>
                      ))}
                    </select>
                    {errors.customerId && <p className="error-text">{errors.customerId}</p>}
                  </div>
                  <div>
                    <label className="label-text" htmlFor="i-contact">Contact Person</label>
                    <input
                      id="i-contact"
                      type="text"
                      className="input-field"
                      value={form.contactPerson}
                      onChange={(e) => update("contactPerson", e.target.value)}
                      placeholder="Auto-filled from customer"
                    />
                  </div>
                  <div>
                    <label className="label-text" htmlFor="i-product">Product</label>
                    <select
                      id="i-product"
                      className={`input-field ${errors.productId ? "input-error" : ""}`}
                      value={form.productId}
                      onChange={(e) => update("productId", e.target.value)}
                    >
                      <option value="">Select a product…</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.productName} {p.productCode ? `(${p.productCode})` : ""}
                        </option>
                      ))}
                    </select>
                    {errors.productId && <p className="error-text">{errors.productId}</p>}
                  </div>
                  <div>
                    <label className="label-text" htmlFor="i-qty">Quantity</label>
                    <input
                      id="i-qty"
                      type="number"
                      min="1"
                      step="1"
                      className={`input-field ${errors.quantity ? "input-error" : ""}`}
                      value={form.quantity}
                      onChange={(e) => update("quantity", e.target.value)}
                      placeholder="1"
                    />
                    {errors.quantity && <p className="error-text">{errors.quantity}</p>}
                  </div>
                  <div>
                    <label className="label-text" htmlFor="i-unit">Unit</label>
                    <input
                      id="i-unit"
                      type="text"
                      className="input-field"
                      value={form.unit}
                      onChange={(e) => update("unit", e.target.value)}
                      placeholder="Pcs"
                    />
                  </div>
                  <div>
                    <label className="label-text" htmlFor="i-price">Expected Price</label>
                    <input
                      id="i-price"
                      type="number"
                      min="0"
                      step="0.01"
                      className={`input-field ${errors.expectedPrice ? "input-error" : ""}`}
                      value={form.expectedPrice}
                      onChange={(e) => update("expectedPrice", e.target.value)}
                      placeholder="0.00"
                    />
                    {errors.expectedPrice && <p className="error-text">{errors.expectedPrice}</p>}
                  </div>
                  <div>
                    <label className="label-text" htmlFor="i-priority">Priority</label>
                    <select
                      id="i-priority"
                      className="input-field"
                      value={form.priority}
                      onChange={(e) => update("priority", e.target.value)}
                    >
                      <option value={INQUIRY_PRIORITY.LOW}>Low</option>
                      <option value={INQUIRY_PRIORITY.MEDIUM}>Medium</option>
                      <option value={INQUIRY_PRIORITY.HIGH}>High</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-text" htmlFor="i-status">Status</label>
                    <select
                      id="i-status"
                      className="input-field"
                      value={form.status}
                      onChange={(e) => update("status", e.target.value)}
                    >
                      <option value={INQUIRY_STATUS.NEW}>New</option>
                      <option value={INQUIRY_STATUS.IN_PROGRESS}>In Progress</option>
                      <option value={INQUIRY_STATUS.QUOTED}>Quoted</option>
                      <option value={INQUIRY_STATUS.CLOSED}>Closed</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label-text" htmlFor="i-notes">Notes</label>
                    <textarea
                      id="i-notes"
                      rows={3}
                      className="input-field"
                      value={form.notes}
                      onChange={(e) => update("notes", e.target.value)}
                      placeholder="Additional notes"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-2 border-t border-ink-100 pt-4 dark:border-ink-800">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? "Save changes" : "Create inquiry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4 backdrop-blur-sm dark:bg-black/60">
          <div className="w-full max-w-sm rounded-2xl border border-ink-200 bg-white p-6 shadow-float animate-scale-in dark:border-ink-700 dark:bg-ink-900">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40">
              <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 3h2a1 1 0 011 1v1h4a1 1 0 110 2h-.5l-.7 8.1A2 2 0 0112.8 17H7.2a2 2 0 01-2-1.9L4.5 7H4a1 1 0 110-2h4V4a1 1 0 011-1z" />
              </svg>
            </div>
            <h3 className="text-center text-base font-semibold text-ink-900 dark:text-ink-50">Delete inquiry?</h3>
            <p className="mt-2 text-center text-sm text-ink-500 dark:text-ink-300">
              Are you sure you want to delete this inquiry?
            </p>
            <div className="mt-6 flex gap-2">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={handleDelete} className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-red-700 active:scale-[0.98]">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
