// import { useMemo, useState } from "react";
// import {
//   Building2,
//   Plus,
//   Pencil,
//   Trash2,
//   Mail,
//   Phone,
//   MapPin,
// } from "lucide-react";
// import PageHeader from "../../components/PageHeader";
// import Breadcrumbs from "../../components/Breadcrumbs";
// import { Card } from "../../components/Card";
// import Button from "../../components/Button";
// import Modal from "../../components/Modal";
// import { Input, Textarea } from "../../components/Field";
// import DataTable from "../../components/DataTable";
// import SearchBar from "../../components/SearchBar";
// import EmptyState from "../../components/EmptyState";
// import { ConfirmDialog } from "../../components/ConfirmDialog";
// import { useToast } from "../../components/Toast";
// import { useStore } from "../../lib/useStore";
// import {
//   getCustomers,
//   addCustomer,
//   updateCustomer,
//   deleteCustomer,
// } from "../../lib/data";
// import { validateEmail, validateMobile, formatDate } from "../../lib/validate";

// const empty = {
//   name: "",
//   contactPerson: "",
//   email: "",
//   mobile: "",
//   address: "",
// };

// export default function CustomersPage() {
//   useStore(() => {});
//   const toast = useToast();
//   const [search, setSearch] = useState("");
//   const [modalOpen, setModalOpen] = useState(false);
//   const [editing, setEditing] = useState(null);
//   const [form, setForm] = useState(empty);
//   const [errors, setErrors] = useState({});
//   const [deleteId, setDeleteId] = useState(null);

//   const customers = getCustomers();

//   const filtered = useMemo(() => {
//     return customers.filter(
//       (c) =>
//         !search ||
//         c.name.toLowerCase().includes(search.toLowerCase()) ||
//         c.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
//         c.email.toLowerCase().includes(search.toLowerCase()),
//     );
//   }, [customers, search]);

//   const openAdd = () => {
//     setEditing(null);
//     setForm(empty);
//     setErrors({});
//     setModalOpen(true);
//   };
//   const openEdit = (c) => {
//     setEditing(c);
//     setForm({ ...c });
//     setErrors({});
//     setModalOpen(true);
//   };

