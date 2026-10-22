import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../auth/AdminAuthContext";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import { useAdminData } from "../hooks/useAdminData";

export default function AdminLayout() {
  const { logout } = useAdminAuth();
  const { settings } = useAdminData();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login", {
      replace: true,
      state: { from: { pathname: "/admin" } },
      viewTransition: typeof document !== "undefined" && "startViewTransition" in document,
    });
  }

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 ${settings.density === "compact" ? "text-[13px]" : ""}`}>
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onLogout={handleLogout}
      />
      <div className={`flex min-h-screen min-w-0 flex-col ${collapsed ? "lg:pl-20" : "lg:pl-72"}`}>
        <AdminHeader
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((value) => !value)}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
