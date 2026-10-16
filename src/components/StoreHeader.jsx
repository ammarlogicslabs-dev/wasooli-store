import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, useReducedMotion } from "framer-motion";
import { Heart, LogOut, Mail, MapPin, Minus, Phone, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";
import { formatPrice, products } from "../data/product";

const STORE_NAME = "Wasooli Store";
const STORE_PHONE = "0300 1234567";
const STORE_EMAIL = "hello@wasooli.store";
const STORE_HEADLINE =
  "Nationwide delivery on networking cables  ·  Orders packed in 1-2 working days  ·  Standard delivery in 3-5 days  ·  Express in 1-2 days";

// Scroll behaviour tuning
const TOP_THRESHOLD = 18; // px from top where everything is shown again
const SCROLL_DELTA = 2; // ignore tiny scroll movements
const NAV_HIDE_AFTER = 80; // extra px scrolled down (after headline hides) before the nav hides
const MOTION_EASE = [0.22, 1, 0.36, 1];

function formatWishlistDate(value) {
  if (!value) return "Saved earlier";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Saved earlier";
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function availabilityOf(stock) {
  if (!Number.isFinite(stock) || stock > 0) {
    return { label: "In stock", className: "text-emerald-700" };
  }
  return { label: "Out of stock", className: "text-red-600" };
}

function WishlistItem({ item, onView, onRemove }) {
  const availability = availabilityOf(item.stock);

  return (
    <li className="flex gap-3">
      <Link
        to={`/products/${item.slug}`}
        onClick={onView}
        className="size-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50"
      >
        <img src={item.image} alt="" className="h-full w-full object-cover" />
      </Link>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold text-slate-900">
          {item.title}
        </p>
        <p className={`mt-1 text-xs font-semibold ${availability.className}`}>
          {availability.label}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {item.addedAt
            ? `Wishlisted on ${formatWishlistDate(item.addedAt)}`
            : "Saved earlier"}
        </p>
        <Link
          to={`/products/${item.slug}`}
          onClick={onView}
          className="mt-2 inline-flex h-8 items-center rounded-lg bg-brand-500 px-3 text-xs font-semibold text-white transition hover:bg-brand-600"
        >
          View item
        </Link>
      </div>

      <button
        type="button"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.title} from wishlist`}
        className="grid size-8 shrink-0 cursor-pointer place-items-center self-start rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 size={16} />
      </button>
    </li>
  );
}

function CartItem({ item, onNavigate, onRemove, onQuantityChange }) {
  const productPath = `/products/${item.slug}`;
  const maxQuantity = Number.isFinite(item.stock) ? item.stock : Infinity;

  return (
    <li className="flex gap-3">
      <Link
        to={productPath}
        onClick={onNavigate}
        className="size-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50"
      >
        <img src={item.image} alt="" className="h-full w-full object-cover" />
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          to={productPath}
          onClick={onNavigate}
          className="line-clamp-2 text-sm font-semibold text-slate-900 transition hover:text-brand-600"
        >
          {item.title}
        </Link>
        <p className="mt-1 text-xs text-slate-500">
          {formatPrice(item.price)} each
        </p>

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex h-8 items-center rounded-lg border border-slate-200 bg-white">
            <button
              type="button"
              disabled={item.quantity <= 1}
              onClick={() => onQuantityChange(item.id, item.quantity - 1)}
              aria-label={`Decrease quantity of ${item.title}`}
              className="grid size-8 place-items-center text-slate-600 transition hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Minus size={14} />
            </button>
            <span
              className="min-w-6 text-center text-sm font-semibold text-slate-900"
              aria-live="polite"
            >
              {item.quantity}
            </span>
            <button
              type="button"
              disabled={item.quantity >= maxQuantity}
              onClick={() => onQuantityChange(item.id, item.quantity + 1)}
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
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.title} from cart`}
        className="grid size-8 shrink-0 place-items-center self-start rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 size={16} />
      </button>
    </li>
  );
}

