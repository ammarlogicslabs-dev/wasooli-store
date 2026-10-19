import { useState } from "react";
import { toast } from "react-toastify";
import { saveSettings } from "../../services/storage/adminDataService";
import { useAdminAuth } from "../auth/AdminAuthContext";
import ImagePicker from "../components/ImagePicker";
import PageHeader from "../components/PageHeader";
import { buttonClass, inputClass } from "../components/formStyles";
import { useAdminData } from "../hooks/useAdminData";

export default function ProfilePage() {
  const { settings } = useAdminData();
  const { admin, updateProfile } = useAdminAuth();
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
    if (typeof updateProfile === "function") {
      updateProfile({ name: result.settings.adminName, avatarUrl: result.settings.avatarUrl });
    }
    toast.success("Profile updated successfully.");
  }

  return (
    <div className="space-y-5">
      <PageHeader crumbs={[{ label: "Admin Profile" }]} title="Admin Profile" detail="Display details for the demo admin. The password stays admin123." />
      <form onSubmit={handleSubmit} className="max-w-xl space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="mb-1.5 text-sm font-semibold text-slate-900">Avatar</p>
          <ImagePicker
            value={form.avatarUrl}
            onChange={(avatarUrl) => setForm({ ...form, avatarUrl })}
            label="Select avatar"
            changeLabel="Change avatar"
            previewClassName="mx-auto size-28 rounded-full object-cover"
            emptyClassName="h-28"
            rounded="rounded-3xl"
            maxEdge={400}
          />
        </div>
        <p className="text-sm text-slate-500">{admin?.email}</p>
        <label className="block text-sm font-semibold text-slate-900">Display name
          <input value={form.adminName} onChange={(event) => setForm({ ...form, adminName: event.target.value })} className={`${inputClass} mt-1.5`} />
        </label>
        <label className="block text-sm font-semibold text-slate-900">Email
          <input value={form.adminEmail} onChange={(event) => setForm({ ...form, adminEmail: event.target.value })} className={`${inputClass} mt-1.5 disabled:cursor-not-allowed disabled:opacity-50`} disabled />
        </label>
        <button type="submit" className={buttonClass}>Save profile</button>
      </form>
    </div>
  );
}
