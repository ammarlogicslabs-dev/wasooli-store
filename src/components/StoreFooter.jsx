import { useEffect, useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "../cart/CartContext";
import {
  Cable,
  ChevronDown,
  ChevronRight,
  FileText,
  Network,
  PhoneCall,
  RotateCcw,
  Router,
  ShieldCheck,
  Wifi,
  Mail,
  Ticket,
  // Wrench,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import {
  ARCHIVED_CATEGORIES_KEY,
  DELETED_CATEGORIES_KEY,
  getStorefrontCategories,
  isCategoryHidden,
} from "../services/storage/adminDataService";
import { DATA_EVENT } from "../services/storage/storageService";

const FOOTER_CATEGORIES_CONFIG = [
  {
    Icon: Router,
    defaultLabel: "Routers",
    canonicalName: "Routing",
    keywords: ["routing", "router"],
  },
  {
    Icon: Network,
    defaultLabel: "Switches",
    canonicalName: "Switching",
    keywords: ["switching", "switch"],
  },
  {
    Icon: Wifi,
    defaultLabel: "Wireless",
    canonicalName: "Wireless",
    keywords: ["wireless", "wifi", "access point"],
  },
  {
    Icon: Cable,
    defaultLabel: "Cables",
    canonicalName: "Cabling & Connectivity",
    keywords: ["cabling", "cable", "connectivity"],
  },
  {
    Icon: ShieldCheck,
    defaultLabel: "Tools & Accessories",
    canonicalName: "Tools & Accessories",
    keywords: ["tool", "accessory", "accessories"],
  },
];


const TICKER_ANNOUNCEMENTS = [
  "MON - SAT: 10:00 AM - 10:00 PM | SUN: CLOSED (ONLINE ORDERS 24/7)",
  "PRICES & AVAILABILITY MAY VARY DUE TO CURRENCY & TARIFF FLUCTUATIONS",
  "WASOOLI STORE OPERATES ONLY ONE OFFICIAL PLATFORM — BEWARE OF FAKE CHANNELS",
  "NATIONWIDE 1-2 DAY DISPATCH WITH LIVE TRACKING ACROSS ALL CITIES IN PAKISTAN",
  "100% GENUINE & QUALITY-TESTED NETWORKING HARDWARE WITH OFFICIAL STORE WARRANTY",
];


function ColumnDivider() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-0 top-1 bottom-1 hidden w-px bg-linear-to-b from-transparent via-[#38bdf8]/60 to-transparent shadow-[0_0_8px_rgba(56,189,248,0.35)] lg:block"
    />
  );
}

/**
 * Footer column. On phones (< sm) it is a dropdown: tap the title to open or
 * close the links. From sm up it is always open and the title is a plain heading.
 */
