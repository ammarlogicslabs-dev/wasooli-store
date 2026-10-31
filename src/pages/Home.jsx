import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Headset,
  Network,
  ShieldCheck,
  ShoppingBag,
  Truck,
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
import { normalizeCategory } from "../data/categories";
import { resolveMediaUrl } from "../utils/mediaUrl";
import { smoothScrollTo } from "../utils/smoothScroll";
import ScrollProduct from "../components/ScrollProduct";

/* ─── constants ─────────────────────────────────────────────────────────────── */

const EASE = [0.22, 1, 0.36, 1];


const CATEGORY_FALLBACK = [
  { name: "Tools & Accessories", image: "/categories/transparent/tools.png", fallbackCount: 12 },
  { name: "Cabling & Connectivity", image: "/categories/transparent/cable.png", fallbackCount: 11 },
  { name: "Wireless", image: "/categories/transparent/wireless.png", fallbackCount: 6 },
  { name: "Optical & Fiber", image: "/categories/transparent/optical.png", fallbackCount: 6 },
  { name: "Switching", image: "/categories/transparent/switch.png", fallbackCount: 10 },
  { name: "Network Security", image: "/categories/transparent/network.png", fallbackCount: 7 },
  { name: "PoE", image: "/categories/transparent/PoE.png", fallbackCount: 8 },
  { name: "Routing", image: "/categories/transparent/router.png", fallbackCount: 15 },
  { name: "Adapters & NICs", image: "/categories/transparent/adapter.png", fallbackCount: 9 },
  { name: "Power & Racks", image: "/categories/transparent/power-racks.png", fallbackCount: 5 },
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
    title: "Dispatched in 1-2 days",
    text: "Carefully boxed with tamper-proof seals and dispatched nationwide across Pakistan.",
    features: ["1-2 Day Packing", "Courier Tracking", "Safe Transit"],
  },
];

