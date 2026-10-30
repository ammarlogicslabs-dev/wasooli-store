import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSmoothNavigate } from "../auth/useSmoothNavigate";
import {
  ArrowLeft,
  Bot,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Minus,

  Plus,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { formatPrice } from "../data/product";
import { getProductInstructions } from "../data/productInstructions";
import { getProductPolicy } from "../utils/productPolicy";
import ProductCard from "../components/ProductCard";
import ProductBotModal from "../components/ProductBotModal";
import QuantityStepper from "../components/QuantityStepper";
import ShopProductRail from "../components/ShopProductRail";
import StoreHeader from "../components/StoreHeader";
import { useEnsureLogin } from "../auth/useEnsureLogin";
import { useCart } from "../cart/CartContext";
import { resolveMediaUrl } from "../utils/mediaUrl";
import { getRecentlyViewedIds, pushRecentlyViewed } from "../utils/recentlyViewed";
import { getProductReviewStats } from "../services/storage/reviewService";
import {
  formatTierRange,
  getActiveTier,
  getUnitPrice,
  lineTotal,
} from "../utils/priceTiers";

const STORE_NAME = "Wasooli Store";

function formatReviewDate(dateStr) {
  if (!dateStr) return "Recently";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "Recently";
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

function Stars({ rating, size = 16 }) {
  const filled = Math.round(Number(rating) || 0);
  return (
    <div className="flex items-center gap-0.5 text-amber-400" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          fill={n <= filled ? "currentColor" : "none"}
          className={n <= filled ? "" : "text-slate-300"}
        />
      ))}
    </div>
  );
}