function FooterSection({
  title,
  className = "",
  isOpen = false,
  onToggle,
  children,
}) {
  const id = useId();

  return (
    <div className={`relative border-b border-white/10 sm:border-0 ${className}`}>
      <ColumnDivider />
      <h4 className="m-0">
        <button
          type="button"
          id={`${id}-button`}
          aria-expanded={isOpen}
          aria-controls={`${id}-panel`}
          onClick={onToggle}
          className="flex w-full cursor-pointer items-center justify-between py-4 text-left text-sm font-bold tracking-wide text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]/70 sm:pointer-events-none sm:cursor-default sm:py-0 sm:text-[15px]"
        >
          {title}
          <ChevronDown
            size={18}
            aria-hidden="true"
            className={`shrink-0 text-[#38bdf8] transition-transform duration-300 sm:hidden ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </h4>

      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-button`}
        className={`grid transition-[grid-template-rows,opacity,visibility] duration-300 ease-out sm:visible sm:grid-rows-[1fr] sm:opacity-100 ${
          isOpen ? "visible grid-rows-[1fr] opacity-100" : "invisible grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

const FOOTER_BG_IMAGES = [
  "/footer.png",
  "/footer-2.jpg",
  "/footer-3.jpg",
];

export default function StoreFooter() {
  const [openSection, setOpenSection] = useState(null);
  const [categoryTick, setCategoryTick] = useState(0);
  const [activeFooterBg, setActiveFooterBg] = useState(0);
  const { categories: storeCategories = [] } = useCart();

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFooterBg((prev) => (prev + 1) % FOOTER_BG_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleStorage(event) {
      const key = event.key || event.detail?.key;
      if (
        !key ||
        key === "wasooli_admin_categories_v1" ||
        key === ARCHIVED_CATEGORIES_KEY ||
        key === DELETED_CATEGORIES_KEY
      ) {
        setCategoryTick((t) => t + 1);
      }
    }
    window.addEventListener("storage", handleStorage);
    window.addEventListener(DATA_EVENT, handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(DATA_EVENT, handleStorage);
    };
  }, []);

  const visibleFooterCategories = useMemo(() => {
    void categoryTick;
    const catList =
      Array.isArray(storeCategories) && storeCategories.length > 0
        ? storeCategories
        : getStorefrontCategories();

    return FOOTER_CATEGORIES_CONFIG.map((config) => {
      const matched = catList.find((c) => {
        const name = (typeof c === "string" ? c : c?.name || "").toLowerCase();
        return (
          name === config.canonicalName.toLowerCase() ||
          config.keywords.some((kw) => name.includes(kw))
        );
      });

      if (matched && isCategoryHidden(matched)) return null;
      if (isCategoryHidden(config.canonicalName)) return null;

      const dynamicCatName =
        typeof matched === "object" && matched?.name ? matched.name : config.canonicalName;
      const label =
        matched &&
        typeof matched === "object" &&
        matched.name &&
        matched.name.toLowerCase() !== config.canonicalName.toLowerCase()
          ? matched.name
          : config.defaultLabel;

      return {
        Icon: config.Icon,
        label,
        cat: dynamicCatName,
      };
    }).filter(Boolean);
  }, [storeCategories, categoryTick]);

  const toggleSection = (sectionKey) => {
    setOpenSection((prev) => (prev === sectionKey ? null : sectionKey));
  };
  return (
    <footer className="relative bg-[#020b24] text-slate-300 overflow-hidden font-sans">
      {/* Top Announcement Ticker Strip */}
      <div className="relative z-20 overflow-hidden border-y border-sky-200/70 bg-[#c4dcfb] text-slate-800 py-2 sm:py-2.5 shadow-xs">
        <style>{`
          @keyframes footer-ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .footer-ticker-track {
            animation: footer-ticker 35s linear infinite;
            display: flex;
            width: max-content;
          }
          .footer-ticker-track:hover {
            animation-play-state: paused;
          }
          @media (prefers-reduced-motion: reduce) {
            .footer-ticker-track { animation: none !important; }
          }
        `}</style>
        <div className="footer-ticker-track whitespace-nowrap text-[11px] sm:text-xs font-semibold tracking-wider text-slate-800 uppercase select-none">
          {[...TICKER_ANNOUNCEMENTS, ...TICKER_ANNOUNCEMENTS].map((msg, idx) => (
            <span key={idx} className="inline-flex items-center">
              <span>{msg}</span>
              <span className="mx-4 sm:mx-6 text-slate-400 select-none text-[9px]">●</span>
            </span>
          ))}
        </div>
      </div>

      {/* Background Graphic with smooth crossfade swap */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
        {FOOTER_BG_IMAGES.map((src, index) => (
          <motion.img
            key={src}
            src={src}
            alt=""
            fetchPriority={index === 0 ? "high" : "low"}
            initial={false}
            animate={{
              opacity: activeFooterBg === index ? 1 : 0,
            }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        ))}
      </div>

      {/* Subtle soft gradient overlay so text stays readable on all devices */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-r from-[#020b24]/90 via-[#020b24]/65 to-transparent md:via-[#020b24]/40"
      />

      {/* Main Footer Content */}
      <div className="relative z-10 mx-auto max-w-384 px-4 pt-10 pb-8 sm:px-6 sm:pt-12 sm:pb-10 lg:px-8 xl:px-10">
        <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-8 lg:grid-cols-12 lg:gap-0 items-start lg:items-stretch">
          
          {/* Column 1: Brand, Description & Socials */}
          <div className="relative border-b border-white/10 pb-6 sm:col-span-2 sm:border-0 sm:pb-0 lg:col-span-3 lg:pr-6 xl:pr-8">
            <ColumnDivider />
            <Link to="/" viewTransition className="inline-block py-1">
              <img
                src="/wasooli.png"
                alt="Wasooli Store"
                className="h-16 sm:h-20 lg:h-19 w-auto object-contain drop-shadow-md"
              />
            </Link>
            <p className="mt-3.5 max-w-sm text-xs sm:text-[13px] leading-relaxed text-slate-300/90 font-normal">
              Your trusted source for networking &amp; ISP supplies.
              <br />
              Routers, switches, access points, cables and more.
            </p>

            {/* Social Icons (5 circular blue buttons) */}
            <div className="mt-5 flex items-center gap-2.5">
              {[
                { Icon: FaFacebookF, href: "https://facebook.com", label: "Facebook" },
                { Icon: FaInstagram, href: "https://instagram.com", label: "Instagram" },
                { Icon: FaYoutube, href: "https://youtube.com", label: "YouTube" },
                { Icon: FaLinkedinIn, href: "https://linkedin.com", label: "LinkedIn" },
                { Icon: FaXTwitter, href: "https://x.com", label: "X" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid size-8 place-items-center rounded-full bg-[#0066ff] text-white shadow-md shadow-[#0066ff]/30 transition-all duration-200 hover:scale-110 hover:bg-[#0052cc] hover:shadow-lg cursor-pointer"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links with chevron right */}
          <FooterSection
            title="Quick Links"
            className="lg:col-span-2 lg:px-4 xl:px-6"
            isOpen={openSection === "quick-links"}
            onToggle={() => toggleSection("quick-links")}
          >
            <ul className="space-y-0 pb-4 text-xs sm:mt-4 sm:space-y-2.5 sm:pb-0 sm:text-[13px]">
              {[
                { label: "Home", to: "/" },
                { label: "Shop", to: "/shop" },
                { label: "Coupons & Discounts", to: "/account?section=coupons" },
                // { label: "Deals", to: "/shop?tag=deals" },
                { label: "Your Orders", to: "/account?section=orders" },
                { label: "About Us", to: "/about" },
              ].map(({ label, to, highlight }) => (
                <li key={label}>
                  <Link
                    to={to}
                    viewTransition
                    className={`inline-flex items-center gap-2.5 py-2 transition-colors hover:text-white group sm:py-0 ${
                      highlight ? "text-[#38bdf8] font-medium" : "text-slate-300"
                    }`}
                  >
                    <ChevronRight
                      size={13}
                      className={`shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 ${
                        highlight ? "text-[#38bdf8]" : "text-slate-400 group-hover:text-white"
                      }`}
                    />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </FooterSection>

          {/* Column 3: Categories with icons */}
          <FooterSection
            title="Categories"
            className="lg:col-span-2 lg:px-4 xl:px-6"
            isOpen={openSection === "categories"}
            onToggle={() => toggleSection("categories")}
          >
            <ul className="space-y-0 pb-4 text-xs sm:mt-4 sm:space-y-2.5 sm:pb-0 sm:text-[13px]">
              {visibleFooterCategories.map(({ Icon, label, cat }) => (
                <li key={label}>
                  <Link
                    to={`/shop?category=${encodeURIComponent(cat)}`}
                    viewTransition
                    className="inline-flex items-center gap-2.5 py-2 text-slate-300 transition-colors hover:text-white group sm:py-0"
                  >
                    <Icon size={14} className="text-[#38bdf8] group-hover:text-white transition-colors shrink-0" />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </FooterSection>

          {/* Column 4: Customer Care with icons */}
          <FooterSection
            title="Customer Care"
            className="lg:col-span-2 lg:px-4 xl:px-6"
            isOpen={openSection === "customer-care"}
            onToggle={() => toggleSection("customer-care")}
          >
            <ul className="space-y-0 pb-4 text-xs sm:mt-4 sm:space-y-2.5 sm:pb-0 sm:text-[13px]">
              {[
                { Icon: PhoneCall, label: "FAQs", to: "/faqs" },
                { Icon: Ticket, label: "Coupons & Discounts", to: "/account?section=coupons" },
                { Icon: RotateCcw, label: "Return & Exchange", to: "/returns" },
                { Icon: FileText, label: "Terms & Conditions", to: "/terms" },
                { Icon: Mail, label: "Contact", to: "/contact" },
              ].map(({ Icon, label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    viewTransition
                    className="inline-flex items-center gap-2.5 py-2 text-slate-300 transition-colors hover:text-white group sm:py-0"
                  >
                    <Icon size={14} className="text-[#38bdf8] group-hover:text-white transition-colors shrink-0" />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </FooterSection>
        </div>
      </div>
    </footer>
  );
}