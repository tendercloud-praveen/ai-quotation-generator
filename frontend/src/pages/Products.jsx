import { useEffect, useMemo, useState } from "react";
import {
  getProductsByCompany,
  createProduct,
  updateProductById,
  deleteProductById,
  productCodeExistsInCompany,
  PRODUCT_STATUS,
} from "../lib/products";
import { validateProductForm } from "../lib/validation";
import { ROLES } from "../lib/storage";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";

const EMPTY_FORM = {
  productCode: "",
  productName: "",
  category: "",
  brand: "",
  description: "",
  costPrice: "",
  sellingPrice: "",
  gstPercentage: "",
  unit: "",
  stockQuantity: "",
  status: PRODUCT_STATUS.ACTIVE,
};

const STATUS_STYLES = {
  [PRODUCT_STATUS.ACTIVE]: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  [PRODUCT_STATUS.INACTIVE]: "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300",
};

export default function Products() {
  const { user: currentUser } = useAuth();
  const canManage = currentUser?.role === ROLES.ADMIN;

  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("productName");
  const [sortDir, setSortDir] = useState("asc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  function refresh() {
    setProducts(getProductsByCompany(currentUser?.companyId));
  }
  useEffect(refresh, [currentUser?.companyId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? products.filter((p) =>
          [p.productName, p.productCode, p.category, p.brand]
            .filter(Boolean)
            .some((v) => v.toLowerCase().includes(q))
        )
      : products;
    const sorted = [...list].sort((a, b) => {
      const av = String(a[sortKey] || "").toLowerCase();
      const bv = String(b[sortKey] || "").toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [products, query, sortKey, sortDir]);

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setServerError("");
    setModalOpen(true);
  }

  function openEdit(p) {
    setEditingId(p.id);
    setForm({
      productCode: p.productCode,
      productName: p.productName,
      category: p.category,
      brand: p.brand || "",
      description: p.description || "",
      costPrice: p.costPrice,
      sellingPrice: p.sellingPrice,
      gstPercentage: p.gstPercentage,
      unit: p.unit || "",
      stockQuantity: p.stockQuantity,
      status: p.status,
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
    const fieldErrors = validateProductForm(form, { isEdit: Boolean(editingId) });
    if (
      productCodeExistsInCompany(
        currentUser?.companyId,
        form.productCode,
        editingId
      )
    ) {
      fieldErrors.productCode = "A product with this code already exists.";
    }
    setErrors(fieldErrors);
    if (Object.values(fieldErrors).some(Boolean)) return;

    const payload = {
      productCode: form.productCode,
      productName: form.productName,
      category: form.category,
      brand: form.brand,
      description: form.description,
      costPrice: Number(form.costPrice),
      sellingPrice: Number(form.sellingPrice),
      gstPercentage: form.gstPercentage === "" ? 0 : Number(form.gstPercentage),
      unit: form.unit,
      stockQuantity: form.stockQuantity === "" ? 0 : Number(form.stockQuantity),
      status: form.status,
    };

    if (editingId) {
      updateProductById(editingId, payload);
    } else {
      createProduct({ ...payload, companyId: currentUser?.companyId });
    }
    setModalOpen(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
    refresh();
  }

  function handleDelete() {
    if (!confirmDelete) return;
    deleteProductById(confirmDelete.id);
    setConfirmDelete(null);
    refresh();
  }

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
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
            Product Management
          </h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
            Manage your product catalog.
          </p>
        </div>
        {canManage && (
          <button onClick={openAdd} className="btn-primary">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 4a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V5a1 1 0 011-1z" />
            </svg>
            Add Product
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
          placeholder="Search by name, code, category, or brand…"
          className="input-field pl-9"
        />
      </div>

      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50/60 dark:border-ink-800 dark:bg-ink-900/60">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
                  <button onClick={() => toggleSort("productCode")} className="inline-flex items-center gap-1 hover:text-ink-700">
                    Product Code
                    {sortKey === "productCode" && (
                      <span className="text-ink-400">{sortDir === "asc" ? "▲" : "▼"}</span>
                    )}
                  </button>
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
                  <button onClick={() => toggleSort("productName")} className="inline-flex items-center gap-1 hover:text-ink-700">
                    Product Name
                    {sortKey === "productName" && (
                      <span className="text-ink-400">{sortDir === "asc" ? "▲" : "▼"}</span>
                    )}
                  </button>
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
                  <button onClick={() => toggleSort("category")} className="inline-flex items-center gap-1 hover:text-ink-700">
                    Category
                    {sortKey === "category" && (
                      <span className="text-ink-400">{sortDir === "asc" ? "▲" : "▼"}</span>
                    )}
                  </button>
                </th>
                <th className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500 sm:table-cell">Brand</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Cost Price</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Selling Price</th>
                <th className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500 sm:table-cell">Stock</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Status</th>
                <th className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500 sm:table-cell">Created</th>
                {canManage && (
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-500">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={canManage ? 10 : 9} className="px-5 py-12 text-center">
                    <div className="mx-auto max-w-sm">
                      <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-400 dark:bg-ink-800 dark:text-ink-500">
                        <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M4 5a2 2 0 012-2h8a2 2 0 012 2v3h-2V5H6v3H4V5zm0 6h12v8H4v-8z" />
                        </svg>
                      </div>
                      <div className="text-sm font-medium text-ink-700 dark:text-ink-200">No products found</div>
                      <div className="mt-1 text-xs text-ink-400 dark:text-ink-500">
                        {query
                          ? "Try a different search."
                          : canManage
                            ? 'Click "Add Product" to create your first product.'
                            : "No products have been added yet."}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-ink-50/50 dark:hover:bg-ink-800/40">
                  <td className="px-5 py-3.5 font-medium text-ink-900 dark:text-ink-50">{p.productCode}</td>
                  <td className="px-5 py-3.5 text-ink-700 dark:text-ink-200">{p.productName}</td>
                  <td className="px-5 py-3.5 text-ink-600 dark:text-ink-300">{p.category}</td>
                  <td className="hidden px-5 py-3.5 text-ink-600 sm:table-cell dark:text-ink-300">{p.brand || "—"}</td>
                  <td className="px-5 py-3.5 text-ink-600 dark:text-ink-300">{Number(p.costPrice).toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-ink-600 dark:text-ink-300">{Number(p.sellingPrice).toFixed(2)}</td>
                  <td className="hidden px-5 py-3.5 text-ink-600 sm:table-cell dark:text-ink-300">{p.stockQuantity}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[p.status] || "bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-300"}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                      {p.status}
                    </span>
                  </td>
                  <td className="hidden px-5 py-3.5 text-ink-600 sm:table-cell dark:text-ink-300">{formatDate(p.createdAt)}</td>
                  {canManage && (
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="rounded-lg p-1.5 text-ink-500 hover:bg-brand-50 hover:text-brand-600 dark:text-ink-400 dark:hover:bg-brand-500/15 dark:hover:text-brand-300"
                          aria-label={`Edit ${p.productName}`}
                          title="Edit"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.6 2.9a1 1 0 011.4 0l1.1 1.1a1 1 0 010 1.4l-.7.7-2.5-2.5.7-.7zM3 14.5V17h2.5l8.2-8.2-2.5-2.5L3 14.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setConfirmDelete(p)}
                          className="rounded-lg p-1.5 text-ink-500 hover:bg-red-50 hover:text-red-600 dark:text-ink-400 dark:hover:bg-red-500/15 dark:hover:text-red-400"
                          aria-label={`Delete ${p.productName}`}
                          title="Delete"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 3h4a1 1 0 011 1v1h3a1 1 0 110 2h-.5l-.7 8.1A2 2 0 0112.8 17H7.2a2 2 0 01-2-1.9L4.5 7H4a1 1 0 110-2h3V4a1 1 0 011-1zm1 5a1 1 0 011 1v5a1 1 0 11-2 0V9a1 1 0 011-1zm4 0a1 1 0 011 1v5a1 1 0 11-2 0V9a1 1 0 011-1z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/50 p-0 backdrop-blur-sm dark:bg-black/60 sm:items-center sm:p-4">
          <div className="w-full max-w-lg rounded-t-2xl border border-ink-200 bg-white shadow-float animate-slide-in-right dark:border-ink-700 dark:bg-ink-900 sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-ink-200 px-5 py-4 dark:border-ink-700">
              <h2 className="text-base font-semibold text-ink-900 dark:text-ink-50">
                {editingId ? "Edit product" : "Add product"}
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label-text" htmlFor="p-code">Product Code</label>
                    <input
                      id="p-code"
                      type="text"
                      className={`input-field ${errors.productCode ? "input-error" : ""}`}
                      value={form.productCode}
                      onChange={(e) => update("productCode", e.target.value)}
                      placeholder="PRD-001"
                    />
                    {errors.productCode && <p className="error-text">{errors.productCode}</p>}
                  </div>
                  <div>
                    <label className="label-text" htmlFor="p-name">Product Name</label>
                    <input
                      id="p-name"
                      type="text"
                      className={`input-field ${errors.productName ? "input-error" : ""}`}
                      value={form.productName}
                      onChange={(e) => update("productName", e.target.value)}
                      placeholder="Widget Pro"
                    />
                    {errors.productName && <p className="error-text">{errors.productName}</p>}
                  </div>
                  <div>
                    <label className="label-text" htmlFor="p-category">Category</label>
                    <input
                      id="p-category"
                      type="text"
                      className={`input-field ${errors.category ? "input-error" : ""}`}
                      value={form.category}
                      onChange={(e) => update("category", e.target.value)}
                      placeholder="Electronics"
                    />
                    {errors.category && <p className="error-text">{errors.category}</p>}
                  </div>
                  <div>
                    <label className="label-text" htmlFor="p-brand">Brand</label>
                    <input
                      id="p-brand"
                      type="text"
                      className="input-field"
                      value={form.brand}
                      onChange={(e) => update("brand", e.target.value)}
                      placeholder="Acme"
                    />
                  </div>
                  <div>
                    <label className="label-text" htmlFor="p-cost">Cost Price</label>
                    <input
                      id="p-cost"
                      type="number"
                      min="0"
                      step="0.01"
                      className={`input-field ${errors.costPrice ? "input-error" : ""}`}
                      value={form.costPrice}
                      onChange={(e) => update("costPrice", e.target.value)}
                      placeholder="100.00"
                    />
                    {errors.costPrice && <p className="error-text">{errors.costPrice}</p>}
                  </div>
                  <div>
                    <label className="label-text" htmlFor="p-selling">Selling Price</label>
                    <input
                      id="p-selling"
                      type="number"
                      min="0"
                      step="0.01"
                      className={`input-field ${errors.sellingPrice ? "input-error" : ""}`}
                      value={form.sellingPrice}
                      onChange={(e) => update("sellingPrice", e.target.value)}
                      placeholder="150.00"
                    />
                    {errors.sellingPrice && <p className="error-text">{errors.sellingPrice}</p>}
                  </div>
                  <div>
                    <label className="label-text" htmlFor="p-gst">GST %</label>
                    <input
                      id="p-gst"
                      type="number"
                      min="0"
                      step="0.01"
                      className={`input-field ${errors.gstPercentage ? "input-error" : ""}`}
                      value={form.gstPercentage}
                      onChange={(e) => update("gstPercentage", e.target.value)}
                      placeholder="18"
                    />
                    {errors.gstPercentage && <p className="error-text">{errors.gstPercentage}</p>}
                  </div>
                  <div>
                    <label className="label-text" htmlFor="p-unit">Unit</label>
                    <input
                      id="p-unit"
                      type="text"
                      className="input-field"
                      value={form.unit}
                      onChange={(e) => update("unit", e.target.value)}
                      placeholder="Pcs"
                    />
                  </div>
                  <div>
                    <label className="label-text" htmlFor="p-stock">Stock Quantity</label>
                    <input
                      id="p-stock"
                      type="number"
                      min="0"
                      step="1"
                      className={`input-field ${errors.stockQuantity ? "input-error" : ""}`}
                      value={form.stockQuantity}
                      onChange={(e) => update("stockQuantity", e.target.value)}
                      placeholder="0"
                    />
                    {errors.stockQuantity && <p className="error-text">{errors.stockQuantity}</p>}
                  </div>
                  <div>
                    <label className="label-text" htmlFor="p-status">Status</label>
                    <select
                      id="p-status"
                      className="input-field"
                      value={form.status}
                      onChange={(e) => update("status", e.target.value)}
                    >
                      <option value={PRODUCT_STATUS.ACTIVE}>Active</option>
                      <option value={PRODUCT_STATUS.INACTIVE}>Inactive</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label-text" htmlFor="p-desc">Description</label>
                  <textarea
                    id="p-desc"
                    rows={3}
                    className="input-field"
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="Short product description"
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-2 border-t border-ink-100 pt-4 dark:border-ink-800">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? "Save changes" : "Create product"}
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
            <h3 className="text-center text-base font-semibold text-ink-900 dark:text-ink-50">Delete product?</h3>
            <p className="mt-2 text-center text-sm text-ink-500 dark:text-ink-400">
              Are you sure you want to delete this product?
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
