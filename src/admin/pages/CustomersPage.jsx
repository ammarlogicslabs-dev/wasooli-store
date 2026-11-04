import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  Power,
  RotateCw,
  Trash2,
  User,
  UserPlus,
} from "lucide-react";
import { formatPrice } from "../../data/product";
import {
  deleteCustomer,
  saveCustomer,
  setCustomerStatus,
} from "../../services/storage/adminDataService";
import AdminModal from "../components/AdminModal";
import AdminPagination from "../components/AdminPagination";
import AdminTable from "../components/AdminTable";
import ConfirmDialog from "../components/ConfirmDialog";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { buttonClass, inputClass } from "../components/formStyles";
import { paginate, useAdminData } from "../hooks/useAdminData";

const INITIAL_FORM = {
  name: "",
  email: "",
  password: "",
  phone: "",
  city: "Karachi",
  address: "",
  role: "Customer",
  status: "active",
};

function generatePassword(length = 8) {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
  let pass = "";
  for (let i = 0; i < length; i += 1) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

export default function CustomersPage() {
  const { customers } = useAdminData();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState("");
  const [ordersFilter, setOrdersFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Add User Modal State
  const isAddParam = searchParams.get("add") === "true";
  const [modalOpenState, setModalOpenState] = useState(false);
  const isAddModalOpen = isAddParam || modalOpenState;

  const [form, setForm] = useState(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete User Dialog State
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Status Toggling State
  const [statusTogglingKey, setStatusTogglingKey] = useState(null);

  function handleCloseModal() {
    setModalOpenState(false);
    setFormError("");
    if (searchParams.get("add") === "true") {
      const next = new URLSearchParams(searchParams);
      next.delete("add");
      setSearchParams(next, { replace: true });
    }
  }

  function handleOpenAddModal() {
    setForm({
      ...INITIAL_FORM,
      password: generatePassword(8),
    });
    setFormError("");
    setShowPassword(false);
    setModalOpenState(true);
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Full name is required.");
      return;
    }
    if (!form.email.trim()) {
      setFormError("Email address is required.");
      return;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (!form.password.trim() || form.password.trim().length < 4) {
      setFormError("Password must be at least 4 characters.");
      return;
    }

    setSaving(true);
    const result = await saveCustomer({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password.trim(),
      phone: form.phone.trim(),
      city: form.city.trim(),
      address: form.address.trim(),
      role: form.role,
      status: form.status,
    });
    setSaving(false);

    if (result.ok) {
      toast.success(`User "${form.name}" created successfully!`);
      handleCloseModal();
    } else {
      setFormError(result.message || "Could not create user.");
    }
  }

  async function handleToggleStatus(e, customer) {
    e.stopPropagation();
    const nextStatus = customer.status === "inactive" ? "active" : "inactive";
    setStatusTogglingKey(customer.key);
    const result = await setCustomerStatus(customer.key, nextStatus);
    setStatusTogglingKey(null);

    if (result.ok) {
      toast.success(
        nextStatus === "inactive"
          ? `User "${customer.name}" marked inactive.`
          : `User "${customer.name}" activated.`
      );
    } else {
      toast.error(result.message || "Failed to update user status.");
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingCustomer) return;
    setDeleteLoading(true);
    const result = await deleteCustomer(deletingCustomer.key);
    setDeleteLoading(false);

    if (result.ok) {
      toast.success(`User "${deletingCustomer.name}" deleted.`);
      setDeletingCustomer(null);
    } else {
      toast.error(result.message || "Failed to delete user.");
    }
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return customers.filter((customer) => {
      const matchesQuery =
        !needle ||
        [customer.name, customer.email, customer.phone, customer.city, customer.role]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(needle);

      const matchesOrders =
        ordersFilter === "all" ||
        (ordersFilter === "with-orders" && (customer.orders || 0) > 0) ||
        (ordersFilter === "none" && (!customer.orders || customer.orders === 0));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && customer.status !== "inactive") ||
        (statusFilter === "inactive" && customer.status === "inactive");

      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "Customer" && (!customer.role || customer.role === "Customer")) ||
        (roleFilter === "Admin" && customer.role === "Admin");

      return matchesQuery && matchesOrders && matchesStatus && matchesRole;
    });
  }, [customers, query, ordersFilter, statusFilter, roleFilter]);

  const view = paginate(filtered, page, 8);

  return (
    <div className="space-y-5">
      <PageHeader
        crumbs={[{ label: "Users" }]}
        title="All Users"
        detail="Manage customer and admin accounts. Add new users with login credentials."
        actions={
          <button
            type="button"
            onClick={handleOpenAddModal}
            className={`${buttonClass} inline-flex items-center gap-1.5 cursor-pointer`}
          >
            <UserPlus size={16} />
            <span>Add user</span>
          </button>
        }
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        {/* Filters and search bar */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search name, email, phone, city..."
            className={inputClass}
          />
          <select
            value={ordersFilter}
            onChange={(event) => {
              setOrdersFilter(event.target.value);
              setPage(1);
            }}
            className={inputClass}
          >
            <option value="all">Any order count</option>
            <option value="with-orders">Has orders</option>
            <option value="none">No orders</option>
          </select>
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            className={inputClass}
          >
            <option value="all">All statuses</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>
          <select
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value);
              setPage(1);
            }}
            className={inputClass}
          >
            <option value="all">All roles</option>
            <option value="Customer">Customer</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="mt-4">
          <AdminTable
            rows={view.items}
            rowKey={(customer) => customer.key}
            onRowClick={(customer) =>
              navigate(`/admin/customers/${encodeURIComponent(customer.key)}`)
            }
            empty="No users match this search."
            columns={[
              {
                key: "name",
                label: "User",
                render: (customer) => (
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 font-bold text-xs uppercase">
                      {customer.name?.charAt(0) || "U"}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{customer.name}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {customer.email || customer.phone || "No contact saved"}
                      </p>
                    </div>
                  </div>
                ),
              },
              {
                key: "role",
                label: "Role",
                render: (customer) => (
                  <span
                    className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold ${
                      customer.role === "Admin"
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {customer.role || "Customer"}
                  </span>
                ),
              },
              { key: "city", label: "City", render: (customer) => customer.city || "—" },
              { key: "orders", label: "Orders", render: (customer) => customer.orders || 0 },
              {
                key: "spent",
                label: "Spent",
                render: (customer) => formatPrice(customer.spent || 0),
              },
              {
                key: "status",
                label: "Status",
                render: (customer) => (
                  <StatusBadge status={customer.status === "inactive" ? "inactive" : "active"}>
                    {customer.status || "active"}
                  </StatusBadge>
                ),
              },
              {
                key: "actions",
                label: "Action",
                render: (customer) => (
                  <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      disabled={statusTogglingKey === customer.key}
                      onClick={(e) => handleToggleStatus(e, customer)}
                      title={customer.status === "inactive" ? "Activate User" : "Deactivate User"}
                      aria-label="Toggle user status"
                      className={`grid size-8 cursor-pointer place-items-center rounded-lg border border-slate-200 bg-white shadow-2xs transition ${
                        customer.status === "inactive"
                          ? "text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50"
                          : "text-amber-600 hover:border-amber-300 hover:bg-amber-50"
                      }`}
                    >
                      <Power size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingCustomer(customer);
                      }}
                      title="Delete user"
                      aria-label="Delete user"
                      className="grid size-8 cursor-pointer place-items-center rounded-lg border border-slate-200 bg-red-100/50 text-red-400 shadow-2xs transition hover:border-red-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ),
              },
            ]}
          />
          <AdminPagination page={view.page} pages={view.pages} total={view.total} onPage={setPage} />
        </div>
      </section>

      {/* Add User Modal */}
      <AdminModal
        open={isAddModalOpen}
        title="Add user"
        onClose={handleCloseModal}
        wide
      >
        <form onSubmit={handleCreateUser} className="space-y-4 pt-1">
          {formError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
              {formError}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Muhammad Ali"
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. ali@example.com"
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, password: generatePassword(8) })}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700 hover:underline cursor-pointer"
                >
                  <RotateCw size={11} />
                  <span>Generate</span>
                </button>
              </div>
              <div className="relative">
                <KeyRound size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimum 4 characters"
                  className={`${inputClass} pl-9 pr-9`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. 0300-1234567"
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                City
              </label>
              <div className="relative">
                <MapPin size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g. Karachi, Lahore, Islamabad"
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Role
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className={inputClass}
              >
                <option value="Customer">Customer (Storefront access)</option>
                <option value="Admin">Admin (Full panel access)</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Account Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={inputClass}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Shipping Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Address
              </label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Street address, apartment, or shop location..."
                rows={2}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={saving}
              className="h-10 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`${buttonClass} inline-flex items-center gap-2 cursor-pointer`}
            >
              {saving ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Creating user...</span>
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>Create user</span>
                </>
              )}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Delete User Confirm Dialog */}
      <ConfirmDialog
        open={Boolean(deletingCustomer)}
        title={`Delete user "${deletingCustomer?.name || ""}"?`}
        message="This action will remove the user account and revoke their login access. Are you sure you want to proceed?"
        confirmLabel="Delete user"
        tone="danger"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onClose={() => {
          if (!deleteLoading) setDeletingCustomer(null);
        }}
      />
    </div>
  );
}
