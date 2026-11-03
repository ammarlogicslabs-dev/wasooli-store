import { useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { toast } from "react-toastify";
import { deleteCoupon, saveCoupon } from "../../services/storage/adminDataService";
import AdminModal from "../components/AdminModal";
import AdminTable from "../components/AdminTable";
import ConfirmDialog from "../components/ConfirmDialog";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { buttonClass, inputClass } from "../components/formStyles";
import { filterNumericKeyDown, sanitizeNumber } from "../../utils/numberInput";
import { useAdminData } from "../hooks/useAdminData";

const EMPTY = {
  code: "",
  type: "percent",
  value: "",
  minOrder: "0",
  maxDiscount: "",
  startDate: "",
  expiryDate: "",
  usageLimit: "10",
  used: "0",
  active: true,
};

export default function CouponsPage() {
  const { coupons } = useAdminData();
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredCoupons = useMemo(() => {
    return (coupons || []).filter((coupon) => {
      if (statusFilter === "active" && !coupon.active) return false;
      if (statusFilter === "inactive" && coupon.active) return false;
      if (typeFilter !== "all" && coupon.type !== typeFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const code = String(coupon.code || "").toLowerCase();
        const val = String(coupon.value || "").toLowerCase();
        if (!code.includes(q) && !val.includes(q)) return false;
      }
      return true;
    });
  }, [coupons, search, statusFilter, typeFilter]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form || saving) return;
    setSaving(true);
    const result = await saveCoupon(form);
    setSaving(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    toast.success("Coupon saved.");
    setForm(null);
  }

  async function handleToggle(coupon) {
    const result = await saveCoupon({ ...coupon, active: !coupon.active });
    if (!result.ok) toast.error(result.message);
    else toast.success("Coupon updated.");
  }

  async function handleDelete() {
    if (!pending) return;
    const result = await deleteCoupon(pending.id);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success("Coupon deleted.");
    setPending(null);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        crumbs={[{ label: "Coupons & Discounts" }]}
        title="Coupons & Discounts"
        detail="Manage coupons stored in the API. Customers can redeem active codes at checkout."
        actions={
          <button
            type="button"
            onClick={() => {
              setError("");
              setForm(EMPTY);
            }}
            className={buttonClass}
          >
            <Plus size={16} />
            <span>Add coupon</span>
          </button>
        }
      />
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coupon code or discount value..."
              className={`${inputClass} pl-10 pr-9`}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={15} />
              </button>
            )}
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`${inputClass} sm:w-36`}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={`${inputClass} sm:w-36`}
            >
              <option value="all">All types</option>
              <option value="percent">Percentage</option>
              <option value="fixed">Fixed</option>
            </select>
          </div>
        </div>

        <AdminTable
          rows={filteredCoupons}
          rowKey={(coupon) => coupon.id}
          empty={
            search || statusFilter !== "all" || typeFilter !== "all"
              ? "No coupons match your search."
              : "No coupons yet."
          }
          columns={[
            { key: "code", label: "Code", render: (coupon) => <span className="font-semibold text-slate-900">{coupon.code}</span> },
            {
              key: "value",
              label: "Discount",
              render: (coupon) => (
                <div>
                  <span className="font-semibold text-slate-900">
                    {coupon.type === "percent" ? `${coupon.value}%` : `Rs ${coupon.value}`}
                  </span>
                  {coupon.type === "percent" && Number(coupon.maxDiscount) > 0 ? (
                    <span className="block text-[11px] font-medium text-emerald-600">
                      Max Rs {Number(coupon.maxDiscount).toLocaleString()}
                    </span>
                  ) : null}
                </div>
              ),
            },
            { key: "min", label: "Minimum", render: (coupon) => `Rs ${coupon.minOrder}` },
            { key: "expiry", label: "Expiry", render: (coupon) => coupon.expiryDate || "None" },
            { key: "usage", label: "Usage", render: (coupon) => `${coupon.used}/${coupon.usageLimit}` },
            { key: "status", label: "Status", render: (coupon) => <StatusBadge status={coupon.active ? "active" : "archived"}>{coupon.active ? "Active" : "Inactive"}</StatusBadge> },

            {
              key: "actions",
              label: "Action",
              render: (coupon) => (
                <span className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setForm({
                        ...coupon,
                        value: String(coupon.value ?? ""),
                        minOrder: String(coupon.minOrder ?? "0"),
                        maxDiscount: coupon.maxDiscount != null ? String(coupon.maxDiscount) : "",
                        usageLimit: String(coupon.usageLimit ?? "10"),
                        used: String(coupon.used ?? "0"),
                      });
                    }}
                    className="cursor-pointer text-xs font-semibold text-brand-600"
                  >
                    Edit
                  </button>
                  <button type="button" onClick={() => handleToggle(coupon)} className="cursor-pointer text-xs font-semibold text-slate-500">{coupon.active ? "Disable" : "Enable"}</button>
                  <button type="button" onClick={() => setPending(coupon)} className="cursor-pointer text-xs font-semibold text-red-600">Delete</button>
                </span>
              ),
            },
          ]}
        />
      </section>
      <AdminModal open={Boolean(form)} title={form?.id ? "Edit coupon" : "Add coupon"} onClose={() => setForm(null)}>
        {form && (
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-900 sm:col-span-2">Code
              <input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} placeholder="e.g. WASOOLI10" className={`${inputClass} mt-1.5`} />
            </label>
            <label className="text-sm font-semibold text-slate-900">Type
              <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className={`${inputClass} mt-1.5`}>
                <option value="percent">Percentage</option>
                <option value="fixed">Fixed amount</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-900">Value
              <input
                type="text"
                value={form.value}
                onKeyDown={(event) => filterNumericKeyDown(event, { allowDecimal: true })}
                onChange={(event) => setForm({ ...form, value: sanitizeNumber(event.target.value, { allowDecimal: true }) })}
                placeholder="e.g. 10 (for 10%) or 500"
                inputMode="decimal"
                className={`${inputClass} mt-1.5`}
              />
            </label>
            <label className="text-sm font-semibold text-slate-900">Minimum order
              <input
                type="text"
                value={form.minOrder}
                onKeyDown={(event) => filterNumericKeyDown(event, { allowDecimal: true })}
                onChange={(event) => setForm({ ...form, minOrder: sanitizeNumber(event.target.value, { allowDecimal: true }) })}
                placeholder="e.g. 2000"
                inputMode="decimal"
                className={`${inputClass} mt-1.5`}
              />
            </label>
            <label className="text-sm font-semibold text-slate-900">Maximum discount
              <input
                type="text"
                value={form.maxDiscount ?? ""}
                onKeyDown={(event) => filterNumericKeyDown(event, { allowDecimal: true })}
                onChange={(event) => setForm({ ...form, maxDiscount: sanitizeNumber(event.target.value, { allowDecimal: true }) })}
                placeholder="e.g. 2000 (Optional cap)"
                inputMode="decimal"
                className={`${inputClass} mt-1.5`}
              />
            </label>
            <label className="text-sm font-semibold text-slate-900">Usage limit
              <input
                type="text"
                value={form.usageLimit}
                onKeyDown={(event) => filterNumericKeyDown(event)}
                onChange={(event) => setForm({ ...form, usageLimit: sanitizeNumber(event.target.value) })}
                placeholder="e.g. 100"
                inputMode="numeric"
                className={`${inputClass} mt-1.5`}
              />
            </label>
            <label className="text-sm font-semibold text-slate-900">Start
              <input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} className={`${inputClass} mt-1.5`} />
            </label>
            <label className="text-sm font-semibold text-slate-900">Expiry
              <input type="date" value={form.expiryDate} onChange={(event) => setForm({ ...form, expiryDate: event.target.value })} className={`${inputClass} mt-1.5`} />
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 sm:col-span-2">
              <input type="checkbox" checked={Boolean(form.active)} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
              Active
            </label>
            {error ? <p className="text-sm font-medium text-red-600 sm:col-span-2">{error}</p> : null}
            <button type="submit" disabled={saving} className={`${buttonClass} sm:col-span-2`}>{saving ? "Saving…" : "Save coupon"}</button>
          </form>
        )}
      </AdminModal>
      <ConfirmDialog
        open={Boolean(pending)}
        title="Delete coupon?"
        message="This permanently removes the coupon from the store."
        confirmLabel="Delete"
        onClose={() => setPending(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
