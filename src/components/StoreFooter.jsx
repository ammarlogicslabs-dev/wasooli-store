import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Clock,
  Headphones,
  Mail,
  MapPin,
  Network,
  Phone,
  RotateCcw,
  ShieldCheck,
  Truck,
  Zap,
} from "lucide-react";

export default function StoreFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e) {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail("");
    }, 4000);
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <footer className="relative border-t border-slate-800 bg-slate-950 text-slate-300">
      {/* Top Value Banner */}
      {/* <div className="border-b border-slate-900 bg-slate-900/40">
        <div className="mx-auto max-w-8xl px-4 py-8 sm:px-6 lg:px-8 2xl:max-w-[1536px]">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3.5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-400 ring-1 ring-brand-500/25">
                <Truck size={20} />
              </span>
              <div>
                <h4 className="text-sm font-bold text-white">Nationwide Delivery</h4>
                <p className="text-xs text-slate-400">Fast dispatch in 1–2 days across Pakistan</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/25">
                <ShieldCheck size={20} />
              </span>
              <div>
                <h4 className="text-sm font-bold text-white">100% Genuine Gear</h4>
                <p className="text-xs text-slate-400">Tested &amp; verified networking equipment</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/25">
                <RotateCcw size={20} />
              </span>
              <div>
                <h4 className="text-sm font-bold text-white">Easy Exchanges</h4>
                <p className="text-xs text-slate-400">2-day sealed item return &amp; exchange</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/25">
                <Headphones size={20} />
              </span>
              <div>
                <h4 className="text-sm font-bold text-white">Networking Support</h4>
                <p className="text-xs text-slate-400">Technical help for setup &amp; purchases</p>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Main Footer Links */}
      <div className="mx-auto max-w-8xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 2xl:max-w-[1536px]">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="grid size-11 place-items-center overflow-hidden rounded-xl border border-white/10 bg-white p-1 shadow-md">
                <img src="/wasooli.png" alt="Wasooli Store" className="h-full w-full object-contain" />
              </span>
              <div>
                <span className="block text-lg font-black tracking-tight text-white">Wasooli Store</span>
                <span className="block text-[11px] font-medium tracking-wider text-brand-400 uppercase">
                  Networking Products HQ
                </span>
              </div>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
              Pakistan&apos;s premier online catalog for high-performance enterprise and home networking hardware.
              Routers, PoE switches, Cat6/Cat8 patch cords, fiber optics, and accessories.
            </p>

            <div className="mt-6 flex flex-col gap-2.5 text-xs text-slate-300">
              <a
                href="tel:03001234567"
                className="inline-flex items-center gap-2.5 transition hover:text-brand-300"
              >
                <Phone size={14} className="text-brand-400" />
                <span>0300 1234567 (Mon–Sat 10am–8pm)</span>
              </a>
              <a
                href="mailto:hello@wasooli.store"
                className="inline-flex items-center gap-2.5 transition hover:text-brand-300"
              >
                <Mail size={14} className="text-brand-400" />
                <span>hello@wasooli.store</span>
              </a>
              <div className="inline-flex items-center gap-2.5 text-slate-400">
                <MapPin size={14} className="text-brand-400" />
                <span>Karachi, Pakistan (Nationwide Delivery)</span>
              </div>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">Hardware Catalog</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { name: "Routing & Gateways", cat: "Routing" },
                { name: "Switching & PoE", cat: "Switching" },
                { name: "Wireless Access Points", cat: "Wireless" },
                { name: "Network Security", cat: "Network Security" },
                { name: "Optical & Fiber Optics", cat: "Optical & Fiber" },
                { name: "Cabling & Patch Cords", cat: "Cabling & Connectivity" },
                { name: "Power, Racks & Tools", cat: "Tools & Accessories" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    to={`/shop?category=${encodeURIComponent(item.cat)}`}
                    className="text-slate-400 transition hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Customer Care & Policy */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">Customer Support</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/shop" className="text-slate-400 transition hover:text-white">
                  Browse All Products
                </Link>
              </li>
              <li>
                <Link to="/account" className="text-slate-400 transition hover:text-white">
                  Track Your Orders
                </Link>
              </li>
              <li>
                <Link to="/account" className="text-slate-400 transition hover:text-white">
                  My Profile &amp; Addresses
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-slate-400 transition hover:text-white">
                  Bulk &amp; Quantity Discounts
                </Link>
              </li>
              <li>
                <a
                  href="#categories"
                  onClick={(e) => {
                    if (window.location.pathname === "/") {
                      e.preventDefault();
                      document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="text-slate-400 transition hover:text-white"
                >
                  Category Directory
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter & Wholesale Alerts */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">Stock &amp; Price Alerts</h3>
            <p className="mt-4 text-xs leading-5 text-slate-400">
              Get notified when new networking equipment arrives or when bulk discounts are added.
            </p>

            {subscribed ? (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                <span>Thank you! You are subscribed to Wasooli Store alerts.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="mt-4 space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 inline-flex items-center justify-center rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-400"
                  >
                    Join
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">No spam, strictly hardware arrivals &amp; B2B drops.</p>
              </form>
            )}

            <div className="mt-6 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Zap size={14} className="text-brand-400" />
                <span>Payment Methods</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Cash on Delivery (COD) · IBFT / Bank Transfer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Back to Top */}
      <div className="border-t border-slate-900 bg-slate-950 py-5">
        <div className="mx-auto flex max-w-8xl flex-col items-center justify-between gap-4 px-4 text-xs text-slate-400 sm:flex-row sm:px-6 lg:px-8 2xl:max-w-[1536px]">
          <p>
            &copy; {new Date().getFullYear()} <strong className="text-slate-300">Wasooli Store</strong>. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              Nationwide Logistics Active
            </span>
            <button
              onClick={scrollToTop}
              className="group inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1 text-slate-300 transition hover:border-brand-500/50 hover:bg-slate-800 hover:text-white"
            >
              <span>Back to top</span>
              <ArrowUp size={12} className="transition-transform group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
