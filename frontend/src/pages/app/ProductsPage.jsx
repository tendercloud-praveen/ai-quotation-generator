// import { useMemo, useState } from 'react';
// import { Package, Plus, Pencil, Trash2, Eye } from 'lucide-react';
// import PageHeader from '../../components/PageHeader';
// import Breadcrumbs from '../../components/Breadcrumbs';
// import { Card } from '../../components/Card';
// import Button from '../../components/Button';
// import Modal from '../../components/Modal';
// import { Input, Select, Textarea } from '../../components/Field';
// import Badge from '../../components/Badge';
// import DataTable from '../../components/DataTable';
// import SearchBar from '../../components/SearchBar';
// import EmptyState from '../../components/EmptyState';
// import { ConfirmDialog } from '../../components/ConfirmDialog';
// import { useToast } from '../../components/Toast';
// import { useStore } from '../../lib/useStore';
// import { getProducts, addProduct, updateProduct, deleteProduct, CATEGORIES, UNITS } from '../../lib/data';
// import { formatINR } from '../../lib/validate';
// import { useRole } from '../../lib/RoleContext';

// const empty = { sku: '', name: '', category: 'Pumps', unit: 'Nos', sellingPrice: '', costPrice: '', description: '' };

// export default function ProductsPage() {
//   useStore(() => {});
//   const toast = useToast();
//   const { effectiveRole } = useRole();
//   const canManage = effectiveRole === 'admin';
//   const [search, setSearch] = useState('');
//   const [catFilter, setCatFilter] = useState('all');
//   const [modalOpen, setModalOpen] = useState(false);
//   const [editing, setEditing] = useState(null);
//   const [form, setForm] = useState(empty);
//   const [errors, setErrors] = useState({});
//   const [deleteId, setDeleteId] = useState(null);
//   const [viewProduct, setViewProduct] = useState(null);

//   const products = getProducts();

//   const filtered = useMemo(() => {
//     return products.filter((p) => {
//       const matches = !search || p.sku.toLowerCase().includes(search.toLowerCase()) || p.name.toLowerCase().includes(search.toLowerCase());
//       const catOk = catFilter === 'all' || p.category === catFilter;
//       return matches && catOk;
//     });
//   }, [products, search, catFilter]);

//   const openAdd = () => { setEditing(null); setForm(empty); setErrors({}); setModalOpen(true); };
//   const openEdit = (p) => { setEditing(p); setForm({ ...p }); setErrors({}); setModalOpen(true); };

