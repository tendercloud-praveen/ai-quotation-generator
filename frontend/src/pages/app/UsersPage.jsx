import { useEffect, useMemo, useState } from "react";
import {
  Users as UsersIcon,
  UserPlus,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Shield,
  Eye,
  Loader2,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Breadcrumbs from "../../components/Breadcrumbs";
import { Card } from "../../components/Card";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { Input, Select } from "../../components/Field";
import Badge from "../../components/Badge";
import DataTable from "../../components/DataTable";
import SearchBar from "../../components/SearchBar";
import EmptyState from "../../components/EmptyState";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import Avatar from "../../components/Avatar";
import { useToast } from "../../components/Toast";
import {
  validateEmail,
  validateMobile,
  validateStrongPassword,
  formatDate,
} from "../../lib/validate";
import { ROLE_LABELS } from "../../lib/nav";
import { useRole } from "../../lib/RoleContext";
import {
  fetchUsersApi,
  getUserByIdApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
} from "../../services/userService";

const empty = {
  companyName: "",
  fullName: "",
  email: "",
  mobile: "",
  password: "",
  confirm: "",
  role: "sales_rep",
};

export default function UsersPage() {
  const { user: currentUser } = useRole();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [deleteId, setDeleteId] = useState(null);
  const [viewUser, setViewUser] = useState(null);

  // Load users from DB on mount
  const loadUsers = async () => {
    try {
      setLoading(true);

      const response = await fetchUsersApi();

      console.log("USERS API RESPONSE:", response);

      const usersData = response?.data || [];

      const normalizedUsers = usersData.map((u) => ({
        id: u.id,
        companyName: u.company_name,
        fullName: u.full_name,
        email: u.email,
        mobile: u.mobile_number,
        role: u.role?.toLowerCase(),
        status: u.is_active ? "active" : "disabled",
        createdAt: u.created_at || null,
      }));

      setUsers(normalizedUsers);
    } catch (err) {
      console.error("Fetch users error:", err);
      console.error("Backend response:", err.response?.data);

      toast.error("Failed to load users from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matches =
        !search ||
        u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());
      const roleOk = roleFilter === "all" || u.role === roleFilter;
      return matches && roleOk;
    });
  }, [users, search, roleFilter]);

  const openAdd = () => {
    setEditing(null);
    setForm({
      ...empty,
      companyName: currentUser?.companyName || "",
    });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setForm({ ...u, password: "", confirm: "" });
    setErrors({});
    setModalOpen(true);
  };

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e = {};

    if (!form.companyName?.trim()) {
      e.companyName = "Company name is required";
    }

    if (!form.fullName?.trim()) {
      e.fullName = "Full name is required";
    }

    if (!form.email?.trim()) {
      e.email = "Email is required";
    } else if (!validateEmail(form.email)) {
      e.email = "Enter a valid email address";
    } else if (
      !editing &&
      users.find((u) => u.email?.toLowerCase() === form.email.toLowerCase())
    ) {
      e.email = "An account with this email already exists";
    }

    if (!form.mobile?.trim()) {
      e.mobile = "Mobile number is required";
    } else if (!validateMobile(form.mobile)) {
      e.mobile = "Mobile must be exactly 10 digits";
    }

    if (!editing || form.password) {
      if (!form.password) {
        e.password = "Password is required";
      } else if (!validateStrongPassword(form.password)) {
        e.password = "8+ chars with upper, lower, number & symbol";
      }

      if (form.confirm !== form.password) {
        e.confirm = "Passwords do not match";
      }
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    try {
      setIsSubmitting(true);
      if (editing) {
        const patch = {
          full_name: form.fullName,
          email: form.email,
          mobile_number: form.mobile,
          role: form.role,
          is_active: form.status === "active",
        };

        if (form.password) {
          patch.password = form.password;
        }

        await updateUserApi(editing.id, patch);

        toast.success("User updated successfully.");
      } else {
        const payload = {
          company_name: form.companyName,
          full_name: form.fullName,
          email: form.email,
          mobile_number: form.mobile,
          password: form.password,
          role: form.role,
        };
        await createUserApi(payload);
        toast.success(`${ROLE_LABELS[form.role]} account created in database.`);
      }
      setModalOpen(false);
      await loadUsers(); // Refresh DB list
    } catch (err) {
      toast.error("Failed to save user details.");
      console.error("Save user error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const remove = async () => {
    try {
      await deleteUserApi(deleteId);
      toast.success("User deleted from database.");
      setDeleteId(null);
      await loadUsers(); // Refresh DB list
    } catch (err) {
      toast.error("Failed to delete user.");
      console.error("Delete user error:", err);
    }
  };

  const columns = [
    {
      key: "fullName",
      header: "User",
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar
            name={u.fullName}
            color={u.avatarColor}
            size={36}
            src={u.avatarImage}
          />
          <div>
            <p className="font-medium text-slate-700 dark:text-slate-200">
              {u.fullName}
            </p>
            <p className="text-xs text-slate-400">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      render: (u) => (
        <Badge
          tone={
            u.role === "admin"
              ? "brand"
              : u.role === "manager"
                ? "info"
                : "default"
          }
        >
          {ROLE_LABELS[u.role] || u.role}
        </Badge>
      ),
    },
    {
      key: "mobile",
      header: "Mobile",
      render: (u) => (
        <span className="text-slate-600 dark:text-slate-300">{u.mobile}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (u) => (
        <Badge tone={u.status === "active" ? "success" : "danger"} dot>
          {u.status === "active" ? "Active" : "Disabled"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      sortable: true,
      render: (u) => (
        <span className="text-slate-500 dark:text-slate-400">
          {u.createdAt ? formatDate(u.createdAt) : "N/A"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumbs items={[{ label: "Users" }]} />
      <PageHeader
        title="User Management"
        subtitle="Create and manage Manager and Sales Rep accounts."
        actions={
          <Button onClick={openAdd}>
            <UserPlus size={16} /> Add User
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name or email…"
        />
        <div className="flex items-center gap-2">
          {["all", "admin", "manager", "sales_rep"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                roleFilter === r
                  ? "bg-brand-600 text-white"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              {r === "all" ? "All" : ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center items-center py-12 text-slate-500 gap-2">
            <Loader2 className="animate-spin" size={20} /> Loading users from
            database...
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="No users found"
            description="Try adjusting your search or add a new user."
            action={
              <Button onClick={openAdd}>
                <UserPlus size={16} /> Add User
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={columns}
            rows={filtered}
            pageSize={8}
            actions={(u) => (
              <div className="flex items-center justify-end gap-1">
                <button
                  onClick={() => setViewUser(u)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 transition"
                  title="View"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => openEdit(u)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/40 transition"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>
                {u.id !== currentUser?.id && (
                  <button
                    onClick={() => setDeleteId(u.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 transition"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            )}
          />
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit User" : "Add New User"}
        subtitle={
          editing
            ? `Update ${editing.fullName}'s details`
            : "Create a new Manager or Sales Rep account"
        }
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : editing
                  ? "Save Changes"
                  : "Create User"}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Company Name"
            value={form.companyName}
            onChange={(e) => set("companyName", e.target.value)}
            error={errors.companyName}
            required
          />
          <Input
            label="Full Name"
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            error={errors.fullName}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            error={errors.email}
            required
          />
          <Input
            label="Mobile Number"
            maxLength={10}
            value={form.mobile}
            onChange={(e) =>
              set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            error={errors.mobile}
            hint="Exactly 10 digits"
            required
          />
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => set("role", e.target.value)}
            required
          >
            <option value="sales_rep">Sales Rep</option>
            <option value="manager">Manager</option>
          </Select>
          <Input
            label={editing ? "New Password (leave blank to keep)" : "Password"}
            type="password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            error={errors.password}
            required={!editing}
          />
          <Input
            label="Confirm Password"
            type="password"
            value={form.confirm}
            onChange={(e) => set("confirm", e.target.value)}
            error={errors.confirm}
            required={!editing}
          />
          {editing && (
            <Select
              label="Status"
              value={form.status || "active"}
              onChange={(e) => set("status", e.target.value)}
            >
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </Select>
          )}
        </div>
        {!editing && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 px-4 py-3 text-sm text-brand-700 dark:text-brand-300">
            <Shield size={16} className="mt-0.5 shrink-0" /> Created users will
            be persisted to the database and can log in immediately.
          </div>
        )}
      </Modal>

      {/* View Modal */}
      <Modal
        open={!!viewUser}
        onClose={() => setViewUser(null)}
        title="User Details"
        size="md"
      >
        {viewUser && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar
                name={viewUser.fullName}
                color={viewUser.avatarColor}
                size={64}
                src={viewUser.avatarImage}
              />
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {viewUser.fullName}
                </h3>
                <Badge
                  tone={
                    viewUser.role === "admin"
                      ? "brand"
                      : viewUser.role === "manager"
                        ? "info"
                        : "default"
                  }
                >
                  {ROLE_LABELS[viewUser.role] || viewUser.role}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="grid place-items-center h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {viewUser.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="grid place-items-center h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Mobile</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {viewUser.mobile}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="grid place-items-center h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400">
                  <Shield size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Status</p>
                  <Badge
                    tone={viewUser.status === "active" ? "success" : "danger"}
                    dot
                  >
                    {viewUser.status === "active" ? "Active" : "Disabled"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="grid place-items-center h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400">
                  <UsersIcon size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Joined</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {viewUser.createdAt
                      ? formatDate(viewUser.createdAt)
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={remove}
        title="Delete user?"
        message="This will permanently remove the user account from the database. This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
}
