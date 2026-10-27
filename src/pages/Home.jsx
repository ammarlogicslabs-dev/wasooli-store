import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  BadgePercent,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Mail,
  MapPin,
  Network,
  Phone,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  Zap,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, Keyboard } from "swiper/modules";
import "swiper/css";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import StoreHeader from "../components/StoreHeader";
import ShopProductRail from "../components/ShopProductRail";
import ProductCard from "../components/ProductCard";
import Hero3DCanvas from "../components/home/Hero3DCanvas";
import { useCart } from "../cart/CartContext";
import { formatPrice } from "../data/product";
import { normalizeCategory } from "../data/categories";
import { resolveMediaUrl } from "../utils/mediaUrl";
import { smoothScrollTo } from "../utils/smoothScroll";
import ScrollProduct from "../components/ScrollProduct";

/* ─── constants ─────────────────────────────────────────────────────────────── */

const EASE = [0.22, 1, 0.36, 1];

const BENEFITS = [
  { icon: Truck, title: "Fast Dispatch", text: "Packed in 1–2 working days" },
  { icon: ShieldCheck, title: "Secure Checkout", text: "Protected payments" },
  { icon: RotateCcw, title: "Easy Exchanges", text: "Sealed items within 2 days" },
  { icon: Headphones, title: "Expert Support", text: "Networking help available" },
  { icon: BadgePercent, title: "Bulk Pricing", text: "Save more on higher quantities" },
];

const SHOWCASE_FALLBACK = [
  { id: "showcase-router", title: "Wi-Fi 6 Router", image: "/products/wifi6-router.jpg" },
  { id: "showcase-switch", title: "Gigabit Switch", image: "/products/gigabit-switch.jpg" },
  { id: "showcase-ap", title: "Ceiling Access Point", image: "/products/ceiling-access-point.jpg" },
];

const CATEGORY_FALLBACK = [
  { name: "Cabling & Connectivity", image: "/products/cat6-cable.jpg" },
  { name: "Wireless", image: "/products/ceiling-access-point.jpg" },
  { name: "Routing", image: "/products/wifi6-router.jpg" },
  { name: "Optical & Fiber", image: "/products/media-converter.jpg" },
  { name: "Switching", image: "/products/gigabit-switch.jpg" },
  { name: "Network Security", image: "/products/datacenter-switch.jpg" },
  { name: "PoE", image: "/products/poe-injector.jpg" },
  { name: "Adapters & NICs", image: "/products/pcie-network-card.jpg" },
  { name: "Power & Racks", image: "/products/bulk-rack.jpg" },
  { name: "Tools & Accessories", image: "/products/cable-test-2.jpg" },
];

const STEPS = [
  {
    icon: ShoppingBag,
    step: "01",
    tag: "Select Gear",
    title: "Pick your gear",
    text: "Explore Cat6 cables, PoE switches, routers, and enterprise accessories in one verified catalog.",
    features: ["In-Stock Gear", "Wholesale Packs", "Full Specs"],
  },
  {
    icon: ShieldCheck,
    step: "02",
    tag: "Safe Payment",
    title: "Checkout your way",
    text: "Order smoothly via Cash on Delivery or instant bank transfer, with verified invoice confirmation.",
    features: ["Cash on Delivery", "Bank Transfer", "Instant Receipt"],
  },
  {
    icon: Truck,
    step: "03",
    tag: "Express Shipping",
    title: "Dispatched in 1–2 days",
    text: "Carefully boxed with tamper-proof seals and dispatched nationwide across Pakistan.",
    features: ["1–2 Day Packing", "Courier Tracking", "Safe Transit"],
  },
];

const TICKER_ITEMS = [
  "Routers", "Switches", "Access Points", "PoE Gear",
  "Fiber", "Cabling", "Security", "Tools", "Racks", "Adapters",
];

/* ─── button styles ─────────────────────────────────────────────────────────── */

const BTN_PRIMARY =
  "inline-flex h-10 items-center gap-2 rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white " +
  "shadow-[0_4px_0_0_#1a7fd9,0_14px_24px_-10px_rgba(44,154,255,0.7)] transition-[transform,box-shadow,background-color] duration-150 " +
  "hover:-translate-y-0.5 hover:bg-brand-400 hover:shadow-[0_6px_0_0_#1a7fd9,0_18px_28px_-10px_rgba(44,154,255,0.75)] " +
  "active:translate-y-[2px] active:shadow-[0_1px_0_0_#1a7fd9,0_4px_10px_-4px_rgba(44,154,255,0.5)] " +
  "focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-300 sm:h-11 sm:px-6 sm:text-[15px]";

const BTN_GHOST =
  "inline-flex h-10 items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 text-sm font-semibold text-white backdrop-blur-sm " +
  "transition duration-150 hover:-translate-y-0.5 hover:bg-white/10 active:translate-y-0.5 " +
  "focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30 sm:h-11 sm:px-6 sm:text-[15px]";

const ANIMATIONS = `
@keyframes wl-sheen { 0% { transform: translateX(-120%) skewX(-18deg); } 60%,100% { transform: translateX(260%) skewX(-18deg); } }
@keyframes wl-pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(44,154,255,.55); } 100% { box-shadow: 0 0 0 12px rgba(44,154,255,0); } }
@keyframes wl-ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
.wl-sheen::after {
  content: ""; position: absolute; inset: 0; width: 40%;
  background: linear-gradient(100deg, transparent, rgba(255,255,255,.3), transparent);
  animation: wl-sheen 4.5s ease-in-out infinite; pointer-events: none;
}
.wl-live-dot { animation: wl-pulse-ring 1.8s ease-out infinite; }
.wl-ticker-track { animation: wl-ticker 28s linear infinite; display: flex; width: max-content; }
@media (prefers-reduced-motion: reduce) {
  .wl-sheen::after, .wl-live-dot, .wl-ticker-track { animation: none !important; }
}
`;

