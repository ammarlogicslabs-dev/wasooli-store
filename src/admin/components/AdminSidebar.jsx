import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Boxes,
  ChevronDown,
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Store,
  Tags,
  BadgePercent,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useAdminData } from "../hooks/useAdminData";

export default function AdminSidebar({
  collapsed,
  mobileOpen,
  onClose,
  onLogout,
  onToggleCollapse,
}) {
  const location = useLocation();
  const { orders } = useAdminData();

  const isProductsActive = location.pathname.startsWith("/admin/products");
  const isOrdersActive = location.pathname.startsWith("/admin/orders");

  // Single open accordion: 'products' | 'orders' | null
  const [openMenu, setOpenMenu] = useState(() => {
    if (location.pathname.startsWith("/admin/products")) return "products";
    if (location.pathname.startsWith("/admin/orders")) return "orders";
    return null;
  });

  const [hoveredItem, setHoveredItem] = useState(null);

  // Sync open menu with current route: only active dropdown stays open
  useEffect(() => {
    if (location.pathname.startsWith("/admin/products")) {
      setOpenMenu("products");
    } else if (location.pathname.startsWith("/admin/orders")) {
      setOpenMenu("orders");
    }
  }, [location.pathname]);

  function handleProductsClick() {
    if (collapsed && onToggleCollapse) {
      onToggleCollapse();
      setOpenMenu("products");
      return;
    }
    setOpenMenu((prev) => (prev === "products" ? null : "products"));
  }

  function handleOrdersClick() {
    if (collapsed && onToggleCollapse) {
      onToggleCollapse();
      setOpenMenu("orders");
      return;
    }
    setOpenMenu((prev) => (prev === "orders" ? null : "orders"));
  }

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-dvh flex-col border-r border-slate-200 bg-white text-slate-800 transition-[width,transform] duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${
          collapsed ? "w-20" : "w-72"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Floating Circular Toggle Button on right border (matching reference screenshot) */}

{onToggleCollapse && (
  <div className="hidden lg:flex absolute -right-5 top-5 z-50 items-center justify-center">
    {/* Outer Circle */}
    <div className="absolute size-12 rounded-full border border-blue-200/70 bg-blue-50/40 shadow-[0_0_18px_rgba(44,154,255,0.12)]" />

    {/* Collapse Button */}
    <button
      type="button"
      onClick={onToggleCollapse}
      className="
        relative grid size-8 place-items-center
        rounded-full
        border border-blue-100
        bg-white
        text-brand-500
        shadow-[0_2px_10px_rgba(44,154,255,0.16)]
        cursor-pointer
        transition-all duration-300 ease-out
        hover:border-brand-500
        hover:bg-blue-50
        hover:shadow-[0_4px_16px_rgba(44,154,255,0.28)]
        hover:scale-110
        active:scale-95
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-[#2C9AFF]  
        focus-visible:ring-offset-2
      "
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      <ChevronLeft
        size={16}
        strokeWidth={2.5}
        className={`transition-transform duration-300 ease-in-out ${
          collapsed ? "rotate-180" : ""
        }`}
      />
    </button>
  </div>
)}

        {/* Top Header / Logo */}
        <div className="flex shrink-0 items-center justify-between px-4 pt-4 pb-3">
          <div
            className={`flex items-center gap-2.5 min-w-0 ${
              collapsed ? "justify-center w-full" : ""
            }`}
          >
            {/* Logo icon */}
            <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-brand-500 text-white shadow-xs">
              <Store size={18} />
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[15px] font-bold tracking-tight text-slate-900">
                    Wasooli
                  </span>
                  {/* <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9.5px] font-semibold text-emerald-700 border border-emerald-200">
                    Live
                  </span> */}
                </div>
                <p className="truncate text-[10.5px] text-slate-400">
                  Store Management
                </p>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 cursor-pointer place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden transition-colors"
            aria-label="Close sidebar"
          >
            <X size={17} />
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-2 custom-scrollbar">
          {/* Top Single Item: Dashboard (directly below logo matching screenshot) */}
          <div
            className="relative"
            onMouseEnter={() => setHoveredItem("dashboard")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <NavLink
              to="/admin"
              end
              viewTransition
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center rounded-xl text-xs transition-colors duration-150 ${
                  collapsed
                    ? "size-9 justify-center mx-auto"
                    : "gap-2.5 px-3 py-2.5 w-full"
                } ${
                  isActive
                    ? "bg-brand-50 text-brand-700 font-semibold border border-brand-200/70"
                    : "text-slate-600 hover:bg-slate-100/80 font-medium"
                }`
              }
            >
              <LayoutDashboard size={17} className="shrink-0" />
              {!collapsed && <span className="truncate text-xs">Dashboard</span>}
            </NavLink>

            {/* Collapsed Tooltip */}
            <AnimatePresence>
              {collapsed && hoveredItem === "dashboard" && (
                <motion.div
                  initial={{ opacity: 0, x: -6, scale: 0.94 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -6, scale: 0.94 }}
                  className="pointer-events-none absolute left-full top-1/2 ml-2.5 -translate-y-1/2 z-50 whitespace-nowrap rounded-lg border border-slate-800 bg-slate-900/95 px-2.5 py-1 text-[11px] font-medium text-white shadow-xl"
                >
                  Dashboard
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* =========================================
              SECTION 1: PRODUCT MANAGEMENT
             ========================================= */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-600">
                Product Management
              </p>
            )}

            {collapsed && (
              <div className="mx-auto my-1.5 w-5 border-t border-slate-200" />
            )}

            {/* Manage Product (Expandable Accordion with Tree Connector) */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={handleProductsClick}
                className={`group flex items-center rounded-xl text-xs transition-colors duration-150 cursor-pointer ${
                  collapsed
                    ? "size-9 justify-center mx-auto"
                    : "w-full justify-between px-3 py-2.5"
                } ${
                  isProductsActive
                    ? "bg-brand-50 text-brand-700 font-semibold border border-brand-200/70"
                    : "text-slate-600 hover:bg-slate-100/80 font-medium"
                }`}
                title="Manage Product"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Package size={17} className="shrink-0" />
                  {!collapsed && (
                    <span className="truncate text-xs">Manage Product</span>
                  )}
                </div>

                {!collapsed && (
                  <ChevronDown
                    size={14}
                    className={`shrink-0 transition-transform duration-200 ${
                      openMenu === "products" ? "rotate-0 text-brand-600" : "-rotate-90 text-slate-400"
                    }`}
                  />
                )}
              </button>

              {/* Submenu Tree with Dynamic Line Fill (matching /shop) */}
              <AnimatePresence initial={false}>
                {!collapsed && openMenu === "products" && (() => {
                  const productSubIndex =
                    location.pathname === "/admin/products"
                      ? 0
                      : location.pathname.startsWith("/admin/products/new") ||
                        location.pathname.includes("/edit")
                      ? 1
                      : -1;
                  const hasActiveProductSub = productSubIndex !== -1;
                  const productFillPercent = hasActiveProductSub
                    ? productSubIndex * 100
                    : 0;

                  return (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="relative ml-5 pl-4 py-1.5 space-y-1">
                        {/* Vertical Tree Connector Guide Line with Dynamic Theme Fill */}
                        <div className="absolute left-2 top-3 bottom-3 w-[1.5px] bg-slate-200 pointer-events-none">
                          {/* Animated Active Filled Line */}
                          <motion.div
                            initial={false}
                            animate={{
                              height: hasActiveProductSub
                                ? `${productFillPercent}%`
                                : "0%",
                            }}
                            transition={{ type: "spring", stiffness: 350, damping: 28 }}
                            className="absolute top-0 left-0 w-full bg-brand-500 rounded-full shadow-[0_0_8px_rgba(44,154,255,0.45)]"
                          />

                          {/* Top Dot */}
                          <span
                            className={`absolute -top-1 -left-0.75 size-2 rounded-full ring-2 ring-white transition-colors duration-200 ${
                              hasActiveProductSub || isProductsActive
                                ? "bg-brand-500 shadow-[0_0_8px_rgba(44,154,255,0.6)]"
                                : "bg-slate-300"
                            }`}
                          />

                          {/* Bottom Dot */}
                          <span
                            className={`absolute -bottom-1 left-[-2.5px] size-1.5 rounded-full ring-2 ring-white transition-colors duration-200 ${
                              productSubIndex === 1
                                ? "bg-brand-500 scale-125 shadow-[0_0_8px_rgba(44,154,255,0.6)]"
                                : "bg-slate-300"
                            }`}
                          />
                        </div>

                        {/* Sub-item: All Products */}
                        <NavLink
                          to="/admin/products"
                          end
                          viewTransition
                          onClick={onClose}
                          className={({ isActive }) =>
                            `block rounded-lg px-2.5 py-1 text-xs transition-colors ${
                              isActive
                                ? "text-brand-600 font-semibold"
                                : "text-slate-500 hover:text-slate-900 font-medium"
                            }`
                          }
                        >
                          All Products
                        </NavLink>

                        {/* Sub-item: Add New Product */}
                        <NavLink
                          to="/admin/products/new"
                          end
                          viewTransition
                          onClick={onClose}
                          className={({ isActive }) =>
                            `block rounded-lg px-2.5 py-1 text-xs transition-colors ${
                              isActive
                                ? "text-brand-600 font-semibold"
                                : "text-slate-500 hover:text-slate-900 font-medium"
                            }`
                          }
                        >
                          Add Product
                        </NavLink>
                      </div>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
            </div>

            {/* Categories & Attributes (Plain link without arrow) */}
            <NavLink
              to="/admin/categories"
              end
              viewTransition
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center rounded-xl text-xs transition-colors duration-150 ${
                  collapsed
                    ? "size-9 justify-center mx-auto"
                    : "w-full gap-2.5 px-3 py-2.5"
                } ${
                  isActive
                    ? "bg-brand-50 text-brand-700 font-semibold border border-brand-200/70"
                    : "text-slate-600 hover:bg-slate-100/80 font-medium"
                }`
              }
              title="Categories & Attributes"
            >
              <Tags size={17} className="shrink-0" />
              {!collapsed && (
                <span className="truncate text-xs">Categories & Attributes</span>
              )}
            </NavLink>

            {/* Manage Inventory (Plain link without arrow) */}
            <NavLink
              to="/admin/inventory"
              end
              viewTransition
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center rounded-xl text-xs transition-colors duration-150 ${
                  collapsed
                    ? "size-9 justify-center mx-auto"
                    : "w-full gap-2.5 px-3 py-2.5"
                } ${
                  isActive
                    ? "bg-brand-50 text-brand-700 font-semibold border border-brand-200/70"
                    : "text-slate-600 hover:bg-slate-100/80 font-medium"
                }`
              }
              title="Manage Inventory"
            >
              <Boxes size={17} className="shrink-0" />
              {!collapsed && (
                <span className="truncate text-xs">Manage Inventory</span>
              )}
            </NavLink>
          </div>

          {/* =========================================
              SECTION 2: ORDER MANAGEMENT
             ========================================= */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-600">
                Order Management
              </p>
            )}

            {collapsed && (
              <div className="mx-auto my-1.5 w-5 border-t border-slate-200" />
            )}

            {/* Orders (Expandable Accordion with Tree Connector) */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={handleOrdersClick}
                className={`group flex items-center rounded-xl text-xs transition-colors duration-150 cursor-pointer ${
                  collapsed
                    ? "size-9 justify-center mx-auto"
                    : "w-full justify-between px-3 py-2.5"
                } ${
                  isOrdersActive
                    ? "bg-brand-50 text-brand-700 font-semibold border border-brand-200/70"
                    : "text-slate-600 hover:bg-slate-100/80 font-medium"
                }`}
                title="Orders"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <ShoppingBag size={17} className="shrink-0" />
                  {!collapsed && <span className="truncate text-xs">Orders</span>}
                </div>

                {!collapsed && (
                  <div className="flex items-center gap-1.5">
                    {orders?.length > 0 && (
                      <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
                        {orders.length}
                      </span>
                    )}
                    <ChevronDown
                      size={14}
                      className={`shrink-0 transition-transform duration-200 ${
                        openMenu === "orders" ? "rotate-0 text-brand-600" : "-rotate-90 text-slate-400"
                      }`}
                    />
                  </div>
                )}
              </button>

              {/* Submenu Tree with Dynamic Line Fill (matching /shop) */}
              <AnimatePresence initial={false}>
                {!collapsed && openMenu === "orders" && (() => {
                  const orderSubIndex =
                    location.pathname.startsWith("/admin/orders")
                      ? 0
                      : location.pathname.startsWith("/admin/reports")
                      ? 1
                      : -1;
                  const hasActiveOrderSub = orderSubIndex !== -1;
                  const orderFillPercent = hasActiveOrderSub
                    ? orderSubIndex * 100
                    : 0;

                  return (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="relative ml-5 pl-4 py-1.5 space-y-1">
                        {/* Vertical Tree Connector Guide Line with Dynamic Theme Fill */}
                        <div className="absolute left-2 top-3 bottom-3 w-[1.5px] bg-slate-200 pointer-events-none">
                          {/* Animated Active Filled Line */}
                          <motion.div
                            initial={false}
                            animate={{
                              height: hasActiveOrderSub
                                ? `${orderFillPercent}%`
                                : "0%",
                            }}
                            transition={{ type: "spring", stiffness: 350, damping: 28 }}
                            className="absolute top-0 left-0 w-full bg-brand-500 rounded-full shadow-[0_0_8px_rgba(44,154,255,0.45)]"
                          />

                          {/* Top Dot */}
                          <span
                            className={`absolute -top-1 -left-0.75 size-2 rounded-full ring-2 ring-white transition-colors duration-200 ${
                              hasActiveOrderSub || isOrdersActive
                                ? "bg-brand-500 shadow-[0_0_8px_rgba(44,154,255,0.6)]"
                                : "bg-slate-300"
                            }`}
                          />

                          {/* Bottom Dot */}
                          <span
                            className={`absolute -bottom-1 left-[-2.5px] size-1.5 rounded-full ring-2 ring-white transition-colors duration-200 ${
                              orderSubIndex === 1
                                ? "bg-brand-500 scale-125 shadow-[0_0_8px_rgba(44,154,255,0.6)]"
                                : "bg-slate-300"
                            }`}
                          />
                        </div>

                        {/* Sub-item: All Orders */}
                        <NavLink
                          to="/admin/orders"
                          end
                          viewTransition
                          onClick={onClose}
                          className={({ isActive }) =>
                            `block rounded-lg px-2.5 py-1 text-xs transition-colors ${
                              isActive
                                ? "text-brand-600 font-semibold"
                                : "text-slate-500 hover:text-slate-900 font-medium"
                            }`
                          }
                        >
                          All Orders
                        </NavLink>

                        {/* Sub-item: Reports */}
                        <NavLink
                          to="/admin/reports"
                          end
                          viewTransition
                          onClick={onClose}
                          className={({ isActive }) =>
                            `block rounded-lg px-2.5 py-1 text-xs transition-colors ${
                              isActive
                                ? "text-brand-600 font-semibold"
                                : "text-slate-500 hover:text-slate-900 font-medium"
                            }`
                          }
                        >
                          Order Reports
                        </NavLink>
                      </div>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
            </div>

            {/* Coupons & Discounts (Plain link) */}
            <NavLink
              to="/admin/coupons"
              end
              viewTransition
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center rounded-xl text-xs transition-colors duration-150 ${
                  collapsed
                    ? "size-9 justify-center mx-auto"
                    : "w-full gap-2.5 px-3 py-2.5"
                } ${
                  isActive
                    ? "bg-brand-50 text-brand-700 font-semibold border border-brand-200/70"
                    : "text-slate-600 hover:bg-slate-100/80 font-medium"
                }`
              }
              title="Coupons & Discounts"
            >
              <BadgePercent size={17} className="shrink-0" />
              {!collapsed && (
                <span className="truncate text-xs">Coupons & Discounts</span>
              )}
            </NavLink>

            {/* Transactions & Payments (Plain link) */}
            <NavLink
              to="/admin/reports"
              end
              viewTransition
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center rounded-xl text-xs transition-colors duration-150 ${
                  collapsed
                    ? "size-9 justify-center mx-auto"
                    : "w-full gap-2.5 px-3 py-2.5"
                } ${
                  isActive
                    ? "bg-brand-50 text-brand-700 font-semibold border border-brand-200/70"
                    : "text-slate-600 hover:bg-slate-100/80 font-medium"
                }`
              }
              title="Transactions & Payments"
            >
              <BarChart3 size={17} className="shrink-0" />
              {!collapsed && (
                <span className="truncate text-xs">Transactions & Reports</span>
              )}
            </NavLink>
          </div>

          {/* =========================================
              SECTION 3: USER MANAGEMENT
             ========================================= */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-600">
                User Management
              </p>
            )}

            {collapsed && (
              <div className="mx-auto my-1.5 w-5 border-t border-slate-200" />
            )}

            {/* All Customers */}
            <NavLink
              to="/admin/customers"
              end
              viewTransition
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center rounded-xl text-xs transition-colors duration-150 ${
                  collapsed
                    ? "size-9 justify-center mx-auto"
                    : "w-full gap-2.5 px-3 py-2.5"
                } ${
                  isActive
                    ? "bg-brand-50 text-brand-700 font-semibold border border-brand-200/70"
                    : "text-slate-600 hover:bg-slate-100/80 font-medium"
                }`
              }
              title="All Users"
            >
              <Users size={17} className="shrink-0" />
              {!collapsed && <span className="truncate text-xs">All Users</span>}
            </NavLink>

            {/* Admin Profile */}
            <NavLink
              to="/admin/profile"
              end
              viewTransition
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center rounded-xl text-xs transition-colors duration-150 ${
                  collapsed
                    ? "size-9 justify-center mx-auto"
                    : "w-full gap-2.5 px-3 py-2.5"
                } ${
                  isActive
                    ? "bg-brand-50 text-brand-700 font-semibold border border-brand-200/70"
                    : "text-slate-600 hover:bg-slate-100/80 font-medium"
                }`
              }
              title="Admin"
            >
              <UserRound size={17} className="shrink-0" />
              {!collapsed && <span className="truncate text-xs">Admin</span>}
            </NavLink>

            {/* Store Settings */}
            <NavLink
              to="/admin/settings"
              end
              viewTransition
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center rounded-xl text-xs transition-colors duration-150 ${
                  collapsed
                    ? "size-9 justify-center mx-auto"
                    : "w-full gap-2.5 px-3 py-2.5"
                } ${
                  isActive
                    ? "bg-brand-50 text-brand-700 font-semibold border border-brand-200/70"
                    : "text-slate-600 hover:bg-slate-100/80 font-medium"
                }`
              }
              title="Store Settings"
            >
              <Settings size={17} className="shrink-0" />
              {!collapsed && (
                <span className="truncate text-xs">Store Settings</span>
              )}
            </NavLink>
          </div>
        </div>

        {/* Bottom Logout Button */}
        <div className="shrink-0 border-t border-slate-100 bg-white p-2">
          <button
            type="button"
            onClick={onLogout}
            title="Logout"
            className={`group flex items-center rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer ${
              collapsed
                ? "size-9 justify-center mx-auto"
                : "w-full gap-2.5 px-3 py-2.5"
            }`}
          >
            <LogOut
              size={16}
              className="shrink-0 group-hover:translate-x-0.5 transition-transform duration-150"
            />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
