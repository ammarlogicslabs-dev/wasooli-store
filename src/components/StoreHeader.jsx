import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSmoothNavigate } from "../auth/useSmoothNavigate";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Heart,
  LogIn,
  Mail,
  MapPin,
  Menu,
  ChevronRight,
  Phone,
  ShoppingBag,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useEnsureLogin } from "../auth/useEnsureLogin";
import { useCart } from "../cart/CartContext";
import { formatPrice } from "../data/product";
import { normalizeCategory } from "../data/categories";
import { resolveMediaUrl } from "../utils/mediaUrl";
import QuantityStepper from "./QuantityStepper";
import { PROGRAMMATIC_SCROLL_EVENT } from "../utils/smoothScroll";
import {
  AdaptersNicIcon,
  CablingIcon,
  NetworkSecurityIcon,
  OpticalFiberIcon,
  PoeIcon,
  PowerRacksIcon,
  RoutingIcon,
  SwitchingIcon,
  ToolsAccessoriesIcon,
  WirelessIcon,
} from "./NavIcons";

const STORE_NAME = "Wasooli Store";
const STORE_PHONE = "0300 1234567";
const STORE_EMAIL = "hello@wasooli.store";
const STORE_HEADLINE =
  "Nationwide delivery on networking cables  ·  Orders packed in 1-2 working days  ·  Standard delivery in 3-5 days  ·  Express in 1-2 days";

/** 10 Networking categories with large custom vector icons */
const NAV_ICONS = [
  { Icon: RoutingIcon, label: "Routing", category: "Routing" },
  { Icon: SwitchingIcon, label: "Switching", category: "Switching" },
  { Icon: WirelessIcon, label: "Wireless", category: "Wireless" },
  { Icon: NetworkSecurityIcon, label: "Network Security", category: "Network Security" },
  { Icon: OpticalFiberIcon, label: "Optical & Fiber", category: "Optical & Fiber" },
  { Icon: CablingIcon, label: "Cabling & Connectivity", category: "Cabling & Connectivity" },
  { Icon: PoeIcon, label: "PoE", category: "PoE" },
  { Icon: AdaptersNicIcon, label: "Adapters & NICs", category: "Adapters & NICs" },
  { Icon: PowerRacksIcon, label: "Power & Racks", category: "Power & Racks" },
  { Icon: ToolsAccessoriesIcon, label: "Tools & Accessories", category: "Tools & Accessories" },
];

const LABEL_WIDTHS = {
  "Routing": 52,
  "Switching": 63,
  "Wireless": 55,
  "Network Security": 103,
  "Optical & Fiber": 90,
  "Cabling & Connectivity": 132,
  "PoE": 31,
  "Adapters & NICs": 98,
  "Power & Racks": 91,
  "Tools & Accessories": 118,
};

function navIconTo(category) {
  if (!category) return "/shop";
  return `/shop?category=${encodeURIComponent(category)}`;
}

// Scroll behaviour tuning
const TOP_THRESHOLD = 18;
const SCROLL_DELTA = 2;
const NAV_HIDE_AFTER = 80;
const MOTION_EASE = [0.16, 1, 0.3, 1];
const DEFAULT_PROGRAMMATIC_MS = 1600;

