import { useState } from "react";
import { toast } from "react-toastify";
import { deleteCoupon, saveCoupon } from "../../services/storage/adminDataService";
import AdminModal from "../components/AdminModal";
import AdminTable from "../components/AdminTable";
import ConfirmDialog from "../components/ConfirmDialog";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { buttonClass, inputClass } from "../components/formStyles";
import { useAdminData } from "../hooks/useAdminData";

const EMPTY = {
  code: "",
  type: "percent",
  value: "",
  minOrder: "0",
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
        actions={<button type="button" onClick={() => { setError(""); setForm(EMPTY); }} className={buttonClass}>Add coupon</button>}
      />
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <AdminTable
          rows={coupons}
          rowKey={(coupon) => coupon.id}
          empty="No coupons yet."
          columns={[
            { key: "code", label: "Code", render: (coupon) => <span className="font-semibold text-slate-900">{coupon.code}</span> },
            { key: "value", label: "Discount", render: (coupon) => coupon.type === "percent" ? `${coupon.value}%` : `Rs ${coupon.value}` },
            { key: "min", label: "Minimum", render: (coupon) => `Rs ${coupon.minOrder}` },
            { key: "expiry", label: "Expiry", render: (coupon) => coupon.expiryDate || "None" },
            { key: "usage", label: "Usage", render: (coupon) => `${coupon.used}/${coupon.usageLimit}` },
            { key: "status", label: "Status", render: (coupon) => <StatusBadge status={coupon.active ? "active" : "archived"}>{coupon.active ? "Active" : "Inactive"}</StatusBadge> },
            {
              key: "actions",
              label: "",
              render: (coupon) => (
                <span className="flex justify-end gap-3">
                  <button type="button" onClick={() => { setError(""); setForm({ ...coupon, value: String(coupon.value), minOrder: String(coupon.minOrder), usageLimit: String(coupon.usageLimit), used: String(coupon.used) }); }} className="cursor-pointer text-xs font-semibold text-brand-600">Edit</button>
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
              <input value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} placeholder="e.g. 10 (for 10%) or 500" inputMode="decimal" className={`${inputClass} mt-1.5`} />
            </label>
            <label className="text-sm font-semibold text-slate-900">Minimum order
              <input value={form.minOrder} onChange={(event) => setForm({ ...form, minOrder: event.target.value })} placeholder="e.g. 2000" inputMode="decimal" className={`${inputClass} mt-1.5`} />
            </label>
            <label className="text-sm font-semibold text-slate-900">Usage limit
              <input value={form.usageLimit} onChange={(event) => setForm({ ...form, usageLimit: event.target.value })} placeholder="e.g. 100" inputMode="numeric" className={`${inputClass} mt-1.5`} />
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