//   const validate = () => {
//     const e = {};
//     if (!form.name.trim()) e.name = "Company name is required";
//     if (!form.contactPerson.trim())
//       e.contactPerson = "Contact person is required";
//     if (!form.email.trim()) e.email = "Email is required";
//     else if (!validateEmail(form.email)) e.email = "Invalid email";
//     if (!form.mobile.trim()) e.mobile = "Mobile is required";
//     else if (!validateMobile(form.mobile)) e.mobile = "Must be 10 digits";
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const save = () => {
//     if (!validate()) return;
//     if (editing) {
//       updateCustomer(editing.id, form);
//       toast.success("Customer updated.");
//     } else {
//       addCustomer(form);
//       toast.success("Customer added.");
//     }
//     setModalOpen(false);
//   };

//   const remove = () => {
//     deleteCustomer(deleteId);
//     toast.success("Customer deleted.");
//     setDeleteId(null);
//   };

//   const columns = [
//     {
//       key: "name",
//       header: "Customer",
//       sortable: true,
//       render: (c) => (
//         <div>
//           <p className="font-medium text-slate-700 dark:text-slate-200">
//             {c.name}
//           </p>
//           <p className="text-xs text-slate-400">{c.contactPerson}</p>
//         </div>
//       ),
//     },
//     {
//       key: "email",
//       header: "Email",
//       render: (c) => (
//         <span className="text-slate-600 dark:text-slate-300">{c.email}</span>
//       ),
//     },
//     {
//       key: "mobile",
//       header: "Mobile",
//       render: (c) => (
//         <span className="text-slate-600 dark:text-slate-300">{c.mobile}</span>
//       ),
//     },
//     {
//       key: "address",
//       header: "Address",
//       render: (c) => (
//         <span className="text-slate-500 dark:text-slate-400 truncate max-w-[200px] block">
//           {c.address}
//         </span>
//       ),
//     },
//     {
//       key: "createdAt",
//       header: "Added",
//       sortable: true,
//       render: (c) => (
//         <span className="text-slate-500 dark:text-slate-400">
//           {formatDate(c.createdAt)}
//         </span>
//       ),
//     },
//   ];

//   return (
//     <div className="space-y-6">
//       <Breadcrumbs items={[{ label: "Customers" }]} />
//       <PageHeader
//         title="Customers"
//         subtitle="Manage your customer directory."
//         actions={
//           <Button onClick={openAdd}>
//             <Plus size={16} /> Add Customer
//           </Button>
//         }
//       />

//       <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
//         <SearchBar
//           value={search}
//           onChange={setSearch}
//           placeholder="Search customers…"
//         />
//       </div>

//       <Card>
//         {filtered.length === 0 ? (
//           <EmptyState
//             icon={Building2}
//             title="No customers found"
//             description="Add your first customer to begin creating inquiries."
//             action={
//               <Button onClick={openAdd}>
//                 <Plus size={16} /> Add Customer
//               </Button>
//             }
//           />
//         ) : (
//           <DataTable
//             columns={columns}
//             rows={filtered}
//             pageSize={8}
//             actions={(c) => (
//               <div className="flex items-center justify-end gap-1">
//                 <button
//                   onClick={() => openEdit(c)}
//                   className="p-1.5 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/40 transition"
//                 >
//                   <Pencil size={16} />
//                 </button>
//                 <button
//                   onClick={() => setDeleteId(c.id)}
//                   className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 transition"
//                 >
//                   <Trash2 size={16} />
//                 </button>
//               </div>
//             )}
//           />
//         )}
//       </Card>

//       <Modal
//         open={modalOpen}
//         onClose={() => setModalOpen(false)}
//         title={editing ? "Edit Customer" : "Add Customer"}
//         size="lg"
//         footer={
//           <>
//             <Button variant="secondary" onClick={() => setModalOpen(false)}>
//               Cancel
//             </Button>
//             <Button onClick={save}>{editing ? "Save" : "Add"}</Button>
//           </>
//         }
//       >
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <div className="sm:col-span-2">
//             <Input
//               label="Company Name"
//               value={form.name}
//               onChange={(e) => setForm({ ...form, name: e.target.value })}
//               error={errors.name}
//               required
//             />
//           </div>
//           <Input
//             label="Contact Person"
//             value={form.contactPerson}
//             onChange={(e) =>
//               setForm({ ...form, contactPerson: e.target.value })
//             }
//             error={errors.contactPerson}
//             required
//           />
//           <Input
//             label="Email"
//             type="email"
//             value={form.email}
//             onChange={(e) => setForm({ ...form, email: e.target.value })}
//             error={errors.email}
//             required
//           />
//           <Input
//             label="Mobile"
//             maxLength={10}
//             value={form.mobile}
//             onChange={(e) =>
//               setForm({
//                 ...form,
//                 mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
//               })
//             }
//             error={errors.mobile}
//             required
//           />
//           <div />
//           <div className="sm:col-span-2">
//             <Textarea
//               label="Address"
//               value={form.address}
//               onChange={(e) => setForm({ ...form, address: e.target.value })}
//               rows={2}
//             />
//           </div>
//         </div>
//       </Modal>

//       <ConfirmDialog
//         open={!!deleteId}
//         onClose={() => setDeleteId(null)}
//         onConfirm={remove}
//         title="Delete customer?"
//         message="This customer will be removed from the directory."
//         confirmLabel="Delete"
//       />
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from "react";
import { Building2, Plus, Pencil, Trash2 } from "lucide-react";

import PageHeader from "../../components/PageHeader";
import Breadcrumbs from "../../components/Breadcrumbs";
import { Card } from "../../components/Card";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { Input, Textarea } from "../../components/Field";
import DataTable from "../../components/DataTable";
import SearchBar from "../../components/SearchBar";
import EmptyState from "../../components/EmptyState";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { useToast } from "../../components/Toast";

import {
  getCustomersApi,
  getCustomerApi,
  createCustomerApi,
  updateCustomerApi,
  deleteCustomerApi,
} from "../../services/customerService";

import { validateEmail, validateMobile, formatDate } from "../../lib/validate";

// ============================================================
// EMPTY FORM
// ============================================================

const empty = {
  name: "",
  contactPerson: "",
  email: "",
  mobile: "",
  address: "",
};

// ============================================================
// CUSTOMERS PAGE
// ============================================================

export default function CustomersPage() {
  const toast = useToast();

  // ==========================================================
  // STATE
  // ==========================================================

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState(empty);

  const [errors, setErrors] = useState({});

  const [deleteId, setDeleteId] = useState(null);

  // Customers now come from API/DB
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(false);

  // ==========================================================
  // GET ALL CUSTOMERS
  // ==========================================================

  const loadCustomers = async () => {
    try {
      setLoading(true);

      const response = await getCustomersApi();

      console.log("GET /customers/ response:", response);

      const data = response?.data ?? [];

      // Backend:
      //
      // company_name
      // contact_person
      //
      // Frontend:
      //
      // name
      // contactPerson

      const mappedCustomers = data.map((customer) => ({
        id: customer.id,

        name: customer.company_name ?? "",

        contactPerson: customer.contact_person ?? "",

        email: customer.email ?? "",

        mobile: customer.mobile ?? "",

        address: customer.address ?? "",

        // Backend currently does not return createdAt
        // so we don't invent a date.
        createdAt: customer.created_at ?? customer.createdAt ?? null,
      }));

      setCustomers(mappedCustomers);
    } catch (error) {
      console.error("Failed to load customers:", error);

      toast.error(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Failed to load customers.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // LOAD CUSTOMERS WHEN PAGE OPENS
  // ==========================================================

  useEffect(() => {
    loadCustomers();
  }, []);

  // ==========================================================
  // SEARCH / FILTER
  // ==========================================================

  const filtered = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return customers;
    }

    return customers.filter((c) =>
      [c.name, c.contactPerson, c.email, c.mobile, c.address]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(searchValue)),
    );
  }, [customers, search]);

  // ==========================================================
  // OPEN ADD CUSTOMER MODAL
  // ==========================================================

  const openAdd = () => {
    setEditing(null);

    setForm({
      ...empty,
    });

    setErrors({});

    setModalOpen(true);
  };

  // ==========================================================
  // GET CUSTOMER BY ID + OPEN EDIT
  // ==========================================================

  const openEdit = async (customer) => {
    try {
      setLoading(true);

      const response = await getCustomerApi(customer.id);

      console.log("GET /customers/:id response:", response);

      const data = response?.data ?? response;

      const customerData = {
        id: data.id,

        name: data.company_name ?? "",

        contactPerson: data.contact_person ?? "",

        email: data.email ?? "",

        mobile: data.mobile ?? "",

        address: data.address ?? "",

        createdAt: data.created_at ?? data.createdAt ?? null,
      };

      setEditing(customerData);

      setForm({
        name: customerData.name,

        contactPerson: customerData.contactPerson,

        email: customerData.email,

        mobile: customerData.mobile,

        address: customerData.address,
      });

      setErrors({});

      setModalOpen(true);
    } catch (error) {
      console.error("Failed to load customer:", error);

      toast.error(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Failed to load customer.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validate = () => {
    const e = {};

    if (!form.name.trim()) {
      e.name = "Company name is required";
    }

    if (!form.contactPerson.trim()) {
      e.contactPerson = "Contact person is required";
    }

    if (!form.email.trim()) {
      e.email = "Email is required";
    } else if (!validateEmail(form.email)) {
      e.email = "Invalid email";
    }

    if (!form.mobile.trim()) {
      e.mobile = "Mobile is required";
    } else if (!validateMobile(form.mobile)) {
      e.mobile = "Must be 10 digits";
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  };

  // ==========================================================
  // CREATE / UPDATE CUSTOMER
  // ==========================================================

  const save = async () => {
    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      // Convert frontend fields to backend fields
      const payload = {
        company_name: form.name.trim(),

        contact_person: form.contactPerson.trim(),

        email: form.email.trim(),

        mobile: form.mobile.trim(),

        address: form.address.trim(),
      };

      console.log("Customer API payload:", payload);

      // ======================================================
      // UPDATE
      // ======================================================

      if (editing) {
        const response = await updateCustomerApi(editing.id, payload);

        console.log("PUT /customers/:id response:", response);

        toast.success("Customer updated.");
      }

      // ======================================================
      // CREATE
      // ======================================================
      else {
        const response = await createCustomerApi(payload);

        console.log("POST /customers/ response:", response);

        toast.success("Customer added.");
      }

      // ======================================================
      // REFRESH FROM DATABASE
      // ======================================================

      await loadCustomers();

      // ======================================================
      // CLOSE MODAL
      // ======================================================

      setModalOpen(false);

      setEditing(null);

      setForm({
        ...empty,
      });

      setErrors({});
    } catch (error) {
      console.error("Failed to save customer:", error);

      toast.error(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Failed to save customer.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // DELETE CUSTOMER
  // ==========================================================

  const remove = async () => {
    if (!deleteId) {
      return;
    }

    try {
      setLoading(true);

      const response = await deleteCustomerApi(deleteId);

      console.log("DELETE /customers/:id response:", response);

      toast.success("Customer deleted.");

      setDeleteId(null);

      // ======================================================
      // REFRESH FROM DATABASE
      // ======================================================

      await loadCustomers();
    } catch (error) {
      console.error("Failed to delete customer:", error);

      toast.error(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Failed to delete customer.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // TABLE COLUMNS
  // ==========================================================

  const columns = [
    {
      key: "name",

      header: "Customer",

      sortable: true,

      render: (c) => (
        <div>
          <p className="font-medium text-slate-700 dark:text-slate-200">
            {c.name}
          </p>

          <p className="text-xs text-slate-400">{c.contactPerson || "-"}</p>
        </div>
      ),
    },

    {
      key: "email",

      header: "Email",

      render: (c) => (
        <span className="text-slate-600 dark:text-slate-300">
          {c.email || "-"}
        </span>
      ),
    },

    {
      key: "mobile",

      header: "Mobile",

      render: (c) => (
        <span className="text-slate-600 dark:text-slate-300">
          {c.mobile || "-"}
        </span>
      ),
    },

    {
      key: "address",

      header: "Address",

      render: (c) => (
        <span className="text-slate-500 dark:text-slate-400 truncate max-w-[200px] block">
          {c.address || "-"}
        </span>
      ),
    },

    {
      key: "createdAt",

      header: "Added",

      sortable: true,

      render: (c) => (
        <span className="text-slate-500 dark:text-slate-400">
          {c.createdAt ? formatDate(c.createdAt) : "-"}
        </span>
      ),
    },
  ];

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="space-y-6">
      {/* ====================================================
          BREADCRUMBS
      ==================================================== */}

      <Breadcrumbs
        items={[
          {
            label: "Customers",
          },
        ]}
      />

      {/* ====================================================
          PAGE HEADER
      ==================================================== */}

      <PageHeader
        title="Customers"
        subtitle="Manage your customer directory."
        actions={
          <Button onClick={openAdd} disabled={loading}>
            <Plus size={16} />
            Add Customer
          </Button>
        }
      />

      {/* ====================================================
          SEARCH
      ==================================================== */}

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search customers…"
        />
      </div>

      {/* ====================================================
          CUSTOMER TABLE
      ==================================================== */}

      <Card>
        {/* ==================================================
            INITIAL LOADING
        ================================================== */}

        {loading && customers.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-sm text-slate-500">Loading customers...</div>
          </div>
        ) : filtered.length === 0 ? (
          /* ==================================================
             EMPTY STATE
          ================================================== */

          <EmptyState
            icon={Building2}
            title="No customers found"
            description="Add your first customer to begin creating inquiries."
            action={
              <Button onClick={openAdd} disabled={loading}>
                <Plus size={16} />
                Add Customer
              </Button>
            }
          />
        ) : (
          /* ==================================================
             DATA TABLE
          ================================================== */

          <DataTable
            columns={columns}
            rows={filtered}
            pageSize={8}
            actions={(c) => (
              <div className="flex items-center justify-end gap-1">
                {/* EDIT */}

                <button
                  onClick={() => openEdit(c)}
                  disabled={loading}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/40 transition disabled:opacity-50"
                >
                  <Pencil size={16} />
                </button>

                {/* DELETE */}

                <button
                  onClick={() => setDeleteId(c.id)}
                  disabled={loading}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 transition disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          />
        )}
      </Card>

      {/* ======================================================
          ADD / EDIT MODAL
      ====================================================== */}

      <Modal
        open={modalOpen}
        onClose={() => {
          if (!loading) {
            setModalOpen(false);
          }
        }}
        title={editing ? "Edit Customer" : "Add Customer"}
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button onClick={save} disabled={loading}>
              {loading ? "Saving..." : editing ? "Save" : "Add"}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* ==================================================
              COMPANY NAME
          ================================================== */}

          <div className="sm:col-span-2">
            <Input
              label="Company Name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              error={errors.name}
              required
            />
          </div>

          {/* ==================================================
              CONTACT PERSON
          ================================================== */}

          <Input
            label="Contact Person"
            value={form.contactPerson}
            onChange={(e) =>
              setForm({
                ...form,
                contactPerson: e.target.value,
              })
            }
            error={errors.contactPerson}
            required
          />

          {/* ==================================================
              EMAIL
          ================================================== */}

          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            error={errors.email}
            required
          />

          {/* ==================================================
              MOBILE
          ================================================== */}

          <Input
            label="Mobile"
            maxLength={10}
            value={form.mobile}
            onChange={(e) =>
              setForm({
                ...form,

                mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
              })
            }
            error={errors.mobile}
            required
          />

          {/* ==================================================
              EMPTY GRID SPACE
          ================================================== */}

          <div />

          {/* ==================================================
              ADDRESS
          ================================================== */}

          <div className="sm:col-span-2">
            <Textarea
              label="Address"
              value={form.address}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: e.target.value,
                })
              }
              rows={2}
            />
          </div>
        </div>
      </Modal>

      {/* ======================================================
          DELETE CONFIRMATION
      ====================================================== */}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => {
          if (!loading) {
            setDeleteId(null);
          }
        }}
        onConfirm={remove}
        title="Delete customer?"
        message="This customer will be removed from the directory."
        confirmLabel={loading ? "Deleting..." : "Delete"}
      />
    </div>
  );
}
