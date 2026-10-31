import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Bell,
  Box,
  Check,
  CheckCircle2,
  Clock,
  Copy,
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
  Save,
  ShoppingBag,
  Sparkles,
  Star,
  Ticket,
  Trash2,
  Truck,
  User,
  X,
  XCircle,
} from "lucide-react";
import QuantityStepper from "../components/QuantityStepper";
import StoreHeader from "../components/StoreHeader";
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";
import { formatPrice } from "../data/product";
import {
  fetchMyOrders,
  fetchPublicCoupons,
  fetchSavedAddress,
  listCoupons,
  saveSavedAddress,
} from "../services/storage/adminDataService";
import { getUserReviewedOrderMap, submitReview } from "../services/storage/reviewService";
import { adminStage, historyTimeForStage } from "../services/storage/orderStatus";
import { resolveMediaUrl } from "../utils/mediaUrl";
import { PASSWORD_HINT, passwordPolicyError } from "../utils/passwordPolicy";

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
          placeholder={`Enter ${label.toLowerCase()}`}
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
    <section className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-3.5 sm:p-6 shadow-sm overflow-hidden">
      <div className="flex items-start gap-2.5 sm:gap-3">
        <span className="grid size-9 sm:size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <Icon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-slate-900 truncate">{title}</h2>
          {detail ? <p className="mt-0.5 text-xs sm:text-sm text-slate-500 truncate">{detail}</p> : null}
        </div>
      </div>
      <div className="mt-4 sm:mt-5">{children}</div>
    </section>
  );
}