const HERO_FEATURES = [
  { icon: Truck, title: "Nationwide Delivery", text: "Fast & Reliable" },
  { icon: Building2, title: "Bulk Pricing", text: "Better Rates" },
  { icon: Headset, title: "Technical Support", text: "Expert Assistance" },
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

/* ─── A. Hero ───────────────────────────────────────────────────────────────── */

const HERO_BG_IMAGES = [
  "/wasooli-hero.png",
  "/playstore banner.png",
];

function HeroSection() {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const mouseX = useSpring(useMotionValue(0), { stiffness: 70, damping: 18 });
  const mouseY = useSpring(useMotionValue(0), { stiffness: 70, damping: 18 });
  const [activeHeroBg, setActiveHeroBg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeroBg((prev) => (prev + 1) % HERO_BG_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

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
      className="relative flex min-h-[calc(100vh-var(--store-header-height,80px))] lg:h-[calc(100vh-var(--store-header-height,108px))] lg:max-h-[calc(100vh-var(--store-header-height,108px))] flex-col justify-between overflow-hidden bg-slate-950 text-white"
      aria-label="Hero banner"
    >
      {/* BG parallax images with smooth crossfade swap */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {HERO_BG_IMAGES.map((src, index) => (
          <motion.img
            key={src}
            src={src}
            alt=""
            fetchPriority={index === 0 ? "high" : "low"}
            style={reduce ? undefined : { y: bgY, scale: 1.1 }}
            initial={false}
            animate={{
              opacity: activeHeroBg === index ? 0.24 : 0,
            }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-950/85 to-slate-950/15" aria-hidden="true" />
      <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-transparent to-transparent" aria-hidden="true" />

      {/* Subtle grid */}
      <div aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-size-[56px_56px] mask-[radial-gradient(ellipse_at_65%_35%,black,transparent_65%)]"
      />

      {/* Glows */}
      <motion.div aria-hidden="true" style={reduce ? undefined : { x: glowX, y: glowY }}
        className="pointer-events-none absolute -right-20 -top-8 h-88 w-88 rounded-full bg-brand-500/18 blur-3xl"
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
          {/* Top tag: CONNECTING YOUR WORLD */}
          <motion.p
            {...fadeUp(0.1, reduce)}
            className="mb-3 text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-sky-400"
          >
            CONNECTING YOUR WORLD
          </motion.p>

          {/* Main Headline */}
          <motion.h1
            {...fadeUp(0.18, reduce)}
            className="max-w-xl text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.2rem] xl:text-[3.6rem]"
          >
            <span className="block">Your Networking</span>
            <span className="block mt-1 sm:mt-1.5">
              Products <span className="text-[#0088ff]">HQ.</span>
            </span>
          </motion.h1>

          {/* Subtitle paragraph */}
          <motion.p
            {...fadeUp(0.28, reduce)}
            className="mt-3.5 max-w-lg text-xs leading-relaxed text-slate-300 sm:text-sm sm:leading-relaxed"
          >
            Routers, switches, fiber cables and ISP essentials — all in one
            place. Trusted by professionals across Pakistan.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            {...fadeUp(0.38, reduce)}
            className="mt-5 flex flex-wrap items-center gap-3 sm:mt-6 sm:gap-3.5"
          >
            <Link
              to="/shop"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0084ff] px-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition duration-150 hover:bg-[#0073e6] hover:-translate-y-0.5 active:translate-y-0"
            >
              Shop Now
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <a
              href="#categories"
              onClick={(event) => {
                event.preventDefault();
                smoothScrollTo("categories", { reduce });
              }}
              className="inline-flex h-11 items-center rounded-xl border border-slate-700/80 bg-slate-900/60 px-5 text-sm font-semibold text-white backdrop-blur-sm transition duration-150 hover:border-slate-500 hover:bg-slate-800/80 hover:-translate-y-0.5 active:translate-y-0"
            >
              Explore Categories
            </a>
          </motion.div>

          {/* Bottom Features Bar: 3 Circular Badges with Glowing Cyan Gradient Dividers (same as footer) */}
          <motion.div
            {...fadeUp(0.48, reduce)}
            className="mt-7 sm:mt-9 pt-4 sm:pt-5 flex flex-wrap items-center gap-5 sm:gap-7 lg:gap-8"
            aria-label="Store highlights"
          >
            {HERO_FEATURES.map(({ icon: Icon, title, text }, idx) => (
              <div key={title} className="flex items-center gap-5 sm:gap-7 lg:gap-8">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-full border border-sky-400/60 bg-sky-950/40 text-sky-400">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-white leading-tight">
                      {title}
                    </p>
                    <p className="text-[11px] sm:text-xs text-slate-400 leading-tight mt-0.5">
                      {text}
                    </p>
                  </div>
                </div>
                {idx < HERO_FEATURES.length - 1 && (
                  <div
                    className="hidden sm:block h-8 w-px bg-gradient-to-b from-transparent via-[#38bdf8]/60 to-transparent shadow-[0_0_8px_rgba(56,189,248,0.35)]"
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: Interactive 3D Cybernetic Network Animation */}
        <motion.div
          {...fadeUp(0.25, reduce)}
          className="relative flex h-full w-full min-h-0 items-center justify-center overflow-hidden"
        >
          <Hero3DCanvas className="h-full w-full" />
        </motion.div>
      </motion.div>

      {/* Hero background image swap indicators */}
      <div className="absolute bottom-11 right-6 z-20 hidden sm:flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-900/60 px-2.5 py-1 backdrop-blur-md">
        {HERO_BG_IMAGES.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveHeroBg(idx)}
            aria-label={`Switch hero background ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${activeHeroBg === idx ? "w-5 bg-brand-400" : "w-1.5 bg-white/30 hover:bg-white/60"}`}
          />
        ))}
      </div>

      {/* Ticker */}
      <div className="relative shrink-0 overflow-hidden border-t border-white/6 bg-white/3 py-2" aria-hidden="true">
        <div className="wl-ticker-track">
          {[0, 1].map((set) => (
            <span key={set} className="flex shrink-0 items-center gap-5 pr-6">
              {TICKER_ITEMS.map((t) => (
                <span key={t} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 whitespace-nowrap">
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

/* ─── B. Networking Solutions banner ────────────────────────────────────────── */

function ConnectionBanner() {
  const reduce = useReducedMotion();

  return (
    <section className="relative z-10 bg-white py-4" aria-label="Networking Solutions banner">
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 2xl:max-w-384">
        <motion.div
          {...fadeUpInView(0, reduce)}
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[#cfe2fa] bg-linear-to-r from-[#eaf4fe] via-[#f3f9ff] to-[#e5f1fe] px-3 py-2 sm:px-6 sm:py-2.5 lg:px-7 shadow-[0_10px_35px_-15px_rgba(14,165,233,0.25)]"
        >
          {/* Aesthetic background color design with glowing gradients and light rays */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* Glowing cyan/blue radial ambient lights */}
            <div className="absolute left-[5%] top-1/2 h-36 w-64 -translate-y-1/2 rounded-full bg-sky-400/20 blur-3xl" />
            <div className="absolute right-[14%] top-1/2 h-44 w-80 -translate-y-1/2 rounded-full bg-[#0070f3]/22 blur-3xl" />
            <div className="absolute right-[25%] top-1/2 h-28 w-44 -translate-y-1/2 rounded-full bg-cyan-300/30 blur-2xl" />

            {/* Glowing diagonal fiber-optic light streaks */}
            <div className="absolute -bottom-10 left-[45%] h-36 w-[18%] skew-x-[-35deg] bg-linear-to-r from-transparent via-white/60 to-transparent" />
            <div className="absolute -top-10 left-[68%] h-36 w-[12%] skew-x-[-35deg] bg-linear-to-r from-transparent via-sky-300/35 to-transparent" />

            {/* Concentric rings behind the cable */}
            <div className="absolute right-[13%] top-1/2 size-60 -translate-y-1/2 rounded-full border-[1.5px] border-sky-300/40" />
            <div className="absolute right-[9%] top-1/2 size-80 -translate-y-1/2 rounded-full border border-sky-300/25" />
            <div className="absolute right-[5%] top-1/2 size-96 -translate-y-1/2 rounded-full border border-sky-200/20" />

            {/* Subtle high-tech dot grid */}
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(rgba(0,112,243,0.22)_1px,transparent_1px)] bg-[size:14px_14px] mask-[linear-gradient(to_right,black_60%,transparent_95%)]" />

            {/* Glossy top sheen & bottom accent */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-white/45 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-[#38bdf8]/50 to-transparent" />
          </div>

          <div className="relative flex flex-col items-center gap-3 md:flex-row md:justify-between md:gap-4 lg:gap-6">
            {/* Left & Middle: Eyebrow, Title, Divider 1, Single-Line Subtitle, Divider 2 */}
            <div className="flex min-w-0 flex-1 flex-col items-center gap-2 md:flex-row md:items-center md:gap-4 lg:gap-5 text-center md:text-left">
              {/* Eyebrow & Headline block */}
              <div className="shrink-0">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0070f3]">
                  <span className="size-1.5 rounded-full bg-[#0070f3]" aria-hidden="true" />
                  <span>Networking Solutions</span>
                </div>
                <h2 className="mt-0.5 text-lg font-black tracking-tight text-[#0a1e3f] sm:text-xl lg:text-[22px] whitespace-nowrap">
                  Build a <span className="text-[#0070f3]">stronger</span> connection
                </h2>
              </div>

              {/* Line 1: Footer style glowing cyan-gradient vertical divider */}
              <div
                className="hidden md:block h-10 w-px shrink-0 bg-linear-to-b from-transparent via-[#38bdf8]/70 to-transparent shadow-[0_0_8px_rgba(56,189,248,0.45)]"
                aria-hidden="true"
              />

              {/* Single-line Subtitle */}
              <p className="min-w-0 text-xs sm:text-[11px] font-medium text-slate-600 whitespace-nowrap">
                From home networks to business setups — we have the right equipment for you.
              </p>

              {/* Line 2: Footer style glowing cyan-gradient vertical divider */}
              <div
                className="hidden lg:block h-10 w-px shrink-0 bg-linear-to-b from-transparent via-[#38bdf8]/70 to-transparent shadow-[0_0_8px_rgba(56,189,248,0.45)]"
                aria-hidden="true"
              />
            </div>

            {/* Right: Bigger Cable Image + Solid Blue Button */}
            <div className="flex shrink-0 items-center ">
              <img
                src="/image-2.png"
                alt="Fiber optic patch cord"
                className="h-14 sm:h-16 md:h-18 lg:h-20 w-auto object-contain drop-shadow-[0_8px_20px_rgba(0,112,243,0.22)] transition-transform duration-300 "
              />
              <Link
                to="/shop"
                className="group inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full bg-[#0070f3] px-4 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all duration-200 hover:bg-[#0060df] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Explore All Products</span>
                <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Section heading ───────────────────────────────────────────────────────── */

function SectionHeading({
  eyebrow,
  title,
  id,
  linkLabel,
  linkTo = "/shop",
  hideLinkOnMobile = false,
}) {
  const reduce = useReducedMotion();
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:mb-8">
      <motion.div {...fadeUpInView(0, reduce)}>
        <p className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-600">
          <span className="size-1.5 rounded-full bg-brand-500" aria-hidden="true" />
          {eyebrow}
        </p>
        <h2 id={id} className="mt-2 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl lg:text-[28px] leading-tight sm:leading-snug">
          {title}
        </h2>
        <motion.span aria-hidden="true"
          initial={reduce ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.18, ease: EASE }}
          className="mt-2.5 block h-[3px] w-10 origin-left rounded-full bg-linear-to-r from-brand-500 to-brand-300"
        />
      </motion.div>
      {linkLabel && (
        <Link to={linkTo}
          className={`${
            hideLinkOnMobile ? "hidden sm:inline-flex" : "inline-flex self-start sm:self-auto"
          } group shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 shadow-xs transition-all duration-200 hover:border-brand-500 hover:bg-brand-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300`}
        >
          {linkLabel}
          <ChevronRight size={15} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

/* ─── C. Category grid (Glowing 3D Glass Orbs with Swiper & Pagination) ──────── */

function CategoryGrid({ items, loading }) {
  const [swiper, setSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const reduce = useReducedMotion();

  const displayItems = items && items.length > 0 ? items : CATEGORY_FALLBACK;
  const loopCategories = useMemo(() => {
    if (displayItems.length > 0 && displayItems.length < 16) {
      return [...displayItems, ...displayItems];
    }
    return displayItems;
  }, [displayItems]);

  return (
    <section
      id="categories"
      className="scroll-mt-[calc(var(--store-header-height,72px)+1rem)] bg-[#f8fafc] py-4 sm:py-6 lg:py-8"
      aria-labelledby="categories-heading"
    >
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 2xl:max-w-384">
        {/* Main Rounded White Container Card matching image */}
        {/* <div className="relative rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 lg:p-10 shadow-[0_12px_45px_-15px_rgba(0,112,243,0.08)]"> */}
          {/* Header Inside Card */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between lg:mb-8">
            <div>
              {/* Pill Tag: • SHOP BY CATEGORY */}
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf3ff] px-3.5 py-1 text-[11px] font-bold tracking-[0.16em] uppercase text-[#0070f3]">
                <span className="size-1.5 rounded-full bg-[#0070f3]" aria-hidden="true" />
                <span>SHOP BY CATEGORY</span>
              </div>
              {/* Title */}
              <h2
                id="categories-heading"
                className="mt-2.5 text-2xl font-black tracking-tight text-[#0a1e3f] sm:text-3xl lg:text-[32px]"
              >
                Find the right gear faster
              </h2>
              {/* Blue accent underline */}
              <div className="mt-2.5 h-1 w-9 rounded-full bg-[#0070f3]" aria-hidden="true" />
            </div>

            {/* All categories > Button */}
            <Link
              to="/shop"
              className="hidden sm:inline-flex shrink-0 items-center gap-1.5 rounded-full border border-sky-300/80 bg-white px-4 py-1.5 text-xs sm:text-sm font-bold text-[#0070f3] shadow-xs transition-all duration-200 hover:border-[#0070f3] hover:bg-sky-50 active:scale-95"
            >
              <span>All categories</span>
              <ChevronRight size={15} aria-hidden="true" />
            </Link>
          </div>

          {loading ? (
            <div className="flex gap-4 overflow-hidden py-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={`cat-skel-${i}`} className="flex flex-col items-center shrink-0 w-28 sm:w-32">
                  <div className="size-24 sm:size-28 rounded-full animate-pulse bg-slate-100" />
                  <div className="mt-3 h-3.5 w-20 animate-pulse rounded bg-slate-200" />
                  <div className="mt-1.5 h-3 w-14 animate-pulse rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : (
            <div className="relative mt-2">
              {/* Left Circular Arrow */}
              <button
                type="button"
                aria-label="Previous categories"
                onClick={() => swiper?.slidePrev()}
                className="absolute left-0 top-16 sm:top-18 md:top-19 lg:top-19.5 xl:top-20 z-30 flex size-9 sm:size-10 -translate-x-3 sm:-translate-x-5 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/90 bg-white text-[#0070f3] shadow-md transition-all duration-200 hover:border-[#0070f3] hover:bg-[#eaf3ff] hover:scale-105 active:scale-95 focus:outline-none"
              >
                <ChevronLeft size={19} />
              </button>

              {/* Right Circular Arrow */}
              <button
                type="button"
                aria-label="Next categories"
                onClick={() => swiper?.slideNext()}
                className="absolute right-0 top-16 sm:top-18 md:top-19 lg:top-19.5 xl:top-20 z-30 flex size-9 sm:size-10 translate-x-3 sm:translate-x-5 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/90 bg-white text-[#0070f3] shadow-md transition-all duration-200 hover:border-[#0070f3] hover:bg-[#eaf3ff] hover:scale-105 active:scale-95 focus:outline-none"
              >
                <ChevronRight size={19} />
              </button>

              {/* Swiper with 8 items visible on PC desktop */}
              <Swiper
                modules={[Keyboard, A11y, Autoplay]}
                onSwiper={setSwiper}
                onSlideChange={(s) => setActiveIndex(s.realIndex ?? s.activeIndex)}
                keyboard={{ enabled: true }}
                loop={displayItems.length > 8}
                speed={700}
                autoplay={
                  reduce
                     ? false
                    : {
                        delay: 2800,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                      }
                }
                spaceBetween={10}
                slidesPerView={2.5}
                breakpoints={{
                  480: { slidesPerView: 3.2, spaceBetween: 10 },
                  640: { slidesPerView: 4.2, spaceBetween: 12 },
                  768: { slidesPerView: 5.5, spaceBetween: 12 },
                  1024: { slidesPerView: 8, spaceBetween: 10 },
                  1280: { slidesPerView: 8, spaceBetween: 12 },
                  1536: { slidesPerView: 8, spaceBetween: 14 },
                }}
                className="overflow-visible py-5 px-1"
              >
                {loopCategories.map((cat, index) => {
                  const productCount = cat.count || cat.fallbackCount || 10;
                  return (
                    <SwiperSlide key={`${cat.name}-${index}`} className="!h-auto">
                      <motion.div
                        initial={reduce ? false : { opacity: 0, scale: 0.92 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.35,
                          delay: Math.min(index * 0.04, 0.25),
                          ease: EASE,
                        }}
                      >
                        <Link
                          to={`/shop?category=${encodeURIComponent(cat.name)}`}
                          className="group flex flex-col items-center focus:outline-none pt-1 pb-2"
                          aria-label={`Browse ${cat.name}`}
                        >
                          {/* 3D Glass Bubble Orb with Concentric #0070F3 Water-Ripples */}
                          <div className="relative flex aspect-square size-23 sm:size-26 md:size-29 lg:size-29.5 xl:size-31 2xl:size-33 items-center justify-center">
                            {/* 3D Translucent Glass Orb Sphere with #0070F3 Shade */}
                            <div
                              className="relative size-full rounded-full border-[1.5px] border-white/95 p-2.5 sm:p-3 md:p-3.5 backdrop-blur-xs flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1.5 shadow-[inset_0_0_24px_rgba(0,112,243,0.38),inset_0_10px_18px_rgba(255,255,255,0.98),inset_0_-16px_26px_rgba(0,85,210,0.55)] group-hover:shadow-[inset_0_0_26px_rgba(0,112,243,0.48),inset_0_10px_18px_rgba(255,255,255,1),inset_0_-16px_26px_rgba(0,85,210,0.7)]"
                              style={{
                                background:
                                  "radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.05) 35%, rgba(210, 235, 255, 0.15) 60%, rgba(0, 112, 243, 0.25) 85%, rgba(0, 85, 210, 0.5) 100%)",
                              }}
                            >
                              {/* Primary upper-left tilted curved specular gloss */}
                              <div
                                className="pointer-events-none absolute left-[12%] top-[8%] h-[35%] w-[48%] rotate-[-28deg] rounded-full z-20"
                                style={{
                                  background:
                                    "radial-gradient(ellipse at 50% 30%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.55) 45%, rgba(255, 255, 255, 0) 80%)",
                                  filter: "blur(0.5px)",
                                }}
                              />

                              {/* Top rim specular edge highlight */}
                              <div
                                className="pointer-events-none absolute inset-x-[18%] top-[3%] h-[20%] rounded-t-full z-20"
                                style={{
                                  background:
                                    "radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.4) 40%, transparent 75%)",
                                }}
                              />

                              {/* Secondary pinpoint specular sparkle */}
                              <div className="pointer-events-none absolute left-[24%] top-[14%] size-1.5 rounded-full bg-white shadow-[0_0_5px_2px_rgba(255,255,255,0.9)] z-20" />

                              {/* Bottom-right internal caustic light bounce */}
                              <div
                                className="pointer-events-none absolute right-[12%] bottom-[10%] h-[30%] w-[46%] rotate-25 rounded-full z-20"
                                style={{
                                  background:
                                    "radial-gradient(ellipse at 50% 70%, rgba(190, 230, 255, 0.8) 0%, rgba(0, 112, 243, 0.35) 55%, transparent 80%)",
                                  filter: "blur(1px)",
                                }}
                              />

                              {/* Bottom inner glass rim crescent */}
                              <div
                                className="pointer-events-none absolute inset-x-[20%] bottom-[4%] h-[15%] rounded-b-full z-20"
                                style={{
                                  background:
                                    "radial-gradient(ellipse at 50% 100%, rgba(255, 255, 255, 0.75) 0%, rgba(160, 215, 255, 0.35) 50%, transparent 85%)",
                                }}
                              />

                              {/* Floating Product Image inside Glass Bubble */}
                              {cat.image ? (
                                <img
                                  src={resolveMediaUrl(cat.image)}
                                  alt={cat.name}
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = "/categories/transparent/router.png";
                                  }}
                                  className="relative z-10 max-h-[74%] max-w-[74%] object-contain drop-shadow-[0_8px_16px_rgba(0,40,110,0.22)] transition-transform duration-300 ease-out group-hover:scale-110"
                                />
                              ) : (
                                <Network size={32} className="text-[#0070f3]" />
                              )}
                            </div>

                            {/* Concentric #0070F3 Glowing Floor Water-Ripples */}
                            <div className="pointer-events-none absolute -bottom-4.5 inset-x-[-15%] flex items-center justify-center h-8 z-0">
                              <svg viewBox="0 0 180 40" className="w-full h-full overflow-visible">
                                <defs>
                                  <radialGradient id={`glow-${index}`} cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="#0070f3" stopOpacity="0.65" />
                                    <stop offset="45%" stopColor="#0070f3" stopOpacity="0.32" />
                                    <stop offset="80%" stopColor="#0055c8" stopOpacity="0.1" />
                                    <stop offset="100%" stopColor="#0055c8" stopOpacity="0" />
                                  </radialGradient>
                                  <linearGradient id={`ringGrad-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#0070f3" stopOpacity="0.1" />
                                    <stop offset="25%" stopColor="#0070f3" stopOpacity="0.8" />
                                    <stop offset="50%" stopColor="#80bfff" stopOpacity="1" />
                                    <stop offset="75%" stopColor="#0070f3" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#0070f3" stopOpacity="0.1" />
                                  </linearGradient>
                                </defs>
                                {/* Ambient #0070F3 floor glow */}
                                <ellipse cx="90" cy="20" rx="80" ry="17" fill={`url(#glow-${index})`} filter="blur(3px)" />
                                {/* Outer faint wave ripple */}
                                <ellipse cx="90" cy="20" rx="72" ry="14" fill="none" stroke="#0070f3" strokeWidth="1.2" strokeOpacity="0.45" />
                                {/* Middle wave ripple */}
                                <ellipse cx="90" cy="20" rx="52" ry="10.5" fill="none" stroke={`url(#ringGrad-${index})`} strokeWidth="1.6" strokeOpacity="0.85" />
                                {/* Inner bright wave ripple */}
                                <ellipse cx="90" cy="20" rx="32" ry="6.5" fill="none" stroke="#d6e9ff" strokeWidth="1.8" strokeOpacity="0.95" />
                                {/* Shadow right at contact point */}
                                <ellipse cx="90" cy="18" rx="16" ry="4" fill="#003882" fillOpacity="0.25" filter="blur(1.5px)" />
                              </svg>
                            </div>
                          </div>

                          {/* Category Title */}
                          <p className="mt-3.5 text-center text-xs sm:text-[13px] font-bold leading-tight text-[#0a1e3f] transition-colors duration-200 group-hover:text-[#0070f3] line-clamp-1">
                            {cat.name}
                          </p>

                          {/* Product Count Pill */}
                          <span className="mt-1.5 inline-block rounded-full border border-sky-200/90 bg-[#f0f7ff] px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-[#0070f3] transition-colors duration-200 group-hover:bg-[#0070f3] group-hover:text-white">
                            {productCount} products
                          </span>
                        </Link>
                      </motion.div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>

              {/* Pagination Dots at Bottom */}
              <div className="mt-6 flex items-center justify-center gap-1.5" aria-hidden="true">
                {displayItems.slice(0, 8).map((cat, idx) => {
                  const isActive = (activeIndex % displayItems.length) === idx;
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
                      className={`rounded-full transition-all duration-300 cursor-pointer ${
                        isActive
                          ? "w-4 h-1.5 bg-[#0070f3]"
                          : "size-1.5 bg-sky-200 hover:bg-sky-300"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          )}
        {/* </div> */}
      </div>
    </section>
  );
}

/* ─── D. Featured products grid ─────────────────────────────────────────────── */

function FeaturedGrid({ products, loading }) {
  const displayProducts = (products || []).slice(0, 10);

  return (
    <section className="relative border-b border-slate-200/80 bg-slate-50/70" aria-labelledby="featured-heading">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#2C9AFF_1px,transparent_1px)] bg-size-[26px_26px] opacity-[0.035] mask-[linear-gradient(to_bottom,black,transparent_70%)]"
      />
      <div className="mx-auto max-w-8xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 2xl:max-w-384">
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
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-brand-50 via-white to-white px-6 py-8 text-center shadow-sm">
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
                  <ProductCard product={product} index={index} layout="grid" showBot={false} />
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

function PromoBanner() {
  const reduce = useReducedMotion();
  const ref = useRef(null);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden border-y border-slate-800/80 bg-[#030c1c] text-white"
      aria-label="Bulk pricing promotion"
    >
      {/* Background Graphic Asset */}
      <img
        src="/order-save.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-right select-none"
      />

      {/* Readability Gradient Overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-r from-[#030c1c] via-[#030c1c]/85 to-[#030c1c]/30 sm:to-transparent lg:via-[#030c1c]/40"
      />

      <div className="relative mx-auto max-w-8xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-13 xl:py-15 2xl:max-w-384">
        <div className="grid items-center lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
          {/* Left Column: Headline, Checklist & CTAs */}
          <div>
            {/* Headline */}
            <motion.h2
              {...fadeUpInView(0.08, reduce)}
              className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl leading-tight"
            >
              Order more,{" "}
              <span className="bg-linear-to-r from-[#60B6FF] via-[#9ad0ff] to-white bg-clip-text text-transparent">
                save more.
              </span>
            </motion.h2>

            {/* Description */}
            <motion.p
              {...fadeUpInView(0.16, reduce)}
              className="mt-2.5 max-w-xl text-xs sm:text-sm leading-relaxed text-slate-300"
            >
              Equip your entire deployment for less. Automated tiered wholesale discounts apply directly at checkout on Cat6 patch rolls, managed switches, and enterprise Wi-Fi gear.
            </motion.p>

            {/* Benefits Checklist */}
            <motion.div {...fadeUpInView(0.24, reduce)} className="mt-4 space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/4 px-3 py-1.5 text-xs text-slate-200 backdrop-blur-sm sm:text-sm leading-snug">
                <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                <span>Instant volume discount applied automatically in your shopping cart</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/4 px-3 py-1.5 text-xs text-slate-200 backdrop-blur-sm sm:text-sm leading-snug">
                <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                <span>Official GST invoice &amp; tax receipts provided with every order</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/4 px-3 py-1.5 text-xs text-slate-200 backdrop-blur-sm sm:text-sm leading-snug">
                <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                <span>Priority carton &amp; pallet packaging for zero-damage transit across Pakistan</span>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div {...fadeUpInView(0.32, reduce)} className="mt-5 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <Link
                to="/shop"
                className="inline-flex h-10 sm:h-11 items-center gap-2 rounded-xl bg-brand-500 px-5 sm:px-6 text-xs sm:text-sm font-semibold text-white shadow-[0_4px_20px_rgba(44,154,255,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#208ef3] hover:shadow-[0_8px_28px_rgba(44,154,255,0.55)] active:translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2C9AFF]/50"
              >
                Browse all products <ArrowRight size={15} aria-hidden="true" />
              </Link>
              <Link
                to="/shop?category=Cabling%20%26%20Connectivity"
                className="inline-flex h-10 sm:h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 sm:px-5 text-xs sm:text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 active:translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
              >
                Bulk Cables &amp; Patch
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Spacer for 3D graphic in order-save.png (hidden on mobile to prevent bottom gap) */}
          <div className="hidden lg:block relative min-h-72.5 xl:min-h-82.5 w-full" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

/* ─── G. How it works ───────────────────────────────────────────────────────── */

function HowItWorks() {
  const reduce = useReducedMotion();
  return (
    <section className="relative overflow-hidden border-b border-slate-200/80 bg-linear-to-b from-slate-50 via-slate-100/60 to-slate-50 py-10 sm:py-16" aria-labelledby="home-steps-heading">
      {/* Background ambient light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-full max-w-4xl rounded-full bg-brand-500/5 blur-[100px]"
      />
      {/* Subtle blueprint dot grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#2C9AFF_1px,transparent_1px)] bg-size-[28px_28px] opacity-[0.04]"
      />

      <div className="relative mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 2xl:max-w-384">
        <SectionHeading
          eyebrow="How ordering works"
          title="From cart to your door in 3 simple steps"
          id="home-steps-heading"
          linkLabel="Start shopping"
          hideLinkOnMobile
        />

        <div className="relative mt-8 sm:mt-12 grid gap-6 md:grid-cols-3">
          {/* Top Connecting Line (Step 01 -> Step 02) on desktop */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-14 left-16 right-[38%] hidden h-0.5 bg-linear-to-r from-[#2C9AFF]/30 via-[#2C9AFF] to-[#2C9AFF]/30 md:block"
          />

          {/* Bottom Connecting Line (Step 02 -> Step 03) on desktop */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-12 left-[38%] right-16 hidden h-0.5 bg-linear-to-r from-[#2C9AFF]/30 via-[#2C9AFF] to-[#2C9AFF]/30 md:block"
          />

          {STEPS.map(({ icon: Icon, step, tag, title, text, features }, index) => (
            <div key={title} className="relative flex flex-col">
              <motion.article
                {...fadeUpInView(0.08 * index, reduce)}
                whileHover={reduce ? undefined : { y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
                className="group relative z-10 flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 p-6 sm:p-7 shadow-[0_4px_24px_-6px_rgba(15,23,42,0.06)] backdrop-blur-sm transition-all duration-300 hover:border-brand-500/50 hover:shadow-[0_20px_45px_-12px_rgba(44,154,255,0.22)]"
              >
                <div>
                  {/* Large faint step number watermark */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-1 top-10 select-none text-[7.5rem] font-black leading-none text-slate-900/[0.035] transition-colors duration-300 group-hover:text-brand-500/8"
                  >
                    {step}
                  </span>

                  {/* Step Header: Icon + Step Pill Badge */}
                  <div className="flex items-center justify-between">
                    <span className="grid size-13 place-items-center rounded-2xl bg-linear-to-br from-[#2C9AFF] to-[#1268c4] text-white shadow-[0_8px_20px_rgba(44,154,255,0.32)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2">
                      <Icon size={24} aria-hidden="true" />
                    </span>
                    <span className="inline-flex items-center rounded-full border border-brand-500/20 bg-brand-500/8 px-3 py-1 font-mono text-xs font-black tracking-wider text-brand-500 transition-colors duration-300 group-hover:border-brand-500 group-hover:bg-brand-500 group-hover:text-white">
                      STEP {step}
                    </span>
                  </div>

                  {/* Subtag & Title */}
                  <div className="mt-6">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-brand-500">
                      {tag}
                    </span>
                    <h3 className="mt-1 text-lg font-extrabold tracking-tight text-slate-900 transition-colors duration-200 group-hover:text-brand-500">
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
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition-colors duration-200 group-hover:bg-brand-500/10 group-hover:text-[#1875d1]"
                      >
                        <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom active indicator */}
                <div className="mt-6 h-1 w-10 rounded-full bg-slate-100 transition-all duration-300 group-hover:w-20 group-hover:bg-brand-500" />
              </motion.article>

              {/* Mobile Vertical Connecting Line between cards */}
              {index < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute top-full left-1/2 z-0 h-6 w-[2.5px] -translate-x-1/2 bg-[#0070f3] shadow-[0_0_8px_rgba(0,112,243,0.5)] md:hidden"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── H. Closing CTA ────────────────────────────────────────────────────────── */


/* ─── Page root ─────────────────────────────────────────────────────────────── */

export default function Home() {
  const { products, ready } = useCart();
  const catalogLoading = !ready && products.length === 0;

  useEffect(() => {
    document.title = "Wasooli Store — Networking Products Pakistan";
  }, []);

  const { categoryItems } = useMemo(() => {
    const map = new Map();
    CATEGORY_FALLBACK.forEach((fb) => {
      map.set(fb.name, { name: fb.name, count: 0, image: fb.image, fallbackCount: fb.fallbackCount });
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
    return { categoryItems: all };
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

  
  return (
    <main className="min-h-screen bg-slate-50">
      <style>{ANIMATIONS}</style>
      {/* Smooth Scroll Progress Indicator */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 z-100 h-0.75 origin-left bg-linear-to-r from-[#2C9AFF] via-sky-400 to-[#2C9AFF] shadow-[0_0_12px_rgba(44,154,255,0.85)] pointer-events-none"
      />
      <StoreHeader />
      <HeroSection />
      <ConnectionBanner />
      <CategoryGrid items={categoryItems.length ? categoryItems : CATEGORY_FALLBACK} loading={catalogLoading} />
      <FeaturedGrid products={featuredProducts} loading={catalogLoading} />
      <ShopProductRail subtitle="What people buy" title="Trending now" products={trendingProducts} tone="light" autoplay />
      <PromoBanner />
      <HowItWorks />
    </main> 
  );
}