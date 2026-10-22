import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Bell,
  Box,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Heart,
  KeyRound,
  LogOut,
  MapPin,
  Navigation,
  Package,
  PackageCheck,
  Phone,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import QuantityStepper from "../components/QuantityStepper";
import StoreHeader from "../components/StoreHeader";
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";
import { formatPrice } from "../data/product";
import { fetchMyOrders } from "../services/storage/adminDataService";
import { adminStage, historyTimeForStage } from "../services/storage/orderStatus";
import { resolveMediaUrl } from "../utils/mediaUrl";

const TRACKING_STEPS = [
  {
    key: "confirmed",
    title: "Order Confirmed",
    shortLabel: "Confirmed",
    location: "Wasooli Store",
    description: "Your order has been verified and confirmed.",
    icon: CheckCircle2,
  },
  {
    key: "packed",
    title: "Order Packed",
    shortLabel: "Packed",
    location: "Fulfillment",
    description: "Items have been packed and are ready for dispatch.",
    icon: Box,
  },
  {
    key: "handover",
    title: "Handed Over to Delivery Partner",
    shortLabel: "Handed Over",
    location: "Courier partner",
    description: "Package has been handed over to the delivery partner.",
    icon: Truck,
  },
  {
    key: "rider",
    title: "Out for Delivery",
    shortLabel: "Out for Delivery",
    location: "Local delivery",
    description: "Your order is out for delivery. Keep your phone reachable.",
    icon: Navigation,
  },
  {
    key: "delivered",
    title: "Delivered",
    shortLabel: "Delivered",
    location: "Delivered",
    description: "Package has been delivered successfully.",
    icon: PackageCheck,
  },
];

