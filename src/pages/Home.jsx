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
  ChevronRight,
  Headphones,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  Zap,
} from "lucide-react";
import StoreHeader from "../components/StoreHeader";
import ShopProductRail from "../components/ShopProductRail";
import ProductCard from "../components/ProductCard";
import { useCart } from "../cart/CartContext";
import { formatPrice } from "../data/product";
import { getRecentlyViewedIds } from "../utils/recentlyViewed";
import { resolveMediaUrl } from "../utils/mediaUrl";
import { smoothScrollTo } from "../utils/smoothScroll";
import ScrollProduct from "../components/ScrollProduct";

/* ─── shared constants ─────────────────────────────────────────────────────── */

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
  { name: "Routers", image: "/products/wifi6-router.jpg" },
  { name: "Switches", image: "/products/gigabit-switch.jpg" },
  { name: "Access Points", image: "/products/ceiling-access-point.jpg" },
  { name: "PoE Gear", image: "/products/poe-injector.jpg" },
  { name: "Adapters", image: "/products/usb-wifi-adapter.jpg" },
  { name: "Converters", image: "/products/media-converter.jpg" },
];

const STEPS = [
  { icon: ShoppingBag, title: "Pick your gear", text: "Cables, switches, routers, and access points in one catalog." },
  { icon: ShieldCheck, title: "Checkout your way", text: "Cash on delivery or a bank transfer, with a saved address." },
  { icon: Truck, title: "Dispatched in 1–2 days", text: "Packed for nationwide delivery across Pakistan." },
];

/* Raised "3D" buttons: a solid lower edge that compresses on press. */
const BTN_PRIMARY =
  "inline-flex h-11 items-center gap-2 rounded-xl bg-brand-500 px-6 text-sm font-semibold text-white " +
  "shadow-[0_4px_0_0_#1a7fd9,0_16px_28px_-12px_rgba(44,154,255,0.75)] transition-[transform,box-shadow,background-color] duration-150 " +
  "hover:-translate-y-0.5 hover:bg-brand-400 hover:shadow-[0_6px_0_0_#1a7fd9,0_20px_32px_-12px_rgba(44,154,255,0.8)] " +
  "active:translate-y-[3px] active:shadow-[0_1px_0_0_#1a7fd9,0_6px_12px_-6px_rgba(44,154,255,0.6)] " +
  "focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-300 sm:h-12 sm:text-base";

const BTN_GHOST =
  "inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur-sm " +
  "transition duration-150 hover:-translate-y-0.5 hover:bg-white/10 active:translate-y-0.5 " +
  "focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30 sm:h-12 sm:text-base";

const ANIMATIONS = `
@keyframes wl-sheen { 0% { transform: translateX(-120%) skewX(-18deg); } 60%,100% { transform: translateX(260%) skewX(-18deg); } }
@keyframes wl-pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(44,154,255,.55); } 100% { box-shadow: 0 0 0 14px rgba(44,154,255,0); } }
.wl-sheen::after {
  content: ""; position: absolute; inset: 0; width: 40%;
  background: linear-gradient(100deg, transparent, rgba(255,255,255,.35), transparent);
  animation: wl-sheen 4.5s ease-in-out infinite; pointer-events: none;
}
.wl-live-dot { animation: wl-pulse-ring 1.8s ease-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .wl-sheen::after, .wl-live-dot { animation: none !important; }
}
`;

/** Simple fade-up entrance. */
function fadeUp(delay, reduce) {
  if (reduce) return {};
  return {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: EASE },
  };
}

/** Scroll-triggered fade-up. */
function fadeUpInView(delay, reduce) {
  if (reduce) return {};
  return {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.55, delay, ease: EASE },
  };
}

/* ─── 3D helpers ───────────────────────────────────────────────────────────── */

