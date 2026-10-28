import { Menu } from "lucide-react";
import { useAdminAuth } from "../auth/AdminAuthContext";
import { useAdminData } from "../hooks/useAdminData";
import { resolveMediaUrl } from "../../utils/mediaUrl";

export default function AdminHeader({ onOpenMobile }) {
  const { admin } = useAdminAuth();
  const { settings } = useAdminData();
  const initial = (admin?.name || "A").charAt(0).toUpperCase();
  const avatarUrl = resolveMediaUrl(settings.avatarUrl);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onOpenMobile} className="grid size-10 cursor-pointer place-items-center rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
          <Menu size={18} />
        </button>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-900">{admin?.name || "Admin"}</p>
          <p className="text-xs text-slate-500">{admin?.email}</p>
        </div>
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="size-10 rounded-full object-cover" />
        ) : (
          <span className="grid size-10 place-items-center rounded-full bg-brand-500 text-sm font-bold text-white">{initial}</span>
        )}
      </div>
    </header>
  );
}
