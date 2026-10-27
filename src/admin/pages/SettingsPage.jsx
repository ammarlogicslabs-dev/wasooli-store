import { useState } from "react";
import { toast } from "react-toastify";
import { saveSettings } from "../../services/storage/adminDataService";
import PageHeader from "../components/PageHeader";
import { buttonClass, inputClass } from "../components/formStyles";
import { useAdminData } from "../hooks/useAdminData";

export default function SettingsPage() {
  const { settings } = useAdminData();
  const [form, setForm] = useState(settings);
  const [prevSettings, setPrevSettings] = useState(settings);

  if (settings !== prevSettings) {
    setPrevSettings(settings);
    setForm(settings);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const result = await saveSettings({
      ...form,
      shippingFee: Number(form.shippingFee),
      expressShippingFee: Number(form.expressShippingFee),
      lowStockThreshold: Number(form.lowStockThreshold),
      notifyLowStock: Boolean(form.notifyLowStock),
      notifyNewOrder: Boolean(form.notifyNewOrder),
      bankName: String(form.bankName || "").trim(),
      accountTitle: String(form.accountTitle || "").trim(),
      accountNumber: String(form.accountNumber || "").trim(),
      iban: String(form.iban || "").trim(),
    });
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success("Settings saved.");
  }

  return (
    <div className="space-y-5">
      <PageHeader crumbs={[{ label: "Store Settings" }]} title="Store Settings" detail="Store-wide settings saved in the API database." />
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="block text-sm font-semibold text-slate-900">Store name
          <input value={form.storeName} onChange={(event) => setForm({ ...form, storeName: event.target.value })} placeholder="e.g. Wasooli Store" className={`${inputClass} mt-1.5`} />
        </label>
        <label className="block text-sm font-semibold text-slate-900">Currency
          <select value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })} className={`${inputClass} mt-1.5`}>
            <option value="PKR">PKR</option>
          </select>
        </label>
        <label className="block text-sm font-semibold text-slate-900">Standard shipping fee
          <input value={form.shippingFee} onChange={(event) => setForm({ ...form, shippingFee: event.target.value })} placeholder="e.g. 200" inputMode="decimal" className={`${inputClass} mt-1.5`} />
        </label>
        <label className="block text-sm font-semibold text-slate-900">Express shipping fee
          <input value={form.expressShippingFee ?? 300} onChange={(event) => setForm({ ...form, expressShippingFee: event.target.value })} placeholder="e.g. 350" inputMode="decimal" className={`${inputClass} mt-1.5`} />
        </label>
        <label className="block text-sm font-semibold text-slate-900">Low-stock threshold
          <input value={form.lowStockThreshold} onChange={(event) => setForm({ ...form, lowStockThreshold: event.target.value })} placeholder="e.g. 5" inputMode="numeric" className={`${inputClass} mt-1.5`} />
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <input type="checkbox" checked={Boolean(form.notifyLowStock)} onChange={(event) => setForm({ ...form, notifyLowStock: event.target.checked })} />
          Low-stock alerts
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <input type="checkbox" checked={Boolean(form.notifyNewOrder)} onChange={(event) => setForm({ ...form, notifyNewOrder: event.target.checked })} />
          New-order alerts
        </label>
        <div className="border-t border-slate-200 pt-4">
          <p className="text-sm font-semibold text-slate-900">Bank transfer details</p>
          <p className="mt-1 text-xs text-slate-500">Shown at checkout when the customer chooses bank transfer. Leave blank to ask them to contact the store.</p>
        </div>
        <label className="block text-sm font-semibold text-slate-900">Bank name
          <input value={form.bankName ?? ""} onChange={(event) => setForm({ ...form, bankName: event.target.value })} placeholder="e.g. Meezan Bank, HBL" className={`${inputClass} mt-1.5`} />
        </label>
        <label className="block text-sm font-semibold text-slate-900">Account title
          <input value={form.accountTitle ?? ""} onChange={(event) => setForm({ ...form, accountTitle: event.target.value })} placeholder="e.g. Wasooli Technologies" className={`${inputClass} mt-1.5`} />
        </label>
        <label className="block text-sm font-semibold text-slate-900">Account number
          <input value={form.accountNumber ?? ""} onChange={(event) => setForm({ ...form, accountNumber: event.target.value })} placeholder="e.g. 01020304050607" className={`${inputClass} mt-1.5`} />
        </label>
        <label className="block text-sm font-semibold text-slate-900">IBAN
          <input value={form.iban ?? ""} onChange={(event) => setForm({ ...form, iban: event.target.value })} placeholder="e.g. PK00MEZN0000000000000000" className={`${inputClass} mt-1.5`} />
        </label>
        <button type="submit" className={buttonClass}>Save settings</button>
      </form>
    </div>
  );
}
