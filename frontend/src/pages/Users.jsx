import { useEffect, useMemo, useState } from "react";
import {
  getUsersByCompany,
  createTeamMember,
  updateUserById,
  deleteUserById,
} from "../lib/users";
import { validateUserForm } from "../lib/validation";
import { ROLES } from "../lib/storage";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";

const ROLE_STYLES = {
  [ROLES.MANAGER]: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300",
  [ROLES.SALES]: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
};

const EMPTY_FORM = {
  fullName: "",
  email: "",
  mobile: "",
  password: "",
  confirmPassword: "",
  role: ROLES.MANAGER,
};

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  function refresh() {
    setUsers(getUsersByCompany(currentUser?.companyId));
  }
  useEffect(refresh, [currentUser?.companyId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.fullName, u.email, u.mobile, u.role]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [users, query]);

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setServerError("");
    setModalOpen(true);
  }

  function openEdit(u) {
    setEditingId(u.id);
    setForm({
      fullName: u.fullName,
      email: u.email,
      mobile: u.mobile,
      password: "",
      confirmPassword: "",
      role: u.role,
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
    const isEdit = Boolean(editingId);
    const fieldErrors = validateUserForm(form, { isEdit });
    // Duplicate email check within the current company (skip the user being edited).
    const companyUsers = getUsersByCompany(currentUser?.companyId);
    const normalizedEmail = form.email.trim().toLowerCase();
    const dupe = companyUsers.find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.id !== editingId
    );
    if (dupe) {
      fieldErrors.email = "A user with this email already exists.";
    }
    setErrors(fieldErrors);
    if (Object.values(fieldErrors).some(Boolean)) return;

    if (isEdit) {
      const patch = {
        fullName: form.fullName,
        email: form.email,
        mobile: form.mobile,
        role: form.role,
      };
      // Only update password if a new one was entered.
      if (form.password) patch.password = form.password;
      updateUserById(editingId, patch);
    } else {
      createTeamMember({
        fullName: form.fullName,
        email: form.email,
        mobile: form.mobile,
        password: form.password,
        role: form.role,
        companyId: currentUser?.companyId,
        createdBy: currentUser?.id,
      });
    }
    setModalOpen(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
    refresh();
  }

  function handleDelete() {
    if (!confirmDelete) return;
    // Admin accounts cannot be deleted; the current admin cannot delete their own account.
    if (confirmDelete.role === ROLES.ADMIN || confirmDelete.id === currentUser?.id) {
      setConfirmDelete(null);
      return;
    }
    deleteUserById(confirmDelete.id);
    setConfirmDelete(null);
    refresh();
  }

  const initials = (name) =>
    name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink-900 sm:text-2xl dark:text-ink-50">
            User Management
          </h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            Create Managers and Sales Reps for your workspace.
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 4a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V5a1 1 0 011-1z" />
          </svg>
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 dark:text-ink-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zm-6 4a6 6 0 1110.9 3.5l3.3 3.3a1 1 0 01-1.4 1.4l-3.3-3.3A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, mobile, or role…"
          className="input-field pl-9"
        />
      </div>

      {/* Table */}
      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50/60 dark:border-ink-800 dark:bg-ink-900/60">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">User</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">Email</th>
                <th className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500 sm:table-cell dark:text-ink-400">Mobile</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">Role</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <div className="mx-auto max-w-sm">
                      <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-400 dark:bg-ink-800 dark:text-ink-500">
                        <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 11a4 4 0 100-8 4 4 0 000 8zm0 2c-3.3 0-6 1.8-6 4v1h12v-1c0-2.2-2.7-4-6-4z" />
                        </svg>
                      </div>
                      <div className="text-sm font-medium text-ink-700 dark:text-ink-200">No users found</div>
                      <div className="mt-1 text-xs text-ink-400 dark:text-ink-500">
                        {query ? "Try a different search." : "Click “Add User” to create your first team member."}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-ink-50/50 dark:hover:bg-ink-800/40">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-xs font-bold text-white">
                        {initials(u.fullName)}
                      </span>
                      <div>
                        <div className="font-medium text-ink-900 dark:text-ink-50">{u.fullName}</div>
                        {u.companyName && (
                          <div className="text-xs text-ink-400 dark:text-ink-500">{u.companyName}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-ink-600 dark:text-ink-300">{u.email}</td>
                  <td className="hidden px-5 py-3.5 text-ink-600 sm:table-cell dark:text-ink-300">{u.mobile}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${ROLE_STYLES[u.role] || "bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-300"}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(u)}
                        className="rounded-lg p-1.5 text-ink-500 hover:bg-brand-50 hover:text-brand-600 dark:text-ink-400 dark:hover:bg-brand-500/15 dark:hover:text-brand-300"
                        aria-label={`Edit ${u.fullName}`}
                        title="Edit"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.6 2.9a1 1 0 011.4 0l1.1 1.1a1 1 0 010 1.4l-.7.7-2.5-2.5.7-.7zM3 14.5V17h2.5l8.2-8.2-2.5-2.5L3 14.5z" />
                        </svg>
                      </button>
                      {u.role !== ROLES.ADMIN && u.id !== currentUser?.id && (
                        <button
                          onClick={() => setConfirmDelete(u)}
                          className="rounded-lg p-1.5 text-ink-500 hover:bg-red-50 hover:text-red-600 dark:text-ink-400 dark:hover:bg-red-500/15 dark:hover:text-red-400"
                          aria-label={`Delete ${u.fullName}`}
                          title="Delete"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 3h4a1 1 0 011 1v1h3a1 1 0 110 2h-.5l-.7 8.1A2 2 0 0112.8 17H7.2a2 2 0 01-2-1.9L4.5 7H4a1 1 0 110-2h3V4a1 1 0 011-1zm1 5a1 1 0 011 1v5a1 1 0 11-2 0V9a1 1 0 011-1zm4 0a1 1 0 011 1v5a1 1 0 11-2 0V9a1 1 0 011-1z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/50 p-0 backdrop-blur-sm dark:bg-black/60 sm:items-center sm:p-4">
          <div className="w-full max-w-lg rounded-t-2xl border border-ink-200 bg-white shadow-float animate-slide-in-right dark:border-ink-700 dark:bg-ink-900 sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-ink-200 px-5 py-4 dark:border-ink-700">
              <h2 className="text-base font-semibold text-ink-900 dark:text-ink-50">
                {editingId ? "Edit user" : "Add user"}
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
                  <label className="label-text" htmlFor="u-fullName">Full name</label>
                  <input
                    id="u-fullName"
                    type="text"
                    className={`input-field ${errors.fullName ? "input-error" : ""}`}
                    value={form.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    placeholder="Jordan Carter"
                  />
                  {errors.fullName && <p className="error-text">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="label-text" htmlFor="u-email">Email</label>
                  <input
                    id="u-email"
                    type="email"
                    className={`input-field ${errors.email ? "input-error" : ""}`}
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="jordan@acme.com"
                  />
                  {errors.email && <p className="error-text">{errors.email}</p>}
                </div>
                <div>
                  <label className="label-text" htmlFor="u-mobile">Mobile number</label>
                  <input
                    id="u-mobile"
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
                <div>
                  <label className="label-text" htmlFor="u-role">Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[ROLES.MANAGER, ROLES.SALES].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => update("role", r)}
                        className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm font-medium transition-all ${
                          form.role === r
                            ? "border-brand-500 bg-brand-50 text-brand-700 shadow-glow dark:bg-brand-500/15 dark:text-brand-300"
                            : "border-ink-200 bg-white text-ink-600 hover:border-ink-300 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-300 dark:hover:border-ink-600"
                        }`}
                      >
                        <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                          form.role === r ? "border-brand-500" : "border-ink-300 dark:border-ink-600"
                        }`}>
                          {form.role === r && <span className="h-2 w-2 rounded-full bg-brand-500" />}
                        </span>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label-text" htmlFor="u-password">
                    Password {editingId && <span className="font-normal text-ink-400 dark:text-ink-500">(leave blank to keep current)</span>}
                  </label>
                  <input
                    id="u-password"
                    type="password"
                    className={`input-field ${errors.password ? "input-error" : ""}`}
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    placeholder={editingId ? "••••••••" : "Create a strong password"}
                  />
                  {errors.password ? (
                    <p className="error-text">{errors.password}</p>
                  ) : !editingId ? (
                    <p className="mt-1.5 text-xs text-ink-400 dark:text-ink-500">8+ chars with uppercase, lowercase, number, and special character.</p>
                  ) : null}
                </div>
                <div>
                  <label className="label-text" htmlFor="u-confirm">Confirm password</label>
                  <input
                    id="u-confirm"
                    type="password"
                    className={`input-field ${errors.confirmPassword ? "input-error" : ""}`}
                    value={form.confirmPassword}
                    onChange={(e) => update("confirmPassword", e.target.value)}
                    placeholder="Re-enter password"
                  />
                  {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-2 border-t border-ink-100 pt-4 dark:border-ink-800">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? "Save changes" : "Create user"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4 backdrop-blur-sm dark:bg-black/60">
          <div className="w-full max-w-sm rounded-2xl border border-ink-200 bg-white p-6 shadow-float animate-scale-in dark:border-ink-700 dark:bg-ink-900">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400">
              <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 3h2a1 1 0 011 1v1h4a1 1 0 110 2h-.5l-.7 8.1A2 2 0 0112.8 17H7.2a2 2 0 01-2-1.9L4.5 7H4a1 1 0 110-2h4V4a1 1 0 011-1z" />
              </svg>
            </div>
            <h3 className="text-center text-base font-semibold text-ink-900 dark:text-ink-50">Delete user?</h3>
            <p className="mt-2 text-center text-sm text-ink-500 dark:text-ink-400">
              Are you sure you want to delete this user?
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