/** Perspective tilt that follows the pointer, with a moving highlight. Mouse only. */
function TiltCard({ children, max = 8, glare = true, className = "" }) {
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
  const highlight = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.28), transparent 55%)`;
  const glareOpacity = useTransform(sx, (v) => Math.min(Math.abs(v) * 2 + 0.2, 1));

  function onMove(event) {
    if (reduce || event.pointerType !== "mouse" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

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

function CountUp({ value, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView) return undefined;
    if (reduce) {
      setShown(value);
      return undefined;
    }
    const controls = animate(0, value, {
      duration: 1.4,
      ease: EASE,
      onUpdate: (latest) => setShown(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, value, reduce]);

  return (
    <span ref={ref}>
      {shown}
      {suffix}
    </span>
  );
}

/* ─── A. Hero ──────────────────────────────────────────────────────────────── */

function HeroProductCard({ product, className, depth, mouseX, mouseY, delay, floatDelay }) {
  const reduce = useReducedMotion();
  const tx = useTransform(mouseX, [-0.5, 0.5], [-depth, depth]);
  const ty = useTransform(mouseY, [-0.5, 0.5], [-depth, depth]);
  const rating = Number(product.rating);

  return (
    <motion.div
      style={reduce ? undefined : { x: tx, y: ty }}
      className={`absolute ${className}`}
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 40, scale: 0.9 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, y: [0, -10, 0], scale: 1 }}
        transition={
          reduce
            ? { duration: 0 }
            : {
                opacity: { duration: 0.6, delay },
                scale: { duration: 0.6, delay, ease: EASE },
                y: {
                  duration: 5.5,
                  delay: delay + floatDelay,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }
        }
      >
        <Link
          to={product.slug ? `/products/${product.slug}` : "/shop"}
          viewTransition
          aria-label={`Shop ${product.title}`}
          className="block w-40 overflow-hidden rounded-3xl border border-white/70 bg-white p-2.5 text-slate-900 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.65)] transition-transform duration-300 hover:scale-[1.04] focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-300 sm:w-44 xl:w-52"
        >
          <div className="grid aspect-square place-items-center overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50 to-white">
            {product.image ? (
              <img
                src={resolveMediaUrl(product.image)}
                alt=""
                loading="eager"
                className="h-full w-full object-contain p-2"
              />
            ) : null}
          </div>
          <p className="mt-2 line-clamp-1 text-xs font-semibold">{product.title}</p>
          <div className="mt-0.5 flex items-center justify-between gap-2">
            {product.price != null ? (
              <span className="text-sm font-bold text-brand-600">{formatPrice(product.price)}</span>
            ) : (
              <span className="text-[11px] font-semibold text-brand-600">Shop now</span>
            )}
            {Number.isFinite(rating) && rating > 0 ? (
              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-slate-500">
                <Star size={11} className="fill-amber-400 text-amber-400" aria-hidden="true" />
                {rating.toFixed(1)}
              </span>
            ) : null}
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}

function HeroSection({ products, productCount, categoryCount }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const mouseX = useSpring(useMotionValue(0), { stiffness: 80, damping: 18 });
  const mouseY = useSpring(useMotionValue(0), { stiffness: 80, damping: 18 });

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);
  const fade = useTransform(scrollYProgress, [0, 0.9], [1, 0.2]);

  const glowX = useTransform(mouseX, [-0.5, 0.5], [-40, 40]);
  const glowY = useTransform(mouseY, [-0.5, 0.5], [-30, 30]);

  function onMove(event) {
    if (reduce || event.pointerType !== "mouse" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((event.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  const showcase = (products.length ? products : SHOWCASE_FALLBACK).slice(0, 3);

  return (
    <section
      ref={ref}
      onPointerMove={onMove}
      className="relative overflow-hidden bg-slate-950 text-white"
    >
      {/* Background image with scroll parallax */}
      <motion.img
        src="/wasooli-hero.jpg"
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        style={reduce ? undefined : { y: bgY, scale: 1.12 }}
        className="absolute inset-0 h-full w-full object-cover opacity-20 sm:opacity-25"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/20" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" aria-hidden="true" />

      {/* Fine grid for depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_70%_40%,black,transparent_70%)]"
      />

      {/* Mouse-reactive glows */}
      <motion.div
        aria-hidden="true"
        style={reduce ? undefined : { x: glowX, y: glowY }}
        className="pointer-events-none absolute -right-24 top-0 h-[26rem] w-[26rem] rounded-full bg-brand-500/20 blur-3xl"
      />
      <motion.div
        aria-hidden="true"
        style={reduce ? undefined : { x: glowY, y: glowX }}
        className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl"
      />

      <motion.div
        style={reduce ? undefined : { y: contentY, opacity: fade }}
        className="relative mx-auto grid max-w-8xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-28 2xl:max-w-[1536px]"
      >
        <div>
          <motion.p
            {...fadeUp(0.1, reduce)}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-300"
          >
            <span className="wl-live-dot size-2 rounded-full bg-brand-400" aria-hidden="true" />
            Wasooli Store · Pakistan
          </motion.p>

          <motion.h1
            {...fadeUp(0.22, reduce)}
            className="mt-4 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl"
          >
            Your Networking
            <span className="mt-1 block bg-gradient-to-r from-white via-sky-100 to-brand-300 bg-clip-text text-transparent">
              Products HQ.
            </span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.34, reduce)}
            className="mt-5 max-w-lg text-sm leading-6 text-slate-300 sm:text-base sm:leading-7"
          >
            Cables, switches, access points, and more — sourced for reliability
            and packed in 1–2 days. Delivered nationwide across Pakistan.
          </motion.p>

          <motion.div {...fadeUp(0.46, reduce)} className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/shop" className={`${BTN_PRIMARY} relative overflow-hidden wl-sheen`}>
              Shop Now
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <a
              href="#categories"
              className={BTN_GHOST}
              onClick={(event) => {
                event.preventDefault();
                smoothScrollTo("categories", { reduce });
              }}
            >
              Explore Categories
            </a>
          </motion.div>

          <motion.ul
            {...fadeUp(0.58, reduce)}
            className="mt-9 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400 sm:gap-x-7 sm:text-sm"
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
            <motion.dl
              {...fadeUp(0.7, reduce)}
              className="mt-10 grid max-w-md grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.04] py-4 backdrop-blur-sm"
            >
              {[
                { label: "Products", node: <CountUp value={productCount} suffix="+" /> },
                { label: "Categories", node: <CountUp value={categoryCount} /> },
                { label: "Days to dispatch", node: "1–2" },
              ].map(({ label, node }) => (
                <div key={label} className="px-4 text-center">
                  <dd className="m-0 text-xl font-bold text-white sm:text-2xl">{node}</dd>
                  <dt className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400 sm:text-[11px]">
                    {label}
                  </dt>
                </div>
              ))}
            </motion.dl>
          ) : null}
        </div>

        {showcase.length > 0 ? (
          <div className="mt-2 flex gap-3 overflow-x-auto pb-1 lg:hidden" aria-label="Featured products">
            {showcase.map((product) => (
              <Link
                key={product.id}
                to={product.slug ? `/products/${product.slug}` : "/shop"}
                viewTransition
                className="w-36 shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-white p-2 text-slate-900 shadow-xl"
              >
                <div className="grid aspect-square place-items-center overflow-hidden rounded-xl bg-slate-50">
                  {product.image ? (
                    <img src={resolveMediaUrl(product.image)} alt="" className="h-full w-full object-contain p-2" />
                  ) : null}
                </div>
                <p className="mt-2 line-clamp-1 text-xs font-semibold">{product.title}</p>
              </Link>
            ))}
          </div>
        ) : null}

        {/* Layered floating product composition */}
        {showcase.length > 0 ? (
          <div className="relative hidden h-[30rem] lg:block" aria-label="Featured products">
            <div
              aria-hidden="true"
              className="absolute inset-x-6 top-10 bottom-10 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent"
            />
            {showcase[0] ? (
              <HeroProductCard
                product={showcase[0]}
                className="top-2 left-4 z-10"
                depth={26}
                mouseX={mouseX}
                mouseY={mouseY}
                delay={0.5}
                floatDelay={0}
              />
            ) : null}
            {showcase[1] ? (
              <HeroProductCard
                product={showcase[1]}
                className="top-28 right-0 z-20"
                depth={46}
                mouseX={mouseX}
                mouseY={mouseY}
                delay={0.65}
                floatDelay={1.2}
              />
            ) : null}
            {showcase[2] ? (
              <HeroProductCard
                product={showcase[2]}
                className="bottom-0 left-16 z-30"
                depth={64}
                mouseX={mouseX}
                mouseY={mouseY}
                delay={0.8}
                floatDelay={2.1}
              />
            ) : null}
          </div>
        ) : null}
      </motion.div>
    </section>
  );
}

/* ─── B. Benefits strip ────────────────────────────────────────────────────── */

function BenefitsStrip() {
  const reduce = useReducedMotion();
  return (
    <section className="relative z-10 border-b border-slate-200 bg-white" aria-label="Store benefits">
      <div className="mx-auto max-w-8xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 2xl:max-w-[1536px]">
        <motion.ul
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
        >
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <motion.li
              key={title}
              variants={{
                hidden: { opacity: 0, y: 14 },
                show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
              }}
              className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white px-3 py-3 shadow-xs"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-500 text-white shadow-[0_12px_24px_-12px_rgba(44,154,255,0.9)] transition duration-200 group-hover:-translate-y-0.5 group-hover:bg-brand-600">
                <Icon size={18} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-slate-900 sm:text-sm">{title}</p>
                <p className="line-clamp-2 text-[11px] leading-4 text-slate-500 sm:text-xs">{text}</p>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

/* ─── C. Category grid ─────────────────────────────────────────────────────── */

function SectionHeading({ eyebrow, title, id, linkLabel }) {
  const reduce = useReducedMotion();
  return (
    <div className="mb-6 flex items-end justify-between gap-3 sm:mb-8">
      <motion.div {...fadeUpInView(0, reduce)}>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-600">{eyebrow}</p>
        <h2 id={id} className="mt-1.5 text-xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h2>
        <motion.span
          aria-hidden="true"
          initial={reduce ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          className="mt-3 block h-1 w-14 origin-left rounded-full bg-gradient-to-r from-brand-500 to-brand-300"
        />
      </motion.div>
      <Link
        to="/shop"
        className="group flex shrink-0 items-center gap-0.5 text-sm font-semibold text-brand-600 transition hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-100"
      >
        {linkLabel}
        <ChevronRight
          size={16}
          aria-hidden="true"
          className="transition-transform duration-200 group-hover:translate-x-1"
        />
      </Link>
    </div>
  );
}

function CategoryGrid({ items, loading }) {
  const reduce = useReducedMotion();

  return (
    <section
      id="categories"
      className="scroll-mt-[calc(var(--store-header-height,72px)+1rem)] border-b border-slate-200/80 bg-gradient-to-b from-white to-slate-50"
      aria-labelledby="categories-heading"
    >
      <div className="mx-auto max-w-8xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 2xl:max-w-[1536px]">
        <SectionHeading
          eyebrow="Shop by category"
          title="Find the right gear faster"
          id="categories-heading"
          linkLabel="All categories"
        />

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`cat-skel-${i}`} className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {items.map((cat, index) => (
              <motion.div
                key={cat.name}
                initial={reduce ? false : { opacity: 0, y: 24, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={reduce ? { duration: 0 } : { duration: 0.5, delay: 0.06 * index, ease: EASE }}
              >
                <TiltCard max={9} className="rounded-2xl">
                  <Link
                    to="/shop"
                    className="group relative block aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.35)] transition-shadow duration-300 hover:border-brand-300 hover:shadow-[0_28px_44px_-18px_rgba(44,154,255,0.5)] focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
                    aria-label={`Browse ${cat.name}`}
                  >
                    {cat.image ? (
                      <img
                        src={resolveMediaUrl(cat.image)}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-2xl font-bold text-slate-300">
                        {cat.name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3 transition-transform duration-300 group-hover:-translate-y-1">
                      <p className="text-xs font-bold leading-tight text-white drop-shadow sm:text-sm">{cat.name}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-300 sm:text-xs">
                        {cat.count == null
                          ? "Browse"
                          : `${cat.count} ${cat.count === 1 ? "item" : "items"}`}
                        <ArrowRight
                          size={11}
                          aria-hidden="true"
                          className="-translate-x-1 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                        />
                      </p>
                    </div>
                  </Link>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* ─── D. Featured products grid ────────────────────────────────────────────── */

function FeaturedGrid({ products, loading }) {
  return (
    <section className="border-b border-slate-200/80 bg-white" aria-labelledby="featured-heading">
      <div className="mx-auto max-w-8xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 2xl:max-w-[1536px]">
        <SectionHeading
          eyebrow="Curated picks"
          title="Featured products"
          id="featured-heading"
          linkLabel="View all"
        />

        {loading ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={`feat-skel-${i}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="aspect-square animate-pulse bg-slate-100" />
                <div className="space-y-1.5 p-2.5">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                  <div className="h-3.5 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-brand-50 via-white to-white px-6 py-8 text-center shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-600">Catalog</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">Products are on the way.</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Featured picks show up here as soon as the store catalog is available. You can still open the shop to browse.
            </p>
            <Link to="/shop" className={`${BTN_PRIMARY} mt-5`}>
              Open the shop
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div
            className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 min-[1800px]:grid-cols-6"
            style={{ perspective: 1200 }}
          >
            {products.map((product, index) => (
              <ScrollProduct key={product.id} index={index} columns={5}>
                <TiltCard max={4} glare={false} className="h-full rounded-[1.35rem]">
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

/* ─── F. Promotional banner ────────────────────────────────────────────────── */

function PromoBanner({ showcase }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yA = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const yB = useTransform(scrollYProgress, [0, 1], [70, -70]);
  const yC = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const blobY = useTransform(scrollYProgress, [0, 1], [-30, 30]);
  const layers = [
    { y: yA, className: "left-0 top-6 w-40 -rotate-6" },
    { y: yB, className: "left-28 top-24 z-10 w-44 rotate-3" },
    { y: yC, className: "left-56 top-2 w-36 rotate-[9deg]" },
  ];
  const cards = showcase.filter((p) => p?.image).slice(0, 3);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden border-b border-brand-600 bg-gradient-to-br from-brand-500 via-brand-500 to-brand-700"
      aria-label="Bulk pricing promotion"
    >
      <motion.div
        aria-hidden="true"
        style={reduce ? undefined : { y: blobY }}
        className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"
      />
      <div className="pointer-events-none absolute -bottom-12 -right-12 h-56 w-56 rounded-full bg-sky-300/25 blur-2xl" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:22px_22px]"
      />

      <div
        className={`relative mx-auto grid max-w-8xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:px-8 2xl:max-w-[1536px] ${
          cards.length > 0 ? "lg:grid-cols-[1.1fr_0.9fr]" : ""
        }`}
      >
        <div className={`text-white ${cards.length > 0 ? "text-center lg:text-left" : "mx-auto max-w-2xl text-center"}`}>
          <motion.span
            {...fadeUpInView(0, reduce)}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]"
          >
            <Zap size={13} aria-hidden="true" />
            Bulk pricing available
          </motion.span>

          <motion.h2
            {...fadeUpInView(0.12, reduce)}
            className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
          >
            Order more, save more.
          </motion.h2>

          <motion.p {...fadeUpInView(0.22, reduce)} className="mt-3 max-w-xl text-sm leading-6 text-brand-50 sm:text-base">
            Many of our networking cables and accessories are priced lower per unit
            when you order in higher quantities. Check the pricing table on any
            product page to see available tiers.
          </motion.p>

          <motion.div
            {...fadeUpInView(0.32, reduce)}
            className={`mt-7 flex flex-wrap gap-3 ${cards.length > 0 ? "justify-center lg:justify-start" : "justify-center"}`}
          >
            <Link
              to="/shop"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-7 text-sm font-semibold text-brand-700 shadow-[0_4px_0_0_#b9dcff,0_18px_30px_-12px_rgba(0,0,0,0.4)] transition duration-150 hover:-translate-y-0.5 hover:bg-brand-50 active:translate-y-[3px] active:shadow-[0_1px_0_0_#b9dcff] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
            >
              Browse all products
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </motion.div>
        </div>

        {cards.length > 0 ? (
          <div className="relative mx-auto hidden h-72 w-full max-w-md lg:block" aria-hidden="true">
            {cards.map((product, i) => (
              <motion.div
                key={product.id}
                style={reduce ? undefined : { y: layers[i].y }}
                className={`absolute ${layers[i].className}`}
              >
                <div className="overflow-hidden rounded-2xl border border-white/30 bg-white p-2 shadow-[0_30px_50px_-20px_rgba(0,20,60,0.6)]">
                  <div className="grid aspect-square place-items-center rounded-xl bg-slate-100">
                    <img
                      src={resolveMediaUrl(product.image)}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-contain p-2"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* ─── H. Closing CTA ───────────────────────────────────────────────────────── */

function ClosingCTA() {
  const reduce = useReducedMotion();

  return (
    <section className="border-t border-slate-200 bg-white" aria-labelledby="home-cta-heading">
      <div className="mx-auto max-w-8xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24 2xl:max-w-[1536px]">
        <div className="mx-auto max-w-xl text-center">
          <motion.p
            {...fadeUpInView(0, reduce)}
            className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-600"
          >
            Get started
          </motion.p>

          <motion.h2
            {...fadeUpInView(0.1, reduce)}
            id="home-cta-heading"
            className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            Ready to build your network?
          </motion.h2>

          <motion.p {...fadeUpInView(0.2, reduce)} className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Explore our full range — from Cat6 patch cables to PoE switches and
            Wi-Fi access points — and find everything you need in one place.
          </motion.p>

          <motion.div {...fadeUpInView(0.3, reduce)} className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/shop" className={BTN_PRIMARY}>
              Browse products
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link
              to="/account"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-7 text-sm font-semibold text-slate-700 shadow-[0_3px_0_0_#e2e8f0] transition duration-150 hover:-translate-y-0.5 hover:border-brand-500 hover:text-brand-600 active:translate-y-[2px] active:shadow-none focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 sm:h-12 sm:text-base"
            >
              My account
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const reduce = useReducedMotion();

  return (
    <section className="border-b border-slate-200/80 bg-slate-50" aria-labelledby="home-steps-heading">
      <div className="mx-auto max-w-8xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 2xl:max-w-[1536px]">
        <SectionHeading
          eyebrow="How ordering works"
          title="From cart to your door"
          id="home-steps-heading"
          linkLabel="Start shopping"
        />
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, index) => (
            <motion.article
              key={title}
              {...fadeUpInView(0.08 * index, reduce)}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className="text-sm font-bold text-brand-200">0{index + 1}</span>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-slate-500">{text}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function StoreFooter() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-8xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8 2xl:max-w-[1536px]">
        <div>
          <p className="text-base font-bold text-white">Wasooli Store</p>
          <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">
            Networking cables, switches, and wireless gear, packed in Karachi and delivered across Pakistan.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Shop</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/shop" className="transition hover:text-white">All products</Link></li>
            <li><Link to="/shop" className="transition hover:text-white">Categories</Link></li>
            <li><Link to="/account" className="transition hover:text-white">My account</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Help</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Cash on delivery</li>
            <li>Bank transfer</li>
            <li>Exchanges within 2 days</li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Contact</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Phone size={14} className="text-brand-300" aria-hidden="true" />
              <a href="tel:03001234567" className="transition hover:text-white">0300 1234567</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={14} className="text-brand-300" aria-hidden="true" />
              <a href="mailto:hello@wasooli.store" className="transition hover:text-white">hello@wasooli.store</a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={14} className="text-brand-300" aria-hidden="true" />
              Karachi
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Wasooli Store. All rights reserved.
      </div>
    </footer>
  );
}

/* ─── Page root ─────────────────────────────────────────────────────────────── */

export default function Home() {
  const { products, ready } = useCart();
  const catalogLoading = !ready && products.length === 0;

  useEffect(() => {
    document.title = "Wasooli Store — Networking Products Pakistan";
  }, []);

  /* Category map — same pattern as Shop.jsx */
  const { categoryItems, categoryTotal } = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      const name = p.category;
      if (!name) return;
      const entry = map.get(name) || { name, count: 0, image: null };
      entry.count += 1;
      if (!entry.image && p.image) entry.image = p.image;
      map.set(name, entry);
    });
    const all = [...map.values()].sort((a, b) => b.count - a.count);
    return { categoryItems: all.slice(0, 6), categoryTotal: all.length };
  }, [products]);

  /* Top 8 in-stock products by rating — for the featured grid */
  const featuredProducts = useMemo(
    () =>
      [...products]
        .filter((p) => !Number.isFinite(p.stock) || p.stock > 0)
        .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
        .slice(0, 10),
    [products]
  );

  /* Top 10 in-stock by review count — for the trending rail */
  const trendingProducts = useMemo(
    () =>
      [...products]
        .filter((p) => !Number.isFinite(p.stock) || p.stock > 0)
        .sort((a, b) => (Number(b.reviews) || 0) - (Number(a.reviews) || 0))
        .slice(0, 10),
    [products]
  );

  /* Hero composition: best-rated in-stock items that have an image */
  const heroProducts = useMemo(
    () => featuredProducts.filter((p) => p.image).slice(0, 3),
    [featuredProducts]
  );

  /* Promo composition: trending items that have an image */
  const promoProducts = useMemo(
    () => trendingProducts.filter((p) => p.image).slice(0, 3),
    [trendingProducts]
  );

  /* Recently viewed — hidden when empty */
  const recentProducts = useMemo(() => {
    const ids = getRecentlyViewedIds();
    if (!ids.length || !products.length) return [];
    const byId = new Map(products.map((p) => [String(p.id), p]));
    return ids.map((id) => byId.get(id)).filter(Boolean).slice(0, 10);
  }, [products, ready]);

  return (
    <main className="min-h-screen bg-slate-50">
      <style>{ANIMATIONS}</style>
      <StoreHeader />
      <HeroSection
        products={heroProducts}
        productCount={products.length}
        categoryCount={categoryTotal}
      />
      <BenefitsStrip />
      <CategoryGrid
        items={categoryItems.length ? categoryItems : CATEGORY_FALLBACK}
        loading={catalogLoading}
      />
      <FeaturedGrid products={featuredProducts} loading={catalogLoading} />
      <ShopProductRail
        subtitle="What people buy"
        title="Trending now"
        products={trendingProducts}
        tone="dark"
        autoplay
      />
      <PromoBanner showcase={promoProducts.length ? promoProducts : SHOWCASE_FALLBACK} />
      <ShopProductRail
        subtitle="Continue browsing"
        title="Recently viewed"
        products={recentProducts}
        tone="light"
      />
      <HowItWorks />
      <ClosingCTA />
      {/* <StoreFooter /> */}
    </main>
  );
}