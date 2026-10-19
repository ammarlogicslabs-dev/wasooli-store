import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Tags,
  BadgePercent,
  UserRound,
  Users,
  X,
} from "lucide-react";

const MAIN = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/coupons", label: "Coupons & Discounts", icon: BadgePercent },
  { to: "/admin/reports", label: "Reports & Payments", icon: BarChart3 },
];

const PREFERENCES = [
  { to: "/admin/settings", label: "Store Settings", icon: Settings },
  { to: "/admin/profile", label: "Admin Profile", icon: UserRound },
];

function Item({ item, collapsed, onNavigate }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      title={item.label}
      onClick={onNavigate}
      className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        isActive ? "bg-brand-500 text-white" : "text-slate-600 hover:bg-brand-50 hover:text-brand-700"
      }`}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  );
}

export default function AdminSidebar({ collapsed, mobileOpen, onClose, onLogout }) {
  return (
    <>
      {mobileOpen && <button type="button" aria-label="Close menu" className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-72 flex-col border-r border-slate-200 bg-white transition-[width,transform] ${collapsed ? "lg:w-20" : "lg:w-72"} ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-5">
          <div className={collapsed ? "lg:hidden" : ""}>
            <p className="text-lg font-bold text-slate-900">Store Admin</p>
            <p className="text-xs text-slate-500">Store management workspace</p>
          </div>
          <button type="button" onClick={onClose} className="grid size-9 cursor-pointer place-items-center rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-3 pb-4">
          <div>
            {!collapsed && <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Main menu</p>}
            <div className="space-y-1">
              {MAIN.map((item) => <Item key={item.to} item={item} collapsed={collapsed} onNavigate={onClose} />)}
            </div>
          </div>
          <div>
            {!collapsed && <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Preferences</p>}
            <div className="space-y-1">
              {PREFERENCES.map((item) => <Item key={item.to} item={item} collapsed={collapsed} onNavigate={onClose} />)}
            </div>
          </div>
        </div>
        <div className="shrink-0 border-t border-slate-100 bg-white p-3">
          <button type="button" onClick={onLogout} className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
