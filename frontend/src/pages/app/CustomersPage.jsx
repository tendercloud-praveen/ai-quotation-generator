import { useMemo, useState } from "react";
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
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
import { useStore } from "../../lib/useStore";
import {
  getCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
} from "../../lib/data";
import { validateEmail, validateMobile, formatDate } from "../../lib/validate";

const empty = {
  name: "",
  contactPerson: "",
  email: "",
  mobile: "",
  address: "",
};

export default function CustomersPage() {
  useStore(() => {});
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [deleteId, setDeleteId] = useState(null);

  const customers = getCustomers();

  const filtered = useMemo(() => {
    return customers.filter(
      (c) =>
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()),
    );
  }, [customers, search]);

  const openAdd = () => {
    setEditing(null);
    setForm(empty);
    setErrors({});
    setModalOpen(true);
  };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ ...c });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Company name is required";
    if (!form.contactPerson.trim())
      e.contactPerson = "Contact person is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!validateEmail(form.email)) e.email = "Invalid email";
    if (!form.mobile.trim()) e.mobile = "Mobile is required";
    else if (!validateMobile(form.mobile)) e.mobile = "Must be 10 digits";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    if (editing) {
      updateCustomer(editing.id, form);
      toast.success("Customer updated.");
    } else {
      addCustomer(form);
      toast.success("Customer added.");
    }
    setModalOpen(false);
  };

  const remove = () => {
    deleteCustomer(deleteId);
    toast.success("Customer deleted.");
    setDeleteId(null);
  };

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
          <p className="text-xs text-slate-400">{c.contactPerson}</p>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (c) => (
        <span className="text-slate-600 dark:text-slate-300">{c.email}</span>
      ),
    },
    {
      key: "mobile",
      header: "Mobile",
      render: (c) => (
        <span className="text-slate-600 dark:text-slate-300">{c.mobile}</span>
      ),
    },
    {
      key: "address",
      header: "Address",
      render: (c) => (
        <span className="text-slate-500 dark:text-slate-400 truncate max-w-[200px] block">
          {c.address}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Added",
      sortable: true,
      render: (c) => (
        <span className="text-slate-500 dark:text-slate-400">
          {formatDate(c.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Customers" }]} />
      <PageHeader
        title="Customers"
        subtitle="Manage your customer directory."
        actions={
          <Button onClick={openAdd}>
            <Plus size={16} /> Add Customer
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search customers…"
        />
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No customers found"
            description="Add your first customer to begin creating inquiries."
            action={
              <Button onClick={openAdd}>
                <Plus size={16} /> Add Customer
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={columns}
            rows={filtered}
            pageSize={8}
            actions={(c) => (
              <div className="flex items-center justify-end gap-1">
                <button
                  onClick={() => openEdit(c)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/40 transition"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setDeleteId(c.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          />
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Customer" : "Add Customer"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>{editing ? "Save" : "Add"}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Company Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name}
              required
            />
          </div>
          <Input
            label="Contact Person"
            value={form.contactPerson}
            onChange={(e) =>
              setForm({ ...form, contactPerson: e.target.value })
            }
            error={errors.contactPerson}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
            required
          />
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
          <div />
          <div className="sm:col-span-2">
            <Textarea
              label="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={2}
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={remove}
        title="Delete customer?"
        message="This customer will be removed from the directory."
        confirmLabel="Delete"
      />
    </div>
  );
}
