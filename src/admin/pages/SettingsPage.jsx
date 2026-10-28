import { useState } from "react";
import { toast } from "react-toastify";
import { Megaphone, Plus, Trash2, RotateCcw } from "lucide-react";
import {
  saveSettings,
  DEFAULT_NAVBAR_ANNOUNCEMENTS,
  DEFAULT_FOOTER_ANNOUNCEMENTS,
} from "../../services/storage/adminDataService";
import PageHeader from "../components/PageHeader";
import AdminModal from "../components/AdminModal";
import { buttonClass, inputClass } from "../components/formStyles";
import { useAdminData } from "../hooks/useAdminData";

export default function SettingsPage() {
  const { settings } = useAdminData();
  const [form, setForm] = useState(settings);
  const [prevSettings, setPrevSettings] = useState(settings);

  // Modal open states
  const [navbarModalOpen, setNavbarModalOpen] = useState(false);
  const [footerModalOpen, setFooterModalOpen] = useState(false);

  // Add inputs for modals
  const [newNavbarItem, setNewNavbarItem] = useState("");
  const [newFooterItem, setNewFooterItem] = useState("");

  if (settings !== prevSettings) {
    setPrevSettings(settings);
    setForm(settings);
  }

  // --- Navbar Announcements handlers ---
  function handleAddNavbarItem(e) {
    if (e) e.preventDefault();
    const trimmed = newNavbarItem.trim();
    if (!trimmed) return;
    setForm((prev) => ({
      ...prev,
      navbarAnnouncements: [...(prev.navbarAnnouncements || DEFAULT_NAVBAR_ANNOUNCEMENTS), trimmed],
    }));
    setNewNavbarItem("");
  }

  function handleEditNavbarItem(index, value) {
    setForm((prev) => {
      const copy = [...(prev.navbarAnnouncements || DEFAULT_NAVBAR_ANNOUNCEMENTS)];
      copy[index] = value;
      return { ...prev, navbarAnnouncements: copy };
    });
  }

  function handleRemoveNavbarItem(index) {
    setForm((prev) => ({
      ...prev,
      navbarAnnouncements: (prev.navbarAnnouncements || DEFAULT_NAVBAR_ANNOUNCEMENTS).filter((_, i) => i !== index),
    }));
  }

  function handleResetNavbarItems() {
    setForm((prev) => ({
      ...prev,
      navbarAnnouncements: [...DEFAULT_NAVBAR_ANNOUNCEMENTS],
    }));
    toast.info("Navbar announcements reset to defaults.");
  }

  // --- Footer Announcements handlers ---
  function handleAddFooterItem(e) {
    if (e) e.preventDefault();
    const trimmed = newFooterItem.trim();
    if (!trimmed) return;
    setForm((prev) => ({
      ...prev,
      footerAnnouncements: [...(prev.footerAnnouncements || DEFAULT_FOOTER_ANNOUNCEMENTS), trimmed],
    }));
    setNewFooterItem("");
  }

  function handleEditFooterItem(index, value) {
    setForm((prev) => {
      const copy = [...(prev.footerAnnouncements || DEFAULT_FOOTER_ANNOUNCEMENTS)];
      copy[index] = value;
      return { ...prev, footerAnnouncements: copy };
    });
  }

  function handleRemoveFooterItem(index) {
    setForm((prev) => ({
      ...prev,
      footerAnnouncements: (prev.footerAnnouncements || DEFAULT_FOOTER_ANNOUNCEMENTS).filter((_, i) => i !== index),
    }));
  }

  function handleResetFooterItems() {
    setForm((prev) => ({
      ...prev,
      footerAnnouncements: [...DEFAULT_FOOTER_ANNOUNCEMENTS],
    }));
    toast.info("Footer announcements reset to defaults.");
  }

  // --- Persistence ---
  async function persistSettings(payload, successMsg) {
    const cleanedNavbar = Array.isArray(payload.navbarAnnouncements)
      ? payload.navbarAnnouncements.map((s) => String(s).trim()).filter(Boolean)
      : [...DEFAULT_NAVBAR_ANNOUNCEMENTS];

    const cleanedFooter = Array.isArray(payload.footerAnnouncements)
      ? payload.footerAnnouncements.map((s) => String(s).trim()).filter(Boolean)
      : [...DEFAULT_FOOTER_ANNOUNCEMENTS];

    const result = await saveSettings({
      ...payload,
      shippingFee: Number(payload.shippingFee),
      expressShippingFee: Number(payload.expressShippingFee),
      lowStockThreshold: Number(payload.lowStockThreshold),
      notifyLowStock: Boolean(payload.notifyLowStock),
      notifyNewOrder: Boolean(payload.notifyNewOrder),
      bankName: String(payload.bankName || "").trim(),
      accountTitle: String(payload.accountTitle || "").trim(),
      accountNumber: String(payload.accountNumber || "").trim(),
      iban: String(payload.iban || "").trim(),
      navbarAnnouncements: cleanedNavbar,
      topBannerText: cleanedNavbar.join("  ·  "),
      footerAnnouncements: cleanedFooter,
    });
    if (!result.ok) {
      toast.error(result.message || "Failed to save settings.");
      return false;
    }
    if (successMsg) toast.success(successMsg);
    return true;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await persistSettings(form, "Settings saved successfully.");
  }

  async function handleSaveNavbarModal() {
    const cleaned = Array.isArray(form.navbarAnnouncements)
      ? form.navbarAnnouncements.map((s) => String(s).trim()).filter(Boolean)
      : [...DEFAULT_NAVBAR_ANNOUNCEMENTS];
    const updatedForm = { ...form, navbarAnnouncements: cleaned };
    setForm(updatedForm);
    const ok = await persistSettings(updatedForm, "Navbar announcements updated successfully.");
    if (ok) setNavbarModalOpen(false);
  }

  async function handleSaveFooterModal() {
    const cleaned = Array.isArray(form.footerAnnouncements)
      ? form.footerAnnouncements.map((s) => String(s).trim()).filter(Boolean)
      : [...DEFAULT_FOOTER_ANNOUNCEMENTS];
    const updatedForm = { ...form, footerAnnouncements: cleaned };
    setForm(updatedForm);
    const ok = await persistSettings(updatedForm, "Footer announcements updated successfully.");
    if (ok) setFooterModalOpen(false);
  }

  const navbarCount = (form.navbarAnnouncements || DEFAULT_NAVBAR_ANNOUNCEMENTS).length;
  const footerCount = (form.footerAnnouncements || DEFAULT_FOOTER_ANNOUNCEMENTS).length;

  return (
    <div className="space-y-5">
      <PageHeader
        crumbs={[{ label: "Store Settings" }]}
        title="Store Settings"
        detail="Store-wide settings, announcement strips, and payment details."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setNavbarModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-xs font-bold text-sky-900 shadow-xs hover:bg-sky-100 hover:border-sky-300 transition active:scale-95 cursor-pointer"
            >
              <Megaphone size={15} className="text-brand-600" />
              <span>Navbar Announcements ({navbarCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setFooterModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 shadow-xs hover:bg-slate-50 hover:border-slate-300 transition active:scale-95 cursor-pointer"
            >
              <Megaphone size={15} className="text-slate-600" />
              <span>Footer Announcements ({footerCount})</span>
            </button>
          </div>
        }
      />

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {/* Basic General Settings */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-slate-900">
            Store name
            <input
              value={form.storeName}
              onChange={(event) => setForm({ ...form, storeName: event.target.value })}
              placeholder="e.g. Wasooli Store"
              className={`${inputClass} mt-1.5`}
            />
          </label>

          <label className="block text-sm font-semibold text-slate-900">
            Currency
            <select
              value={form.currency}
              onChange={(event) => setForm({ ...form, currency: event.target.value })}
              className={`${inputClass} mt-1.5`}
            >
              <option value="PKR">PKR</option>
            </select>
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-900">
              Standard shipping fee (PKR)
              <input
                value={form.shippingFee}
                onChange={(event) => setForm({ ...form, shippingFee: event.target.value })}
                placeholder="e.g. 200"
                inputMode="decimal"
                className={`${inputClass} mt-1.5`}
              />
            </label>

            <label className="block text-sm font-semibold text-slate-900">
              Express shipping fee (PKR)
              <input
                value={form.expressShippingFee ?? 300}
                onChange={(event) => setForm({ ...form, expressShippingFee: event.target.value })}
                placeholder="e.g. 350"
                inputMode="decimal"
                className={`${inputClass} mt-1.5`}
              />
            </label>
          </div>

          <label className="block text-sm font-semibold text-slate-900">
            Low-stock threshold
            <input
              value={form.lowStockThreshold}
              onChange={(event) => setForm({ ...form, lowStockThreshold: event.target.value })}
              placeholder="e.g. 5"
              inputMode="numeric"
              className={`${inputClass} mt-1.5`}
            />
          </label>

          <div className="flex flex-wrap gap-5 pt-1">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(form.notifyLowStock)}
                onChange={(event) => setForm({ ...form, notifyLowStock: event.target.checked })}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              Low-stock alerts
            </label>

            <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(form.notifyNewOrder)}
                onChange={(event) => setForm({ ...form, notifyNewOrder: event.target.checked })}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              New-order alerts
            </label>
          </div>
        </div>

        {/* Bank transfer details */}
        <div className="border-t border-slate-200 pt-4 space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Bank transfer details</p>
            <p className="mt-1 text-xs text-slate-500">
              Shown at checkout when the customer chooses bank transfer. Leave blank to ask them to contact the store.
            </p>
          </div>

          <label className="block text-sm font-semibold text-slate-900">
            Bank name
            <input
              value={form.bankName ?? ""}
              onChange={(event) => setForm({ ...form, bankName: event.target.value })}
              placeholder="e.g. Meezan Bank, HBL"
              className={`${inputClass} mt-1.5`}
            />
          </label>

          <label className="block text-sm font-semibold text-slate-900">
            Account title
            <input
              value={form.accountTitle ?? ""}
              onChange={(event) => setForm({ ...form, accountTitle: event.target.value })}
              placeholder="e.g. Wasooli Technologies"
              className={`${inputClass} mt-1.5`}
            />
          </label>

          <label className="block text-sm font-semibold text-slate-900">
            Account number
            <input
              value={form.accountNumber ?? ""}
              onChange={(event) => setForm({ ...form, accountNumber: event.target.value })}
              placeholder="e.g. 01020304050607"
              className={`${inputClass} mt-1.5`}
            />
          </label>

          <label className="block text-sm font-semibold text-slate-900">
            IBAN
            <input
              value={form.iban ?? ""}
              onChange={(event) => setForm({ ...form, iban: event.target.value })}
              placeholder="e.g. PK00MEZN0000000000000000"
              className={`${inputClass} mt-1.5`}
            />
          </label>
        </div>

        <div className="pt-2">
          <button type="submit" className={buttonClass}>
            Save settings
          </button>
        </div>
      </form>

      {/* ─── MODAL 1: TOP NAVBAR ANNOUNCEMENTS ─── */}
      <AdminModal
        open={navbarModalOpen}
        title="Navbar Headline Announcements"
        onClose={() => setNavbarModalOpen(false)}
        wide
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Manage the announcement messages that scroll continuously in the top headline bar above the navbar.
            </p>
            {/* <button
              type="button"
              onClick={handleResetNavbarItems}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline cursor-pointer shrink-0"
            >
              <RotateCcw size={12} />
              Reset to defaults
            </button> */}
          </div>

          {/* Add New Navbar Announcement Input */}
          <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-3.5 space-y-1.5">
            <label className="block text-xs font-bold text-sky-950">
              Add New Navbar Announcement:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newNavbarItem}
                onChange={(e) => setNewNavbarItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddNavbarItem();
                  }
                }}
                placeholder="e.g. Free shipping on all orders over PKR 10,000"
                className={`${inputClass} text-xs py-2 bg-white`}
              />
              <button
                type="button"
                onClick={handleAddNavbarItem}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 transition active:scale-95 shrink-0 cursor-pointer"
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* List of current navbar announcements */}
          <div className="space-y-2 max-h-[46vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              <span>Active Announcements ({navbarCount})</span>
              <span>Actions</span>
            </div>
            {(form.navbarAnnouncements || DEFAULT_NAVBAR_ANNOUNCEMENTS).map((item, index) => (
              <div key={index} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/60 p-1.5 hover:bg-slate-50">
                <span className="grid size-6 place-items-center rounded-md bg-sky-100 text-[11px] font-bold text-sky-700 shrink-0 select-none">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleEditNavbarItem(index, e.target.value)}
                  placeholder="Announcement message..."
                  className={`${inputClass} text-xs py-1.5 bg-white`}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveNavbarItem(index)}
                  title={`Delete announcement ${index + 1}`}
                  aria-label={`Remove announcement ${index + 1}`}
                  className="grid size-8 place-items-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors shrink-0 cursor-pointer"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            {(!form.navbarAnnouncements || form.navbarAnnouncements.length === 0) && (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                No announcements in the list. Add one using the box above or click &apos;Reset to defaults&apos;.
              </div>
            )}
          </div>

          <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setNavbarModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveNavbarModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 transition active:scale-95 cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </div>
      </AdminModal>

      {/* ─── MODAL 2: FOOTER TICKER ANNOUNCEMENTS ─── */}
      <AdminModal
        open={footerModalOpen}
        title="Footer Ticker Announcements"
        onClose={() => setFooterModalOpen(false)}
        wide
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Manage the messages that scroll across the announcement strip right above the footer.
            </p>
            {/* <button
              type="button"
              onClick={handleResetFooterItems}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline cursor-pointer shrink-0"
            >
              <RotateCcw size={12} />
              Reset to defaults
            </button> */}
          </div>

          {/* Add New Footer Announcement Input */}
          <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-3.5 space-y-1.5">
            <label className="block text-xs font-bold text-sky-950">
              Add New Announcement Message:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newFooterItem}
                onChange={(e) => setNewFooterItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddFooterItem();
                  }
                }}
                placeholder="e.g. SPECIAL DISCOUNT: 10% OFF ON ORDERS OVER RS. 50,000"
                className={`${inputClass} text-xs py-2 bg-white`}
              />
              <button
                type="button"
                onClick={handleAddFooterItem}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 transition active:scale-95 shrink-0 cursor-pointer"
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* List of current footer announcements */}
          <div className="space-y-2 max-h-[46vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              <span>Active Announcements ({footerCount})</span>
              <span>Actions</span>
            </div>
            {(form.footerAnnouncements || DEFAULT_FOOTER_ANNOUNCEMENTS).map((item, index) => (
              <div key={index} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/60 p-1.5 hover:bg-slate-50">
                <span className="grid size-6 place-items-center rounded-md bg-slate-200 text-[11px] font-bold text-slate-600 shrink-0 select-none">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleEditFooterItem(index, e.target.value)}
                  placeholder="Announcement message..."
                  className={`${inputClass} text-xs py-1.5 bg-white`}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFooterItem(index)}
                  title={`Delete announcement ${index + 1}`}
                  aria-label={`Remove announcement ${index + 1}`}
                  className="grid size-8 place-items-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors shrink-0 cursor-pointer"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            {(!form.footerAnnouncements || form.footerAnnouncements.length === 0) && (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                No announcements in the list. Add one using the box above or click &apos;Reset to defaults&apos;.
              </div>
            )}
          </div>

          <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setFooterModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveFooterModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 transition active:scale-95 cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