function ImageLightbox({ images, index, title, onClose, onChange }) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onChange((index - 1 + images.length) % images.length);
      if (event.key === "ArrowRight") onChange((index + 1) % images.length);
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [index, images.length, onChange, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Product image viewer"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close image viewer"
        className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
      >
        <X size={20} />
      </button>

      {images.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={(event) => {
              event.stopPropagation();
              onChange((index - 1 + images.length) % images.length);
            }}
            className="absolute left-3 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={(event) => {
              event.stopPropagation();
              onChange((index + 1) % images.length);
            }}
            className="absolute right-3 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
          >
            <ChevronRight size={22} />
          </button>
        </>
      ) : null}

      <img
        src={resolveMediaUrl(images[index])}
        alt={`${title} — image ${index + 1}`}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[85vh] max-w-full object-contain"
      />
      <p className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
        {index + 1} / {images.length}
      </p>
    </motion.div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useSmoothNavigate();
  const ensureLogin = useEnsureLogin("Please log in first to continue to checkout.");
  const { products, addItem, openCart, isWished, toggleWishlist } = useCart();
  const addedTimer = useRef(null);
  const zoomRef = useRef(null);

  const product = products.find((item) => item.slug === slug);

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [tab, setTab] = useState("overview");
  const [openPolicy, setOpenPolicy] = useState("shipping");
  const [floatingBotOpen, setFloatingBotOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });
  const [copied, setCopied] = useState(false);
  const [activeSlug, setActiveSlug] = useState(slug);

  const wished = product ? isWished(product.id) : false;
  const instructions = getProductInstructions(product);
  const policy = getProductPolicy(product);

  if (slug !== activeSlug) {
    setActiveSlug(slug);
    setQuantity(1);
    setActiveImage(0);
    setAdded(false);
    setTab("overview");
    setOpenPolicy("shipping");
    setLightboxOpen(false);
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  useEffect(() => {
    if (product?.id != null) {
      pushRecentlyViewed(product.id);
    }
  }, [product?.id]);

  useEffect(() => {
    return () => {
      if (addedTimer.current) window.clearTimeout(addedTimer.current);
    };
  }, []);

  const [reviewVersion, setReviewVersion] = useState(0);
  const productId = product ? String(product.id) : "";
  const productSlug = product ? String(product.slug) : "";

  const reviewStats = useMemo(() => {
    if (reviewVersion < 0) {
      return {
        reviews: [],
        total: 0,
        rating: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        percentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }
    return getProductReviewStats(productId, productSlug);
  }, [productId, productSlug, reviewVersion]);

  const productReviews = reviewStats.reviews;
  const reviewCount = reviewStats.total;
  const reviewRating = reviewStats.rating;

  useEffect(() => {
    const handleReviewAdded = () => {
      setReviewVersion((v) => v + 1);
    };
    window.addEventListener("wasooli-review-added", handleReviewAdded);
    return () => window.removeEventListener("wasooli-review-added", handleReviewAdded);
  }, []);

  useEffect(() => {
    document.title = product
      ? `${product.title} | ${STORE_NAME}`
      : `Product not found | ${STORE_NAME}`;
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StoreHeader />
        <main className="grid min-h-[70vh] place-items-center px-4">
          <div className="text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <ShoppingBag size={28} />
            </div>
            <h1 className="mt-5 text-2xl font-bold text-slate-900">Product not found</h1>
            <p className="mt-2 text-slate-500">The product you are looking for does not exist.</p>
            <Link
              to="/shop"
              className="mt-6 inline-flex cursor-pointer rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-600"
            >
              Browse Products
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const images = [
    ...new Set([product.image, ...(product.images ?? [])].filter(Boolean)),
  ];
  const activeSrc = resolveMediaUrl(images[activeImage] || product.image);

  const stock = Number.isFinite(product.stock) ? product.stock : null;
  const outOfStock = stock !== null && stock <= 0;
  const lowStock = stock !== null && stock <= 5 && stock > 0;

  const priceTiers = getActiveTier(product);
  const unitPrice = getUnitPrice(product, quantity);
  const basePrice = Number(product.price) || 0;
  const originalOldPrice = Number(product.oldPrice) || 0;
  const anchorPrice =
    originalOldPrice > unitPrice
      ? originalOldPrice
      : basePrice > unitPrice
      ? basePrice
      : 0;
  const hasDiscount = anchorPrice > unitPrice;
  const discount = hasDiscount
    ? Math.round(((anchorPrice - unitPrice) / anchorPrice) * 100)
    : 0;
  const saveVsBase =
    priceTiers.length > 0 && basePrice > unitPrice
      ? basePrice - unitPrice
      : 0;
  const nextTier = priceTiers.find((tier) => quantity < tier.minQty);
  const nextTierSave =
    nextTier && Number(product.price) > nextTier.price
      ? Number(product.price) - nextTier.price
      : 0;

  const description = product.description || product.shortDescription;
  const hasFeatures = product.features?.length > 0;
  const hasSpecs = product.specifications?.length > 0;

  const detailTabs = [
    { id: "overview", label: "Overview" },
    ...(hasSpecs ? [{ id: "specs", label: "Specifications" }] : []),
    // ...(instructions ? [{ id: "instructions", label: "Setup guide" }] : []),
    { id: "shipping", label: "Shipping & returns" },
    { id: "reviews", label: `Reviews (${reviewCount})` },
  ];

  const relatedProducts = products
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, 8);

  const recentProducts = (() => {
    const ids = getRecentlyViewedIds().filter((id) => String(id) !== String(product.id));
    const byId = new Map(products.map((item) => [String(item.id), item]));
    return ids.map((id) => byId.get(id)).filter(Boolean).slice(0, 10);
  })();

  function handleAddToCart() {
    if (outOfStock) return;
    addItem(product, quantity);
    setAdded(true);
    openCart?.();
    if (addedTimer.current) window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setAdded(false), 1800);
  }

  function handleBuyNow() {
    if (outOfStock) return;
    const buyNowState = {
      buyNow: {
        product: {
          id: product.id,
          slug: product.slug,
          title: product.title,
          image: product.image,
          price: product.price,
          priceTiers: product.priceTiers || [],
          stock: product.stock,
        },
        quantity,
      },
    };
    if (!ensureLogin(undefined, { pathname: "/checkout", state: buyNowState })) return;
    navigate("/checkout", { state: buyNowState });
  }

  function onZoomMove(event) {
    const box = zoomRef.current?.getBoundingClientRect();
    if (!box) return;
    const x = ((event.clientX - box.left) / box.width) * 100;
    const y = ((event.clientY - box.top) / box.height) * 100;
    setZoom({
      active: true,
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    });
  }

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore cancel */
    }
  }

  const cartLabel = outOfStock ? "Out of Stock" : added ? "Added!" : "Add to Cart";
  const deliveryWindow = (() => {
    const start = new Date();
    const end = new Date();
    start.setDate(start.getDate() + 3);
    end.setDate(end.getDate() + 5);
    const day = (d) => d.getDate();
    const month = (d) =>
      d.toLocaleDateString("en-PK", { month: "short" });
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${day(start)} – ${day(end)} ${month(end)}`;
    }
    return `${day(start)} ${month(start)} – ${day(end)} ${month(end)}`;
  })();

  return (
    <main className="min-h-screen bg-slate-50 pb-24 lg:pb-0">
      <StoreHeader />

      <div className="border-b border-slate-200/80 bg-white">
        <nav
          aria-label="Breadcrumb"
          className="page-crumb page-offset mx-auto flex max-w-8xl flex-wrap items-center gap-x-0 px-4 py-3 sm:px-6 lg:px-8 2xl:max-w-384"
        >
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to="/shop">Shop</Link>
          <span aria-hidden="true">/</span>
          <Link to={`/shop?category=${encodeURIComponent(product.category)}`}>
            {product.category}
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="max-w-48 truncate sm:max-w-md">
            {product.title}
          </span>
        </nav>
      </div>

      <div className="mx-auto max-w-8xl px-4 pt-4 sm:px-6 lg:px-8 2xl:max-w-384">
        <Link
          to="/shop"
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-brand-600"
        >
          <ArrowLeft size={16} />
          Back to shop
        </Link>
      </div>

      {/* Main grid: gallery + info + sticky buy box */}
      <section className="mx-auto grid max-w-8xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8 lg:px-8 lg:py-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.85fr)_300px] xl:gap-8 2xl:max-w-384">
        {/* Gallery */}
        <div className="lg:sticky lg:top-[calc(var(--store-header-height,72px)+1rem)] lg:self-start">
          <div className="flex gap-3">
            {images.length > 1 ? (
              <div className="custom-scrollbar hidden max-h-105 w-16 shrink-0 flex-col gap-2 overflow-y-auto sm:flex lg:max-h-130">
                {images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`View image ${index + 1}`}
                    aria-pressed={activeImage === index}
                    className={`overflow-hidden rounded-xl border-2 transition ${activeImage === index
                      ? "border-brand-500 ring-2 ring-brand-100"
                      : "border-slate-200 opacity-80 hover:opacity-100"
                      }`}
                  >
                    <img
                      src={resolveMediaUrl(image)}
                      alt=""
                      className="aspect-square w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}

            <div className="relative min-w-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-2">
                {product.badge ? (
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    {product.badge}
                  </span>
                ) : null}
                {hasDiscount ? (
                  <span className="rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1 text-[10px] font-bold text-white shadow-md">
                    −{discount}% OFF
                  </span>
                ) : null}
              </div>

              <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                  aria-pressed={wished}
                  className="grid size-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:text-red-500"
                >
                  <Heart size={18} className={wished ? "text-red-500" : ""} fill={wished ? "currentColor" : "none"} />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share product"
                  className="grid size-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:text-brand-600"
                >
                  <Share2 size={17} />
                </button>
              </div>

              <button
                type="button"
                ref={zoomRef}
                onMouseMove={onZoomMove}
                onMouseLeave={() => setZoom((current) => ({ ...current, active: false }))}
                onClick={() => setLightboxOpen(true)}
                className="group relative block aspect-square w-full cursor-zoom-in overflow-hidden bg-gradient-to-b from-slate-50 to-white"
                aria-label="Open image zoom"
              >
                <img
                  src={activeSrc}
                  alt={product.title}
                  className="h-full w-full object-cover transition duration-300"
                  style={
                    zoom.active
                      ? {
                        transform: "scale(1.85)",
                        transformOrigin: `${zoom.x}% ${zoom.y}%`,
                      }
                      : undefined
                  }
                />
                {/* <span className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-slate-900/70 px-3 py-1.5 text-[11px] font-semibold text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
                  <ZoomIn size={13} />
                  Hover to zoom · Click to expand
                </span> */}
              </button>

              {images.length > 1 ? (
                <div className="flex gap-2 overflow-x-auto border-t border-slate-100 p-3 sm:hidden">
                  {images.map((image, index) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${activeImage === index ? "border-brand-500" : "border-slate-200"
                        }`}
                    >
                      <img src={resolveMediaUrl(image)} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          {copied ? (
            <p className="mt-2 text-xs font-medium text-emerald-600">Link copied to clipboard</p>
          ) : null}
        </div>

        {/* Product info */}
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-600">
            {product.brand ? `${product.brand} · ` : ""}
            <Link
              to={`/shop?category=${encodeURIComponent(product.category)}`}
              className="hover:underline transition-colors hover:text-brand-700"
            >
              {product.category}
            </Link>
          </p>
          <h1 className="mt-2 text-xl font-bold leading-snug tracking-tight text-slate-900 sm:text-2xl lg:text-[1.7rem]">
            {product.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <button
              type="button"
              onClick={() => {
                setTab("reviews");
                document.getElementById("pd-tabs")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 rounded-lg transition hover:bg-slate-100"
            >
              <span
                className={`rounded px-1.5 py-0.5 text-xs font-bold text-white ${
                  reviewCount > 0 ? "bg-emerald-600" : "bg-slate-400"
                }`}
              >
                {reviewCount > 0 ? reviewRating : "0"}
              </span>
              <Stars rating={reviewCount > 0 ? reviewRating : 0} size={14} />
              <span
                className={`text-sm underline-offset-2 hover:underline ${
                  reviewCount > 0 ? "text-brand-600" : "text-slate-500"
                }`}
              >
                {reviewCount} {reviewCount === 1 ? "rating" : "ratings"}
              </span>
            </button>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${outOfStock ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"
                }`}
            >
              <span className={`size-1.5 rounded-full ${outOfStock ? "bg-red-500" : "bg-emerald-500"}`} />
              {outOfStock ? "Out of stock" : lowStock ? `Only ${stock} left` : "In stock"}
            </span>
          </div>

          {/* Price — mobile / tablet (desktop sticky box has it too) */}
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:hidden">
            <div className="flex flex-wrap items-end gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {formatPrice(unitPrice)}
              </span>
              <span className="pb-1 text-sm text-slate-500">/ unit</span>
              {hasDiscount ? (
                <>
                  <span className="pb-1 text-sm text-slate-400 line-through">
                    {formatPrice(anchorPrice)}
                  </span>
                  <span className="mb-0.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
                    −{discount}%
                  </span>
                </>
              ) : null}
            </div>
            {saveVsBase > 0 ? (
              <p className="mt-2 text-sm font-medium text-emerald-700">
                Bulk price — save {formatPrice(saveVsBase)} / unit
              </p>
            ) : null}
            {priceTiers.length > 0 ? (
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Qty</th>
                      <th className="px-3 py-2">Unit price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceTiers.map((tier) => {
                      const active =
                        quantity >= tier.minQty &&
                        (tier.maxQty == null || quantity <= tier.maxQty);
                      return (
                        <tr
                          key={formatTierRange(tier)}
                          className={`border-t border-slate-100 ${active ? "bg-brand-50 font-semibold text-brand-800" : "text-slate-700"
                            }`}
                        >
                          <td className="px-3 py-2">{formatTierRange(tier)}</td>
                          <td className="px-3 py-2">
                            <span>{formatPrice(tier.price)}</span>
                            {anchorPrice > tier.price ? (
                              <span className="ml-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                                −{Math.round(((anchorPrice - tier.price) / anchorPrice) * 100)}%
                              </span>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>

          {product.shortDescription ? (
            <p className="mt-5 text-sm leading-6 text-slate-600">{product.shortDescription}</p>
          ) : null}

          {hasFeatures ? (
            <ul className="mt-5 space-y-2.5">
              {product.features.slice(0, 5).map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <Check size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                  {feature}
                </li>
              ))}
            </ul>
          ) : null}

          {/* Delivery strip */}
          <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <Truck size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Delivery by{" "}
                  <span className="text-emerald-700">{deliveryWindow}</span>
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Packed in 1–2 working days · Standard 3–5 days
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 border-t border-slate-100 pt-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-600">
                <MapPin size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Nationwide shipping</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Delivered across Pakistan · Cash on delivery where available
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 border-t border-slate-100 pt-3">
              <span
                className={`grid size-10 shrink-0 place-items-center rounded-xl ${policy.isUsed ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                  }`}
              >
                <RotateCcw size={18} />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-sm font-semibold text-slate-900">{policy.badge}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${policy.isUsed ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                      }`}
                  >
                    {policy.condition}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{policy.shortSummary}</p>
              </div>
            </div>
          </div>

          {/* Qty + CTAs — tablet and below; desktop uses sticky box */}
          <div className="mt-6 xl:hidden">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="shrink-0 text-sm font-semibold text-slate-900">Qty</span>
              <QuantityStepper
                size="lg"
                value={quantity}
                min={1}
                max={stock === null ? Infinity : stock}
                disabled={outOfStock}
                onChange={setQuantity}
                label="Quantity"
              />
              <p className="min-w-0 text-sm text-slate-600 sm:ml-auto">
                Total{" "}
                <span className="font-bold text-slate-900">
                  {formatPrice(lineTotal(product, quantity))}
                </span>
              </p>
            </div>
            <div className="product-buy-row mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                type="button"
                disabled={outOfStock}
                onClick={handleAddToCart}
                className={`inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:bg-slate-300 sm:flex-none sm:px-6 ${added ? "bg-emerald-500" : "bg-brand-500 hover:bg-brand-600"
                  }`}
              >
                {added ? <Check size={16} /> : <ShoppingBag size={16} />}
                {cartLabel}
              </button>
              <button
                type="button"
                disabled={outOfStock}
                onClick={handleBuyNow}
                className="inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-900 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 sm:flex-none sm:px-6"
              >
                <Zap size={16} />
                Buy now
              </button>
            </div>
            {nextTier && nextTierSave > 0 ? (
              <p className="mt-2 text-sm text-brand-700">
                Buy {nextTier.minQty}+ and save {formatPrice(nextTierSave)} per unit
              </p>
            ) : null}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:hidden">
            {[
              { icon: Truck, title: "Fast dispatch", text: "1–2 working days" },
              { icon: RotateCcw, title: policy.badge, text: policy.warrantyType },
              { icon: ShieldCheck, title: "Secure checkout", text: "Protected payments" },
            ].map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                  <Icon size={16} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-900">{title}</p>
                  <p className="truncate text-[11px] text-slate-500">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky buy box — desktop */}
        <aside className="hidden xl:block">
          <div className="sticky top-[calc(var(--store-header-height,72px)+1rem)] rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.35)]">
            <div className="flex flex-wrap items-end gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {formatPrice(unitPrice)}
              </span>
              <span className="pb-1 text-sm text-slate-500">/ unit</span>
            </div>
            {hasDiscount ? (
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm text-slate-400 line-through">
                  {formatPrice(anchorPrice)}
                </span>
                <span className="rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
                  −{discount}%
                </span>
              </div>
            ) : null}

            {saveVsBase > 0 ? (
              <p className="mt-2 text-xs font-medium text-emerald-700">
                Bulk save {formatPrice(saveVsBase)} / unit
              </p>
            ) : null}

            {priceTiers.length > 0 ? (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-2.5 py-1.5">Qty</th>
                      <th className="px-2.5 py-1.5">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceTiers.map((tier) => {
                      const active =
                        quantity >= tier.minQty &&
                        (tier.maxQty == null || quantity <= tier.maxQty);
                      return (
                        <tr
                          key={formatTierRange(tier)}
                          className={`border-t border-slate-100 ${active ? "bg-brand-50 font-semibold text-brand-800" : "text-slate-700"
                            }`}
                        >
                          <td className="px-2.5 py-1.5">{formatTierRange(tier)}</td>
                          <td className="px-2.5 py-1.5">
                            <span>{formatPrice(tier.price)}</span>
                            {anchorPrice > tier.price ? (
                              <span className="ml-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                                −{Math.round(((anchorPrice - tier.price) / anchorPrice) * 100)}%
                              </span>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}

            <p
              className={`mt-4 text-sm font-semibold ${outOfStock ? "text-red-600" : "text-emerald-700"
                }`}
            >
              {outOfStock
                ? "Currently unavailable"
                : lowStock
                  ? `Hurry — only ${stock} left`
                  : "In stock — ready to ship"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Get it by{" "}
              <span className="font-semibold text-slate-800">{deliveryWindow}</span>
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="shrink-0 text-xs font-semibold text-slate-700">Qty</span>
              <QuantityStepper
                size="lg"
                value={quantity}
                min={1}
                max={stock === null ? Infinity : stock}
                disabled={outOfStock}
                onChange={setQuantity}
                label="Quantity"
              />
              <p className="min-w-0 text-sm text-slate-600 sm:ml-auto">
                Total{" "}
                <span className="font-bold text-slate-900">
                  {formatPrice(lineTotal(product, quantity))}
                </span>
              </p>
            </div>

            {nextTier && nextTierSave > 0 ? (
              <p className="mt-2 rounded-lg bg-brand-50 px-2.5 py-2 text-xs text-brand-800">
                Add {nextTier.minQty - quantity} more to unlock {formatPrice(nextTier.price)} / unit
              </p>
            ) : null}

            <button
              type="button"
              disabled={outOfStock}
              onClick={handleAddToCart}
              className={`mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:bg-slate-300 ${added ? "bg-emerald-500" : "bg-brand-500 hover:bg-brand-600"
                }`}
            >
              {added ? <Check size={16} /> : <ShoppingBag size={16} />}
              {cartLabel}
            </button>
            <button
              type="button"
              disabled={outOfStock}
              onClick={handleBuyNow}
              className="mt-2.5 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-900 bg-white text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
            >
              <Zap size={16} />
              Buy now
            </button>

            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
            >
              <Heart size={15} fill={wished ? "currentColor" : "none"} className={wished ? "text-red-500" : ""} />
              {wished ? "Saved to wishlist" : "Add to wishlist"}
            </button>

            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
              <p className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-brand-600" />
                Secure checkout at {STORE_NAME}
              </p>
              <p className="flex items-center gap-2">
                <Truck size={14} className="text-brand-600" />
                Packed in 1–2 working days
              </p>
              <p className="flex items-center gap-2">
                <RotateCcw size={14} className={policy.isUsed ? "text-amber-600" : "text-emerald-600"} />
                <span>
                  <strong className="font-semibold text-slate-800">{policy.badge}</strong> · {policy.warrantyType}
                </span>
              </p>
            </div>
          </div>
        </aside>
      </section>

      {/* Tabs */}
      <section
        id="pd-tabs"
        className="mx-auto max-w-8xl scroll-mt-28 px-4 pb-12 sm:px-6 lg:px-8 2xl:max-w-[1536px]"
      >
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div
            role="tablist"
            className="flex gap-1 overflow-x-auto border-b border-slate-200 px-2 scrollbar-none sm:gap-2 sm:px-4"
          >
            {detailTabs.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                onClick={() => setTab(item.id)}
                className={`-mb-px shrink-0 cursor-pointer whitespace-nowrap border-b-2 px-3 py-3.5 text-sm font-semibold transition sm:px-4 ${tab === item.id
                  ? "border-brand-500 text-brand-600"
                  : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div role="tabpanel" className="p-5 sm:p-7">
            {tab === "overview" && (
              <div className="space-y-8">
                {description ? (
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">About this product</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-[15px]">
                      {description}
                    </p>
                  </div>
                ) : null}

                {hasFeatures ? (
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Key features</h2>
                    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                      {product.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-3 text-sm text-slate-700"
                        >
                          <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                            <Check size={12} />
                          </span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {hasSpecs ? (
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-lg font-bold text-slate-900">Quick specs</h2>
                      <button
                        type="button"
                        onClick={() => setTab("specs")}
                        className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                      >
                        View all
                      </button>
                    </div>
                    <div className="mt-3 max-w-2xl divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
                      {product.specifications.slice(0, 6).map((spec, index) => (
                        <div
                          key={spec.label}
                          className={`grid grid-cols-2 gap-4 px-4 py-3 text-sm ${index % 2 === 0 ? "bg-slate-50" : "bg-white"
                            }`}
                        >
                          <span className="text-slate-500">{spec.label}</span>
                          <span className="text-right font-medium text-slate-900">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {tab === "specs" && hasSpecs && (
              <div>
                <h2 className="text-lg font-bold text-slate-900">Specifications</h2>
                <div className="mt-4 max-w-3xl divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
                  {product.specifications.map((spec, index) => (
                    <div
                      key={spec.label}
                      className={`grid grid-cols-2 gap-4 px-4 py-3.5 text-sm ${index % 2 === 0 ? "bg-slate-50" : "bg-white"
                        }`}
                    >
                      <span className="text-slate-500">{spec.label}</span>
                      <span className="text-right font-medium text-slate-900">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "instructions" && instructions && (
              <div className="space-y-6">
                <div className="flex flex-col justify-between gap-3 rounded-2xl border border-brand-200 bg-brand-50/70 p-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-xl bg-brand-600 text-white">
                      <Bot size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Official product instructions</h3>
                      <p className="text-xs text-slate-600">
                        Setup, performance tips, and compatibility for {product.title}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFloatingBotOpen(true)}
                    className="inline-flex items-center gap-1.5 self-start rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700 sm:self-auto"
                  >
                    <Sparkles size={13} /> Ask Bot Live
                  </button>
                </div>

                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
                    <Wrench size={18} className="text-brand-600" /> Step-by-step installation
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {instructions.setupSteps.map((item) => (
                      <div key={item.step} className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="mb-1.5 flex items-center gap-2">
                          <span className="grid size-6 place-items-center rounded-lg bg-brand-100 text-xs font-bold text-brand-700">
                            {item.step}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                        </div>
                        <p className="pl-8 text-xs leading-relaxed text-slate-600">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
                    <ShieldCheck size={18} className="text-brand-600" /> Do&apos;s &amp; Don&apos;ts
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {instructions.dosAndDonts.map((rule, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-xs leading-relaxed ${rule.type === "do"
                          ? "border-emerald-100 bg-emerald-50/50 text-emerald-900"
                          : "border-red-100 bg-red-50/50 text-red-900"
                          }`}
                      >
                        {rule.type === "do" ? (
                          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                        ) : (
                          <RotateCcw size={16} className="mt-0.5 shrink-0 text-red-500" />
                        )}
                        <span>{rule.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === "shipping" && (
              <div className="max-w-3xl space-y-3">
                {[
                  {
                    id: "shipping",
                    title: "Shipping & Delivery",
                    body: "Orders are packed within 1–2 working days. Standard delivery usually arrives in 3–5 working days, and express delivery in 1–2 working days. Cash on delivery (COD) is available for eligible destinations across Pakistan.",
                  },
                  {
                    id: "returns",
                    title: `Return & Exchange Policy (${policy.badge})`,
                    body: "",
                  },
                ].map((item) => {
                  const open = openPolicy === item.id;
                  return (
                    <div key={item.id} className="overflow-hidden rounded-xl border border-slate-200">
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() =>
                          setOpenPolicy((current) => (current === item.id ? "" : item.id))
                        }
                        className="flex w-full cursor-pointer items-center justify-between gap-4 bg-slate-50 px-4 py-3.5 text-left"
                      >
                        <span className="text-sm font-semibold text-slate-900">{item.title}</span>
                        {open ? (
                          <Minus size={16} className="shrink-0 text-slate-700" />
                        ) : (
                          <Plus size={16} className="shrink-0 text-slate-700" />
                        )}
                      </button>
                      {open ? (
                        item.id === "returns" ? (
                          <div className="border-t border-slate-200 px-5 py-5 space-y-5">
                            {/* Summary Card */}
                            <div
                              className={`rounded-xl border p-4 ${policy.isUsed
                                ? "border-amber-200 bg-amber-50/50"
                                : "border-emerald-200 bg-emerald-50/50"
                                }`}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${policy.isUsed
                                      ? "bg-amber-100 text-amber-900"
                                      : "bg-emerald-100 text-emerald-900"
                                      }`}
                                  >
                                    {policy.condition}
                                  </span>
                                  <span className="text-xs font-semibold text-slate-500">
                                    Category:{" "}
                                    <strong className="text-slate-800">{policy.category}</strong>
                                  </span>
                                </div>
                                <span
                                  className={`rounded-md px-2 py-0.5 text-xs font-bold ${policy.isUsed
                                    ? "bg-amber-200/80 text-amber-900"
                                    : "bg-emerald-200/80 text-emerald-900"
                                    }`}
                                >
                                  {policy.badge}
                                </span>
                              </div>
                              <p className="mt-2 text-sm font-semibold text-slate-900">
                                {policy.warrantyType} ({policy.warrantyPeriod})
                              </p>
                              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                                {policy.shortSummary}
                              </p>
                              <div className="mt-3 grid gap-2 border-t border-slate-200/60 pt-3 text-xs sm:grid-cols-2 text-slate-700">
                                <div>
                                  <span className="font-semibold text-slate-900">Condition Terms: </span>
                                  <span>{policy.conditionTerms}</span>
                                </div>
                                <div>
                                  <span className="font-semibold text-slate-900">Category Rules: </span>
                                  <span>{policy.categoryTerms}</span>
                                </div>
                              </div>
                            </div>

                            {/* Eligible vs Ineligible Grid */}
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
                                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                                  <CheckCircle2 size={15} className="text-emerald-600" />
                                  Qualifies for Exchange / Return
                                </p>
                                <ul className="mt-2.5 space-y-2 text-xs text-emerald-950">
                                  {policy.eligibleItems.map((rule, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-emerald-600" />
                                      <span>{rule}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4">
                                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-800">
                                  <X size={15} className="text-rose-600" />
                                  Strictly Non-Returnable
                                </p>
                                <ul className="mt-2.5 space-y-2 text-xs text-rose-950">
                                  {policy.ineligibleItems.map((rule, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-rose-600" />
                                      <span>{rule}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* 3-Step Claim Process */}
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                How to Claim within {policy.warrantyPeriod}
                              </p>
                              <ol className="mt-2.5 space-y-2 text-xs text-slate-600">
                                {policy.claimProcess.map((step, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
                                      {idx + 1}
                                    </span>
                                    <span className="pt-0.5 leading-snug">
                                      {step.replace(/^[0-9]+[.:]\s*/, "")}
                                    </span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        ) : (
                          <p className="border-t border-slate-200 px-4 py-4 text-sm leading-7 text-slate-600">
                            {item.body}
                          </p>
                        )
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}

            {tab === "reviews" && (
              <div>
                <div className="flex flex-wrap items-center gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="text-center min-w-[90px]">
                    <p className="text-4xl font-bold text-slate-900">
                      {reviewCount > 0 ? reviewRating : "0"}
                    </p>
                    <Stars rating={reviewCount > 0 ? reviewRating : 0} size={18} />
                    <p className="mt-1 text-xs text-slate-500">
                      {reviewCount} {reviewCount === 1 ? "rating" : "ratings"}
                    </p>
                  </div>
                  <div className="min-w-[180px] flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviewStats.distribution[star] || 0;
                      const pct = reviewStats.percentages[star] || 0;
                      return (
                        <div key={star} className="flex items-center gap-2 text-xs text-slate-600">
                          <span className="w-3 font-medium">{star}</span>
                          <Star
                            size={11}
                            className={count > 0 ? "text-amber-400" : "text-slate-300"}
                            fill="currentColor"
                          />
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-amber-400 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-6 text-right text-[11px] font-medium text-slate-400">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {productReviews.length > 0 ? (
                  <div className="mt-6 space-y-3.5">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                      Customer Reviews ({productReviews.length})
                    </h3>
                    <div className="space-y-3">
                      {productReviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs transition hover:border-slate-300"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="grid size-8.5 place-items-center rounded-full bg-linear-to-br from-[#0070F3] to-blue-700 text-xs font-bold text-white shadow-xs">
                                {(rev.userName || "U").charAt(0).toUpperCase()}
                              </span>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-bold text-slate-900">
                                    {rev.userName || "Verified Customer"}
                                  </span>
                                  {rev.verifiedPurchase && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200/60">
                                      <CheckCircle2 size={11} className="text-emerald-600" />
                                      Verified Purchase
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  {formatReviewDate(rev.createdAt)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200/60">
                              <Stars rating={rev.rating} size={13} />
                              <span>{rev.rating}.0</span>
                            </div>
                          </div>

                          {rev.comment && (
                            <p className="mt-3 text-sm leading-relaxed text-slate-700 bg-slate-50/70 rounded-xl p-3 border border-slate-100">
                              {rev.comment}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                    <p className="text-sm font-semibold text-slate-800">No written reviews yet</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Customers who have received their delivered orders can leave a verified review directly from their Order History.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <ShopProductRail
        subtitle="Continue browsing"
        title="Recently viewed"
        products={recentProducts}
        tone="light"
      />

      {relatedProducts.length > 0 ? (
        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-8xl px-4 py-12 sm:px-6 lg:px-8 2xl:max-w-[1536px]">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
                  Similar products
                </p>
                <h2 className="mt-1.5 text-xl font-bold text-slate-900">You may also like</h2>
              </div>
              <Link
                to="/shop"
                className="hidden text-sm font-semibold text-brand-600 hover:text-brand-700 sm:block"
              >
                View all
              </Link>
            </div>
            <div className="mt-7 grid grid-cols-1 gap-2.5 min-[340px]:grid-cols-2 min-[540px]:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
              {relatedProducts.slice(0, 4).map((item, index) => (
                <ProductCard key={item.id} product={item} index={index} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Mobile sticky buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 py-2.5 shadow-[0_-8px_30px_-12px_rgba(15,23,42,0.25)] backdrop-blur-md xl:hidden">
        <div className="mx-auto flex max-w-8xl items-center gap-2 sm:gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900">{formatPrice(unitPrice)}</p>
            <p className="truncate text-[11px] text-slate-500">
              {quantity} item{quantity === 1 ? "" : "s"} · {formatPrice(lineTotal(product, quantity))}
            </p>
          </div>
          <button
            type="button"
            disabled={outOfStock}
            onClick={handleAddToCart}
            className={`inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-white sm:px-4 sm:text-sm ${added ? "bg-emerald-500" : "bg-brand-500"
              } disabled:bg-slate-300`}
          >
            <ShoppingBag size={15} />
            {outOfStock ? "Sold out" : added ? "Added" : "Add"}
          </button>
          <button
            type="button"
            disabled={outOfStock}
            onClick={handleBuyNow}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-900 bg-slate-900 px-3 text-xs font-semibold text-white sm:px-4 sm:text-sm disabled:border-slate-300 disabled:bg-slate-300"
          >
            <Zap size={15} />
            Buy
          </button>
        </div>
      </div>

      <div className="fixed bottom-[4.75rem] right-5 z-40 xl:bottom-6 xl:right-6">
        <button
          type="button"
          onClick={() => setFloatingBotOpen(true)}
          className="group flex items-center gap-2.5 rounded-full bg-slate-900 py-2.5 pl-3 pr-4 text-white shadow-xl ring-4 ring-brand-500/20 transition hover:scale-105 hover:bg-brand-600"
        >
          <div className="relative grid size-8 place-items-center rounded-full bg-brand-500 text-white">
            <Bot size={18} className="animate-pulse" />
            <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border border-slate-900 bg-emerald-400" />
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-[11px] font-bold leading-tight">Product Bot</p>
            <p className="text-[9px] text-slate-300">Ask instructions</p>
          </div>
        </button>
      </div>

      <ProductBotModal
        product={product}
        isOpen={floatingBotOpen}
        onClose={() => setFloatingBotOpen(false)}
      />

      <AnimatePresence>
        {lightboxOpen ? (
          <ImageLightbox
            images={images}
            index={activeImage}
            title={product.title}
            onClose={() => setLightboxOpen(false)}
            onChange={setActiveImage}
          />
        ) : null}
      </AnimatePresence>
    </main>
  );
}
