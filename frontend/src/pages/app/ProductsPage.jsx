import { useEffect, useMemo, useState } from "react";
import {
  Package,
  Plus,
  Pencil,
  Eye,
  Trash2,
  Upload,
  FileText,
  CheckCircle2,
} from "lucide-react";
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

import {
  updateProductApi,
  createProductApi,
  getProductsApi,
  getProductApi,
  bulkUploadProductsApi,
  deleteProductApi,
} from "../../services/productService";

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
  gstPercentage: "",
  description: "",
};

/* =========================================================
   PRODUCTS PAGE
========================================================= */

export default function ProductsPage() {
  const toast = useToast();

  const { effectiveRole } = useRole();

  const canManage = effectiveRole === "admin";

  const canViewMargin =
    effectiveRole === "admin" || effectiveRole === "manager";

  /* =======================================================
     STATE
  ======================================================= */

  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");

  const [catFilter, setCatFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState(empty);

  const [errors, setErrors] = useState({});

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);

  /* =======================================================
     GET ALL PRODUCTS
     
     GET /products/
     
     This loads products directly from the database.
  ======================================================= */

  const fetchProducts = async () => {
    try {
      console.log("Fetching all products...");

      const response = await getProductsApi();

      console.log("GET /products/ response:", response);

      const data = response?.data ?? response;

      const productList = Array.isArray(data)
        ? data
        : data?.products || data?.items || [];

      const formattedProducts = productList.map((product) => ({
        id: product.id ?? product.product_id,

        sku: product.sku || "",

        name: product.product_name || product.name || "",

        category: product.category || "Pumps",

        unit: product.unit || "Nos",

        costPrice: Number(product.cost_price ?? product.costPrice ?? 0),

        sellingPrice: Number(
          product.selling_price ?? product.sellingPrice ?? 0,
        ),

        gstPercentage: Number(
          product.gst_percentage ?? product.gstPercentage ?? 0,
        ),

        description: product.description || "",
      }));

      console.log("Formatted products:", formattedProducts);

      setProducts(formattedProducts);
    } catch (error) {
      console.error("Get products error:", error);

      console.error("Backend response:", error.response?.data);

      toast.error(error.response?.data?.detail || "Failed to load products.");
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      toast.error("Please select a file.");
      return;
    }

    try {
      await bulkUploadProductsApi(bulkFile);

      toast.success("Products uploaded successfully.");

      setBulkFile(null);

      await fetchProducts();
    } catch (error) {
      console.error("Bulk upload error:", error);
      console.error("Backend response:", error.response?.data);

      toast.error(error.response?.data?.detail || "Failed to upload products.");
    }
  };

  /* =======================================================
     GET ALL PRODUCTS WHEN PAGE LOADS
  ======================================================= */

  useEffect(() => {
    fetchProducts();
  }, []);

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
    setEditingProduct(null);

    setForm(empty);

    setErrors({});

    setModalOpen(true);
  };

  /* =======================================================
     OPEN EDIT PRODUCT

     GET /products/{product_id}
  ======================================================= */

  const openEdit = async (product) => {
    try {
      const productId = product.id ?? product.product_id;

      console.log("Fetching product:", productId);

      /*
        GET /products/{product_id}
      */

      const response = await getProductApi(productId);

      console.log("GET product response:", response);

      const productData = response?.data ?? response;

      console.log("Product data:", productData);

      /*
        Store the product being edited.
      */

      setEditingProduct({
        ...productData,

        /*
          Make sure id exists even if
          backend returns product_id.
        */
        id: productData.id ?? productData.product_id ?? productId,
      });

      /*
        Fill the form with backend data.
      */

      setForm({
        sku: productData.sku || "",
        name: productData.product_name || productData.name || "",
        category: productData.category || "Pumps",
        unit: productData.unit || "Nos",
        sellingPrice:
          productData.selling_price ?? productData.sellingPrice ?? "",
        costPrice: productData.cost_price ?? productData.costPrice ?? "",
        gstPercentage:
          productData.gst_percentage ?? productData.gstPercentage ?? "",
        description: productData.description || "",
      });

      setErrors({});

      setModalOpen(true);
    } catch (error) {
      console.error("Get product error:", error);

      console.error("Backend response:", error.response?.data);

      toast.error(
        error.response?.data?.detail || "Failed to load product details.",
      );
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProductApi(productId);

      // Refresh products
      await fetchProducts();
    } catch (error) {
      console.error("Delete product error:", error);
    }
  };

  const openView = async (product) => {
    try {
      const productId = product.id ?? product.product_id;

      console.log("Fetching product details:", productId);

      setViewLoading(true);
      setViewingProduct(null);
      setViewModalOpen(true);

      const response = await getProductApi(productId);

      console.log("GET product response:", response);

      const productData = response?.data ?? response;

      console.log("Product details:", productData);

      setViewingProduct({
        ...productData,
        id: productData.id ?? productData.product_id ?? productId,
      });
    } catch (error) {
      console.error("Get product details error:", error);

      console.error("Backend response:", error.response?.data);

      setViewModalOpen(false);

      toast.error(
        error.response?.data?.detail || "Failed to load product details.",
      );
    } finally {
      setViewLoading(false);
    }
  };

  /* =======================================================
     VALIDATE FORM
  ======================================================= */

  const validate = () => {
    const e = {};

    /* SKU */

    if (!form.sku.trim()) {
      e.sku = "SKU is required";
    } else {
      const duplicateSku = products.some(
        (p) =>
          p.id !== editingProduct?.id &&
          p.sku.toLowerCase() === form.sku.trim().toLowerCase(),
      );

      if (duplicateSku) {
        e.sku = "SKU already exists";
      }
    }

    /* PRODUCT NAME */

    if (!form.name.trim()) {
      e.name = "Product name is required";
    }

    /* SELLING PRICE */

    if (
      !form.sellingPrice ||
      isNaN(form.sellingPrice) ||
      Number(form.sellingPrice) <= 0
    ) {
      e.sellingPrice = "Enter a valid price";
    }

    /* COST PRICE */

    if (
      !form.costPrice ||
      isNaN(form.costPrice) ||
      Number(form.costPrice) <= 0
    ) {
      e.costPrice = "Enter a valid cost";
    }

    /* SELLING PRICE > COST PRICE */

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
     SAVE PRODUCT

     CREATE:
       POST /products/

     UPDATE:
       PUT /products/{product_id}
  ======================================================= */

  const save = async () => {
    if (!validate()) {
      return;
    }

    try {
      const payload = {
        sku: form.sku.trim(),

        category: form.category,

        product_name: form.name.trim(),

        unit: form.unit,

        cost_price: Number(form.costPrice),

        selling_price: Number(form.sellingPrice),

        gst_percentage: Number(form.gstPercentage),

        description: form.description?.trim() || "",
      };

      console.log(
        editingProduct ? "Updating product:" : "Creating product:",
        payload,
      );

      /* =================================================
         UPDATE PRODUCT
         
         PUT /products/{product_id}
      ================================================= */

      if (editingProduct) {
        const productId = editingProduct.id ?? editingProduct.product_id;

        console.log("Updating product ID:", productId);

        const response = await updateProductApi(productId, payload);

        console.log("PUT product response:", response);

        /*
          IMPORTANT:

          Don't rely on local state after
          updating.

          Get the latest data from DB.
        */

        await fetchProducts();

        toast.success("Product updated successfully.");
      } else {
        /* =================================================
         CREATE PRODUCT
         
         POST /products/
      ================================================= */
        const response = await createProductApi(payload);

        console.log("POST product response:", response);

        /*
          After creating, get the latest
          product list from the database.
        */

        await fetchProducts();

        toast.success("Product added successfully.");
      }

      /* =================================================
         RESET
      ================================================= */

      setModalOpen(false);

      setEditingProduct(null);

      setForm(empty);

      setErrors({});
    } catch (error) {
      console.error(
        editingProduct ? "Update product error:" : "Create product error:",
        error,
      );

      console.error("Backend response:", error.response?.data);

      toast.error(
        error.response?.data?.detail ||
          `Failed to ${editingProduct ? "update" : "create"} product.`,
      );
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

    ...(canViewMargin
      ? [
          {
            key: "margin",
            header: "Margin",

            render: (p) => {
              const margin = p.sellingPrice - p.costPrice;

              const percentage =
                p.sellingPrice > 0
                  ? ((margin / p.sellingPrice) * 100).toFixed(0)
                  : 0;

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
        ]
      : []),

    /* =====================================================
       ACTIONS

       ONLY EDIT BUTTON

       NO DELETE BUTTON
    ===================================================== */

    {
      key: "actions",
      header: "Actions",
      render: (p) =>
        canManage ? (
          <div className="flex items-center gap-1">
            {/* Edit */}
            <button
              type="button"
              onClick={() => openEdit(p)}
              className="p-2 text-slate-400 hover:text-brand-600 transition"
              title="Edit Product"
            >
              <Pencil size={19} />
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(`Are you sure you want to delete "${p.name}"?`)
                ) {
                  handleDeleteProduct(p.id);
                }
              }}
              className="p-2 text-slate-400 hover:text-red-600 transition"
              title="Delete Product"
            >
              <Trash2 size={19} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => openView(p)}
            className="p-2 text-slate-400 hover:text-brand-600 transition"
            title="View Product"
          >
            <Eye size={19} />
          </button>
        ),
    },
  ];

  const handleNumberChange =
    (field, max = null) =>
    (e) => {
      const value = e.target.value;

      if (
        value === "" ||
        (Number(value) >= 0 && (max === null || Number(value) <= max))
      ) {
        setForm((prev) => ({
          ...prev,
          [field]: value,
        }));
      }
    };

  return (
    <div className="space-y-6">
      {/* =================================================
          BREADCRUMBS
      ================================================= */}

      <Breadcrumbs
        items={[
          {
            label: "Products",
          },
        ]}
      />

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <PageHeader
        title="Products"
        subtitle="Manage your product catalog with pricing and margins."
        actions={
          canManage ? (
            <div className="flex items-center gap-2">
              {/* File Upload */}
              <label
                className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl
          border cursor-pointer transition-all duration-200
          ${
            bulkFile
              ? "border-brand-200 bg-brand-50 text-brand-700"
              : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-slate-50"
          }`}
              >
                {bulkFile ? (
                  <CheckCircle2 size={17} className="text-green-600" />
                ) : (
                  <FileText
                    size={17}
                    className="text-slate-500 group-hover:text-brand-600"
                  />
                )}

                <div className="flex flex-col text-left">
                  <span className="text-sm font-medium">
                    {bulkFile ? bulkFile.name : "Choose Product File"}
                  </span>

                  {!bulkFile && (
                    <span className="text-[11px] text-slate-400">
                      PDF, DOCX, JPG, PNG
                    </span>
                  )}
                </div>

                <input
                  type="file"
                  accept=".pdf,.docx,.jpg,.jpeg,.png,.bmp,.tiff,.webp"
                  className="hidden"
                  onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                />
              </label>

              {/* Bulk Upload */}
              <Button onClick={handleBulkUpload} disabled={!bulkFile}>
                <Upload size={16} />
                Bulk Upload
              </Button>

              {/* Add Product */}
              <Button onClick={openAdd}>
                <Plus size={16} />
                Add Product
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* =================================================
          SEARCH + CATEGORY FILTER
      ================================================= */}

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

      {/* =================================================
          PRODUCT TABLE
      ================================================= */}

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

      {/* =================================================
          ADD / EDIT PRODUCT MODAL
      ================================================= */}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? "Edit Product" : "Add Product"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>

            <Button onClick={save}>{editingProduct ? "Save" : "Add"}</Button>
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
            disabled={!!editingProduct}
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

          {/* <div /> */}

          {/* =================================================
              GST PERCENTAGE
          ================================================= */}

          <Input
            label="GST Percentage (%)"
            type="number"
            min="0"
            max="100"
            value={form.gstPercentage}
            onChange={handleNumberChange("gstPercentage", 100)}
            placeholder="18"
            required
          />

          {/* =================================================
              COST PRICE
          ================================================= */}

          <Input
            label="Cost Price (₹)"
            type="number"
            min="0"
            value={form.costPrice}
            onChange={handleNumberChange("costPrice")}
            error={errors.costPrice}
            required
          />

          {/* =================================================
              SELLING PRICE
          ================================================= */}

          <Input
            label="Selling Price (₹)"
            type="number"
            min="0"
            value={form.sellingPrice}
            onChange={handleNumberChange("sellingPrice")}
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
      <Modal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setViewingProduct(null);
        }}
        title="Product Details"
        size="lg"
      >
        {viewLoading ? (
          <div className="py-10 text-center text-slate-500">
            Loading product details...
          </div>
        ) : viewingProduct ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">SKU</p>
              <p className="font-medium text-slate-800 dark:text-slate-100">
                {viewingProduct.sku || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">Category</p>
              <p className="font-medium text-slate-800 dark:text-slate-100">
                {viewingProduct.category || "—"}
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-xs text-slate-500 mb-1">Product Name</p>
              <p className="font-medium text-slate-800 dark:text-slate-100">
                {viewingProduct.product_name || viewingProduct.name || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">Unit</p>
              <p className="font-medium text-slate-800 dark:text-slate-100">
                {viewingProduct.unit || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">GST Percentage</p>
              <p className="font-medium text-slate-800 dark:text-slate-100">
                {viewingProduct.gst_percentage ??
                  viewingProduct.gstPercentage ??
                  0}
                %
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">Cost Price</p>
              <p className="font-medium text-slate-800 dark:text-slate-100">
                {formatINR(
                  Number(
                    viewingProduct.cost_price ?? viewingProduct.costPrice ?? 0,
                  ),
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">Selling Price</p>
              <p className="font-medium text-slate-800 dark:text-slate-100">
                {formatINR(
                  Number(
                    viewingProduct.selling_price ??
                      viewingProduct.sellingPrice ??
                      0,
                  ),
                )}
              </p>
            </div>

            {/* <div>
              <p className="text-xs text-slate-500 mb-1">Margin</p>

              {(() => {
                const cost = Number(
                  viewingProduct.cost_price ?? viewingProduct.costPrice ?? 0,
                );

                const selling = Number(
                  viewingProduct.selling_price ??
                    viewingProduct.sellingPrice ??
                    0,
                );

                const margin = selling - cost;

                const percentage =
                  selling > 0 ? ((margin / selling) * 100).toFixed(0) : 0;

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
              })()}
            </div> */}

            <div className="sm:col-span-2">
              <p className="text-xs text-slate-500 mb-1">Description</p>

              <p className="text-sm text-slate-700 dark:text-slate-300">
                {viewingProduct.description || "No description available."}
              </p>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
