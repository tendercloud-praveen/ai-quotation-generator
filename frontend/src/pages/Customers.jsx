import { useEffect, useMemo, useState } from "react";
import {
  getCustomersByCompany,
  createCustomer,
  updateCustomerById,
  deleteCustomerById,
  customerCodeExistsInCompany,
  generateCustomerCode,
  CUSTOMER_STATUS,
} from "../lib/customers";
import { validateCustomerForm } from "../lib/validation";
import { ROLES } from "../lib/storage";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";

const STATUS_STYLES = {
  [CUSTOMER_STATUS.ACTIVE]: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  [CUSTOMER_STATUS.INACTIVE]: "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300",
};

function emptyForm(companyId) {
  return {
    customerCode: generateCustomerCode(companyId),
    customerName: "",
    contactPerson: "",
    email: "",
    mobile: "",
    companyName: "",
    gstNumber: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    status: CUSTOMER_STATUS.ACTIVE,
  };
}

export default function Customers() {
  const { user: currentUser } = useAuth();
  const role = currentUser?.role;
  const canAdd = role === ROLES.ADMIN || role === ROLES.SALES;
  const canDelete = role === ROLES.ADMIN;

  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(() => emptyForm(currentUser?.companyId));
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  function refresh() {
    setCustomers(getCustomersByCompany(currentUser?.companyId));
  }
  useEffect(refresh, [currentUser?.companyId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      [c.customerName, c.companyName, c.mobile, c.email]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [customers, query]);

  // Sales Reps can edit only customers they created; Admins can edit all.
  function canEditCustomer(c) {
    if (role === ROLES.ADMIN) return true;
    if (role === ROLES.SALES) return c.createdBy === currentUser?.id;
    return false;
  }

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm(currentUser?.companyId));
    setErrors({});
    setServerError("");
    setModalOpen(true);
  }

  function openEdit(c) {
    setEditingId(c.id);
    setForm({
      customerCode: c.customerCode,
      customerName: c.customerName,
      contactPerson: c.contactPerson,
      email: c.email || "",
      mobile: c.mobile || "",
      companyName: c.companyName,
      gstNumber: c.gstNumber || "",
      address: c.address || "",
      city: c.city || "",
      state: c.state || "",
      country: c.country || "",
      pincode: c.pincode || "",
      status: c.status,
    });
    setErrors({});
    setServerError("");
    setModalOpen(true);
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
    if (serverError) setServerError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    const fieldErrors = validateCustomerForm(form);
    if (
      customerCodeExistsInCompany(
        currentUser?.companyId,
        form.customerCode,
        editingId
      )
    ) {
      fieldErrors.customerCode = "A customer with this code already exists.";
    }
    setErrors(fieldErrors);
    if (Object.values(fieldErrors).some(Boolean)) return;

    const payload = {
      customerCode: form.customerCode,
      customerName: form.customerName,
      contactPerson: form.contactPerson,
      email: form.email,
      mobile: form.mobile,
      companyName: form.companyName,
      gstNumber: form.gstNumber,
      address: form.address,
      city: form.city,
      state: form.state,
      country: form.country,
      pincode: form.pincode,
      status: form.status,
    };

    if (editingId) {
      updateCustomerById(editingId, payload);
    } else {
      createCustomer({
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
    deleteCustomerById(confirmDelete.id);
    setConfirmDelete(null);
    refresh();
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink-900 sm:text-2xl dark:text-ink-50">
            Customer Management
          </h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            Manage your customer records.
          </p>
        </div>
        {canAdd && (
          <button onClick={openAdd} className="btn-primary">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 4a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V5a1 1 0 011-1z" />
            </svg>
            Add Customer
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
          placeholder="Search by name, company, mobile, or email…"
          className="input-field pl-9"
        />
      </div>

      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50/60 dark:border-ink-800 dark:bg-ink-900/60">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Customer Code</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Customer Name</th>
                <th className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500 sm:table-cell">Contact Person</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Company</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Mobile</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Status</th>
                {(canAdd || canDelete) && (
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-500">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={(canAdd || canDelete) ? 7 : 6} className="px-5 py-12 text-center">
                    <div className="mx-auto max-w-sm">
                      <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-400 dark:bg-ink-800 dark:text-ink-500">
                        <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M7 8a3 3 0 116 0 3 3 0 01-6 0zm-4 9c0-2.2 2.7-4 6-4s6 1.8 6 4v1H3v-1z" />
                        </svg>
                      </div>
                      <div className="text-sm font-medium text-ink-700 dark:text-ink-200">No customers found</div>
                      <div className="mt-1 text-xs text-ink-400 dark:text-ink-500">
                        {query
                          ? "Try a different search."
                          : canAdd
                            ? 'Click "Add Customer" to create your first customer.'
                            : "No customers have been added yet."}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map((c) => {
                const editable = canEditCustomer(c);
                return (
                  <tr key={c.id} className="transition-colors hover:bg-ink-50/50">
                    <td className="px-5 py-3.5 font-medium text-ink-900">{c.customerCode}</td>
                    <td className="px-5 py-3.5 text-ink-700">{c.customerName}</td>
                    <td className="hidden px-5 py-3.5 text-ink-600 sm:table-cell">{c.contactPerson}</td>
                    <td className="px-5 py-3.5 text-ink-600">{c.companyName}</td>
                    <td className="px-5 py-3.5 text-ink-600">{c.mobile}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[c.status] || "bg-ink-100 text-ink-700"}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                        {c.status}
                      </span>
                    </td>
                    {(canAdd || canDelete) && (
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          {editable ? (
                            <button
                              onClick={() => openEdit(c)}
                              className="rounded-lg p-1.5 text-ink-500 hover:bg-brand-50 hover:text-brand-600 dark:text-ink-400 dark:hover:bg-brand-500/15 dark:hover:text-brand-300"
                              aria-label={`Edit ${c.customerName}`}
                              title="Edit"
                            >
                              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.6 2.9a1 1 0 011.4 0l1.1 1.1a1 1 0 010 1.4l-.7.7-2.5-2.5.7-.7zM3 14.5V17h2.5l8.2-8.2-2.5-2.5L3 14.5z" />
                              </svg>
                            </button>
                          ) : null}
                          {canDelete && (
                            <button
                              onClick={() => setConfirmDelete(c)}
                              className="rounded-lg p-1.5 text-ink-500 hover:bg-red-50 hover:text-red-600 dark:text-ink-400 dark:hover:bg-red-500/15 dark:hover:text-red-400"
                              aria-label={`Delete ${c.customerName}`}
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
                {editingId ? "Edit customer" : "Add customer"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-ink-800"
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
                <div>
                  <label className="label-text" htmlFor="c-code">Customer Code</label>
                  <input
                    id="c-code"
                    type="text"
                    className={`input-field ${errors.customerCode ? "input-error" : ""}`}
                    value={form.customerCode}
                    readOnly
                    aria-readonly="true"
                  />
                  <p className="mt-1.5 text-xs text-ink-400 dark:text-ink-500">Auto-generated.</p>
                  {errors.customerCode && <p className="error-text">{errors.customerCode}</p>}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label-text" htmlFor="c-name">Customer Name</label>
                    <input
                      id="c-name"
                      type="text"
                      className={`input-field ${errors.customerName ? "input-error" : ""}`}
                      value={form.customerName}
                      onChange={(e) => update("customerName", e.target.value)}
                      placeholder="Acme Industries"
                    />
                    {errors.customerName && <p className="error-text">{errors.customerName}</p>}
                  </div>
                  <div>
                    <label className="label-text" htmlFor="c-contact">Contact Person</label>
                    <input
                      id="c-contact"
                      type="text"
                      className={`input-field ${errors.contactPerson ? "input-error" : ""}`}
                      value={form.contactPerson}
                      onChange={(e) => update("contactPerson", e.target.value)}
                      placeholder="Jordan Carter"
                    />
                    {errors.contactPerson && <p className="error-text">{errors.contactPerson}</p>}
                  </div>
                  <div>
                    <label className="label-text" htmlFor="c-company">Company Name</label>
                    <input
                      id="c-company"
                      type="text"
                      className={`input-field ${errors.companyName ? "input-error" : ""}`}
                      value={form.companyName}
                      onChange={(e) => update("companyName", e.target.value)}
                      placeholder="Acme Pvt Ltd"
                    />
                    {errors.companyName && <p className="error-text">{errors.companyName}</p>}
                  </div>
                  <div>
                    <label className="label-text" htmlFor="c-gst">GST Number</label>
                    <input
                      id="c-gst"
                      type="text"
                      className="input-field"
                      value={form.gstNumber}
                      onChange={(e) => update("gstNumber", e.target.value)}
                      placeholder="22AAAAA0000A1Z5"
                    />
                  </div>
                  <div>
                    <label className="label-text" htmlFor="c-email">Email</label>
                    <input
                      id="c-email"
                      type="email"
                      className={`input-field ${errors.email ? "input-error" : ""}`}
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="jordan@acme.com"
                    />
                    {errors.email && <p className="error-text">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="label-text" htmlFor="c-mobile">Mobile Number</label>
                    <input
                      id="c-mobile"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      className={`input-field ${errors.mobile ? "input-error" : ""}`}
                      value={form.mobile}
                      onChange={(e) => update("mobile", e.target.value)}
                      placeholder="9876543210"
                    />
                    {errors.mobile && <p className="error-text">{errors.mobile}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label-text" htmlFor="c-address">Address</label>
                    <textarea
                      id="c-address"
                      rows={2}
                      className="input-field"
                      value={form.address}
                      onChange={(e) => update("address", e.target.value)}
                      placeholder="Street, area, landmark"
                    />
                  </div>
                  <div>
                    <label className="label-text" htmlFor="c-city">City</label>
                    <input
                      id="c-city"
                      type="text"
                      className="input-field"
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                      placeholder="Mumbai"
                    />
                  </div>
                  <div>
                    <label className="label-text" htmlFor="c-state">State</label>
                    <input
                      id="c-state"
                      type="text"
                      className="input-field"
                      value={form.state}
                      onChange={(e) => update("state", e.target.value)}
                      placeholder="Maharashtra"
                    />
                  </div>
                  <div>
                    <label className="label-text" htmlFor="c-country">Country</label>
                    <input
                      id="c-country"
                      type="text"
                      className="input-field"
                      value={form.country}
                      onChange={(e) => update("country", e.target.value)}
                      placeholder="India"
                    />
                  </div>
                  <div>
                    <label className="label-text" htmlFor="c-pincode">Pincode</label>
                    <input
                      id="c-pincode"
                      type="text"
                      inputMode="numeric"
                      className="input-field"
                      value={form.pincode}
                      onChange={(e) => update("pincode", e.target.value)}
                      placeholder="400001"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label-text" htmlFor="c-status">Status</label>
                    <select
                      id="c-status"
                      className="input-field"
                      value={form.status}
                      onChange={(e) => update("status", e.target.value)}
                    >
                      <option value={CUSTOMER_STATUS.ACTIVE}>Active</option>
                      <option value={CUSTOMER_STATUS.INACTIVE}>Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-2 border-t border-ink-100 pt-4 dark:border-ink-800">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? "Save changes" : "Create customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4 backdrop-blur-sm dark:bg-black/60">
          <div className="w-full max-w-sm rounded-2xl border border-ink-200 bg-white p-6 shadow-float animate-scale-in dark:border-ink-700 dark:bg-ink-900">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400">
              <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 3h2a1 1 0 011 1v1h4a1 1 0 110 2h-.5l-.7 8.1A2 2 0 0112.8 17H7.2a2 2 0 01-2-1.9L4.5 7H4a1 1 0 110-2h4V4a1 1 0 011-1z" />
              </svg>
            </div>
            <h3 className="text-center text-base font-semibold text-ink-900 dark:text-ink-50">Delete customer?</h3>
            <p className="mt-2 text-center text-sm text-ink-500 dark:text-ink-400">
              Are you sure you want to delete this customer?
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
