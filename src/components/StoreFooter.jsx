import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Cable,
  ChevronRight,
  FileText,
  Lock,
  Network,
  PhoneCall,
  RotateCcw,
  Router,
  ShieldCheck,
  Truck,
  Wifi,
  Wrench,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

function VisaBadge() {
  return (
    <span className="inline-flex h-6 w-11 items-center justify-center rounded bg-white px-1 shadow-xs border border-white/40">
      <span className="text-[11px] font-black italic tracking-tighter text-[#1a1f71]">VISA</span>
    </span>
  );
}

function MastercardBadge() {
  return (
    <span className="inline-flex h-6 w-11 items-center justify-center rounded bg-white px-1 shadow-xs border border-white/40">
      <span className="relative flex items-center justify-center">
        <span className="size-3.5 rounded-full bg-[#eb001b]" />
        <span className="-ml-1.5 size-3.5 rounded-full bg-[#f79e1b] opacity-95" />
      </span>
    </span>
  );
}

function JazzCashBadge() {
  return (
    <span className="inline-flex h-6 w-13 items-center justify-center rounded bg-[#da1e28] px-1 shadow-xs border border-red-500/40">
      <span className="text-[9px] font-black italic tracking-tight text-[#ffdd00]">JazzCash</span>
    </span>
  );
}

function EasypaisaBadge() {
  return (
    <span className="inline-flex h-6 w-13 items-center justify-center rounded bg-[#00a859] px-1 shadow-xs border border-emerald-500/40">
      <span className="text-[9px] font-extrabold tracking-tight text-white">easypaisa</span>
    </span>
  );
}

const TICKER_ANNOUNCEMENTS = [
  "MON – SAT: 10:00 AM – 8:00 PM | SUN: CLOSED (ONLINE ORDERS 24/7)",
  "PRICES & AVAILABILITY MAY VARY DUE TO CURRENCY & TARIFF FLUCTUATIONS",
  "WASOOLI STORE OPERATES ONLY ONE OFFICIAL PLATFORM — BEWARE OF FAKE CHANNELS",
  "NATIONWIDE 1–2 DAY DISPATCH WITH LIVE TRACKING ACROSS ALL CITIES IN PAKISTAN",
  "100% GENUINE & QUALITY-TESTED NETWORKING HARDWARE WITH OFFICIAL STORE WARRANTY",
];

