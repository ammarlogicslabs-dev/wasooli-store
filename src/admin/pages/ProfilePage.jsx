import { useState } from "react";
import { toast } from "react-toastify";
import { saveSettings } from "../../services/storage/adminDataService";
import { useAdminAuth } from "../auth/AdminAuthContext";
import PageHeader from "../components/PageHeader";
import { buttonClass, inputClass } from "../components/formStyles";
import { useAdminData } from "../hooks/useAdminData";

export default function ProfilePage() {
  const { settings } = useAdminData();
  const { admin, updateSession } = useAdminAuth();
  const [form, setForm] = useState({
    adminName: settings.adminName,
    adminEmail: settings.adminEmail,
    avatarUrl: settings.avatarUrl || "",
  });

  function handleSubmit(event) {
    event.preventDefault();
    const result = saveSettings(form);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    // updateSession only exists once AdminAuthContext provides it.
    if (typeof updateSession === "function") {
      updateSession({ name: result.settings.adminName, email: result.settings.adminEmail });
    }
    toast.success("Profile updated successfully.");
  }

  const initial = (form.adminName || "A").charAt(0).toUpperCase();

  return (
    <div className="space-y-5">
      <PageHeader crumbs={[{ label: "Admin Profile" }]} title="Admin Profile" detail="Display details for the demo admin. The password stays admin123." />
      <form onSubmit={handleSubmit} className="max-w-xl space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          {form.avatarUrl ? (
            <img src={form.avatarUrl} alt="" className="size-16 rounded-full object-cover" />
          ) : (
            <span className="grid size-16 place-items-center rounded-full bg-brand-500 text-xl font-bold text-white">{initial}</span>
          )}
          <div>
            <p className="font-semibold text-slate-900">{admin?.name}</p>
            <p className="text-sm text-slate-500">Signed in for this browser tab</p>
          </div>
        </div>
        <label className="block text-sm font-semibold text-slate-900">Display name
          <input value={form.adminName} onChange={(event) => setForm({ ...form, adminName: event.target.value })} className={`${inputClass} mt-1.5`} />
        </label>
        <label className="block text-sm font-semibold text-slate-900 ">Email
          <input value={form.adminEmail} onChange={(event) => setForm({ ...form, adminEmail: event.target.value })} className={`${inputClass} mt-1.5 disabled:cursor-not-allowed disabled:opacity-50`} disabled />
        </label>
        <label className="block text-sm font-semibold text-slate-900">Avatar image URL
          <input value={form.avatarUrl} onChange={(event) => setForm({ ...form, avatarUrl: event.target.value })} placeholder="https://..." className={`${inputClass} mt-1.5`} />
        </label>
        <button type="submit" className={buttonClass}>Save profile</button>
      </form>
    </div>
  );
}