//   const validate = () => {
//     const e = {};
//     if (!form.sku.trim()) e.sku = 'SKU is required';
//     else if (!editing && products.find((p) => p.sku.toLowerCase() === form.sku.toLowerCase())) e.sku = 'SKU already exists';
//     if (!form.name.trim()) e.name = 'Product name is required';
//     if (!form.sellingPrice || isNaN(form.sellingPrice) || +form.sellingPrice <= 0) e.sellingPrice = 'Enter a valid price';
//     if (!form.costPrice || isNaN(form.costPrice) || +form.costPrice <= 0) e.costPrice = 'Enter a valid cost';
//     if (+form.costPrice >= +form.sellingPrice) e.sellingPrice = 'Selling price must exceed cost price';
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const save = () => {
//     if (!validate()) return;
//     const payload = { ...form, sellingPrice: +form.sellingPrice, costPrice: +form.costPrice };
//     if (editing) { updateProduct(editing.id, payload); toast.success('Product updated.'); }
//     else { addProduct(payload); toast.success('Product added.'); }
//     setModalOpen(false);
//   };

//   const remove = () => { deleteProduct(deleteId); toast.success('Product deleted.'); setDeleteId(null); };

//   const columns = [
//     { key: 'sku', header: 'SKU', sortable: true, render: (p) => <span className="font-mono font-medium text-brand-600 dark:text-brand-400">{p.sku}</span> },
//     { key: 'name', header: 'Product', sortable: true, render: (p) => (
//       <div>
//         <p className="font-medium text-slate-700 dark:text-slate-200">{p.name}</p>
//         <p className="text-xs text-slate-400 truncate max-w-[200px]">{p.description}</p>
//       </div>
//     )},
//     { key: 'category', header: 'Category', sortable: true, render: (p) => <Badge tone="info">{p.category}</Badge> },
//     { key: 'unit', header: 'Unit', render: (p) => <span className="text-slate-500 dark:text-slate-400">{p.unit}</span> },
//     { key: 'costPrice', header: 'Cost', sortable: true, render: (p) => <span className="text-slate-600 dark:text-slate-300">{formatINR(p.costPrice)}</span> },
//     { key: 'sellingPrice', header: 'Selling', sortable: true, render: (p) => <span className="font-semibold text-slate-700 dark:text-slate-200">{formatINR(p.sellingPrice)}</span> },
//     { key: 'margin', header: 'Margin', render: (p) => {
//       const m = p.sellingPrice - p.costPrice;
//       const pct = ((m / p.sellingPrice) * 100).toFixed(0);
//       return <Badge tone={+pct >= 30 ? 'success' : +pct >= 15 ? 'warning' : 'danger'}>{formatINR(m)} ({pct}%)</Badge>;
//     }},
//   ];

//   return (
//     <div className="space-y-6">
//       <Breadcrumbs items={[{ label: 'Products' }]} />
//       <PageHeader title="Products" subtitle="Manage your product catalog with pricing and margins." actions={canManage ? <Button onClick={openAdd}><Plus size={16} /> Add Product</Button> : undefined} />

//       <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
//         <SearchBar value={search} onChange={setSearch} placeholder="Search by SKU or name…" />
//         <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
//           <button onClick={() => setCatFilter('all')} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${catFilter === 'all' ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>All</button>
//           {CATEGORIES.map((c) => (
//             <button key={c} onClick={() => setCatFilter(c)} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${catFilter === c ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>{c}</button>
//           ))}
//         </div>
//       </div>

//       <Card>
//         {filtered.length === 0 ? (
//           <EmptyState icon={Package} title="No products found" description={canManage ? 'Add your first product to start generating quotations.' : 'No products in the catalog yet.'} action={canManage ? <Button onClick={openAdd}><Plus size={16} /> Add Product</Button> : undefined} />
//         ) : (
//           <DataTable columns={columns} rows={filtered} pageSize={8} actions={(p) => (
//             <div className="flex items-center justify-end gap-1">
//               {!canManage && (
//                 <button onClick={() => setViewProduct(p)} className="p-1.5 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/40 transition" title="View"><Eye size={16} /></button>
//               )}
//               {canManage && (
//                 <>
//                   <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/40 transition" title="Edit"><Pencil size={16} /></button>
//                   <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 transition" title="Delete"><Trash2 size={16} /></button>
//                 </>
//               )}
//             </div>
//           )} />
//         )}
//       </Card>

//       <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'} size="lg" footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button onClick={save}>{editing ? 'Save' : 'Add'}</Button></>}>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <Input label="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} error={errors.sku} placeholder="CMP-150" required />
//           <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
//             {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
//           </Select>
//           <div className="sm:col-span-2">
//             <Input label="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} placeholder="Centrifugal Monoblock Pump 1.5HP" required />
//           </div>
//           <Select label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
//             {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
//           </Select>
//           <div />
//           <Input label="Cost Price (₹)" type="number" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} error={errors.costPrice} required />
//           <Input label="Selling Price (₹)" type="number" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} error={errors.sellingPrice} required />
//           <div className="sm:col-span-2">
//             <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
//           </div>
//         </div>
//       </Modal>

//       <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={remove} title="Delete product?" message="This product will be removed from the catalog." confirmLabel="Delete" />

//       {/* View-only modal for non-admins */}
//       <Modal open={!!viewProduct} onClose={() => setViewProduct(null)} title="Product Details" size="md" footer={<Button variant="secondary" onClick={() => setViewProduct(null)}>Close</Button>}>
//         {viewProduct && (
//           <div className="space-y-4">
//             <div className="flex items-center gap-3">
//               <div className="grid place-items-center h-12 w-12 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400"><Package size={22} /></div>
//               <div>
//                 <p className="font-semibold text-slate-800 dark:text-slate-100">{viewProduct.name}</p>
//                 <p className="text-xs font-mono text-brand-600 dark:text-brand-400">{viewProduct.sku}</p>
//               </div>
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div><p className="text-xs text-slate-400">Category</p><Badge tone="info">{viewProduct.category}</Badge></div>
//               <div><p className="text-xs text-slate-400">Unit</p><p className="text-sm font-medium text-slate-700 dark:text-slate-200">{viewProduct.unit}</p></div>
//               <div><p className="text-xs text-slate-400">Cost Price</p><p className="text-sm font-medium text-slate-700 dark:text-slate-200">{formatINR(viewProduct.costPrice)}</p></div>
//               <div><p className="text-xs text-slate-400">Selling Price</p><p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{formatINR(viewProduct.sellingPrice)}</p></div>
//               <div className="col-span-2"><p className="text-xs text-slate-400">Margin</p><Badge tone="success">{formatINR(viewProduct.sellingPrice - viewProduct.costPrice)} ({(((viewProduct.sellingPrice - viewProduct.costPrice) / viewProduct.sellingPrice) * 100).toFixed(0)}%)</Badge></div>
//               {viewProduct.description && <div className="col-span-2"><p className="text-xs text-slate-400">Description</p><p className="text-sm text-slate-600 dark:text-slate-300">{viewProduct.description}</p></div>}
//             </div>
//           </div>
//         )}
//       </Modal>
//     </div>
//   );
// }

import { useMemo, useState } from "react";
import { Package, Plus } from "lucide-react";

import PageHeader from "../../components/PageHeader";
import Breadcrumbs from "../../components/Breadcrumbs";
import { Card } from "../../components/Card";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { Input, Select, Textarea } from "../../components/Field";
import Badge from "../../components/Badge";
import DataTable from "../../components/DataTable";
import EmptyState from "../../components/EmptyState";
import { useToast } from "../../components/Toast";
import { formatINR } from "../../lib/validate";
import { useRole } from "../../lib/RoleContext";

import { createProductApi } from "../../services/userService";

import SearchBar from "../../components/SearchBar";

/* =========================================================
   PRODUCT OPTIONS
========================================================= */

const CATEGORIES = [
  "Pumps",
  "Motors",
  "Electrical",
  "Plumbing",
  "Tools",
  "Hardware",
  "Other",
];

const UNITS = ["Nos", "Kg", "Meter", "Box", "Set", "Piece", "Litre"];

/* =========================================================
   EMPTY FORM
========================================================= */

const empty = {
  sku: "",
  name: "",
  category: "Pumps",
  unit: "Nos",
  sellingPrice: "",
  costPrice: "",
  description: "",
};

/* =========================================================
   PRODUCTS PAGE
========================================================= */

export default function ProductsPage() {
  const toast = useToast();

  const { effectiveRole } = useRole();

  const canManage = effectiveRole === "admin";

  /* =======================================================
     STATE
  ======================================================= */

  // Products currently displayed in the UI.
  //
  // NOTE:
  // There is intentionally NO GET API yet.
  // Therefore this array is only updated when a product
  // is successfully created during this page session.
  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");

  const [catFilter, setCatFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState(empty);

  const [errors, setErrors] = useState({});

  /* =======================================================
     FILTER PRODUCTS
  ======================================================= */

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const searchValue = search.toLowerCase().trim();

      const matches =
        !searchValue ||
        p.sku.toLowerCase().includes(searchValue) ||
        p.name.toLowerCase().includes(searchValue);

      const catOk = catFilter === "all" || p.category === catFilter;

      return matches && catOk;
    });
  }, [products, search, catFilter]);

  /* =======================================================
     OPEN ADD PRODUCT MODAL
  ======================================================= */

  const openAdd = () => {
    setForm(empty);

    setErrors({});

    setModalOpen(true);
  };

  /* =======================================================
     VALIDATE FORM
  ======================================================= */

  const validate = () => {
    const e = {};

    // SKU
    if (!form.sku.trim()) {
      e.sku = "SKU is required";
    } else {
      const duplicateSku = products.some(
        (p) => p.sku.toLowerCase() === form.sku.trim().toLowerCase(),
      );

      if (duplicateSku) {
        e.sku = "SKU already exists";
      }
    }

    // Product name
    if (!form.name.trim()) {
      e.name = "Product name is required";
    }

    // Selling price
    if (
      !form.sellingPrice ||
      isNaN(form.sellingPrice) ||
      Number(form.sellingPrice) <= 0
    ) {
      e.sellingPrice = "Enter a valid price";
    }

    // Cost price
    if (
      !form.costPrice ||
      isNaN(form.costPrice) ||
      Number(form.costPrice) <= 0
    ) {
      e.costPrice = "Enter a valid cost";
    }

    // Selling price should be greater than cost price
    if (
      form.costPrice &&
      form.sellingPrice &&
      Number(form.costPrice) >= Number(form.sellingPrice)
    ) {
      e.sellingPrice = "Selling price must exceed cost price";
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  };

  /* =======================================================
     CREATE PRODUCT
  ======================================================= */

  const save = async () => {
    if (!validate()) {
      return;
    }

    try {
      /*
       * IMPORTANT:
       *
       * These field names must match the FastAPI schema:
       *
       * sku
       * category
       * product_name
       * unit
       * cost_price
       * selling_price
       * description
       */

      const payload = {
        sku: form.sku.trim(),

        category: form.category,

        product_name: form.name.trim(),

        unit: form.unit,

        cost_price: Number(form.costPrice),

        selling_price: Number(form.sellingPrice),

        description: form.description?.trim() || "",
      };

      console.log("Creating product:", payload);

      /*
       * POST /products/
       */
      const response = await createProductApi(payload);

      console.log("Create product response:", response);

      /*
       * Backend successfully created the product.
       *
       * Add it to the current page so the user can
       * immediately see the newly created product.
       */

      const createdProduct = response?.data || response;

      const productForTable = {
        id: createdProduct?.id || Date.now(),

        sku: createdProduct?.sku || payload.sku,

        name: createdProduct?.product_name || payload.product_name,

        category: createdProduct?.category || payload.category,

        unit: createdProduct?.unit || payload.unit,

        costPrice: Number(createdProduct?.cost_price ?? payload.cost_price),

        sellingPrice: Number(
          createdProduct?.selling_price ?? payload.selling_price,
        ),

        description: createdProduct?.description ?? payload.description,
      };

      setProducts((previous) => [...previous, productForTable]);

      toast.success("Product added successfully.");

      // Close modal
      setModalOpen(false);

      // Reset form
      setForm(empty);

      setErrors({});
    } catch (error) {
      console.error("Create product error:", error);

      console.error("Backend response:", error.response?.data);

      toast.error(error.response?.data?.detail || "Failed to create product.");
    }
  };

  /* =======================================================
     TABLE COLUMNS
  ======================================================= */

  const columns = [
    {
      key: "sku",

      header: "SKU",

      sortable: true,

      render: (p) => (
        <span className="font-mono font-medium text-brand-600 dark:text-brand-400">
          {p.sku}
        </span>
      ),
    },

    {
      key: "name",

      header: "Product",

      sortable: true,

      render: (p) => (
        <div>
          <p className="font-medium text-slate-700 dark:text-slate-200">
            {p.name}
          </p>

          {p.description && (
            <p className="text-xs text-slate-400 truncate max-w-[200px]">
              {p.description}
            </p>
          )}
        </div>
      ),
    },

    {
      key: "category",

      header: "Category",

      sortable: true,

      render: (p) => <Badge tone="info">{p.category}</Badge>,
    },

    {
      key: "unit",

      header: "Unit",

      render: (p) => (
        <span className="text-slate-500 dark:text-slate-400">{p.unit}</span>
      ),
    },

    {
      key: "costPrice",

      header: "Cost",

      sortable: true,

      render: (p) => (
        <span className="text-slate-600 dark:text-slate-300">
          {formatINR(p.costPrice)}
        </span>
      ),
    },

    {
      key: "sellingPrice",

      header: "Selling",

      sortable: true,

      render: (p) => (
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          {formatINR(p.sellingPrice)}
        </span>
      ),
    },

    {
      key: "margin",

      header: "Margin",

      render: (p) => {
        const margin = p.sellingPrice - p.costPrice;

        const percentage =
          p.sellingPrice > 0 ? ((margin / p.sellingPrice) * 100).toFixed(0) : 0;

        return (
          <Badge
            tone={
              Number(percentage) >= 30
                ? "success"
                : Number(percentage) >= 15
                  ? "warning"
                  : "danger"
            }
          >
            {formatINR(margin)} ({percentage}%)
          </Badge>
        );
      },
    },
  ];

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="space-y-6">
      {/* ===================================================
          BREADCRUMBS
      =================================================== */}

      <Breadcrumbs
        items={[
          {
            label: "Products",
          },
        ]}
      />

      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <PageHeader
        title="Products"
        subtitle="Manage your product catalog with pricing and margins."
        actions={
          canManage ? (
            <Button onClick={openAdd}>
              <Plus size={16} />
              Add Product
            </Button>
          ) : undefined
        }
      />

      {/* ===================================================
          SEARCH + CATEGORY FILTER
      =================================================== */}

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by SKU or name…"
        />

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {/* ALL */}

          <button
            onClick={() => setCatFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              catFilter === "all"
                ? "bg-brand-600 text-white"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            }`}
          >
            All
          </button>

          {/* CATEGORIES */}

          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setCatFilter(category)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                catFilter === category
                  ? "bg-brand-600 text-white"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* ===================================================
          PRODUCT TABLE
      =================================================== */}

      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description={
              canManage
                ? "Add your first product to start generating quotations."
                : "No products in the catalog yet."
            }
            action={
              canManage ? (
                <Button onClick={openAdd}>
                  <Plus size={16} />
                  Add Product
                </Button>
              ) : undefined
            }
          />
        ) : (
          <DataTable columns={columns} rows={filtered} pageSize={8} />
        )}
      </Card>

      {/* ===================================================
          ADD PRODUCT MODAL
      =================================================== */}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Product"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>

            <Button onClick={save}>Add</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* =================================================
              SKU
          ================================================= */}

          <Input
            label="SKU"
            value={form.sku}
            onChange={(e) =>
              setForm({
                ...form,
                sku: e.target.value,
              })
            }
            error={errors.sku}
            placeholder="CMP-150"
            required
          />

          {/* =================================================
              CATEGORY
          ================================================= */}

          <Select
            label="Category"
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value,
              })
            }
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>

          {/* =================================================
              PRODUCT NAME
          ================================================= */}

          <div className="sm:col-span-2">
            <Input
              label="Product Name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              error={errors.name}
              placeholder="Centrifugal Monoblock Pump 1.5HP"
              required
            />
          </div>

          {/* =================================================
              UNIT
          ================================================= */}

          <Select
            label="Unit"
            value={form.unit}
            onChange={(e) =>
              setForm({
                ...form,
                unit: e.target.value,
              })
            }
          >
            {UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </Select>

          {/* EMPTY COLUMN */}

          <div />

          {/* =================================================
              COST PRICE
          ================================================= */}

          <Input
            label="Cost Price (₹)"
            type="number"
            value={form.costPrice}
            onChange={(e) =>
              setForm({
                ...form,
                costPrice: e.target.value,
              })
            }
            error={errors.costPrice}
            required
          />

          {/* =================================================
              SELLING PRICE
          ================================================= */}

          <Input
            label="Selling Price (₹)"
            type="number"
            value={form.sellingPrice}
            onChange={(e) =>
              setForm({
                ...form,
                sellingPrice: e.target.value,
              })
            }
            error={errors.sellingPrice}
            required
          />

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <div className="sm:col-span-2">
            <Textarea
              label="Description"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
              rows={3}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
