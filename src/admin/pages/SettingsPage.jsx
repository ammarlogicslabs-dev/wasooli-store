import { useState } from "react";
import { toast } from "react-toastify";
import { getSettings, resetDemoData, saveSettings } from "../../services/storage/adminDataService";
import ConfirmDialog from "../components/ConfirmDialog";
import PageHeader from "../components/PageHeader";
import { buttonClass, inputClass, quietButtonClass } from "../components/formStyles";
import { useAdminData } from "../hooks/useAdminData";

export default function SettingsPage() {
  const { settings } = useAdminData();
  const [form, setForm] = useState(settings);
  const [resetMode, setResetMode] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();
    const result = saveSettings({
      ...form,
      shippingFee: Number(form.shippingFee),
      lowStockThreshold: Number(form.lowStockThreshold),
      notifyLowStock: Boolean(form.notifyLowStock),
      notifyNewOrder: Boolean(form.notifyNewOrder),
    });
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success("Settings saved on this browser.");
  }

  function confirmReset() {
    resetDemoData({ clearOrders: resetMode === "orders" });
    toast.success(resetMode === "orders" ? "Demo data and orders were reset." : "Catalog, stock, coupons, and settings were restored.");
    setResetMode(null);
    setForm(getSettings());
  }

  return (
    <div className="space-y-5">
      <PageHeader crumbs={[{ label: "Store Settings" }]} title="Store Settings" detail="These values stay in localStorage for this demo." />
      <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="block text-sm font-semibold text-slate-900">Store name
            <input value={form.storeName} onChange={(event) => setForm({ ...form, storeName: event.target.value })} className={`${inputClass} mt-1.5`} />
          </label>
          <label className="block text-sm font-semibold text-slate-900">Currency
            <select value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })} className={`${inputClass} mt-1.5`}>
              <option value="PKR">PKR</option>
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-900">Standard shipping fee
            <input value={form.shippingFee} onChange={(event) => setForm({ ...form, shippingFee: event.target.value })} inputMode="decimal" className={`${inputClass} mt-1.5`} />
          </label>
          <label className="block text-sm font-semibold text-slate-900">Low-stock threshold
            <input value={form.lowStockThreshold} onChange={(event) => setForm({ ...form, lowStockThreshold: event.target.value })} inputMode="numeric" className={`${inputClass} mt-1.5`} />
          </label>
          {/* <label className="block text-sm font-semibold text-slate-900">Table density
            <select value={form.density} onChange={(event) => setForm({ ...form, density: event.target.value })} className={`${inputClass} mt-1.5`}>
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
            </select>
          </label> */}
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <input type="checkbox" checked={Boolean(form.notifyLowStock)} onChange={(event) => setForm({ ...form, notifyLowStock: event.target.checked })} />
            Low-stock alerts
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <input type="checkbox" checked={Boolean(form.notifyNewOrder)} onChange={(event) => setForm({ ...form, notifyNewOrder: event.target.checked })} />
            New-order alerts
          </label>
          <button type="submit" className={buttonClass}>Save settings</button>
        </section>
        <aside className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Reset demo data</h2>
          <p className="text-sm leading-6 text-slate-500">Restores products, categories, coupons, stock, and settings. Customer cart and login stay as they are.</p>
          <button type="button" onClick={() => setResetMode("catalog")} className={quietButtonClass}>Reset catalog</button>
          <button type="button" onClick={() => setResetMode("orders")} className="inline-flex h-10 cursor-pointer items-center rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-600">Reset catalog and orders</button>
        </aside>
      </form>
      <ConfirmDialog
        open={Boolean(resetMode)}
        title="Reset demo data?"
        message={resetMode === "orders" ? "Saved orders will be cleared as well." : "Admin edits to products, stock, coupons, and settings will be restored."}
        confirmLabel="Reset"
        onClose={() => setResetMode(null)}
        onConfirm={confirmReset}
      />
    </div>
  );
}