export default function StoreFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e) {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  }

  return (
    <footer className="relative bg-[#020b24] text-slate-300 overflow-hidden font-sans">
      {/* Top Announcement Ticker Strip */}
      <div className="relative z-20 overflow-hidden border-y border-sky-200/90 bg-[#dbeafe] text-slate-800 py-2 sm:py-2.5 shadow-xs">
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

      {/* Background Graphic */}
      <img
        src="/footer.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
      />

      {/* Subtle soft gradient overlay so text stays readable on all devices */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#020b24]/90 via-[#020b24]/65 to-transparent md:via-[#020b24]/40"
      />

      {/* Main Footer Content */}
      <div className="relative z-10 mx-auto max-w-[1536px] px-4 pt-10 pb-8 sm:px-6 sm:pt-12 sm:pb-10 lg:px-8 xl:px-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6 xl:gap-8 items-start">
          
          {/* Column 1: Brand, Description & Socials */}
          <div className="sm:col-span-2 lg:col-span-3">
            <Link to="/" viewTransition className="inline-block py-1">
              <img
                src="/wasooli.png"
                alt="Wasooli Store"
                className="h-16 sm:h-20 lg:h-[76px] w-auto object-contain drop-shadow-md"
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
          <div className="lg:col-span-2">
            <h4 className="text-sm sm:text-[15px] font-bold text-white tracking-wide">Quick Links</h4>
            <ul className="mt-4 space-y-2.5 text-xs sm:text-[13px]">
              {[
                { label: "Home", to: "/" },
                { label: "Shop", to: "/shop" },
                { label: "New Arrivals", to: "/shop?sort=newest", highlight: true },
                { label: "Deals", to: "/shop?tag=deals" },
                { label: "About Us", to: "/about" },
                { label: "Contact", to: "/contact" },
              ].map(({ label, to, highlight }) => (
                <li key={label}>
                  <Link
                    to={to}
                    viewTransition
                    className={`flex items-center justify-between max-w-[130px] transition-colors hover:text-white ${
                      highlight ? "text-[#38bdf8] font-medium" : "text-slate-300"
                    }`}
                  >
                    <span>{label}</span>
                    <ChevronRight size={13} className={highlight ? "text-[#38bdf8]" : "text-slate-400"} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Categories with icons */}
          <div className="lg:col-span-2">
            <h4 className="text-sm sm:text-[15px] font-bold text-white tracking-wide">Categories</h4>
            <ul className="mt-4 space-y-2.5 text-xs sm:text-[13px]">
              {[
                { Icon: Router, label: "Routers", cat: "Routing" },
                { Icon: Network, label: "Switches", cat: "Switching" },
                { Icon: Wifi, label: "Access Points", cat: "Wireless" },
                { Icon: Cable, label: "Cables", cat: "Cabling & Connectivity" },
                { Icon: ShieldCheck, label: "Accessories", cat: "Tools & Accessories" },
                { Icon: Wrench, label: "Tools", cat: "Tools & Accessories" },
              ].map(({ Icon, label, cat }) => (
                <li key={label}>
                  <Link
                    to={`/shop?category=${encodeURIComponent(cat)}`}
                    viewTransition
                    className="inline-flex items-center gap-2.5 text-slate-300 transition-colors hover:text-white group"
                  >
                    <Icon size={14} className="text-[#38bdf8] group-hover:text-white transition-colors shrink-0" />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Customer Care with icons */}
          <div className="lg:col-span-2">
            <h4 className="text-sm sm:text-[15px] font-bold text-white tracking-wide">Customer Care</h4>
            <ul className="mt-4 space-y-2.5 text-xs sm:text-[13px]">
              {[
                { Icon: PhoneCall, label: "FAQs", to: "/faqs" },
                { Icon: Truck, label: "Shipping & Delivery", to: "/shipping" },
                { Icon: RotateCcw, label: "Return & Refunds", to: "/returns" },
                { Icon: ShieldCheck, label: "Privacy Policy", to: "/privacy" },
                { Icon: FileText, label: "Terms & Conditions", to: "/terms" },
              ].map(({ Icon, label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    viewTransition
                    className="inline-flex items-center gap-2.5 text-slate-300 transition-colors hover:text-white group"
                  >
                    <Icon size={14} className="text-[#38bdf8] group-hover:text-white transition-colors shrink-0" />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5 & Hardware Area: Newsletter + Secure Payments + 100% Secure Shopping Badge */}
          {/* <div className="sm:col-span-2 lg:col-span-3 flex flex-col justify-between">
            <div>
              <h4 className="text-sm sm:text-[16px] font-bold text-white tracking-wide">
                Subscribe to Our Newsletter
              </h4>
              <p className="mt-1 text-xs sm:text-[13px] text-sky-200/80">
                Get the latest updates on new products, offers and more.
              </p>

              <form onSubmit={handleSubscribe} className="relative mt-3.5 flex items-center max-w-sm rounded-full bg-white p-1 shadow-lg">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full bg-transparent pl-4 pr-12 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  aria-label="Subscribe to newsletter"
                  className="absolute right-1 grid size-8 sm:size-8.5 place-items-center rounded-full bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-bold transition-all active:scale-95 cursor-pointer shadow-md"
                >
                  <ArrowRight size={15} />
                </button>
              </form>
              {subscribed && (
                <p className="mt-1.5 text-xs font-semibold text-emerald-400">
                  Thank you for subscribing!
                </p>
              )}

              <div className="mt-5">
                <p className="text-xs font-semibold text-slate-200 tracking-wide">
                  Secure Payments
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2.5 sm:gap-3">
                  <div className="flex items-center gap-2">
                    <VisaBadge />
                    <MastercardBadge />
                    <JazzCashBadge />
                    <EasypaisaBadge />
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-xl border border-sky-400/35 bg-[#00173d]/85 px-3 py-1.5 backdrop-blur-md shadow-lg">
                    <Lock size={18} className="text-sky-300 shrink-0" />
                    <div className="leading-tight text-left">
                      <div className="text-[10px] sm:text-[11px] font-bold text-white tracking-wide">100% Secure</div>
                      <div className="text-[9px] sm:text-[10px] text-sky-200">Shopping</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> */}

        </div>
      </div>

      {/* Bottom Legal & Credits Bar */}
      {/* <div className="relative z-10 border-t border-sky-500/20 bg-[#00081c]/85 backdrop-blur-sm py-3.5">
        <div className="mx-auto flex max-w-[1536px] flex-col items-center justify-between gap-2 px-4 text-[11px] sm:text-xs text-slate-300/80 sm:flex-row sm:px-6 lg:px-8 xl:px-10">
          <p className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} Wasooli Store. All rights reserved.
          </p>
          <p className="text-center sm:text-right">
            Made with <span className="text-red-500">❤️</span> for a better connected world
          </p>
        </div>
      </div> */}
    </footer>
  );
}