function formatStepTime(iso) {
  if (!iso) return "Pending";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Pending";
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

const HIDDEN_PASSWORDS = { current: true, next: false, confirm: false };

function formatDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function PasswordField({ id, label, value, shown, onToggle, onChange, autoComplete }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-900">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={shown ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          onChange={onChange}
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={shown ? `Hide ${label}` : `Show ${label}`}
          aria-pressed={shown}
          className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-slate-400 hover:text-slate-700"
        >
          {shown ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, detail, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <Icon size={18} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {detail ? <p className="mt-0.5 text-sm text-slate-500">{detail}</p> : null}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function Account() {
  const { user, logout, changePassword } = useAuth();
  const {
    products,
    items,
    cartCount,
    removeItem,
    updateQuantity,
    wishlist,
    toggleWishlist,
    notifications = [],
    notificationCount = 0,
    markNotificationsRead,
    removeNotification,
    clearNotifications,
    refreshNotifications,
  } = useCart();
  const navigate = useNavigate();
  const logoutToastId = useRef(null);
  const [logoutPromptOpen, setLogoutPromptOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [passwordError, setPasswordError] = useState("");
  // Each password field has its own show/hide state, so they work independently.
  const [visiblePassword, setVisiblePassword] = useState(HIDDEN_PASSWORDS);
  const [section, setSection] = useState("password");

  const toggleVisible = (field) =>
    setVisiblePassword((current) => ({ ...current, [field]: !current[field] }));

  useEffect(() => {
    document.title = "My account | Wasooli Store";
    let cancelled = false;
    fetchMyOrders()
      .then((list) => {
        if (!cancelled) setOrders(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (section !== "notifications") return undefined;
    let cancelled = false;
    Promise.resolve(refreshNotifications?.()).finally(() => {
      if (!cancelled) markNotificationsRead?.();
    });
    return () => {
      cancelled = true;
    };
  }, [section, markNotificationsRead, refreshNotifications]);

  function getOrderStage(order) {
    const managedStage = adminStage(order);
    if (order.adminStatus === "delivered") {
      return TRACKING_STEPS.length - 1;
    }
    return managedStage ?? 0;
  }

  function openOrderTracking(orderId) {
    setTrackingOrderId(orderId);
  }


  const wishlistItems = wishlist
    .map((entry) => {
      const product = products.find((item) => item.id === entry.id);
      if (!product) return null;
      return { ...product, addedAt: entry.addedAt };
    })
    .filter(Boolean);

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  function dismissLogoutPrompt() {
    if (logoutToastId.current == null) return;
    toast.dismiss(logoutToastId.current);
  }

  function handleLogout() {
    if (logoutToastId.current != null) return;

    setLogoutPromptOpen(true);
    logoutToastId.current = toast(
      ({ closeToast }) => (
        <div className="p-4">
          <h3 className="mb-2 text-lg font-semibold text-gray-800">Are you sure?</h3>
          <p className="mb-4 text-gray-600">You will be logged out of your account.</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                closeToast();
                logout();
                navigate("/login");
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Yes, Logout!
            </button>
            <button
              onClick={closeToast}
              className="rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        hideProgressBar: true,
        closeOnClick: false,
        draggable: false,
        onClose: () => {
          logoutToastId.current = null;
          setLogoutPromptOpen(false);
        },
      }
    );
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    if (!passwordForm.current || !passwordForm.next || !passwordForm.confirm) {
      setPasswordError("Fill in all password fields.");
      return;
    }
    if (passwordForm.next.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    const result = await changePassword(passwordForm.current, passwordForm.next);
    if (!result.success) {
      setPasswordError(result.message);
      return;
    }

    setPasswordForm({ current: "", next: "", confirm: "" });
    setPasswordError("");
    setVisiblePassword(HIDDEN_PASSWORDS);
    toast.success("Password updated.");
  }

  const links = [
    { id: "password", label: "Change password" },
    {
      id: "notifications",
      label: "Notifications",
      detail: null,
      badge: notificationCount,
    },
    {
      id: "orders",
      label: "Order history",
      detail: orders.length === 0 ? "No orders yet" : `${orders.length} orders`,
    },
    {
      id: "wishlist",
      label: "Wishlist",
      detail: wishlistItems.length === 0 ? "No saved items" : `${wishlistItems.length} saved`,
    },
    {
      id: "cart",
      label: "Cart",
      detail: cartCount === 0 ? "Empty" : `${cartCount} ${cartCount === 1 ? "item" : "items"}`,
    },
    
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <StoreHeader />
      {logoutPromptOpen && (
        <button
          type="button"
          aria-label="Close logout confirmation"
          onClick={dismissLogoutPrompt}
          className="fixed inset-0 z-9998 cursor-default bg-slate-900/50"
        />
      )}

      <div className="page-offset mx-auto max-w-8xl px-4 pb-6 sm:px-6 lg:px-8 lg:pb-10">
        <nav aria-label="Breadcrumb" className="page-crumb">
          <Link to="/shop">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Account</span>
        </nav>

        <Link
          to="/shop"
          className="mt-5 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-brand-600"
        >
          <ArrowLeft size={17} />
          Back to shopping
        </Link>

        <h1 className="mt-4 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          My account<span className="text-brand-500">.</span>
        </h1>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-[calc(var(--store-header-height,0px)+1rem)]">
            <div className="flex items-center gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-500 text-lg font-semibold text-white">
                {(user?.name || "W").charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-slate-900">
                  {user?.name || "Account"}
                </p>
                <p className="truncate text-sm text-slate-500">{user?.email}</p>
              </div>
            </div>

            <nav className="mt-5 space-y-1" aria-label="Account sections">
              {links.map((link) => {
                const active = section === link.id;
                return (
                  <button
                    key={link.id}
                    type="button"
                    aria-current={active ? "page" : undefined}
                    onClick={() => {
                      setSection(link.id);
                      if (link.id === "notifications") {
                        markNotificationsRead?.();
                      }
                    }}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                      active
                        ? "bg-brand-50 text-brand-600"
                        : "text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge > 0 ? (
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[11px] font-bold text-white">
                        {link.badge}
                      </span>
                    ) : link.detail ? (
                      <span className={`text-xs font-medium ${active ? "text-brand-600" : "text-slate-400"}`}>
                        {link.detail}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-200 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={16} />
              Log out
            </button>
          </aside>

          <div>
            {section === "password" ? (
            <Section
              icon={KeyRound}
              title="Change password"
              detail="Update the password you use to sign in."
            >
              <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-4" noValidate>
                <PasswordField
                  id="current-password"
                  label="Current password"
                  value={passwordForm.current}
                  shown={visiblePassword.current}
                  autoComplete="current-password"
                  onToggle={() => toggleVisible("current")}
                  onChange={(event) => {
                    setPasswordError("");
                    setPasswordForm((current) => ({ ...current, current: event.target.value }));
                  }}
                />
                <PasswordField
                  id="new-password"
                  label="New password"
                  value={passwordForm.next}
                  shown={visiblePassword.next}
                  autoComplete="new-password"
                  onToggle={() => toggleVisible("next")}
                  onChange={(event) => {
                    setPasswordError("");
                    setPasswordForm((current) => ({ ...current, next: event.target.value }));
                  }}
                />
                <PasswordField
                  id="confirm-password"
                  label="Confirm new password"
                  value={passwordForm.confirm}
                  shown={visiblePassword.confirm}
                  autoComplete="new-password"
                  onToggle={() => toggleVisible("confirm")}
                  onChange={(event) => {
                    setPasswordError("");
                    setPasswordForm((current) => ({ ...current, confirm: event.target.value }));
                  }}
                />
                {passwordError ? (
                  <p className="text-sm font-medium text-red-600">{passwordError}</p>
                ) : (
                  <p className="text-xs text-slate-500">Use at least 6 characters.</p>
                )}
                <button
                  type="submit"
                  className="flex h-11 cursor-pointer items-center justify-center rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  Update password
                </button>
              </form>
            </Section>
            ) : null}

            {section === "notifications" ? (
            <Section
              icon={Bell}
              title="Notifications"
              detail="Stock updates and availability alerts."
            >
              {notifications.length === 0 ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">
                  <p className="text-sm font-semibold text-slate-900">No notifications right now</p>
                  <p className="mt-1 text-xs text-slate-500">
                    When an out-of-stock product becomes available again, you'll see a message here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => clearNotifications?.()}
                      className="cursor-pointer text-xs font-semibold text-slate-500 transition hover:text-red-600"
                    >
                      Clear all
                    </button>
                  </div>
                  <ul className="space-y-3">
                    {notifications.map((notif) => {
                      const isAvailable = notif.type !== "out_of_stock";
                      return (
                        <li
                          key={notif.id}
                          className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5"
                        >
                          {notif.image && (
                            <Link
                              to={`/products/${notif.slug}`}
                              className="size-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white"
                            >
                              <img src={resolveMediaUrl(notif.image)} alt="" className="h-full w-full object-cover" />
                            </Link>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                  isAvailable
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-red-50 text-red-600"
                                }`}
                              >
                                {isAvailable ? "Back in stock" : "Out of stock"}
                              </span>
                              <span className="text-xs text-slate-400">
                                {formatDate(notif.createdAt)}
                              </span>
                            </div>
                            <p className="mt-1.5 text-sm font-medium text-slate-900">
                              {notif.message}
                            </p>
                            {notif.slug && (
                              <Link
                                to={`/products/${notif.slug}`}
                                className="mt-2 inline-flex h-8 items-center rounded-lg bg-brand-500 px-3 text-xs font-semibold text-white transition hover:bg-brand-600"
                              >
                                View product
                              </Link>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeNotification?.(notif.id)}
                            aria-label="Remove notification"
                            className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={15} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </Section>
            ) : null}

            {section === "orders" ? (
            <Section
              icon={Package}
              title="Order history"
              detail={
                orders.length === 0
                  ? "Orders you place will show up here."
                  : `${orders.length} ${orders.length === 1 ? "order" : "orders"}`
              }
            >
              {orders.length === 0 ? (
                <Link
                  to="/shop"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  Browse products
                </Link>
              ) : (
                <ul className="space-y-4">
                  {orders.map((order) => {
                    const stageIndex = getOrderStage(order);
                    const currentStep = TRACKING_STEPS[stageIndex] || TRACKING_STEPS[0];
                    const isCancelled = order.adminStatus === "cancelled";
                    const isDelivered = !isCancelled && stageIndex === TRACKING_STEPS.length - 1;
                    const isTrackingOpen = trackingOrderId === order.id;

                    return (
                      <li
                        key={order.id}
                        className={`rounded-2xl border transition ${
                          isTrackingOpen
                            ? "border-brand-300 bg-white shadow-md"
                            : "border-slate-200 bg-white"
                        } p-4 sm:p-5`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                  isCancelled
                                    ? "bg-red-50 text-red-600"
                                    : isDelivered
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-brand-50 text-brand-600"
                                }`}
                              >
                                <span
                                  className={`size-1.5 rounded-full ${
                                    isCancelled
                                      ? "bg-red-500"
                                      : isDelivered
                                      ? "bg-emerald-500"
                                      : "animate-pulse bg-brand-500"
                                  }`}
                                />
                                {isCancelled ? "Cancelled" : currentStep.title}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                              Placed on {formatDate(order.createdAt)}
                            </p>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <p className="text-sm font-bold text-slate-900">
                              {formatPrice(order.total)}
                            </p>
                            
                          </div>
                        </div>

                        <ul className="mt-3 space-y-1">
                          {(order.items || []).map((item) => (
                            <li key={`${order.id}-${item.id}`} className="text-sm text-slate-600">
                              {item.title} · Qty {item.quantity}
                            </li>
                          ))}
                        </ul>
                          <div className="flex items-center justify-between gap-2">
                          <p className="mt-2.5 text-xs text-slate-500">
                          {order.payment?.label || "Payment"}
                          {order.delivery?.city ? ` · ${order.delivery.city}` : ""}
                        </p>
                          <button
                              type="button"
                              onClick={() =>
                                isTrackingOpen
                                  ? setTrackingOrderId(null)
                                  : openOrderTracking(order.id)
                              }
                              className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition ${
                                isTrackingOpen
                                  ? "border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                                  : "bg-brand-500 text-white hover:bg-brand-600"
                              }`}
                            >
                              <Truck size={13} />
                              {isTrackingOpen ? "Hide tracking" : "Track order"}
                            </button>
                          </div>
                        
                        

                        {isTrackingOpen && (
                          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                            {/* Top Daraz-style banner */}
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3.5">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                                    Wasooli Express
                                  </span>
                                  {!isDelivered && !isCancelled && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                      <Clock size={11} className="animate-spin" />
                                      In progress
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 text-xs text-slate-500">
                                  {order.delivery?.method?.title || "Standard delivery"} ·{" "}
                                  {isCancelled
                                    ? "Order cancelled"
                                    : isDelivered
                                    ? "Delivered to recipient"
                                    : order.delivery?.method?.text || "Arrives in 3-5 working days"}
                                </p>
                                {order.trackingNumber ? (
                                  <p className="mt-1 text-xs font-medium text-slate-600">
                                    {order.courier || "Courier"} · {order.trackingNumber}
                                  </p>
                                ) : null}
                              </div>

                            </div>

                            {/* Horizontal Daraz-style Stepper */}
                            <div className="mt-4 grid grid-cols-5 gap-1.5 sm:gap-2">
                              {TRACKING_STEPS.map((step, index) => {
                                const StepIcon = step.icon;
                                const reached = index <= stageIndex;
                                const current = index === stageIndex;
                                return (
                                  <div key={step.key} className="flex flex-col items-center text-center">
                                    <div className="relative flex w-full items-center justify-center">
                                      {index > 0 && (
                                        <span
                                          className={`absolute right-1/2 top-1/2 h-0.5 w-full -translate-y-1/2 transition-colors duration-500 ${
                                            reached ? "bg-brand-500" : "bg-slate-200"
                                          }`}
                                        />
                                      )}
                                      <span
                                        className={`relative z-10 grid size-8 place-items-center rounded-full border-2 transition-all duration-300 sm:size-9 ${
                                          current
                                            ? "border-brand-500 bg-brand-500 text-white ring-4 ring-brand-100"
                                            : reached
                                            ? "border-brand-500 bg-brand-50 text-brand-600"
                                            : "border-slate-200 bg-white text-slate-400"
                                        }`}
                                      >
                                        <StepIcon size={15} />
                                      </span>
                                    </div>
                                    <p
                                      className={`mt-1.5 text-[10px] font-semibold leading-tight sm:text-[11px] ${
                                        reached ? "text-slate-900" : "text-slate-400"
                                      }`}
                                    >
                                      {step.shortLabel}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Vertical Daraz-style Detailed Timeline */}
                            <div className="mt-5 border-t border-slate-200 pt-4">
                              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                                Tracking Timeline
                              </p>
                              <ol className="relative ml-3 space-y-4 border-l-2 border-slate-200 pl-5">
                                {TRACKING_STEPS.map((step, index) => {
                                  const reached = index <= stageIndex;
                                  const current = index === stageIndex;
                                  const locationText =
                                    step.key === "delivered" && order.delivery?.city
                                      ? `${order.delivery.address || ""}${
                                          order.delivery.city ? `, ${order.delivery.city}` : ""
                                        }`
                                      : step.location;

                                  return (
                                    <li key={step.key} className="relative">
                                      <span
                                        className={`absolute -left-6 top-1 grid size-3.5 place-items-center rounded-full border-2 ${
                                          current
                                            ? "border-brand-500 bg-brand-500 ring-4 ring-brand-100"
                                            : reached
                                            ? "border-brand-500 bg-brand-500"
                                            : "border-slate-300 bg-white"
                                        }`}
                                      />
                                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                                        <p
                                          className={`text-xs font-bold sm:text-sm ${
                                            current
                                              ? "text-brand-600"
                                              : reached
                                              ? "text-slate-900"
                                              : "text-slate-400"
                                          }`}
                                        >
                                          {step.title}
                                        </p>
                                        <span
                                          className={`text-[11px] ${
                                            reached ? "font-medium text-slate-500" : "text-slate-400"
                                          }`}
                                        >
                                          
{!reached ? "Pending" : formatStepTime(historyTimeForStage(order, index) || (index === stageIndex ? (order.statusHistory || []).slice().reverse().find((event) => event.type !== "note" && event.type !== "refund" && event.status === order.adminStatus)?.at : null) || (index === 0 ? order.createdAt : null))}

                                        </span>
                                      </div>
                                      <p
                                        className={`mt-0.5 text-xs leading-relaxed ${
                                          reached ? "text-slate-600" : "text-slate-400"
                                        }`}
                                      >
                                        {step.description}
                                      </p>
                                      <p
                                        className={`mt-0.5 inline-flex items-center gap-1 text-[11px] ${
                                          reached ? "text-slate-500" : "text-slate-400"
                                        }`}
                                      >
                                        <MapPin size={11} />
                                        {locationText}
                                      </p>
                                    </li>
                                  );
                                })}
                              </ol>
                            </div>

                            {/* Delivery & Receiver Summary */}
                            {order.delivery && (
                              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-600">
                                <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                                  <MapPin size={13} className="text-brand-600" />
                                  {order.delivery.fullName} · {order.delivery.address},{" "}
                                  {order.delivery.city}
                                </span>
                                {order.delivery.phone && (
                                  <span className="inline-flex items-center gap-1 text-slate-500">
                                    <Phone size={12} />
                                    {order.delivery.phone}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </Section>
            ) : null}

            {section === "wishlist" ? (
            <Section
              icon={Heart}
              title="Wishlist"
              detail={
                wishlistItems.length === 0
                  ? "Save products to see them here."
                  : `${wishlistItems.length} saved`
              }
            >
              {wishlistItems.length === 0 ? (
                <Link
                  to="/shop"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  Browse products
                </Link>
              ) : (
                <ul className="space-y-4">
                  {wishlistItems.map((item) => {
                    const outOfStock = Number.isFinite(item.stock) && item.stock <= 0;
                    const lowStock = Number.isFinite(item.stock) && item.stock > 0 && item.stock <= 5;
                    return (
                      <li key={item.id} className="flex gap-3">
                        <Link
                          to={`/products/${item.slug}`}
                          className="size-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50"
                        >
                          <img src={resolveMediaUrl(item.image)} alt="" className="h-full w-full object-cover" />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/products/${item.slug}`}
                            className="line-clamp-2 text-sm font-semibold text-slate-900 hover:text-brand-600"
                          >
                            {item.title}
                          </Link>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">
                              {formatPrice(item.price)}
                            </span>
                            <span
                              className={`text-xs font-semibold ${
                                outOfStock
                                  ? "text-red-600"
                                  : lowStock
                                  ? "text-amber-600"
                                  : "text-emerald-700"
                              }`}
                            >
                              ·{" "}
                              {outOfStock
                                ? "Out of stock"
                                : lowStock
                                ? `Only ${item.stock} left`
                                : "In stock"}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.addedAt ? `Saved ${formatDate(item.addedAt)}` : "Saved earlier"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleWishlist(item.id)}
                          aria-label={`Remove ${item.title} from wishlist`}
                          className="grid size-8 shrink-0 cursor-pointer place-items-center self-start rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Section>
            ) : null}

            {section === "cart" ? (
            <Section
              icon={ShoppingBag}
              title="Cart"
              detail={
                cartCount === 0
                  ? "Add products to see them here."
                  : `${cartCount} ${cartCount === 1 ? "item" : "items"}`
              }
            >
              {items.length === 0 ? (
                <Link
                  to="/shop"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  Browse products
                </Link>
              ) : (
                <div>
                  <ul className="space-y-4">
                    {items.map((item) => {
                      const maxQuantity = Number.isFinite(item.stock) ? item.stock : Infinity;
                      return (
                        <li key={item.id} className="flex gap-3">
                          <Link
                            to={`/products/${item.slug}`}
                            className="size-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50"
                          >
                            <img src={resolveMediaUrl(item.image)} alt="" className="h-full w-full object-cover" />
                          </Link>
                          <div className="min-w-0 flex-1">
                            <Link
                              to={`/products/${item.slug}`}
                              className="line-clamp-2 text-sm font-semibold text-slate-900 hover:text-brand-600"
                            >
                              {item.title}
                            </Link>
                            <p className="mt-1 text-xs text-slate-500">{formatPrice(item.price)} each</p>
                            <div className="mt-2 flex items-center justify-between gap-2">
                              <QuantityStepper
                                size="sm"
                                value={item.quantity}
                                min={1}
                                max={maxQuantity}
                                onChange={(next) => updateQuantity(item.id, next)}
                                label={`quantity of ${item.title}`}
                              />
                              <p className="text-sm font-semibold text-slate-900">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            aria-label={`Remove ${item.title} from cart`}
                            className="grid size-8 shrink-0 cursor-pointer place-items-center self-start rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <p className="text-sm text-slate-500">
                      Subtotal{" "}
                      <span className="font-bold text-slate-900">{formatPrice(subtotal)}</span>
                    </p>
                    <Link
                      to="/checkout"
                      className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white transition hover:bg-brand-600"
                    >
                      Checkout
                    </Link>
                  </div>
                </div>
              )}
            </Section>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}