/* ─── helpers ───────────────────────────────────────────────────────────────── */

function fadeUp(delay, reduce) {
  if (reduce) return {};
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, delay, ease: EASE },
  };
}

function fadeUpInView(delay, reduce) {
  if (reduce) return {};
  return {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.5, delay, ease: EASE },
  };
}

/* ─── TiltCard ──────────────────────────────────────────────────────────────── */

function TiltCard({ children, max = 7, glare = true, className = "" }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 22, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 220, damping: 22, mass: 0.5 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [max, -max]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [-max, max]);
  const gx = useTransform(sx, (v) => (v + 0.5) * 100);
  const gy = useTransform(sy, (v) => (v + 0.5) * 100);
  const highlight = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.24), transparent 55%)`;
  const glareOpacity = useTransform(sx, (v) => Math.min(Math.abs(v) * 2 + 0.2, 1));

  function onMove(event) {
    if (reduce || event.pointerType !== "mouse" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function onLeave() { x.set(0); y.set(0); }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={reduce ? undefined : { rotateX, rotateY, transformPerspective: 900, transformStyle: "preserve-3d" }}
      className={`relative will-change-transform ${className}`}
    >
      {children}
      {glare && !reduce ? (
        <motion.span
          aria-hidden="true"
          style={{ backgroundImage: highlight, opacity: glareOpacity }}
          className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-soft-light"
        />
      ) : null}
    </motion.div>
  );
}

/* ─── CountUp ───────────────────────────────────────────────────────────────── */

function CountUp({ value, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView) return undefined;
    if (reduce) { setShown(value); return undefined; }
    const controls = animate(0, value, {
      duration: 1.4, ease: EASE,
      onUpdate: (latest) => setShown(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, value, reduce]);

  return <span ref={ref}>{shown}{suffix}</span>;
}

/* ─── A. Hero ───────────────────────────────────────────────────────────────── */

function HeroSection({ productCount, categoryCount }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const mouseX = useSpring(useMotionValue(0), { stiffness: 70, damping: 18 });
  const mouseY = useSpring(useMotionValue(0), { stiffness: 70, damping: 18 });

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-7%"]);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0.25]);
  const glowX = useTransform(mouseX, [-0.5, 0.5], [-40, 40]);
  const glowY = useTransform(mouseY, [-0.5, 0.5], [-30, 30]);

  function onMove(event) {
    if (reduce || event.pointerType !== "mouse" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((event.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  return (
    <section
      ref={ref}
      onPointerMove={onMove}
      className="relative flex h-[calc(100vh-var(--store-header-height,108px))] max-h-[calc(100vh-var(--store-header-height,108px))] flex-col justify-between overflow-hidden bg-slate-950 text-white"
    >
      {/* BG parallax image */}
      <motion.img src="/wasooli-hero.jpg" alt="" aria-hidden="true" fetchPriority="high"
        style={reduce ? undefined : { y: bgY, scale: 1.1 }}
        className="absolute inset-0 h-full w-full object-cover opacity-[0.18] sm:opacity-[0.22]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/15" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" aria-hidden="true" />

      {/* Subtle grid */}
      <div aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_65%_35%,black,transparent_65%)]"
      />

      {/* Glows */}
      <motion.div aria-hidden="true" style={reduce ? undefined : { x: glowX, y: glowY }}
        className="pointer-events-none absolute -right-20 -top-8 h-[22rem] w-[22rem] rounded-full bg-brand-500/18 blur-3xl"
      />
      <motion.div aria-hidden="true" style={reduce ? undefined : { x: glowY, y: glowX }}
        className="pointer-events-none absolute bottom-0 left-1/4 h-52 w-52 rounded-full bg-sky-400/8 blur-3xl"
      />

      <motion.div
        style={reduce ? undefined : { y: contentY, opacity: fade }}
        className="relative mx-auto grid w-full max-w-8xl flex-1 min-h-0 items-center gap-4 px-4 py-2 sm:px-6 sm:py-3 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6 lg:px-8 2xl:max-w-[1536px]"
      >
        {/* Left: copy */}
        <div className="py-1">
          <motion.h1 {...fadeUp(0.18, reduce)}
            className="max-w-xl text-2xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-[2.6rem] xl:text-[3.2rem]"
          >
            <span className="block">Your Networking</span>
            <span className="block bg-gradient-to-r from-white via-sky-100 to-brand-300 bg-clip-text text-transparent">
              Products HQ.
            </span>
          </motion.h1>

          <motion.p {...fadeUp(0.28, reduce)}
            className="mt-2.5 max-w-md text-xs leading-5 text-slate-400 sm:text-sm sm:leading-6"
          >
            Cables, switches, access points, and more — sourced for reliability
            and packed in 1–2 days. Delivered nationwide across Pakistan.
          </motion.p>

          <motion.div {...fadeUp(0.38, reduce)} className="mt-4 flex flex-wrap items-center gap-2.5 sm:mt-5 sm:gap-3">
            <Link to="/shop" className={`${BTN_PRIMARY} relative overflow-hidden wl-sheen`}>
              Shop Now
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <a href="#categories" className={BTN_GHOST} onClick={(event) => {
              event.preventDefault();
              smoothScrollTo("categories", { reduce });
            }}>
              Explore Categories
            </a>
          </motion.div>

          <motion.ul {...fadeUp(0.48, reduce)}
            className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400 sm:mt-4 sm:gap-x-5 sm:text-xs"
            aria-label="Store highlights"
          >
            {["Nationwide delivery", "Cash on delivery", "Bulk pricing available"].map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <span className="size-1.5 shrink-0 rounded-full bg-brand-400" aria-hidden="true" />
                {item}
              </li>
            ))}
          </motion.ul>

          {productCount > 0 ? (
            <motion.dl {...fadeUp(0.58, reduce)}
              className="mt-3.5 grid max-w-sm grid-cols-3 divide-x divide-white/[0.08] rounded-2xl border border-white/[0.08] bg-white/[0.03] py-2 backdrop-blur-sm sm:mt-4 sm:py-2.5"
            >
              {[
                { label: "Products", node: <CountUp value={productCount} suffix="+" /> },
                { label: "Categories", node: <CountUp value={categoryCount} /> },
                { label: "Dispatch days", node: "1–2" },
              ].map(({ label, node }) => (
                <div key={label} className="px-3 text-center">
                  <dd className="m-0 text-base font-bold text-white sm:text-lg">{node}</dd>
                  <dt className="mt-0.5 text-[9px] font-medium uppercase tracking-wider text-slate-500">{label}</dt>
                </div>
              ))}
            </motion.dl>
          ) : null}
        </div>

        {/* Right: Interactive 3D Cybernetic Network Animation */}
        <motion.div
          {...fadeUp(0.25, reduce)}
          className="relative flex h-full w-full min-h-0 items-center justify-center overflow-hidden"
        >
          <Hero3DCanvas className="h-full w-full" />
        </motion.div>
      </motion.div>

      {/* Ticker */}
      <div className="relative shrink-0 overflow-hidden border-t border-white/[0.06] bg-white/[0.03] py-2" aria-hidden="true">
        <div className="wl-ticker-track">
          {[0, 1].map((set) => (
            <span key={set} className="flex shrink-0 items-center gap-5 pr-6">
              {TICKER_ITEMS.map((t) => (
                <span key={t} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 whitespace-nowrap">
                  <span className="size-1 rounded-full bg-brand-500" />
                  {t}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── B. Benefits strip ─────────────────────────────────────────────────────── */

function BenefitsStrip() {
  const reduce = useReducedMotion();
  return (
    <section className="relative z-10 border-b border-slate-200 bg-white" aria-label="Store benefits">
      <div className="mx-auto max-w-8xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8 2xl:max-w-[1536px]">
        <motion.ul
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"
        >
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <motion.li
              key={title}
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } } }}
              className="group flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white px-3 py-2.5 shadow-xs"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-500 text-white shadow-[0_10px_20px_-10px_rgba(44,154,255,0.85)] transition duration-200 group-hover:-translate-y-0.5 group-hover:bg-brand-600">
                <Icon size={16} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-slate-900">{title}</p>
                <p className="line-clamp-1 text-[10px] leading-4 text-slate-500">{text}</p>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

/* ─── Section heading ───────────────────────────────────────────────────────── */

function SectionHeading({ eyebrow, title, id, linkLabel, linkTo = "/shop" }) {
  const reduce = useReducedMotion();
  return (
    <div className="mb-5 flex items-end justify-between gap-3 sm:mb-6">
      <motion.div {...fadeUpInView(0, reduce)}>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-600">{eyebrow}</p>
        <h2 id={id} className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</h2>
        <motion.span aria-hidden="true"
          initial={reduce ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.18, ease: EASE }}
          className="mt-2.5 block h-[3px] w-10 origin-left rounded-full bg-gradient-to-r from-brand-500 to-brand-300"
        />
      </motion.div>
      <Link to={linkTo}
        className="group flex shrink-0 items-center gap-0.5 text-sm font-semibold text-brand-600 transition hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-100"
      >
        {linkLabel}
        <ChevronRight size={15} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

/* ─── C. Category grid ──────────────────────────────────────────────────────── */

/* ─── C. Category grid (Circular Premium Pods with Swiper & Pagination) ──────── */

function CategoryGrid({ items, loading }) {
  const [swiper, setSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const reduce = useReducedMotion();

  const displayItems = items && items.length > 0 ? items : CATEGORY_FALLBACK;

  return (
    <section
      id="categories"
      className="scroll-mt-[calc(var(--store-header-height,72px)+1rem)] border-b border-slate-200/80 bg-white"
      aria-labelledby="categories-heading"
    >
      <div className="mx-auto max-w-8xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 2xl:max-w-[1536px]">
        <SectionHeading
          eyebrow="Shop by category"
          title="Find the right gear faster"
          id="categories-heading"
          linkLabel="All categories"
        />

        {loading ? (
          <div className="flex gap-4 overflow-hidden py-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={`cat-skel-${i}`} className="flex flex-col items-center shrink-0 w-28">
                <div className="size-32 sm:size-36 md:size-40 lg:size-44 xl:size-48 2xl:size-52 rounded-full animate-pulse bg-slate-100" />
                <div className="mt-3 h-3 w-16 animate-pulse rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : (
          <div className="group/cat-rail relative mt-3 sm:mt-5">
            {/* Left navigation arrow */}
            <button
              type="button"
              aria-label="Previous categories"
              onClick={() => swiper?.slidePrev()}
              className="absolute left-0 top-16 sm:top-[72px] md:top-20 lg:top-[88px] xl:top-24 2xl:top-[104px] z-20 grid size-10 -translate-x-2 sm:-translate-x-3 -translate-y-1/2 place-items-center rounded-full border border-slate-200/90 bg-white/95 text-slate-700 shadow-md backdrop-blur-sm transition-all duration-200 hover:border-[#2C9AFF] hover:text-[#2C9AFF] hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C9AFF]/50 opacity-100 sm:opacity-0 sm:group-hover/cat-rail:opacity-100"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Right navigation arrow */}
            <button
              type="button"
              aria-label="Next categories"
              onClick={() => swiper?.slideNext()}
              className="absolute right-0 top-16 sm:top-[72px] md:top-20 lg:top-[88px] xl:top-24 2xl:top-[104px] z-20 grid size-10 translate-x-2 sm:translate-x-3 -translate-y-1/2 place-items-center rounded-full border border-slate-200/90 bg-white/95 text-slate-700 shadow-md backdrop-blur-sm transition-all duration-200 hover:border-[#2C9AFF] hover:text-[#2C9AFF] hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C9AFF]/50 opacity-100 sm:opacity-0 sm:group-hover/cat-rail:opacity-100"
            >
              <ChevronRight size={18} />
            </button>

            {/* Circular Category Slider (Auto-slider with 7 visible cards on PC screen) */}
            <Swiper
              modules={[Keyboard, A11y, Autoplay]}
              onSwiper={setSwiper}
              onSlideChange={(s) => setActiveIndex(s.realIndex ?? s.activeIndex)}
              keyboard={{ enabled: true }}
              loop={displayItems.length > 7}
              speed={750}
              autoplay={
                reduce
                  ? false
                  : {
                      delay: 2600,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }
              }
              spaceBetween={10}
              slidesPerView={2.8}
              breakpoints={{
                480: { slidesPerView: 3.5, spaceBetween: 10 },
                640: { slidesPerView: 4.5, spaceBetween: 12 },
                768: { slidesPerView: 5.5, spaceBetween: 12 },
                1024: { slidesPerView: 7, spaceBetween: 12 },
                1280: { slidesPerView: 7, spaceBetween: 14 },
                1536: { slidesPerView: 7, spaceBetween: 14 },
              }}
              className="!overflow-visible py-2"
            >
              {displayItems.map((cat, index) => (
                <SwiperSlide key={cat.name} className="!h-auto">
                  <motion.div
                    initial={reduce ? false : { opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.35,
                      delay: Math.min(index * 0.04, 0.28),
                      ease: EASE,
                    }}
                  >
                    <Link
                      to={`/shop?category=${encodeURIComponent(cat.name)}`}
                      className="group flex flex-col items-center focus:outline-none"
                      aria-label={`Browse ${cat.name}`}
                    >
                      {/* Circle Avatar Pod - Slightly enlarged with full image fit */}
                      <div className="relative flex aspect-square size-32 sm:size-36 md:size-40 lg:size-44 xl:size-48 2xl:size-52 items-center justify-center overflow-hidden rounded-full border-2 border-transparent bg-[#f1f3f6] shadow-xs transition-all duration-300 group-hover:border-[#2C9AFF] group-hover:bg-white group-hover:shadow-[0_14px_28px_-6px_rgba(44,154,255,0.28)]">
                        {cat.image ? (
                          <img
                            src={resolveMediaUrl(cat.image)}
                            alt={cat.name}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/products/gigabit-switch.jpg";
                            }}
                            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                          />
                        ) : (
                          <Network size={34} className="text-slate-400" />
                        )}
                      </div>

                      {/* Title Below Circle */}
                      <p className="mt-3 max-w-[130px] sm:max-w-[150px] lg:max-w-[170px] xl:max-w-[190px] text-center text-sm font-semibold leading-tight text-slate-800 transition-colors duration-200 group-hover:text-[#2C9AFF] line-clamp-2 min-h-[2.2rem]">
                        {cat.name}
                      </p>
                    </Link>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Pagination Dots (Matching reference image) */}
            <div className="mt-6 flex items-center justify-center gap-1.5" aria-hidden="true">
              {displayItems.map((cat, idx) => {
                const isActive = activeIndex === idx;
                return (
                  <button
                    key={`dot-${cat.name}`}
                    type="button"
                    onClick={() => {
                      if (swiper?.params?.loop) {
                        swiper.slideToLoop(idx);
                      } else {
                        swiper?.slideTo(idx);
                      }
                    }}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isActive
                        ? "w-6 bg-slate-900"
                        : "w-2 bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── D. Featured products grid ─────────────────────────────────────────────── */

function FeaturedGrid({ products, loading }) {
  const displayProducts = (products || []).slice(0, 10);

  return (
    <section className="border-b border-slate-200/80 bg-white" aria-labelledby="featured-heading">
      <div className="mx-auto max-w-8xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 2xl:max-w-[1536px]">
        <SectionHeading eyebrow="Curated picks" title="Featured products" id="featured-heading" linkLabel="View all" />

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={`feat-skel-${i}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="aspect-square animate-pulse bg-slate-100" />
                <div className="space-y-1.5 p-2">
                  <div className="h-2.5 w-1/3 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-3.5 w-1/2 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-brand-50 via-white to-white px-6 py-8 text-center shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-600">Catalog</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">Products are on the way.</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Featured picks show up here as soon as the store catalog is available.
            </p>
            <Link to="/shop" className={`${BTN_PRIMARY} mt-5`}>
              Open the shop <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div
            className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            style={{ perspective: 1200 }}
          >
            {displayProducts.map((product, index) => (
              <ScrollProduct key={product.id} index={index} columns={5}>
                <TiltCard max={4} glare={false} className="h-full rounded-[1.2rem]">
                  <ProductCard product={product} index={index} layout="grid" />
                </TiltCard>
              </ScrollProduct>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── E. Promo Banner ───────────────────────────────────────────────────────── */

const BULK_TIERS = [
  { range: "10 – 24 units", discount: "8% OFF", label: "Small Project", benefit: "Standard Spools & Patch" },
  { range: "25 – 49 units", discount: "15% OFF", label: "Installer Pack", benefit: "Rackmount & Switches", popular: true },
  { range: "50+ units", discount: "25% OFF", label: "Enterprise Bulk", benefit: "Full Infrastructure Deploy" },
];

function PromoBanner({ showcase }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const [selectedTier, setSelectedTier] = useState(1);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yParallax = useTransform(scrollYProgress, [0, 1], [30, -30]);

  const cards = (showcase && showcase.length > 0 ? showcase : SHOWCASE_FALLBACK)
    .filter((p) => p?.image)
    .slice(0, 3);

  while (cards.length < 3 && SHOWCASE_FALLBACK[cards.length]) {
    cards.push(SHOWCASE_FALLBACK[cards.length]);
  }

  const activeTier = BULK_TIERS[selectedTier] || BULK_TIERS[1];

  return (
    <section
      ref={ref}
      className="relative overflow-hidden border-y border-slate-800/80 bg-gradient-to-br from-[#061224] via-[#0a1e3b] to-[#040e1c] text-white"
      aria-label="Bulk pricing promotion"
    >
      {/* Ambient Lighting Spheres */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-20 h-96 w-96 rounded-full bg-[#2C9AFF]/20 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-10 h-96 w-96 -translate-y-1/2 rounded-full bg-sky-500/15 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-blue-700/20 blur-[120px]"
      />

      {/* Tech Grid Pattern with Radial Mask */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,black_40%,transparent_100%)]"
      />

      <div className="relative mx-auto max-w-8xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 2xl:max-w-[1536px]">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          {/* Left Column: Headline, Interactive Tiers & CTAs */}
          <div>
            {/* Live Program Badge */}
            {/* <motion.div {...fadeUpInView(0, reduce)}>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#2C9AFF]/40 bg-[#2C9AFF]/15 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#60B6FF] backdrop-blur-md shadow-[0_0_24px_rgba(44,154,255,0.22)]">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2C9AFF] opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-[#2C9AFF]" />
                </span>
                <Zap size={13} className="text-[#2C9AFF]" aria-hidden="true" />
                Volume &amp; Contractor Program
              </span>
            </motion.div> */}

            {/* Headline */}
            <motion.h2
              {...fadeUpInView(0.08, reduce)}
              className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl leading-[1.12]"
            >
              Order more,{" "}
              <span className="bg-gradient-to-r from-[#60B6FF] via-[#9ad0ff] to-white bg-clip-text text-transparent">
                save more.
              </span>
            </motion.h2>

            {/* Description */}
            <motion.p
              {...fadeUpInView(0.16, reduce)}
              className="mt-3.5 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-[15px]"
            >
              Equip your entire deployment for less. Automated tiered wholesale discounts apply directly at checkout on Cat6 patch rolls, managed switches, and enterprise Wi-Fi gear.
            </motion.p>

            {/* Interactive Tier Selector */}
            <motion.div {...fadeUpInView(0.24, reduce)} className="mt-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Select your order volume to preview discount:
              </p>
              <div className="mt-2.5 grid grid-cols-3 gap-2 sm:gap-3 max-w-lg">
                {BULK_TIERS.map((tier, idx) => {
                  const isSelected = selectedTier === idx;
                  return (
                    <button
                      key={tier.range}
                      type="button"
                      onClick={() => setSelectedTier(idx)}
                      className={`relative flex flex-col items-center justify-center rounded-xl p-2.5 sm:p-3 text-center transition-all duration-200 focus:outline-none cursor-pointer ${
                        isSelected
                          ? "border-2 border-[#2C9AFF] bg-[#2C9AFF]/20 text-white shadow-[0_0_20px_rgba(44,154,255,0.35)]"
                          : "border border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/20 hover:bg-white/[0.08] hover:text-slate-200"
                      }`}
                    >
                      {tier.popular ? (
                        <span className="absolute -top-2.5 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold text-white shadow-xs uppercase tracking-wider">
                          Popular
                        </span>
                      ) : null}
                      <span className="text-[11px] sm:text-xs font-semibold">{tier.range}</span>
                      <span className={`mt-0.5 text-xs sm:text-sm font-extrabold ${isSelected ? "text-[#60B6FF]" : "text-slate-300"}`}>
                        {tier.discount}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 leading-none mt-0.5">
                        {tier.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Benefits Checklist */}
            <motion.div {...fadeUpInView(0.3, reduce)} className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                <CheckCircle2 size={16} className="text-[#2C9AFF] shrink-0" />
                <span>Instant volume discount applied automatically in your shopping cart</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                <CheckCircle2 size={16} className="text-[#2C9AFF] shrink-0" />
                <span>Official GST invoice &amp; tax receipts provided with every order</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                <CheckCircle2 size={16} className="text-[#2C9AFF] shrink-0" />
                <span>Priority carton &amp; pallet packaging for zero-damage transit across Pakistan</span>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div {...fadeUpInView(0.36, reduce)} className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/shop"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#2C9AFF] px-6 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(44,154,255,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#208ef3] hover:shadow-[0_8px_28px_rgba(44,154,255,0.55)] active:translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2C9AFF]/50"
              >
                Browse all products <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                to="/shop?category=Cabling%20%26%20Connectivity"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 active:translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
              >
                Bulk Cables &amp; Patch
              </Link>
            </motion.div>
          </div>

          {/* Right Column: 3D Floating Hardware Showcase */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none pt-4 pb-2 lg:py-0">
            {/* Background Ambient Aura under cards */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -m-8 rounded-full bg-gradient-to-tr from-[#2C9AFF]/15 to-sky-400/10 blur-2xl"
            />

            <div className="relative min-h-[340px] sm:min-h-[380px] w-full">
              {/* Card 1: Top Right Satellite Card (e.g. Switch) */}
              <motion.div
                style={reduce ? undefined : { y: yParallax }}
                animate={
                  reduce
                    ? undefined
                    : {
                        y: [-6, 6, -6],
                        rotate: [2, 3.5, 2],
                      }
                }
                transition={{
                  duration: 5.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute right-0 top-0 z-10 w-44 sm:w-56"
              >
                <div className="group overflow-hidden rounded-2xl border border-white/20 bg-slate-900/90 backdrop-blur-xl shadow-[0_16px_36px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-[#2C9AFF]/60 hover:shadow-[0_20px_45px_rgba(44,154,255,0.25)]">
                  {/* Image full width with floating badges */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-800">
                    <img
                      src={resolveMediaUrl(cards[1]?.image)}
                      alt={cards[1]?.title || "Switch"}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/products/gigabit-switch.jpg";
                      }}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/40" />
                    <div className="absolute inset-x-2.5 top-2.5 z-10 flex items-center justify-between gap-1">
                      <span className="font-semibold text-white text-[10px] drop-shadow-md line-clamp-1 max-w-[120px]">
                        {cards[1]?.title || "Gigabit Switch"}
                      </span>
                      <span className="shrink-0 rounded-full bg-emerald-500 px-2 py-0.5 font-bold text-white text-[9px] shadow-sm">
                        -{activeTier.discount}
                      </span>
                    </div>
                  </div>
                  <div className="p-2.5 sm:p-3 flex items-center justify-between text-[11px] border-t border-white/5">
                    <span className="text-slate-400 font-medium">Wholesale tier</span>
                    <span className="font-bold text-white">In Stock</span>
                  </div>
                </div>
              </motion.div>

              {/* Card 2: Main Center Hero Card (e.g. Wi-Fi Router / Spool) */}
              <motion.div
                animate={
                  reduce
                    ? undefined
                    : {
                        y: [0, -10, 0],
                        rotate: [-1.5, -0.5, -1.5],
                      }
                }
                transition={{
                  duration: 4.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute left-4 sm:left-12 top-14 sm:top-16 z-20 w-52 sm:w-64"
              >
                <div className="group overflow-hidden rounded-3xl border border-white/25 bg-slate-900/95 backdrop-blur-2xl shadow-[0_25px_60px_-10px_rgba(0,0,0,0.7)] transition-all duration-300 hover:border-[#2C9AFF] hover:shadow-[0_25px_65px_rgba(44,154,255,0.35)]">
                  {/* Product Image full fill */}
                  <div className="relative aspect-square w-full overflow-hidden bg-slate-800">
                    <img
                      src={resolveMediaUrl(cards[0]?.image)}
                      alt={cards[0]?.title || "Router"}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/products/wifi6-router.jpg";
                      }}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/45" />

                    {/* Floating top badges */}
                    <div className="absolute inset-x-3 top-3 z-10 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2C9AFF]/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                        <Sparkles size={11} />
                        Top Volume Seller
                      </span>
                      <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
                        SAVE {activeTier.discount.replace(" OFF", "")}
                      </span>
                    </div>
                  </div>

                  {/* Product Details & Tier Benefit */}
                  <div className="p-3.5 sm:p-4 bg-slate-900/95 border-t border-white/10">
                    <h4 className="text-sm font-bold text-white line-clamp-1">
                      {cards[0]?.title || "Cat6 Bulk Packaging (305m)"}
                    </h4>
                    <div className="mt-1.5 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Order {activeTier.range}</span>
                      <span className="font-extrabold text-[#60B6FF]">Tier Discount Active</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Card 3: Bottom Right Satellite Card (e.g. Access Point) */}
              <motion.div
                animate={
                  reduce
                    ? undefined
                    : {
                        y: [6, -6, 6],
                        rotate: [-3, -1, -3],
                      }
                }
                transition={{
                  duration: 5.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute right-4 sm:right-10 bottom-2 z-15 w-44 sm:w-54"
              >
                <div className="group overflow-hidden rounded-2xl border border-white/20 bg-slate-900/90 backdrop-blur-xl shadow-[0_16px_36px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-[#2C9AFF]/60 hover:shadow-[0_20px_45px_rgba(44,154,255,0.25)]">
                  {/* Image full width with floating badges */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-800">
                    <img
                      src={resolveMediaUrl(cards[2]?.image)}
                      alt={cards[2]?.title || "Access Point"}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/products/ceiling-access-point.jpg";
                      }}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/40" />
                    <div className="absolute inset-x-2.5 top-2.5 z-10 flex items-center justify-between gap-1">
                      <span className="font-semibold text-white text-[10px] drop-shadow-md line-clamp-1 max-w-[110px]">
                        {cards[2]?.title || "Ceiling Access Point"}
                      </span>
                      <span className="shrink-0 rounded-full bg-[#2C9AFF] px-2 py-0.5 font-bold text-white text-[9px] shadow-sm">
                        B2B Pack
                      </span>
                    </div>
                  </div>
                  <div className="p-2.5 sm:p-3 flex items-center justify-between text-[11px] border-t border-white/5">
                    <span className="text-slate-400 font-medium">Warranty</span>
                    <span className="font-bold text-emerald-400">Official Wasooli</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── G. How it works ───────────────────────────────────────────────────────── */

function HowItWorks() {
  const reduce = useReducedMotion();
  return (
    <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-slate-50 via-slate-100/60 to-slate-50 py-14 sm:py-20" aria-labelledby="home-steps-heading">
      {/* Background ambient light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-full max-w-4xl rounded-full bg-[#2C9AFF]/5 blur-[100px]"
      />
      {/* Subtle blueprint dot grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#2C9AFF_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.04]"
      />

      <div className="relative mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 2xl:max-w-[1536px]">
        <SectionHeading
          eyebrow="How ordering works"
          title="From cart to your door in 3 simple steps"
          id="home-steps-heading"
          linkLabel="Start shopping"
        />

        <div className="relative mt-8 sm:mt-12 grid gap-6 md:grid-cols-3">
          {/* Connecting line on desktop */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-14 left-16 right-16 hidden h-[2px] bg-gradient-to-r from-[#2C9AFF]/20 via-[#2C9AFF]/60 to-[#2C9AFF]/20 md:block"
          />

          {STEPS.map(({ icon: Icon, step, tag, title, text, features }, index) => (
            <motion.article
              key={title}
              {...fadeUpInView(0.08 * index, reduce)}
              whileHover={reduce ? undefined : { y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 p-6 sm:p-7 shadow-[0_4px_24px_-6px_rgba(15,23,42,0.06)] backdrop-blur-sm transition-all duration-300 hover:border-[#2C9AFF]/50 hover:shadow-[0_20px_45px_-12px_rgba(44,154,255,0.22)]"
            >
              <div>
                {/* Step Header: Icon + Step Pill Badge */}
                <div className="flex items-center justify-between">
                  <span className="grid size-13 place-items-center rounded-2xl bg-gradient-to-br from-[#2C9AFF] to-[#1268c4] text-white shadow-[0_8px_20px_rgba(44,154,255,0.32)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2">
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <span className="inline-flex items-center rounded-full border border-[#2C9AFF]/20 bg-[#2C9AFF]/8 px-3 py-1 font-mono text-xs font-black tracking-wider text-[#2C9AFF] transition-colors duration-300 group-hover:border-[#2C9AFF] group-hover:bg-[#2C9AFF] group-hover:text-white">
                    STEP {step}
                  </span>
                </div>

                {/* Subtag & Title */}
                <div className="mt-6">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#2C9AFF]">
                    {tag}
                  </span>
                  <h3 className="mt-1 text-lg font-extrabold tracking-tight text-slate-900 transition-colors duration-200 group-hover:text-[#2C9AFF]">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {text}
                  </p>
                </div>

                {/* Micro-Features / Trust Chips */}
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {features?.map((f) => (
                    <span
                      key={f}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition-colors duration-200 group-hover:bg-[#2C9AFF]/10 group-hover:text-[#1875d1]"
                    >
                      <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom active indicator */}
              <div className="mt-6 h-1 w-10 rounded-full bg-slate-100 transition-all duration-300 group-hover:w-20 group-hover:bg-[#2C9AFF]" />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── H. Closing CTA ────────────────────────────────────────────────────────── */

function ClosingCTA() {
  const reduce = useReducedMotion();
  return (
    <section className="relative overflow-hidden bg-slate-50 py-12 sm:py-16 lg:py-20" aria-labelledby="home-cta-heading">
      <div className="relative mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 2xl:max-w-[1536px]">
        {/* Luxury Dark Sapphire Container Card */}
        <div className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#061224] via-[#091b35] to-[#040e1c] px-6 py-14 text-white shadow-[0_25px_70px_-15px_rgba(0,0,0,0.5)] sm:px-12 sm:py-18 lg:px-16 lg:py-20">
          {/* Ambient cyan-blue background glow meshes */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 -right-20 h-96 w-96 rounded-full bg-[#2C9AFF]/25 blur-[120px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-[#2C9AFF]/20 blur-[130px]"
          />

          {/* Subtle blueprint dot grid overlay */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(#2C9AFF_1px,transparent_1px)] [background-size:28px_28px] opacity-15"
          />

          <div className="relative mx-auto max-w-3xl text-center">
            {/* Pill Badge */}
            <motion.div {...fadeUpInView(0, reduce)}>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#2C9AFF]/35 bg-[#2C9AFF]/15 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#60B6FF] backdrop-blur-md shadow-sm">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                Ready to Deploy • Nationwide in Pakistan
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              {...fadeUpInView(0.08, reduce)}
              id="home-cta-heading"
              className="mt-5 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl"
            >
              Ready to build your{" "}
              <span className="bg-gradient-to-r from-sky-200 via-white to-[#60B6FF] bg-clip-text text-transparent">
                high-performance network?
              </span>
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              {...fadeUpInView(0.16, reduce)}
              className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base sm:leading-relaxed"
            >
              Explore our full catalog — Cat6 patch cables to PoE switches and Wi-Fi 6 access points. Fast dispatch, verified genuine stock, and direct support across Pakistan.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              {...fadeUpInView(0.24, reduce)}
              className="mt-8 flex flex-wrap items-center justify-center gap-4"
            >
              <Link
                to="/shop"
                className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-[#2C9AFF] px-7 text-sm font-bold text-white shadow-[0_0_30px_rgba(44,154,255,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1a85ea] hover:shadow-[0_0_45px_rgba(44,154,255,0.7)] active:translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2C9AFF]/30 sm:h-13 sm:px-8 sm:text-base"
              >
                Browse full catalog <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link
                to="/account"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/15 active:translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/20 sm:h-13 sm:px-7 sm:text-base"
              >
                My account
              </Link>
            </motion.div>

            {/* Trust Micro-Metrics Row */}
            <motion.div
              {...fadeUpInView(0.32, reduce)}
              className="mt-12 grid grid-cols-2 gap-4 border-t border-white/10 pt-8 sm:grid-cols-4 sm:gap-6"
            >
              <div className="flex flex-col items-center text-center">
                <span className="grid size-9 place-items-center rounded-xl bg-[#2C9AFF]/15 text-[#60B6FF] ring-1 ring-[#2C9AFF]/30 mb-2">
                  <Truck size={17} />
                </span>
                <span className="text-xs font-bold text-white">1–2 Day Dispatch</span>
                <span className="text-[11px] text-slate-400">Nationwide courier</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <span className="grid size-9 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30 mb-2">
                  <ShieldCheck size={17} />
                </span>
                <span className="text-xs font-bold text-white">100% Genuine</span>
                <span className="text-[11px] text-slate-400">Tested hardware</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <span className="grid size-9 place-items-center rounded-xl bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/30 mb-2">
                  <CheckCircle2 size={17} />
                </span>
                <span className="text-xs font-bold text-white">Cash on Delivery</span>
                <span className="text-[11px] text-slate-400">Doorstep payment</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <span className="grid size-9 place-items-center rounded-xl bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30 mb-2">
                  <Headphones size={17} />
                </span>
                <span className="text-xs font-bold text-white">Expert Support</span>
                <span className="text-[11px] text-slate-400">Direct assistance</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Page root ─────────────────────────────────────────────────────────────── */

export default function Home() {
  const { products, ready } = useCart();
  const catalogLoading = !ready && products.length === 0;

  useEffect(() => {
    document.title = "Wasooli Store — Networking Products Pakistan";
  }, []);

  const { categoryItems, categoryTotal } = useMemo(() => {
    const map = new Map();
    CATEGORY_FALLBACK.forEach((fb) => {
      map.set(fb.name, { name: fb.name, count: 0, image: fb.image });
    });
    products.forEach((p) => {
      const name = normalizeCategory(p.category);
      if (!name) return;
      const entry = map.get(name) || { name, count: 0, image: null };
      entry.count += 1;
      if (!entry.image && p.image) entry.image = p.image;
      map.set(name, entry);
    });
    const all = [...map.values()];
    return { categoryItems: all, categoryTotal: all.length };
  }, [products]);

  const featuredProducts = useMemo(
    () =>
      [...products]
        .filter((p) => !Number.isFinite(p.stock) || p.stock > 0)
        .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
        .slice(0, 10),
    [products]
  );

  const trendingProducts = useMemo(
    () =>
      [...products]
        .filter((p) => !Number.isFinite(p.stock) || p.stock > 0)
        .sort((a, b) => (Number(b.reviews) || 0) - (Number(a.reviews) || 0))
        .slice(0, 10),
    [products]
  );

  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    if (reduce) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    window.__lenis = lenis;

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      window.__lenis = null;
    };
  }, [reduce]);

  const promoProducts = useMemo(
    () => trendingProducts.filter((p) => p.image).slice(0, 3),
    [trendingProducts]
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <style>{ANIMATIONS}</style>
      {/* Smooth Scroll Progress Indicator */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 z-[100] h-[3px] origin-left bg-gradient-to-r from-[#2C9AFF] via-sky-400 to-[#2C9AFF] shadow-[0_0_12px_rgba(44,154,255,0.85)] pointer-events-none"
      />
      <StoreHeader />
      <HeroSection productCount={products.length} categoryCount={categoryTotal} />
      <BenefitsStrip />
      <CategoryGrid items={categoryItems.length ? categoryItems : CATEGORY_FALLBACK} loading={catalogLoading} />
      <FeaturedGrid products={featuredProducts} loading={catalogLoading} />
      <ShopProductRail subtitle="What people buy" title="Trending now" products={trendingProducts} tone="light" autoplay />
      <PromoBanner showcase={promoProducts.length ? promoProducts : SHOWCASE_FALLBACK} />
      <HowItWorks />
      {/* <ClosingCTA /> */}
    </main>
  );
}