export default function Account() {
  const { user, logout, changePassword, updateProfile } = useAuth();
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
  const [logoutPromptOpen, setLogoutPromptOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [trackingOrderId, setTrackingOrderId] = useState(null);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "",
    province: user?.province || "Punjab",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [reviewModal, setReviewModal] = useState({
    open: false,
    order: null,
    item: null,
    rating: 5,
    hoverRating: 0,
    comment: "",
    submitting: false,
  });

  const [reviewVersion, setReviewVersion] = useState(0);
  const userIdentifier = user?.email || user?.id || "";

  const reviewedMap = useMemo(() => {
    if (reviewVersion < 0) return {};
    return getUserReviewedOrderMap(userIdentifier);
  }, [userIdentifier, reviewVersion]);

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [passwordError, setPasswordError] = useState("");
  // Each password field has its own show/hide state, so they work independently.
  const [visiblePassword, setVisiblePassword] = useState(HIDDEN_PASSWORDS);

  const [searchParams, setSearchParams] = useSearchParams();
  const [localSection, setLocalSection] = useState(() => {
    if (typeof window !== "undefined") {
      const s = new URLSearchParams(window.location.search).get("section");
      if (s && ["profile", "orders", "coupons", "notifications", "password", "wishlist", "cart"].includes(s)) {
        return s;
      }
    }
    return "profile";
  });

  const rawSection = searchParams.get("section");
  const section =
    rawSection && ["profile", "orders", "coupons", "notifications", "password", "wishlist", "cart"].includes(rawSection)
      ? rawSection
      : localSection;

  function handleSelectSection(nextSection) {
    setLocalSection(nextSection);
    setSearchParams({ section: nextSection }, { replace: true });
    if (nextSection === "notifications") {
      markNotificationsRead?.();
    }
  }

  const [couponsList, setCouponsList] = useState(() => listCoupons());
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchPublicCoupons().then((list) => {
      if (!cancelled && Array.isArray(list)) {
        setCouponsList(list);
      }
    });

    const handleCouponsUpdate = () => {
      setCouponsList(listCoupons());
    };
    window.addEventListener("wasooli-data", handleCouponsUpdate);
    window.addEventListener("storage", handleCouponsUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener("wasooli-data", handleCouponsUpdate);
      window.removeEventListener("storage", handleCouponsUpdate);
    };
  }, []);

  const activeCoupons = useMemo(() => {
    const now = new Date().toISOString().slice(0, 10);
    return couponsList.filter((c) => {
      if (!c) return false;
      if (c.active === false) return false;
      if (c.expiryDate && c.expiryDate < now) return false;
      if (c.usageLimit && Number(c.used || 0) >= Number(c.usageLimit)) return false;
      return true;
    });
  }, [couponsList]);

  function handleCopyCoupon(code) {
    if (!code) return;
    try {
      navigator.clipboard.writeText(code);
    } catch {
      // fallback
    }
    setCopiedCode(code);
    toast.success(`Coupon code "${code}" copied to clipboard!`);
    setTimeout(() => {
      setCopiedCode((curr) => (curr === code ? null : curr));
    }, 2500);
  }

  const toggleVisible = (field) =>
    setVisiblePassword((current) => ({ ...current, [field]: !current[field] }));

  useEffect(() => {
    const handleReviewAdded = () => {
      setReviewVersion((v) => v + 1);
    };
    window.addEventListener("wasooli-review-added", handleReviewAdded);
    return () => window.removeEventListener("wasooli-review-added", handleReviewAdded);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchSavedAddress()
      .then((addr) => {
        if (!cancelled && addr) {
          setProfileForm((prev) => ({
            ...prev,
            name: user?.name || addr.fullName || prev.name,
            email: user?.email || prev.email,
            phone: addr.phone || user?.phone || prev.phone,
            address: addr.address || user?.address || prev.address,
            city: addr.city || user?.city || prev.city,
            province: addr.province || user?.province || prev.province,
          }));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      if (updateProfile) {
        await updateProfile({
          name: profileForm.name.trim(),
          email: profileForm.email.trim(),
          phone: profileForm.phone.trim(),
          address: profileForm.address.trim(),
          city: profileForm.city.trim(),
          province: profileForm.province.trim(),
        });
      }
      await saveSavedAddress({
        fullName: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
        address: profileForm.address.trim(),
        city: profileForm.city.trim(),
        province: profileForm.province.trim(),
      });
      toast.success("Profile & shipping address updated successfully!");
    } catch {
      toast.error("Could not update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  function openReviewModal(order, item) {
    setReviewModal({
      open: true,
      order,
      item,
      rating: 5,
      hoverRating: 0,
      comment: "",
      submitting: false,
    });
  }

  function handleReviewSubmit(e) {
    e.preventDefault();
    if (!reviewModal.item || !reviewModal.order) return;
    setReviewModal((prev) => ({ ...prev, submitting: true }));
    try {
      submitReview({
        orderId: reviewModal.order.id,
        productId: reviewModal.item.id || reviewModal.item.productId || reviewModal.item.slug,
        productSlug: reviewModal.item.slug || reviewModal.item.id,
        productTitle: reviewModal.item.title || "Product",
        productImage: reviewModal.item.image || "",
        rating: reviewModal.rating,
        comment: reviewModal.comment,
        user,
      });
      toast.success("Thank you! Your verified product review has been submitted.");
      setReviewModal({
        open: false,
        order: null,
        item: null,
        rating: 5,
        hoverRating: 0,
        comment: "",
        submitting: false,
      });
    } catch {
      toast.error("Failed to submit review.");
      setReviewModal((prev) => ({ ...prev, submitting: false }));
    }
  }

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
    setLogoutPromptOpen(false);
  }

  function handleLogout() {
    setLogoutPromptOpen(true);
  }

  function confirmLogout() {
    setLogoutPromptOpen(false);
    logout();
    navigate("/");
  }

  useEffect(() => {
    if (!logoutPromptOpen) return undefined;
    function handleKeyDown(e) {
      if (e.key === "Escape") setLogoutPromptOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [logoutPromptOpen]);

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    if (!passwordForm.current || !passwordForm.next || !passwordForm.confirm) {
      setPasswordError("Fill in all password fields.");
      return;
    }
    const policyError = passwordPolicyError(passwordForm.next);
    if (policyError) {
      setPasswordError(policyError.replace(/^Password/, "New password"));
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
    { id: "profile", label: "My Profile", detail: user?.name || "Edit details" },
    {
      id: "orders",
      label: "Order history",
      detail: orders.length === 0 ? "No orders yet" : `${orders.length} orders`,
    },
    {
      id: "coupons",
      label: "Coupons & Discounts",
      detail: activeCoupons.length === 0 ? "None active" : `${activeCoupons.length} available`,
      badge: activeCoupons.length,
    },
    {
      id: "notifications",
      label: "Notifications",
      detail: null,
      badge: notificationCount,
    },
    { id: "password", label: "Change password" },
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
      {/* Logout Confirmation Modal - Dead Centered */}
      {logoutPromptOpen && (
        <div
          onClick={dismissLogoutPrompt}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-dialog-title"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150"
          >
            <button
              type="button"
              onClick={dismissLogoutPrompt}
              aria-label="Close dialog"
              className="absolute right-4 top-4 grid size-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>

            <h3 id="logout-dialog-title" className="text-lg font-bold text-slate-900">
              Are you sure?
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              You will be logged out of your account.
            </p>

            <div className="mt-5 flex items-center gap-2.5">
              <button
                type="button"
                onClick={confirmLogout}
                className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Yes, Logout!
              </button>
              <button
                type="button"
                onClick={dismissLogoutPrompt}
                className="cursor-pointer rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-offset mx-auto max-w-8xl px-3.5 sm:px-6 lg:px-8 pb-6 lg:pb-10 overflow-x-hidden">
        <nav aria-label="Breadcrumb" className="page-crumb">
          <Link to="/">Home</Link>
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
          <aside className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm lg:sticky lg:top-[calc(var(--store-header-height,0px)+1rem)]">
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
                    onClick={() => handleSelectSection(link.id)}
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

          <div className="min-w-0 w-full">
            {section === "profile" ? (
              <Section
                icon={User}
                title="Customer Profile & Address"
                detail="Manage your personal details and default shipping address for faster checkout."
              >
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="profile-name" className="mb-1.5 block text-sm font-semibold text-slate-900">
                        Full Name
                      </label>
                      <input
                        id="profile-name"
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        placeholder="e.g. Muhammad Ammar"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                      />
                    </div>

                    <div>
                      <label htmlFor="profile-phone" className="mb-1.5 block text-sm font-semibold text-slate-900">
                        Phone Number
                      </label>
                      <input
                        id="profile-phone"
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="e.g. 0300 1234567"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="profile-email" className="mb-1.5 block text-sm font-semibold text-slate-900">
                      Email Address
                    </label>
                    <input
                      id="profile-email"
                      type="email"
                      required
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="e.g. name@example.com"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                    />
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <MapPin size={15} className="text-brand-500" />
                      Default Shipping Address
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="profile-address" className="mb-1.5 block text-sm font-semibold text-slate-900">
                          Street / Office Address
                        </label>
                        <input
                          id="profile-address"
                          type="text"
                          value={profileForm.address}
                          onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                          placeholder="e.g. Office #12, 3rd Floor, Commercial Plaza"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="profile-city" className="mb-1.5 block text-sm font-semibold text-slate-900">
                            City
                          </label>
                          <input
                            id="profile-city"
                            type="text"
                            value={profileForm.city}
                            onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                            placeholder="e.g. Lahore, Karachi, Islamabad"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                          />
                        </div>

                        <div>
                          <label htmlFor="profile-province" className="mb-1.5 block text-sm font-semibold text-slate-900">
                            Province
                          </label>
                          <select
                            id="profile-province"
                            value={profileForm.province}
                            onChange={(e) => setProfileForm({ ...profileForm, province: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                          >
                            <option value="Punjab">Punjab</option>
                            <option value="Sindh">Sindh</option>
                            <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                            <option value="Balochistan">Balochistan</option>
                            <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
                            <option value="Azad Kashmir">Azad Kashmir</option>
                            <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60 shadow-xs"
                    >
                      <Save size={16} />
                      {savingProfile ? "Saving changes..." : "Save Profile"}
                    </button>
                  </div>
                </form>
              </Section>
            ) : null}

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
                  <p className="text-xs text-slate-500">{PASSWORD_HINT}</p>
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
                            className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-600"
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
                        className={`rounded-xl sm:rounded-2xl border transition ${
                          isTrackingOpen
                            ? "border-brand-300 bg-white shadow-md"
                            : "border-slate-200 bg-white"
                        } p-3 sm:p-5 overflow-hidden`}
                      >
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold max-w-full truncate ${
                                  isCancelled
                                    ? "bg-red-50 text-red-600"
                                    : isDelivered
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-brand-50 text-brand-600"
                                }`}
                              >
                                <span
                                  className={`size-1.5 rounded-full shrink-0 ${
                                    isCancelled
                                      ? "bg-red-500"
                                      : isDelivered
                                      ? "bg-emerald-500"
                                      : "animate-pulse bg-brand-500"
                                  }`}
                                />
                                <span className="truncate">{isCancelled ? "Cancelled" : currentStep.title}</span>
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500 truncate">
                              Placed on {formatDate(order.createdAt)}
                            </p>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-sm sm:text-base font-bold text-slate-900 whitespace-nowrap">
                              {formatPrice(order.total)}
                            </p>
                          </div>
                        </div>

                        <ul className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/50 p-2 sm:p-2.5 space-y-1.5 overflow-hidden">
                          {(order.items || []).map((item) => {
                            const revKey1 = `${order.id}_${item.id}`;
                            const revKey2 = `${order.id}_${item.slug}`;
                            const revKey3 = `${order.id}_${item.productId}`;
                            const userReview = reviewedMap[revKey1] || reviewedMap[revKey2] || reviewedMap[revKey3];

                            return (
                              <li
                                key={`${order.id}-${item.id || item.title}`}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 first:pt-0"
                              >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  {item.image && (
                                    <img
                                      src={resolveMediaUrl(item.image)}
                                      alt=""
                                      className="size-9 sm:size-10 rounded-lg border border-slate-200 object-cover bg-white shrink-0"
                                    />
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs sm:text-sm font-semibold text-slate-900">{item.title}</p>
                                    <p className="text-[11px] text-slate-500">
                                      Qty: {item.quantity} · {formatPrice(item.price)}
                                    </p>
                                  </div>
                                </div>

                                {isDelivered && (order.items || []).length > 1 && (
                                  <div className="shrink-0 self-start sm:self-auto pl-11.5 sm:pl-0">
                                    {userReview ? (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-emerald-700 border border-emerald-200">
                                        <CheckCircle2 size={12} className="text-emerald-600" />
                                        Reviewed ({userReview.rating}★)
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => openReviewModal(order, item)}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-linear-to-r from-amber-500 to-amber-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs transition hover:from-amber-600 hover:to-amber-700 active:scale-95 cursor-pointer"
                                      >
                                        <Star size={12} fill="currentColor" />
                                        Review
                                      </button>
                                    )}
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>

                        {(() => {
                          const orderItems = order.items || [];
                          const unreviewedItems = orderItems.filter((item) => {
                            const revKey1 = `${order.id}_${item.id}`;
                            const revKey2 = `${order.id}_${item.slug}`;
                            const revKey3 = `${order.id}_${item.productId}`;
                            return !reviewedMap[revKey1] && !reviewedMap[revKey2] && !reviewedMap[revKey3];
                          });
                          const allReviewed = orderItems.length > 0 && unreviewedItems.length === 0;

                          return (
                            <div className="mt-3 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-2.5">
                              <p className="text-xs text-slate-500 min-w-0 truncate">
                                {order.payment?.label || "Payment"}
                                {order.delivery?.city ? ` · ${order.delivery.city}` : ""}
                              </p>

                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                {isDelivered && (
                                  allReviewed ? (
                                    <span className="inline-flex h-8.5 flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 border border-emerald-200">
                                      <CheckCircle2 size={13} className="text-emerald-600" />
                                      Reviewed
                                    </span>
                                  ) : unreviewedItems.length > 0 ? (
                                    <button
                                      type="button"
                                      onClick={() => openReviewModal(order, unreviewedItems[0])}
                                      className="inline-flex h-8.5 flex-1 sm:flex-initial cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 text-xs font-semibold text-white shadow-xs transition hover:from-amber-600 hover:to-amber-700 active:scale-95 shrink-0"
                                    >
                                      <Star size={13} fill="currentColor" />
                                      Write Review
                                    </button>
                                  ) : null
                                )}

                                <button
                                  type="button"
                                  onClick={() =>
                                    isTrackingOpen
                                      ? setTrackingOrderId(null)
                                      : openOrderTracking(order.id)
                                  }
                                  className={`inline-flex h-8.5 ${
                                    isDelivered ? "flex-1 sm:flex-initial" : "w-full sm:w-auto"
                                  } shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3.5 text-xs font-semibold transition ${
                                    isTrackingOpen
                                      ? "border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                                      : "bg-brand-500 text-white hover:bg-brand-600"
                                  }`}
                                >
                                  <Truck size={13} />
                                  {isTrackingOpen ? "Hide tracking" : "Track order"}
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                        
                        

                        {isTrackingOpen && (() => {
                          const stepsToDisplay = isCancelled
                            ? [
                                ...TRACKING_STEPS.slice(0, Math.min(stageIndex + 1, TRACKING_STEPS.length - 1)).map((s) => ({
                                  ...s,
                                  statusType: "completed",
                                })),
                                {
                                  key: "cancelled",
                                  title: "Order Cancelled",
                                  shortLabel: "Cancelled",
                                  location: "Wasooli Store",
                                  description:
                                    order.cancelReason ||
                                    "This order was cancelled. Package transit has been stopped and no COD amount will be collected.",
                                  icon: XCircle,
                                  statusType: "cancelled",
                                },
                              ]
                            : TRACKING_STEPS.map((s, idx) => ({
                                ...s,
                                statusType: idx === stageIndex ? "current" : idx < stageIndex ? "completed" : "pending",
                              }));

                          const gridColsClass =
                            stepsToDisplay.length === 2
                              ? "grid-cols-2"
                              : stepsToDisplay.length === 3
                              ? "grid-cols-3"
                              : stepsToDisplay.length === 4
                              ? "grid-cols-4"
                              : "grid-cols-5";

                          return (
                            <div className={`mt-4 rounded-xl sm:rounded-2xl border ${
                              isCancelled ? "border-red-200 bg-red-50/20" : "border-slate-200 bg-slate-50/70"
                            } p-3 sm:p-5 overflow-hidden`}>
                              {/* Top Daraz-style banner */}
                              <div className={`flex flex-wrap items-center justify-between gap-3 border-b pb-3.5 ${
                                isCancelled ? "border-red-200/80" : "border-slate-200"
                              }`}>
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className={`text-xs font-bold uppercase tracking-wider ${
                                      isCancelled ? "text-red-600" : "text-brand-600"
                                    }`}>
                                      Wasooli Express {isCancelled ? "· Order Cancelled" : ""}
                                    </span>
                                    {isCancelled ? (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-700">
                                        <XCircle size={11} />
                                        Cancelled
                                      </span>
                                    ) : !isDelivered ? (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                        <Clock size={11} className="animate-spin" />
                                        In progress
                                      </span>
                                    ) : null}
                                  </div>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {order.delivery?.method?.title || "Standard delivery"} ·{" "}
                                    {isCancelled
                                      ? "Shipment cancelled — package will not be delivered"
                                      : isDelivered
                                      ? "Delivered to recipient"
                                      : order.delivery?.method?.text || "Arrives in 3-5 working days"}
                                  </p>
                                  {order.trackingNumber ? (
                                    <p className={`mt-1 text-xs font-medium ${
                                      isCancelled ? "text-slate-400 line-through" : "text-slate-600"
                                    }`}>
                                      {order.courier || "Courier"} · {order.trackingNumber}
                                    </p>
                                  ) : null}
                                </div>
                              </div>

                              {/* Horizontal Stepper */}
                              <div className={`mt-4 grid gap-1 sm:gap-2 ${gridColsClass}`}>
                                {stepsToDisplay.map((step, index) => {
                                  const StepIcon = step.icon;
                                  const isCancelStep = step.statusType === "cancelled";
                                  const isCurrent = step.statusType === "current";
                                  const isCompleted = step.statusType === "completed";

                                  return (
                                    <div key={step.key} className="flex flex-col items-center text-center min-w-0">
                                      <div className="relative flex w-full items-center justify-center">
                                        {index > 0 && (
                                          <span
                                            className={`absolute right-1/2 top-1/2 h-0.5 w-full -translate-y-1/2 transition-colors duration-500 ${
                                              isCancelStep
                                                ? "bg-red-400"
                                                : isCompleted || isCurrent
                                                ? "bg-brand-500"
                                                : "bg-slate-200"
                                            }`}
                                          />
                                        )}
                                        <span
                                          className={`relative z-10 grid size-7 place-items-center rounded-full border-2 transition-all duration-300 sm:size-9 ${
                                            isCancelStep
                                              ? "border-red-500 bg-red-500 text-white ring-2 sm:ring-4 ring-red-100"
                                              : isCurrent
                                              ? "border-brand-500 bg-brand-500 text-white ring-2 sm:ring-4 ring-brand-100"
                                              : isCompleted
                                              ? "border-brand-500 bg-brand-50 text-brand-600"
                                              : "border-slate-200 bg-white text-slate-400"
                                          }`}
                                        >
                                          <StepIcon size={13} />
                                        </span>
                                      </div>
                                      <p
                                        className={`mt-1.5 text-[9px] font-semibold leading-tight sm:text-[11px] truncate w-full ${
                                          isCancelStep
                                            ? "text-red-600 font-bold"
                                            : isCurrent
                                            ? "text-brand-600 font-bold"
                                            : isCompleted
                                            ? "text-slate-900"
                                            : "text-slate-400"
                                        }`}
                                      >
                                        {step.shortLabel}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Vertical Detailed Timeline */}
                              <div className="mt-5 border-t border-slate-200 pt-4">
                                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                                  Tracking Timeline
                                </p>
                                <ol className="relative ml-3 space-y-4 border-l-2 border-slate-200 pl-5">
                                  {stepsToDisplay.map((step, index) => {
                                    const isCancelStep = step.statusType === "cancelled";
                                    const isCurrent = step.statusType === "current";
                                    const isCompleted = step.statusType === "completed";
                                    const isPending = step.statusType === "pending";

                                    const timeString = isCancelStep
                                      ? formatStepTime(
                                          order.adminStatusUpdatedAt ||
                                          order.cancelledAt ||
                                          (order.statusHistory || []).slice().reverse().find((e) => e.status === "cancelled")?.at ||
                                          order.updatedAt
                                        )
                                      : isPending
                                      ? "Pending"
                                      : formatStepTime(
                                          historyTimeForStage(order, index) ||
                                          (index === stageIndex
                                            ? (order.statusHistory || [])
                                                .slice()
                                                .reverse()
                                                .find((e) => e.type !== "note" && e.type !== "refund" && e.status === order.adminStatus)?.at
                                            : null) ||
                                          (index === 0 ? order.createdAt : null)
                                        );

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
                                            isCancelStep
                                              ? "border-red-500 bg-red-500 ring-4 ring-red-100"
                                              : isCurrent
                                              ? "border-brand-500 bg-brand-500 ring-4 ring-brand-100"
                                              : isCompleted
                                              ? "border-brand-500 bg-brand-500"
                                              : "border-slate-300 bg-white"
                                          }`}
                                        />
                                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                                          <p
                                            className={`text-xs font-bold sm:text-sm ${
                                              isCancelStep
                                                ? "text-red-600 font-bold"
                                                : isCurrent
                                                ? "text-brand-600 font-bold"
                                                : isCompleted
                                                ? "text-slate-900"
                                                : "text-slate-400"
                                            }`}
                                          >
                                            {step.title}
                                          </p>
                                          <span
                                            className={`text-[11px] ${
                                              isCancelStep
                                                ? "font-semibold text-red-500"
                                                : isCompleted || isCurrent
                                                ? "font-medium text-slate-500"
                                                : "text-slate-400"
                                            }`}
                                          >
                                            {timeString}
                                          </span>
                                        </div>
                                        <p
                                          className={`mt-0.5 text-xs leading-relaxed ${
                                            isCancelStep
                                              ? "text-red-700/90 font-medium"
                                              : isCompleted || isCurrent
                                              ? "text-slate-600"
                                              : "text-slate-400"
                                          }`}
                                        >
                                          {step.description}
                                        </p>
                                        <p
                                          className={`mt-0.5 inline-flex items-center gap-1 text-[11px] ${
                                            isCancelStep
                                              ? "text-red-500 font-medium"
                                              : isCompleted || isCurrent
                                              ? "text-slate-500"
                                              : "text-slate-400"
                                          }`}
                                        >
                                          {isCancelStep ? <XCircle size={11} /> : <MapPin size={11} />}
                                          {isCancelStep ? "Shipment stopped" : locationText}
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
                        );
                      })()}
                      </li>
                    );
                  })}
                </ul>
              )}
            </Section>
            ) : null}

            {section === "coupons" ? (
            <Section
              icon={Ticket}
              title="Coupons & Discounts"
              detail={
                activeCoupons.length === 0
                  ? "Active store promotions and vouchers."
                  : `${activeCoupons.length} active ${activeCoupons.length === 1 ? "coupon" : "coupons"} available to redeem.`
              }
            >
              {couponsList.length === 0 ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-8 text-center">
                  <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-600 mb-3">
                    <Ticket size={24} />
                  </div>
                  <p className="text-sm font-bold text-slate-900">No coupons available right now</p>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                    We regularly offer promotional codes and seasonal vouchers. Check back soon or browse our store!
                  </p>
                  <Link
                    to="/shop"
                    className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-brand-500 px-5 text-xs font-semibold text-white transition hover:bg-brand-600"
                  >
                    Browse products
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500">
                    Use these coupon codes during checkout to get instant discounts on your orders. Click copy and paste at checkout!
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {couponsList.map((coupon) => {
                      const isPercent = coupon.type === "percent";
                      const discountLabel = isPercent
                        ? `${coupon.value}% OFF`
                        : `Rs ${Number(coupon.value || 0).toLocaleString()} OFF`;
                      const now = new Date().toISOString().slice(0, 10);
                      const isExpired = coupon.expiryDate && coupon.expiryDate < now;
                      const usageLimit = Number(coupon.usageLimit) || 0;
                      const usedCount = Number(coupon.used) || 0;
                      const isLimitReached = usageLimit > 0 && usedCount >= usageLimit;
                      const isInactive = coupon.active === false || isExpired || isLimitReached;
                      const remainingCount = usageLimit > 0 ? Math.max(0, usageLimit - usedCount) : null;
                      const isCopied = copiedCode === coupon.code;

                      return (
                        <div
                          key={coupon.id || coupon.code}
                          className={`relative flex flex-col justify-between rounded-2xl border transition overflow-hidden ${
                            isInactive
                              ? "border-slate-200 bg-slate-50/60 opacity-80"
                              : "border-brand-200 bg-linear-to-br from-white via-white to-brand-50/40 shadow-xs hover:shadow-md hover:border-brand-300"
                          } p-4 sm:p-5`}
                        >
                          <div>
                            {/* Header row */}
                            <div className="flex items-start justify-between gap-2.5">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-black uppercase tracking-wider ${
                                  isInactive
                                    ? "bg-slate-200 text-slate-600"
                                    : "bg-brand-50 text-brand-600 border border-brand-200"
                                }`}
                              >
                                <Sparkles size={12} className="text-brand-500" />
                                {discountLabel}
                              </span>

                              <span
                                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  isExpired
                                    ? "bg-red-50 text-red-600 border border-red-200"
                                    : isLimitReached
                                    ? "bg-rose-50 text-rose-600 border border-rose-200"
                                    : coupon.active === false
                                    ? "bg-slate-100 text-slate-600 border border-slate-200"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                }`}
                              >
                                {isExpired
                                  ? "Expired"
                                  : isLimitReached
                                  ? "Redeemed Out"
                                  : coupon.active === false
                                  ? "Inactive"
                                  : "Active"}
                              </span>
                            </div>

                            {/* Details */}
                            <div className="mt-3">
                              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                                {coupon.description ||
                                  (isPercent
                                    ? `Get ${coupon.value}% instant discount`
                                    : `Save Rs ${Number(coupon.value || 0).toLocaleString()} on your cart`)}
                              </h3>

                              {Number(coupon.minOrder) > 0 ? (
                                <p className="mt-1 text-xs text-slate-500">
                                  Min order:{" "}
                                  <strong className="text-slate-700 font-semibold">
                                    Rs {Number(coupon.minOrder).toLocaleString()}
                                  </strong>
                                </p>
                              ) : (
                                <p className="mt-1 text-xs text-slate-500">No minimum order required</p>
                              )}
                            </div>
                          </div>

                          {/* Dashed Separator */}
                          <div className="my-3.5 border-t border-dashed border-slate-200" />

                          {/* Availability & Code Container */}
                          <div className="space-y-2.5">
                            {/* Availability counter */}
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500 font-medium">Available Coupons:</span>
                              {remainingCount !== null ? (
                                <span className="font-semibold text-slate-800">
                                  {remainingCount > 0 ? (
                                    <strong className="text-brand-600 font-bold">{remainingCount} left</strong>
                                  ) : (
                                    <strong className="text-rose-600 font-bold">0 left</strong>
                                  )}{" "}
                                  <span className="text-slate-400 font-normal">of {usageLimit} total</span>
                                </span>
                              ) : (
                                <span className="font-semibold text-emerald-600">Unlimited uses</span>
                              )}
                            </div>

                            {/* Usage Progress Bar */}
                            {usageLimit > 0 && (
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    isLimitReached ? "bg-rose-500" : "bg-brand-500"
                                  }`}
                                  style={{
                                    width: `${Math.min(100, Math.round((usedCount / usageLimit) * 100))}%`,
                                  }}
                                />
                              </div>
                            )}

                            {/* Coupon Code Box */}
                            <div className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-brand-300 bg-brand-50/50 p-2 sm:p-2.5">
                              <div className="min-w-0 flex-1 pl-1">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block leading-tight">
                                  Coupon Code
                                </span>
                                <span className="font-mono text-sm sm:text-base font-black tracking-wider text-brand-700 select-all truncate block">
                                  {coupon.code}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleCopyCoupon(coupon.code)}
                                disabled={isInactive}
                                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition shadow-xs cursor-pointer ${
                                  isCopied
                                    ? "bg-emerald-600 text-white"
                                    : isInactive
                                    ? "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none"
                                    : "bg-brand-500 text-white hover:bg-brand-600 active:scale-95"
                                }`}
                              >
                                {isCopied ? (
                                  <>
                                    <Check size={13} className="text-white" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={13} />
                                    <span>Copy code</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Expiry Footer */}
                            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                              <span>
                                {coupon.expiryDate ? `Expires: ${formatDate(coupon.expiryDate)}` : "Ongoing promotion"}
                              </span>
                              <Link
                                to="/shop"
                                className="font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                              >
                                Shop now →
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
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
                          className="grid size-8 shrink-0 cursor-pointer place-items-center self-start rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-600"
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
                            className="grid size-8 shrink-0 cursor-pointer place-items-center self-start rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-600"
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
      {/* Review Modal Dialog */}
      {reviewModal.open && (
        <div
          onClick={() => setReviewModal({ ...reviewModal, open: false })}
          className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          >
            <button
              type="button"
              onClick={() => setReviewModal({ ...reviewModal, open: false })}
              className="absolute right-4 top-4 grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-500">
                <Star size={20} fill="currentColor" />
              </span>
              <div className="min-w-0 pr-6">
                <h3 className="text-base font-bold text-slate-900 truncate">Rate & Review Product</h3>
                <p className="text-xs text-slate-500 truncate">{reviewModal.item?.title}</p>
              </div>
            </div>

            <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4">
              {/* Star selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Overall Rating
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (reviewModal.hoverRating || reviewModal.rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setReviewModal((prev) => ({ ...prev, hoverRating: star }))}
                        onMouseLeave={() => setReviewModal((prev) => ({ ...prev, hoverRating: 0 }))}
                        onClick={() => setReviewModal((prev) => ({ ...prev, rating: star }))}
                        className="cursor-pointer transition-transform hover:scale-115 focus:outline-none"
                      >
                        <Star
                          size={28}
                          className={active ? "text-amber-400" : "text-slate-200"}
                          fill={active ? "currentColor" : "none"}
                        />
                      </button>
                    );
                  })}
                 
                </div>
              </div>

              {/* Review Comment */}
              <div>
                <label htmlFor="review-comment" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Your Feedback
                </label>
                <textarea
                  id="review-comment"
                  rows={4}
                  required
                  value={reviewModal.comment}
                  onChange={(e) => setReviewModal((prev) => ({ ...prev, comment: e.target.value }))}
                  placeholder="Share details about product performance, speed, build quality, and delivery experience..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition placeholder:text-xs placeholder:leading-relaxed placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewModal({ ...reviewModal, open: false })}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewModal.submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:from-amber-600 hover:to-amber-700 transition disabled:opacity-60 cursor-pointer"
                >
                  <Star size={13} fill="currentColor" />
                  {reviewModal.submitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}