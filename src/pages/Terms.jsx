import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  ShieldCheck,
  CreditCard,
  Truck,
  RotateCcw,
  Scale,
  AlertCircle,
  Clock,
  PhoneCall,
  Mail,
  MessageCircle,
  CheckCircle2,
  Lock,
  Building2,
  ChevronRight,
} from "lucide-react";
import StoreHeader from "../components/StoreHeader";

const SECTIONS = [
  { id: "acceptance", label: "1. Acceptance of Terms", icon: ShieldCheck },
  { id: "accounts", label: "2. User Accounts & Security", icon: Lock },
  { id: "pricing", label: "3. Products & Pricing", icon: CreditCard },
  { id: "orders", label: "4. Ordering & Invoicing", icon: Building2 },
  { id: "payments", label: "5. Payment Terms & COD", icon: CreditCard },
  { id: "shipping", label: "6. Shipping & Doorstep Inspection", icon: Truck },
  { id: "warranty", label: "7. Warranty & Replacements", icon: RotateCcw },
  { id: "liability", label: "8. Limitation of Liability", icon: AlertCircle },
  { id: "governing-law", label: "9. Governing Law (Pakistan)", icon: Scale },
];

export default function Terms() {
  const [activeTab, setActiveTab] = useState("acceptance");

  useEffect(() => {
    document.title = "Terms & Conditions | Wasooli Store";
  }, []);

  const handleTabChange = (id) => {
    setActiveTab(id);
    const element = document.getElementById("terms-content");
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      if (window.pageYOffset > y) {
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800">
      <StoreHeader />

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-linear-to-b from-white via-sky-50/30 to-[#f8fafc] px-4 pt-10 pb-10 sm:px-6 sm:pb-12 lg:px-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-80 w-full max-w-5xl rounded-full bg-brand-500/8 blur-[100px]"
        />

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <Link to="/" className="hover:text-brand-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-800">Terms &amp; Conditions</span>
          </nav>

          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/90 px-3.5 py-1 text-[11px] font-bold tracking-[0.16em] uppercase text-brand-600 shadow-2xs">
            <FileText size={14} className="text-brand-500" />
            <span>Legal Agreement &amp; Operating Guidelines</span>
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-[#0a1e3f] sm:text-4xl lg:text-5xl">
            Terms &amp; Conditions
          </h1>
          <p className="mx-auto mt-3.5 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Please read these terms carefully before placing orders or using Wasooli Store. They govern the purchase of genuine networking hardware, wholesale distribution, and warranty fulfillment across Pakistan.
          </p>

          <div className="mt-4 flex items-center justify-center gap-3 text-xs text-slate-500">
            <span>Last Updated: October 2026</span>
            <span>•</span>
            <span>Applicable across Pakistan</span>
          </div>

          {/* Sticky/Interactive Navigation Pills */}
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5">
            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeTab === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => handleTabChange(sec.id)}
                  className={`inline-flex items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-brand-500 text-white shadow-xs sm:shadow-md shadow-brand-500/25 scale-[1.02]"
                      : "bg-white text-slate-700 border border-slate-200/90 hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-600 shadow-2xs"
                  }`}
                >
                  <Icon className={`size-3 sm:size-3.5 shrink-0 ${isActive ? "text-white" : "text-brand-500"}`} />
                  <span className="leading-tight">{sec.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <main id="terms-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Section 1: Acceptance */}
        {activeTab === "acceptance" && (
        <section
          id="acceptance"
          className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-sky-50 text-brand-600">
              <ShieldCheck size={22} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Article 01</span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Acceptance of Terms</h2>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-xs sm:text-sm leading-relaxed text-slate-600">
            <p>
              By accessing, browsing, or placing an order on <strong className="text-slate-800">Wasooli Store</strong> (accessible via wasooli.store and its mobile/web applications), you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions, along with our{" "}
              <Link to="/returns" className="font-semibold text-brand-600 hover:underline">
                Warranty &amp; Returns Policy
              </Link>{" "}
              and{" "}
              <Link to="/faqs" className="font-semibold text-brand-600 hover:underline">
                Frequently Asked Questions
              </Link>.
            </p>
            <p>
              If you are purchasing on behalf of a registered enterprise, ISP, data center, system integrator, or educational institution, you represent and warrant that you possess the lawful authority to bind said entity to these terms.
            </p>
          </div>
        </section>
        )}

        {/* Section 2: User Accounts */}
        {activeTab === "accounts" && (
        <section
          id="accounts"
          className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-sky-50 text-brand-600">
              <Lock size={22} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Article 02</span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">User Accounts &amp; Security</h2>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-xs sm:text-sm leading-relaxed text-slate-600">
            <p>
              When creating an account on Wasooli Store, you agree to provide authentic, up-to-date, and accurate contact details (including legal name, active Pakistani phone number, and physical shipping address).
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong className="text-slate-800">Credential Confidentiality:</strong> You are strictly responsible for maintaining the confidentiality of your login credentials and one-time verification passwords (OTPs).
              </li>
              <li>
                <strong className="text-slate-800">Account Misuse:</strong> Wasooli Store reserves the right to suspend or terminate accounts that submit fictitious orders, repeated unauthorized Cash on Delivery refusals, or abusive activity.
              </li>
              <li>
                <strong className="text-slate-800">Corporate Accounts:</strong> Bulk purchasers with tax-exempt status or NTN/STRN requirements must provide verified documentation prior to invoice generation.
              </li>
            </ul>
          </div>
        </section>
        )}

        {/* Section 3: Products & Pricing */}
        {activeTab === "pricing" && (
        <section
          id="pricing"
          className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-sky-50 text-brand-600">
              <CreditCard size={22} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Article 03</span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Products, Specifications &amp; Pricing</h2>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-xs sm:text-sm leading-relaxed text-slate-600">
            <p>
              We specialize in genuine commercial and enterprise networking equipment (including Gigabit &amp; 10G PoE switches, enterprise routers, dual-band WiFi 6/7 access points, Cat6/Cat6A/Cat8 patch cords, optical transceivers, and server racks).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Currency &amp; Price Fluctuations</h4>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  All prices are listed in Pakistani Rupees (PKR). Due to international import duties and exchange rate variations, unconfirmed quotes may be subject to periodic revision.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Genuine Hardware Guarantee</h4>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Every product delivered is guaranteed 100% authentic with factory serial numbers, eligible for official manufacturer validation where applicable.
                </p>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* Section 4: Ordering & Invoicing */}
        {activeTab === "orders" && (
        <section
          id="orders"
          className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-sky-50 text-brand-600">
              <Building2 size={22} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Article 04</span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Order Placement &amp; Wholesale Invoicing</h2>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-xs sm:text-sm leading-relaxed text-slate-600">
            <p>
              An order placed through our store represents an offer to purchase. Order acceptance occurs when we confirm order verification via automated SMS, WhatsApp, or phone verification from our dispatch team.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong className="text-slate-800">Wholesale &amp; Volume Tiering:</strong> Discounts applied to bulk roll purchases or enterprise switch quantities are binding once confirmed by our sales desk.
              </li>
              <li>
                <strong className="text-slate-800">Official Sales Tax Invoices:</strong> Verified tax invoices displaying itemized serial numbers, warranty terms, and company NTN are dispatched with every consignment.
              </li>
              <li>
                <strong className="text-slate-800">Order Modification:</strong> Orders may be modified or canceled before dispatch by contacting customer care at 0300 1234567.
              </li>
            </ul>
          </div>
        </section>
        )}

        {/* Section 5: Payment Terms */}
        {activeTab === "payments" && (
        <section
          id="payments"
          className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-sky-50 text-brand-600">
              <CreditCard size={22} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Article 05</span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Payment Methods &amp; Cash on Delivery (COD)</h2>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-xs sm:text-sm leading-relaxed text-slate-600">
            <p>Wasooli Store provides multiple secure payment mechanisms across Pakistan:</p>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white p-3.5">
                <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800">Cash on Delivery (COD):</span>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Available nationwide for standard retail orders. Consignments must be received by the recipient upon payment to the courier rider.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white p-3.5">
                <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800">Direct Bank Transfer (IBFT / Wire):</span>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Mandatory for wholesale bulk consignments, enterprise custom configurations, or orders exceeding standard courier COD thresholds.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200/70 rounded-xl p-3 mt-2">
              <strong className="font-bold">Important Notice:</strong> Unjustified refusal to receive confirmed COD parcels without prior written cancellation causes operational freight losses and may lead to blacklisting across our logistics network.
            </p>
          </div>
        </section>
        )}

        {/* Section 6: Shipping */}
        {activeTab === "shipping" && (
        <section
          id="shipping"
          className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-sky-50 text-brand-600">
              <Truck size={22} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Article 06</span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Shipping, Delivery &amp; Doorstep Inspection</h2>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-xs sm:text-sm leading-relaxed text-slate-600">
            <p>
              We deliver to major metropolitan centers (Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta) as well as tier-2 and tier-3 towns across Pakistan via trusted logistics partners (TCS, Leopards, Trax, Call Courier).
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong className="text-slate-800">Delivery Timelines:</strong> Major cities typically receive orders within 24 to 48 working hours. Regional and rural zones require 2 to 4 business days.
              </li>
              <li>
                <strong className="text-slate-800">Inspection on Arrival:</strong> Customers are advised to examine external packaging seals prior to accepting. If package tampering or external crushing is observed, immediately notify our helpline while the courier rider is present.
              </li>
            </ul>
          </div>
        </section>
        )}

        {/* Section 7: Warranty & Returns */}
        {activeTab === "warranty" && (
        <section
          id="warranty"
          className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-sky-50 text-brand-600">
              <RotateCcw size={22} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Article 07</span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Warranty, Dead on Arrival (DOA) &amp; Returns</h2>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-xs sm:text-sm leading-relaxed text-slate-600">
            <p>
              All active networking hardware is backed by official manufacturer warranties (typically 1 to 3 years depending on vendor and equipment tier).
            </p>
            <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
              <h4 className="text-xs font-bold text-brand-700 uppercase tracking-wider">7-Day Hassle-Free Initial Testing Warranty</h4>
              <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                If an equipment unit arrives damaged, defective, or non-responsive (DOA), we facilitate expedited testing and replacement within 7 calendar days of delivery.
              </p>
            </div>
            <p>
              For comprehensive details regarding warranty exclusions (physical damage, electrical surges, lightning strikes, third-party firmware modification), please review our dedicated policy:
            </p>
            <div className="pt-1">
              <Link
                to="/returns"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-brand-600 transition"
              >
                <span>Read Full Warranty &amp; Return Policy</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </section>
        )}

        {/* Section 8: Limitation of Liability */}
        {activeTab === "liability" && (
        <section
          id="liability"
          className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-sky-50 text-brand-600">
              <AlertCircle size={22} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Article 08</span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Limitation of Liability &amp; Force Majeure</h2>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-xs sm:text-sm leading-relaxed text-slate-600">
            <p>
              To the fullest extent permitted by law, Wasooli Store shall not be liable for any indirect, punitive, incidental, or consequential damages resulting from:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Network downtime, loss of data, or operational disruptions resulting from hardware installation.</li>
              <li>Incompatibilities caused by third-party cabling or non-standard protocols.</li>
              <li>Delays caused by force majeure events including natural disasters, nationwide road closures, or courier operational strikes.</li>
            </ul>
          </div>
        </section>
        )}

        {/* Section 9: Governing Law */}
        {activeTab === "governing-law" && (
        <section
          id="governing-law"
          className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-sky-50 text-brand-600">
              <Scale size={22} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Article 09</span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Governing Law &amp; Jurisdiction</h2>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-xs sm:text-sm leading-relaxed text-slate-600">
            <p>
              These Terms and Conditions and any separate agreements whereby we provide you services shall be governed by and construed in accordance with the laws of the <strong className="text-slate-800">Islamic Republic of Pakistan</strong>.
            </p>
            <p>
              Any disputes or legal proceedings arising out of transactions on Wasooli Store shall be subject to the exclusive jurisdiction of the competent courts of Lahore / Karachi, Pakistan.
            </p>
          </div>
        </section>
        )}

        {/* Still Have Questions? Contact Box (Verified Stacked Layout) */}
        <section className="mt-12 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 lg:p-10 shadow-sm">
          {/* Timing badge */}
          <div className="inline-flex items-center gap-2 whitespace-nowrap rounded-2xl bg-sky-50 border border-sky-100/80 px-3.5 py-1.5 text-xs font-bold text-[#0070f3]">
            <Clock size={14} className="shrink-0 text-[#0070f3]" />
            <span>
              MON – SAT: 10:00 AM – 8:00 PM <span className="font-semibold text-sky-600/80">(ONLINE 24/7)</span>
            </span>
          </div>

          {/* Heading full line */}
          <h2 className="mt-3.5 text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-[#0a1e3f]">
            Still have questions? We're here to help.
          </h2>

          {/* Paragraph underneath */}
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500 max-w-3xl">
            Have questions regarding our commercial terms, corporate invoice processing, or wholesale contracts? Reach out to our legal and enterprise support desk.
          </p>

          {/* Bottom Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* WhatsApp */}
            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10.5 sm:h-11 items-center gap-2 rounded-xl bg-[#25D366] px-4.5 text-xs sm:text-sm font-bold text-white shadow-2xs hover:bg-[#20ba59] active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <MessageCircle size={16} className="shrink-0" />
              <span>WhatsApp Chat</span>
            </a>

            {/* Helpline */}
            <a
              href="tel:03001234567"
              className="inline-flex h-10.5 sm:h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4.5 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs hover:border-[#0070f3] hover:text-[#0070f3] active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <PhoneCall size={15} className="shrink-0 text-[#0070f3]" />
              <span>0300 1234567</span>
            </a>

            {/* Email */}
            <a
              href="mailto:support@wasooli.store"
              className="inline-flex h-10.5 sm:h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4.5 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs hover:border-[#0070f3] hover:text-[#0070f3] active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <Mail size={15} className="shrink-0 text-[#0070f3]" />
              <span>support@wasooli.store</span>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
