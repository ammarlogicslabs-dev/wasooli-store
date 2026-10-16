import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Heart,
  KeyRound,
  LogOut,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import StoreHeader from "../components/StoreHeader";
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";
import { formatPrice, products } from "../data/product";

const ORDERS_KEY = "wasooli_orders";

function readOrders() {
  try {
    const saved = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

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
  const { items, cartCount, removeItem, updateQuantity, wishlist, toggleWishlist } = useCart();
  const navigate = useNavigate();
  const logoutToastId = useRef(null);
  const [logoutPromptOpen, setLogoutPromptOpen] = useState(false);
  const [orders, setOrders] = useState(readOrders);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [visiblePassword, setVisiblePassword] = useState("");
  const [section, setSection] = useState("password");

  useEffect(() => {
    document.title = "My account | Wasooli Store";
    setOrders(readOrders());
  }, []);

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

  function handlePasswordSubmit(event) {
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

    const result = changePassword(passwordForm.current, passwordForm.next);
    if (!result.success) {
      setPasswordError(result.message);
      return;
    }

    setPasswordForm({ current: "", next: "", confirm: "" });
    setPasswordError("");
    setVisiblePassword("");
    toast.success("Password updated.");
  }

  const links = [
    { id: "password", label: "Change password" },
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
          className="fixed inset-0 z-[9998] cursor-default bg-slate-900/50"
        />
      )}

      <div className="mx-auto max-w-8xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <nav aria-label="Breadcrumb" className="text-xs text-slate-500 sm:text-sm">
          <Link to="/shop" className="hover:text-brand-600">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-slate-900">Account</span>
        </nav>

        <Link
          to="/shop"
          className="mt-5 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-brand-600"
        >
          <ArrowLeft size={17} />
          Back to shopping
        </Link>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">
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
                    onClick={() => setSection(link.id)}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                      active
                        ? "bg-brand-50 text-brand-600"
                        : "text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.detail ? (
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
                  shown={visiblePassword === "current"}
                  autoComplete="current-password"
                  onToggle={() =>
                    setVisiblePassword((current) => (current === "current" ? "" : "current"))
                  }
                  onChange={(event) => {
                    setPasswordError("");
                    setPasswordForm((current) => ({ ...current, current: event.target.value }));
                  }}
                />
                <PasswordField
                  id="new-password"
                  label="New password"
                  value={passwordForm.next}
                  shown={visiblePassword === "next"}
                  autoComplete="new-password"
                  onToggle={() =>
                    setVisiblePassword((current) => (current === "next" ? "" : "next"))
                  }
                  onChange={(event) => {
                    setPasswordError("");
                    setPasswordForm((current) => ({ ...current, next: event.target.value }));
                  }}
                />
                <PasswordField
                  id="confirm-password"
                  label="Confirm new password"
                  value={passwordForm.confirm}
                  shown={visiblePassword === "confirm"}
                  autoComplete="new-password"
                  onToggle={() =>
                    setVisiblePassword((current) => (current === "confirm" ? "" : "confirm"))
                  }
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
                <ul className="space-y-3">
                  {orders.map((order) => (
                    <li key={order.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900">{order.id}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{formatDate(order.createdAt)}</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">
                          {formatPrice(order.total)}
                        </p>
                      </div>
                      <ul className="mt-3 space-y-1">
                        {(order.items || []).map((item) => (
                          <li key={`${order.id}-${item.id}`} className="text-sm text-slate-600">
                            {item.title} · Qty {item.quantity}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 text-xs text-slate-500">
                        {order.payment?.label || "Payment"}
                        {order.delivery?.city ? ` · ${order.delivery.city}` : ""}
                      </p>
                    </li>
                  ))}
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
                  {wishlistItems.map((item) => (
                    <li key={item.id} className="flex gap-3">
                      <Link
                        to={`/products/${item.slug}`}
                        className="size-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50"
                      >
                        <img src={item.image} alt="" className="h-full w-full object-cover" />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/products/${item.slug}`}
                          className="line-clamp-2 text-sm font-semibold text-slate-900 hover:text-brand-600"
                        >
                          {item.title}
                        </Link>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {formatPrice(item.price)}
                        </p>
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
                  ))}
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
                            <img src={item.image} alt="" className="h-full w-full object-cover" />
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
                              <div className="flex h-8 items-center rounded-lg border border-slate-200 bg-white">
                                <button
                                  type="button"
                                  disabled={item.quantity <= 1}
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  aria-label={`Decrease quantity of ${item.title}`}
                                  className="grid size-8 place-items-center text-slate-600 transition hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="min-w-6 text-center text-sm font-semibold text-slate-900">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  disabled={item.quantity >= maxQuantity}
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  aria-label={`Increase quantity of ${item.title}`}
                                  className="grid size-8 place-items-center text-slate-600 transition hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
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