function formatWishlistDate(value, emptyLabel = "Saved earlier") {
  if (!value) return emptyLabel;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Saved earlier";
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function availabilityOf(stock) {
  if (Number.isFinite(stock) && stock <= 0) {
    return { label: "Out of stock", className: "text-red-600", out: true };
  }
  if (Number.isFinite(stock) && stock <= 5) {
    return { label: `Only ${stock} left in stock`, className: "text-amber-600", low: true };
  }
  return { label: "In stock", className: "text-emerald-700" };
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
        <img src={resolveMediaUrl(item.image)} alt="" className="h-full w-full object-cover" />
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
        className="grid size-8 shrink-0 cursor-pointer place-items-center self-start rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-600"
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
        <img src={resolveMediaUrl(item.image)} alt="" className="h-full w-full object-cover" />
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
          <QuantityStepper
            size="sm"
            value={item.quantity}
            min={1}
            max={maxQuantity}
            onChange={(next) => onQuantityChange(item.id, next)}
            label={`quantity of ${item.title}`}
          />
          <p className="text-sm font-semibold text-slate-900">
            {formatPrice(item.price * item.quantity)}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.title} from cart`}
        className="grid size-8 shrink-0 place-items-center self-start rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 size={16} />
      </button>
    </li>
  );
}

export default function StoreHeader() {
  const {
    products,
    items,
    cartCount,
    removeItem,
    updateQuantity,
    wishlist,
    toggleWishlist,
    notificationCount = 0,
    subscribeCartOpen,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const ensureLogin = useEnsureLogin("Please log in first to continue to checkout.");
  const navigate = useSmoothNavigate();
  const location = useLocation();
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const headlineRef = useRef(null);
  const navRef = useRef(null);
  const [headlineHeight, setHeadlineHeight] = useState(0);
  const [navHeight, setNavHeight] = useState(0);
  // Headline collapses first, then the nav bar slides away.
  const [headlineHidden, setHeadlineHidden] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  

  const reduceMotion = useReducedMotion();
  const headerTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.42, ease: MOTION_EASE };

  const headlineTransition = reduceMotion
    ? { duration: 0 }
    : {
        height: { duration: 0.4, ease: MOTION_EASE },
        opacity: {
          duration: headlineHidden ? 0.22 : 0.3,
          ease: "easeInOut",
          delay: headlineHidden ? 0 : 0.08,
        },
      };

  const closeCart = () => setCartOpen(false);
  const closeWishlist = () => setWishlistOpen(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const drawerOpen = cartOpen || wishlistOpen || mobileMenuOpen;

  

  useEffect(() => {
    setCartOpen(false);
    setWishlistOpen(false);
    setMobileMenuOpen(false);
    setHeadlineHidden(false);
    setNavHidden(false);
  }, [location.pathname]);

  useEffect(() => {
    return subscribeCartOpen(() => {
      setWishlistOpen(false);
      setCartOpen(true);
    });
  }, [subscribeCartOpen]);

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
    const total = (headlineHeight || 36) + (navHeight || 72);
    document.documentElement.style.setProperty(
      "--store-header-height",
      `${total}px`
    );
    return () => {
      document.documentElement.style.removeProperty("--store-header-height");
    };
  }, [headlineHeight, navHeight]);

  /*
   * Scroll behaviour (staged):
   *  - 1st scroll down : only the headline hides
   *  - scrolling on    : after NAV_HIDE_AFTER more px, the nav bar hides too
   *  - scroll up       : only the nav bar comes back (headline stays hidden)
   *  - back at top     : headline is restored as well
   * Programmatic smooth scrolls (Explore Categories, shop filters, etc.) pause
   * auto-hide so the bar does not disappear mid-scroll and force a second click.
   */
  useEffect(() => {
    let lastY = window.scrollY;
    let downDistance = 0; // px scrolled down since the last upward scroll
    let upDistance = 0; // px scrolled up to prevent jitter on trackpad inertia
    let headlineIsHidden = false;
    let ignoreUntil = 0;

    function onProgrammaticScroll(event) {
      const duration = Number(event.detail?.durationMs);
      ignoreUntil =
        Date.now() +
        (Number.isFinite(duration) ? duration : DEFAULT_PROGRAMMATIC_MS);
      // Keep the current header visible so scroll-margin stays stable.
      setNavHidden(false);
      lastY = window.scrollY;
      downDistance = 0;
      upDistance = 0;
    }

    function onScroll() {
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;

      if (Date.now() < ignoreUntil) {
        return;
      }

      if (y <= TOP_THRESHOLD) {
        downDistance = 0;
        upDistance = 0;
        headlineIsHidden = false;
        setHeadlineHidden(false);
        setNavHidden(false);
        return;
      }

      if (Math.abs(delta) < SCROLL_DELTA) return;

      if (delta > 0) {
        upDistance = 0;
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
        upDistance += Math.abs(delta);
        if (upDistance > 8) {
          setNavHidden(false);
        }
      }
    }

    window.addEventListener(PROGRAMMATIC_SCROLL_EVENT, onProgrammaticScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener(PROGRAMMATIC_SCROLL_EVENT, onProgrammaticScroll);
      window.removeEventListener("scroll", onScroll);
    };
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

  // Lock page scroll and allow Escape to close while ANY drawer is open
  useEffect(() => {
    if (!drawerOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;
    const previousOverscroll = document.body.style.overscrollBehavior;

    // Lock scrolling completely across Desktop, iOS Safari & Android
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overflow = "hidden";

    // Pause Lenis smooth scrolling so background is frozen
    if (typeof window !== "undefined" && window.__lenis) {
      window.__lenis.stop();
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setCartOpen(false);
        setWishlistOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
      document.body.style.overscrollBehavior = previousOverscroll;
      document.documentElement.style.overflow = "";

      if (typeof window !== "undefined" && window.__lenis) {
        window.__lenis.start();
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [drawerOpen]);

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: navHidden ? "-100%" : "0%" }}
        transition={headerTransition}
        className={`fixed inset-x-0 top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur will-change-transform ${navHidden ? "pointer-events-none" : ""
          }`}
      >
        {/* Headline bar: height collapses smoothly (outer), natural height measured (inner) */}
        <motion.div
          initial={false}
          animate={{
            height: headlineHidden ? 0 : (headlineHeight || "auto"),
            opacity: headlineHidden ? 0 : 1,
          }}
          transition={headlineTransition}
          className="overflow-hidden will-change-[height,opacity]"
          aria-hidden={headlineHidden}
        >
          <div ref={headlineRef} className="bg-brand-500 text-white">
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

        <div ref={navRef} className="mx-auto max-w-8xl px-3 py-1 sm:px-6 sm:py-1.5 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: Burger Button (Mobile/Tablet) + Logo */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                className="grid size-9 sm:size-10 cursor-pointer place-items-center rounded-xl border border-slate-200 text-slate-700 transition hover:border-brand-500 hover:text-brand-600 lg:hidden"
              >
                <Menu size={20} />
              </button>

              <Link to="/" viewTransition className="flex shrink-0 items-center py-0.5 group">
                <img
                  src="/wasooli.png"
                  alt="Wasooli Store - ISP Supplies"
                  className="h-14 sm:h-16 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                />
              </Link>
            </div>

            {/* Desktop: Vibrant 3D icon pods centered */}
            <nav
              aria-label="Shop categories"
              className="mx-2 hidden min-w-0 flex-1 items-center justify-center lg:flex overflow-visible"
            >
              <div
                onMouseLeave={() => setHoveredIndex(null)}
                className="flex max-w-full items-center justify-center gap-1.5 xl:gap-2 p-1 overflow-visible"
              >
                {(() => {
                  const searchCat = new URLSearchParams(location.search).get("category");
                  const activeIndex =
                    location.pathname === "/shop" && searchCat
                      ? NAV_ICONS.findIndex(
                          (item) =>
                            item.category === searchCat ||
                            normalizeCategory(item.category) === normalizeCategory(searchCat)
                        )
                      : -1;

                  const getShift = (index) => {
                    const hasActive = activeIndex !== -1;
                    const hasHover = hoveredIndex !== null;

                    if (!hasActive && !hasHover) return 0;

                    const A = hasActive ? activeIndex : null;
                    const H = hasHover ? hoveredIndex : null;

                    if (A !== null && H === null) {
                      const shiftA = LABEL_WIDTHS[NAV_ICONS[A]?.label] || 80;
                      return index <= A ? shiftA : 0;
                    }

                    if (A === null && H !== null) {
                      const shiftH = LABEL_WIDTHS[NAV_ICONS[H]?.label] || 80;
                      return index <= H ? shiftH : 0;
                    }

                    if (A === H) {
                      const shiftA = LABEL_WIDTHS[NAV_ICONS[A]?.label] || 80;
                      return index <= A ? shiftA : 0;
                    }

                    const shiftA = LABEL_WIDTHS[NAV_ICONS[A]?.label] || 80;
                    const shiftH = LABEL_WIDTHS[NAV_ICONS[H]?.label] || 80;
                    const minIdx = Math.min(A, H);
                    const maxIdx = Math.max(A, H);
                    const shiftMin = minIdx === A ? shiftA : shiftH;
                    const shiftMax = maxIdx === A ? shiftA : shiftH;

                    if (index <= minIdx) {
                      return shiftMin + shiftMax;
                    }
                    if (index <= maxIdx) {
                      return shiftMax;
                    }
                    return 0;
                  };

                  return NAV_ICONS.map(({ Icon, label, category }, index) => {
                    const to = navIconTo(category);
                    const active = activeIndex === index;
                    const isHovered = hoveredIndex === index;
                    const isExpanded = active || isHovered;
                    const labelWidth = LABEL_WIDTHS[label] || 80;
                    const shift = getShift(index);

                    return (
                      <Link
                        key={label}
                        to={to}
                        viewTransition
                        aria-label={label}
                        aria-current={active ? "page" : undefined}
                        onMouseEnter={() => setHoveredIndex(index)}
                        style={{
                          transform: `translateX(-${shift}px)`,
                        }}
                        className={`group relative flex shrink-0 items-center rounded-2xl p-1.5 transition-transform duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 cursor-pointer ${
                          active ? "text-brand-700" : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {/* Animated sliding active pill indicator across links */}
                        {active && (
                          <motion.span
                            layoutId="activeCategoryPill"
                            className="absolute inset-y-0 left-0 rounded-2xl bg-linear-to-r from-brand-50 via-brand-100/70 to-brand-50 border border-brand-200/80 shadow-xs transition-all duration-300 ease-out cursor-pointer"
                            style={{
                              width: `calc(100% + ${labelWidth}px)`,
                            }}
                            transition={{ type: "spring", stiffness: 420, damping: 32 }}
                          />
                        )}

                        {/* Smooth expanding pill highlight on hover for non-active items */}
                        {!active && (
                          <span
                            className={`absolute inset-y-0 left-0 rounded-2xl bg-linear-to-r from-brand-50/90 via-brand-100/70 to-brand-50/90 border border-brand-200/80 shadow-xs transition-all duration-300 ease-out ${
                              isHovered ? "opacity-100 cursor-pointer" : "opacity-0 pointer-events-none"
                            }`}
                            style={{
                              width: isHovered ? `calc(100% + ${labelWidth}px)` : "100%",
                            }}
                          />
                        )}

                        {/* Icon container with depth & elevation on the LEFT */}
                        <span
                          className={`relative z-10 grid size-10 place-items-center rounded-xl bg-linear-to-b from-white to-slate-50 border transition-all duration-200 ${
                            active
                              ? "border-brand-300 shadow-xs from-white to-brand-50/50"
                              : "border-slate-200/90 shadow-2xs group-hover:border-brand-300 group-hover:from-white group-hover:to-brand-50/40"
                          }`}
                        >
                          <Icon size={26} className="shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.06)]" />
                        </span>

                        {/* Smooth expanding pill name on the RIGHT */}
                        <span
                          className={`absolute left-11.5 z-10 overflow-hidden transition-all duration-300 ease-out flex items-center ${
                            isExpanded ? "cursor-pointer" : "pointer-events-none"
                          }`}
                          style={{
                            width: isExpanded ? `${labelWidth}px` : "0px",
                            opacity: isExpanded ? 1 : 0,
                          }}
                        >
                          <span
                            className={`block whitespace-nowrap pl-1.5 pr-1 text-xs font-bold tracking-tight transition-colors ${
                              active ? "text-brand-700" : "text-slate-800 group-hover:text-brand-600"
                            }`}
                          >
                            {label}
                          </span>
                        </span>
                      </Link>
                    );
                  });
                })()}
              </div>
            </nav>

            {/* Right: Wishlist, Cart, Account */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => {
                  setCartOpen(false);
                  setWishlistOpen(true);
                }}
                aria-label={`Open wishlist, ${wishlistItems.length} items`}
                className="relative grid size-9 sm:size-10 cursor-pointer place-items-center rounded-xl border border-slate-200 text-slate-700 transition hover:border-brand-500 hover:text-brand-600"
              >
                <Heart
                  size={18}
                  className={wishlistItems.length > 0 ? "text-red-500" : ""}
                  fill={wishlistItems.length > 0 ? "currentColor" : "none"}
                />
                {wishlistItems.length > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-brand-500 px-1 text-[10px] font-bold leading-none text-white sm:-right-1.5 sm:-top-1.5 sm:h-5 sm:min-w-5 sm:text-[11px]">
                    {wishlistItems.length > 99 ? "99+" : wishlistItems.length}
                  </span>
                )}
              </button>

              {/* Cart Button */}
              <button
                type="button"
                onClick={() => {
                  setWishlistOpen(false);
                  setCartOpen(true);
                }}
                aria-label={`Open cart, ${cartCount} items`}
                className="relative grid size-9 sm:size-10 place-items-center rounded-xl border border-slate-200 text-slate-700 transition hover:border-brand-500 hover:text-brand-600 cursor-pointer"
              >
                <ShoppingBag size={18} />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-brand-500 px-1 text-[10px] font-bold leading-none text-white sm:-right-1.5 sm:-top-1.5 sm:h-5 sm:min-w-5 sm:text-[11px]">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>

              {/* Account / Login */}
              {isAuthenticated ? (
                <Link
                  to="/account"
                  viewTransition
                  aria-label="My account"
                  className={`relative grid size-9 sm:size-10 place-items-center rounded-xl border transition ${
                    location.pathname === "/account"
                      ? "border-brand-500 bg-brand-50 text-brand-600"
                      : "border-slate-200 text-slate-700 hover:border-brand-500 hover:text-brand-600"
                  }`}
                >
                  <User size={18} />
                  {notificationCount > 0 && (
                    <span className="absolute -right-1 -top-1 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-brand-500 px-1 text-[10px] font-bold leading-none text-white sm:-right-1.5 sm:-top-1.5 sm:h-5 sm:min-w-5 sm:text-[11px]">
                      {notificationCount > 99 ? "99+" : notificationCount}
                    </span>
                  )}
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    viewTransition
                    state={{ from: location }}
                    aria-label="Login"
                    className="grid size-9 place-items-center rounded-xl border border-brand-500 bg-brand-500 text-white transition hover:bg-brand-600 sm:hidden"
                  >
                    <LogIn size={16} aria-hidden="true" />
                  </Link>
                  <Link
                    to="/login"
                    viewTransition
                    state={{ from: location }}
                    className="hidden sm:inline-flex h-10 items-center gap-1.5 rounded-xl border border-brand-500 bg-brand-500 px-3 text-xs font-semibold text-white transition hover:bg-brand-600 sm:px-4 sm:text-sm"
                  >
                    <LogIn size={16} aria-hidden="true" />
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Spacer keeps page content in place; its height stays constant so scrolling never jumps */}
      <div
        aria-hidden="true"
        className="[overflow-anchor:none]"
        style={{ height: headlineHeight + navHeight }}
      />

      {/* Mobile Navigation Drawer with ALL 10 Navicons */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          mobileMenuOpen ? "visible" : "invisible pointer-events-none"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!mobileMenuOpen}
      >
        {/* Backdrop */}
        <div
          onClick={closeMobileMenu}
          onTouchMove={(e) => e.preventDefault()}
          className={`absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Slide-in panel from left */}
        <aside
          className={`absolute inset-y-0 left-0 flex w-full sm:w-[88vw] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-out overscroll-contain ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Drawer Top Header */}
          <div className="flex items-center justify-between border-b border-slate-200/90 px-4 py-3.5 sm:px-5">
            <Link to="/" onClick={closeMobileMenu} className="flex items-center">
              <img
                src="/wasooli.png"
                alt="Wasooli Store"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <button
              type="button"
              onClick={closeMobileMenu}
              aria-label="Close menu"
              className="grid size-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 overscroll-contain">
            {/* Categories List with exact desktop 3D icon pod design */}
            <div>
              <p className="px-1 pb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Categories
              </p>
              <div className="space-y-1.5">
                {NAV_ICONS.map(({ Icon, label, category }) => {
                  const to = navIconTo(category);
                  const searchCat = new URLSearchParams(location.search).get("category");
                  const active =
                    location.pathname === "/shop" &&
                    Boolean(category) &&
                    (searchCat === category ||
                      normalizeCategory(searchCat) === normalizeCategory(category));

                  return (
                    <Link
                      key={`drawer-${label}`}
                      to={to}
                      onClick={closeMobileMenu}
                      className={`group relative flex items-center gap-3 rounded-2xl p-2 transition-all duration-200 ${
                        active
                          ? "bg-linear-to-r from-brand-50 via-brand-100/70 to-brand-50 border border-brand-200 shadow-xs text-brand-700"
                          : "bg-white border border-slate-200/80 hover:border-brand-300 hover:bg-brand-50/40 shadow-2xs text-slate-800"
                      }`}
                    >
                      {/* Exact desktop-style 3D icon pod container */}
                      <span
                        className={`relative z-10 grid size-10 place-items-center rounded-xl bg-linear-to-b from-white to-slate-50 border transition-all duration-200 shrink-0 ${
                          active
                            ? "border-brand-300 shadow-xs from-white to-brand-50/50"
                            : "border-slate-200/90 shadow-2xs group-hover:border-brand-300 group-hover:from-white group-hover:to-brand-50/40"
                        }`}
                      >
                        <Icon size={26} className="shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.06)]" />
                      </span>

                      {/* Category label */}
                      <span className={`flex-1 text-xs font-bold tracking-tight truncate ${
                        active ? "text-brand-700" : "text-slate-800 group-hover:text-brand-600"
                      }`}>
                        {label}
                      </span>

                      {/* Chevron Right */}
                      <ChevronRight
                        size={15}
                        className={`shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 ${
                          active ? "text-brand-600" : "text-slate-400 group-hover:text-brand-500"
                        }`}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Customer Care info */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Need Help?
              </p>
              <div className="flex flex-col gap-1.5 text-xs text-slate-600">
                <a
                  href={`tel:${STORE_PHONE.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2 font-semibold text-slate-800 hover:text-brand-600"
                >
                  <Phone size={14} className="text-brand-500" />
                  <span>{STORE_PHONE}</span>
                </a>
                <a
                  href={`mailto:${STORE_EMAIL}`}
                  className="inline-flex items-center gap-2 font-medium text-slate-600 hover:text-brand-600"
                >
                  <Mail size={14} className="text-brand-500" />
                  <span>{STORE_EMAIL}</span>
                </a>
                <span className="inline-flex items-center gap-2 text-slate-500 text-[11px]">
                  <MapPin size={14} className="text-brand-500" />
                  Karachi, Pakistan
                </span>
              </div>
            </div>
          </div>

          {/* Drawer Footer Account CTA */}
          <div className="border-t border-slate-200/90 p-4 bg-white">
            {isAuthenticated ? (
              <Link
                to="/account"
                onClick={closeMobileMenu}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-500 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-600"
              >
                <User size={18} />
                <span>My Account</span>
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-500 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-600"
              >
                <LogIn size={18} />
                <span>Sign In / Register</span>
              </Link>
            )}
          </div>
        </aside>
      </div>

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
          onTouchMove={(e) => e.preventDefault()}
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
                  viewTransition
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
                  viewTransition
                  onClick={closeCart}
                  className="flex h-11 items-center justify-center rounded-xl border border-slate-200 px-2 text-center text-xs font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-600 sm:text-sm"
                >
                  Continue shopping
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    closeCart();
                    if (!ensureLogin(undefined, { pathname: "/checkout" })) return;
                    navigate("/checkout");
                  }}
                  className="flex h-11 cursor-pointer items-center justify-center rounded-xl bg-brand-500 px-2 text-center text-xs font-semibold text-white transition hover:bg-brand-600 sm:text-sm"
                >
                  Checkout
                </button>
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
          onTouchMove={(e) => e.preventDefault()}
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