export default function StoreHeader() {
  const { user, logout } = useAuth();
  const {
    items,
    cartCount,
    removeItem,
    updateQuantity,
    wishlist,
    toggleWishlist,
    subscribeCartOpen,
  } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const logoutToastId = useRef(null);
  const [logoutPromptOpen, setLogoutPromptOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const headlineRef = useRef(null);
  const navRef = useRef(null);
  const [headlineHeight, setHeadlineHeight] = useState(0);
  const [navHeight, setNavHeight] = useState(0);
  // Headline collapses first, then the nav bar slides away.
  const [headlineHidden, setHeadlineHidden] = useState(false);
  const [navHidden, setNavHidden] = useState(false);

  const reduceMotion = useReducedMotion();
  const motionTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.35, ease: MOTION_EASE };

  const closeCart = () => setCartOpen(false);
  const closeWishlist = () => setWishlistOpen(false);
  const drawerOpen = cartOpen || wishlistOpen;

  useEffect(() => {
    return subscribeCartOpen(() => {
      setWishlistOpen(false);
      setCartOpen(true);
    });
  }, [subscribeCartOpen]);

  useEffect(() => {
    setCartOpen(false);
    setWishlistOpen(false);
  }, [location.pathname]);

  useLayoutEffect(() => {
    const measure = () => {
      if (headlineRef.current) setHeadlineHeight(headlineRef.current.offsetHeight);
      if (navRef.current) setNavHeight(navRef.current.offsetHeight);
    };

    measure();
    const observer = new ResizeObserver(measure);
    if (headlineRef.current) observer.observe(headlineRef.current);
    if (navRef.current) observer.observe(navRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const height =
      (headlineHidden ? 0 : headlineHeight) + (navHidden ? 0 : navHeight);
    document.documentElement.style.setProperty(
      "--store-header-height",
      `${height}px`
    );
    return () => {
      document.documentElement.style.removeProperty("--store-header-height");
    };
  }, [headlineHidden, headlineHeight, navHidden, navHeight]);

  /*
   * Scroll behaviour (staged):
   *  - 1st scroll down : only the headline hides
   *  - scrolling on    : after NAV_HIDE_AFTER more px, the nav bar hides too
   *  - scroll up       : only the nav bar comes back (headline stays hidden)
   *  - back at top     : headline is restored as well
   */
  useEffect(() => {
    let lastY = window.scrollY;
    let downDistance = 0; // px scrolled down since the last upward scroll
    let headlineIsHidden = false;

    function onScroll() {
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;

      if (y <= TOP_THRESHOLD) {
        downDistance = 0;
        headlineIsHidden = false;
        setHeadlineHidden(false);
        setNavHidden(false);
        return;
      }

      if (Math.abs(delta) < SCROLL_DELTA) return;

      if (delta > 0) {
        downDistance += delta;

        if (!headlineIsHidden) {
          headlineIsHidden = true;
          setHeadlineHidden(true);
          // restart the count so the nav needs its own extra scroll
          downDistance = 0;
          return;
        }

        if (downDistance > NAV_HIDE_AFTER) setNavHidden(true);
      } else {
        downDistance = 0;
        setNavHidden(false);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const wishlistItems = wishlist
    .map((entry) => {
      const product = products.find((item) => item.id === entry.id);
      if (!product) return null;
      return { ...product, addedAt: entry.addedAt };
    })
    .filter(Boolean);

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Lock page scroll and allow Escape to close while a drawer is open
  useEffect(() => {
    if (!drawerOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setCartOpen(false);
        setWishlistOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [drawerOpen]);

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
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Are you sure?</h3>
          <p className="text-gray-600 mb-4">You will be logged out of your account.</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                closeToast();
                closeCart();
                closeWishlist();
                logout();
                navigate("/login");
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Yes, Logout!
            </button>
            <button
              onClick={closeToast}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        position: "top-right",
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

  return (
    <>
      {logoutPromptOpen && (
        <button
          type="button"
          aria-label="Close logout confirmation"
          onClick={dismissLogoutPrompt}
          className="fixed inset-0 z-[9998] cursor-default bg-slate-900/50"
        />
      )}
      <motion.header
        initial={false}
        animate={{ y: navHidden ? "-100%" : "0%" }}
        transition={motionTransition}
        className={`fixed inset-x-0 top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur ${navHidden ? "pointer-events-none" : ""}`}
      >
        {/* Headline bar: height collapses smoothly (outer), natural height measured (inner) */}
        <motion.div
          initial={false}
          animate={{
            height: headlineHidden ? 0 : "auto",
            opacity: headlineHidden ? 0 : 1,
          }}
          transition={motionTransition}
          className="overflow-hidden"
          aria-hidden={headlineHidden}
        >
          <div ref={headlineRef} className="bg-brand-700 text-white">
            <div className="mx-auto flex max-w-8xl flex-col gap-2 px-4 py-1.5 sm:flex-row sm:items-center sm:gap-12 sm:px-6 lg:px-8">
              <div
                className="store-headline min-w-0 flex-1 overflow-hidden"
                aria-label={STORE_HEADLINE}
              >
                <div className="store-headline-track text-[11px] font-medium sm:text-xs">
                  <span className="whitespace-nowrap">{STORE_HEADLINE}</span>
                  <span className="whitespace-nowrap" aria-hidden="true">
                    {STORE_HEADLINE}
                  </span>
                </div>
              </div>
              <div className="hidden shrink-0 items-center gap-x-3 overflow-x-auto text-[11px] font-medium scrollbar-none sm:flex sm:gap-4 sm:text-xs">
                <a
                  href={`tel:${STORE_PHONE.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap transition hover:text-brand-100"
                >
                  <Phone size={13} aria-hidden="true" />
                  {STORE_PHONE}
                </a>
                <a
                  href={`mailto:${STORE_EMAIL}`}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap transition hover:text-brand-100"
                >
                  <Mail size={13} aria-hidden="true" />
                  {STORE_EMAIL}
                </a>
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <MapPin size={13} aria-hidden="true" />
                  Karachi
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div ref={navRef} className="mx-auto flex max-w-8xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/shop" className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full border border-slate-200 bg-white">
              <img
                src="/wasooli.png"
                alt=""
                className="h-full w-full object-cover"
              />
            </span>
            <span className="truncate text-base font-bold tracking-tight text-slate-900">
              {STORE_NAME}
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* {user?.name && (
              <span className="hidden max-w-40 truncate text-sm font-medium text-slate-600 sm:inline">
                {user.name}
              </span>
            )} */}

            <button
              type="button"
              onClick={() => {
                setCartOpen(false);
                setWishlistOpen(true);
              }}
              aria-label={`Open wishlist, ${wishlistItems.length} ${wishlistItems.length === 1 ? "item" : "items"
                }`}
              className="relative grid size-10 cursor-pointer place-items-center rounded-xl border border-slate-200 text-slate-700 transition hover:border-brand-500 hover:text-brand-600"
            >
              <Heart
                size={18}
                className={wishlistItems.length > 0 ? "text-red-500" : ""}
                fill={wishlistItems.length > 0 ? "currentColor" : "none"}
              />
              {wishlistItems.length > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-[11px] font-bold leading-none text-white">
                  {wishlistItems.length > 99 ? "99+" : wishlistItems.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setWishlistOpen(false);
                setCartOpen(true);
              }}
              aria-label={`Open cart, ${cartCount} ${cartCount === 1 ? "item" : "items"
                }`}
              className="relative grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-700 transition hover:border-brand-500 hover:text-brand-600"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-[11px] font-bold leading-none text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Spacer keeps page content in place; its height stays constant so scrolling never jumps */}
      <div
        aria-hidden="true"
        className="[overflow-anchor:none]"
        style={{ height: headlineHeight + navHeight }}
      />

      {/* Cart drawer */}
      <div
        className={`fixed inset-0 z-50 ${cartOpen ? "visible" : "invisible pointer-events-none"
          }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        aria-hidden={!cartOpen}
      >
        <div
          onClick={closeCart}
          className={`absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${cartOpen ? "opacity-100" : "opacity-0"
            }`}
        />

        <aside
          className={`absolute inset-y-0 right-0 flex w-[85vw] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${cartOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-900">
              Your cart
              {cartCount > 0 && (
                <span className="ml-2 text-sm font-normal text-slate-500">
                  ({cartCount} {cartCount === 1 ? "item" : "items"})
                </span>
              )}
            </h2>
            <button
              type="button"
              onClick={closeCart}
              aria-label="Close cart"
              className="grid size-9 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <span className="grid size-14 place-items-center rounded-full bg-brand-50 text-brand-600">
                  <ShoppingBag size={24} />
                </span>
                <p className="mt-4 text-base font-semibold text-slate-900">
                  Your cart is empty
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Add some products to see them here.
                </p>
                <Link
                  to="/shop"
                  onClick={closeCart}
                  className="mt-5 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  Browse products
                </Link>
              </div>
            ) : (
              <ul className="space-y-5">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onNavigate={closeCart}
                    onRemove={removeItem}
                    onQuantityChange={updateQuantity}
                  />
                ))}
              </ul>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-slate-200 px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Subtotal</span>
                <span className="text-base font-bold text-slate-900">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Delivery details are collected at checkout.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  to="/shop"
                  onClick={closeCart}
                  className="flex h-11 items-center justify-center rounded-xl border border-slate-200 px-2 text-center text-xs font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-600 sm:text-sm"
                >
                  Continue shopping
                </Link>
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="flex h-11 items-center justify-center rounded-xl bg-brand-500 px-2 text-center text-xs font-semibold text-white transition hover:bg-brand-600 sm:text-sm"
                >
                  Checkout
                </Link>
              </div>
            </div>
          )}
        </aside>
      </div>

      <div
        className={`fixed inset-0 z-50 ${wishlistOpen ? "visible" : "invisible pointer-events-none"
          }`}
        role="dialog"
        aria-modal="true"
        aria-label="Wishlist"
        aria-hidden={!wishlistOpen}
      >
        <div
          onClick={closeWishlist}
          className={`absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${wishlistOpen ? "opacity-100" : "opacity-0"
            }`}
        />

        <aside
          className={`absolute inset-y-0 right-0 flex w-[85vw] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${wishlistOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-900">
              Wishlist
              {wishlistItems.length > 0 && (
                <span className="ml-2 text-sm font-normal text-slate-500">
                  ({wishlistItems.length}{" "}
                  {wishlistItems.length === 1 ? "item" : "items"})
                </span>
              )}
            </h2>
            <button
              type="button"
              onClick={closeWishlist}
              aria-label="Close wishlist"
              className="grid size-9 cursor-pointer place-items-center rounded-full text-slate-500 transition hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4">
            {wishlistItems.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <span className="grid size-14 place-items-center rounded-full bg-brand-50 text-brand-600">
                  <Heart size={24} />
                </span>
                <p className="mt-4 text-base font-semibold text-slate-900">
                  Your wishlist is empty
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Save products to see them here.
                </p>
                <Link
                  to="/shop"
                  onClick={closeWishlist}
                  className="mt-5 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  Browse products
                </Link>
              </div>
            ) : (
              <ul className="space-y-5">
                {wishlistItems.map((item) => (
                  <WishlistItem
                    key={item.id}
                    item={item}
                    onView={closeWishlist}
                    onRemove={toggleWishlist}
                  />
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}