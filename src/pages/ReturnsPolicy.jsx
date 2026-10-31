import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BadgeAlert,
  Boxes,
  CheckCircle2,
  Clock,
  FileCheck2,
  HelpCircle,
  PhoneCall,
  RotateCcw,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Video,
  XCircle,
} from "lucide-react";
import StoreHeader from "../components/StoreHeader";

const SECTIONS = [
  { id: "warranty", label: "Warranty Policy", icon: ShieldCheck },
  { id: "returns", label: "Return & Exchange", icon: RotateCcw },
  { id: "cancellation", label: "Order Cancellation & COD", icon: ShieldAlert },
  { id: "governing-law", label: "Governing Law", icon: Scale },
];

export default function ReturnsPolicy() {
  const [activeTab, setActiveTab] = useState("warranty");

  useEffect(() => {
    document.title = "Warranty, Returns & Exchanges Policy | Wasooli Store";
  }, []);

  const handleTabChange = (id) => {
    setActiveTab(id);
    const element = document.getElementById("policy-content");
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
            <span className="font-semibold text-slate-800">Returns &amp; Warranty Policy</span>
          </nav>

          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/90 px-3.5 py-1 text-[11px] font-bold tracking-[0.16em] uppercase text-brand-600 shadow-2xs">
            <ShieldCheck size={14} className="text-brand-500" />
            <span>Customer Protection &amp; Guidelines</span>
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-[#0a1e3f] sm:text-4xl lg:text-5xl">
            Warranty, Returns &amp; Exchanges
          </h1>
          <p className="mx-auto mt-3.5 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Transparent, customer-friendly policies covering manufacturer warranty claims, return eligibility, order cancellations, and Cash on Delivery terms across Pakistan.
          </p>

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
                  className={`inline-flex items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl px-2.5 py-1 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-brand-500 text-white shadow-xs sm:shadow-md shadow-brand-500/25 scale-[1.02]"
                      : "bg-white text-slate-700 border border-slate-200/90 hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-600 shadow-2xs"
                  }`}
                >
                  <Icon className={`size-3 sm:size-4 shrink-0 ${isActive ? "text-white" : "text-brand-500"}`} />
                  <span className="leading-tight">{sec.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main id="policy-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* =========================================================
            SECTION 1: WARRANTY POLICY
           ========================================================= */}
        {activeTab === "warranty" && (
        <section
          id="warranty"
          className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 md:p-10 shadow-sm"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand-600 shadow-2xs">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Warranty Policy
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Official terms and service conditions governing hardware warranty claims
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm sm:text-[15px] leading-relaxed text-slate-600">
            At <strong className="text-slate-900 font-semibold">Wasooli Store</strong>, we offer warranty services based on manufacturer, supplier, or distributor terms. Please read the following conditions carefully before making a claim.
          </p>

          {/* General Warranty Terms */}
          <div className="mt-7">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <CheckCircle2 size={18} className="text-brand-500" />
              <span>General Warranty Terms</span>
            </h3>
            <ul className="mt-3.5 space-y-2.5 text-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-brand-500" />
                <span><strong>Manufacturing Defects:</strong> Warranty covers genuine manufacturing and hardware defects within the specified period.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-brand-500" />
                <span><strong>Reseller / Vendor Role:</strong> Warranty is provided by the manufacturer, supplier, or distributor. We act solely as a reseller/vendor, and warranty service is provided strictly according to the manufacturer, supplier, or distributor terms.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-brand-500" />
                <span><strong>Warranty Card:</strong> If your invoice mentions &quot;Warranty Card Issued,&quot; ensure you receive and safely retain it along with your invoice. Without it, our customer support cannot process your claim.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-brand-500" />
                <span><strong>Original Invoice Requirement:</strong> The original invoice is mandatory for all warranty claims. Claims without a valid original invoice may be declined.</span>
              </li>
            </ul>
          </div>

          {/* Important Conditions */}
          <div className="mt-8 rounded-2xl border border-amber-200/80 bg-amber-50/40 p-5">
            <h3 className="flex items-center gap-2 text-sm sm:text-base font-bold text-amber-900">
              <AlertTriangle size={18} className="text-amber-600 shrink-0" />
              <span>Important Conditions &amp; Claim Exclusions</span>
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-amber-900/80 leading-relaxed">
              Check your product before leaving the store or upon delivery arrival. The warranty starts once the invoice is generated. Any issues reported afterward will be processed as a standard warranty claim.
            </p>
            <p className="mt-3 text-xs sm:text-sm font-semibold text-amber-950">
              The manufacturer or service center may reject warranty claims if the product/component:
            </p>
            <ul className="mt-2 space-y-1.5 text-xs sm:text-sm text-amber-900/90 list-disc list-inside pl-1">
              <li>Is broken, burned, chipped, cracked, or rusted due to environmental conditions.</li>
              <li>Is submitted in poor physical condition or not packed in its original protective packaging material.</li>
              <li>Has a damaged, removed, or tampered warranty sticker, bar code, or serial number.</li>
              <li>Suffered accidental damage, liquid spills, electrical power surges, or software-related modifications/issues.</li>
              <li>Power adapters, cables, patch cords, printer cartridges/toners, and consumable accessories are not covered under warranty.</li>
            </ul>
          </div>

          {/* Warranty Claim Process */}
          <div className="mt-8">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <FileCheck2 size={18} className="text-brand-500" />
              <span>Warranty Claim Process</span>
            </h3>
            <div className="mt-3.5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Repair or Replacement</p>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">
                  If the claim is approved, the manufacturer, supplier, or distributor will repair or replace the product at their sole discretion.
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Processing Timeline</p>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">
                  Processing time for formal warranty inspections and claims typically takes <strong>3 to 6 weeks</strong>.
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Discontinued Products</p>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">
                  If the product is discontinued, the manufacturer may offer an upgraded model for an additional charge. If the customer refuses, a partial refund may be issued.
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Limited Warranty</p>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">
                  Some products carry a Limited Warranty, meaning the first year is completely free, while any additional years require a nominal paid service fee.
                </p>
              </div>
            </div>
          </div>

          {/* Special Cases */}
          <div className="mt-8">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Special Cases
            </h3>
            <div className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200/80 text-xs sm:text-sm">
              <div className="p-3.5 sm:p-4">
                <strong className="text-slate-900">International Warranty:</strong>
                <span className="ml-1 text-slate-600">Customers must register the product directly with the global manufacturer and handle the claim process through their official portals.</span>
              </div>
              <div className="p-3.5 sm:p-4">
                <strong className="text-slate-900">Used / Refurbished Hardware:</strong>
                <span className="ml-1 text-slate-600">Used hardware comes with a checking warranty only. Customers must inspect the product thoroughly before purchase or upon receipt.</span>
              </div>
              <div className="p-3.5 sm:p-4">
                <strong className="text-slate-900">Network Gear &amp; PC Systems:</strong>
                <span className="ml-1 text-slate-600">Warranty is void if the device chassis or PC case is opened or internal components are added/removed without prior approval from our authorized service center.</span>
              </div>
              <div className="p-3.5 sm:p-4">
                <strong className="text-slate-900">LCDs / LEDs &amp; Displays:</strong>
                <span className="ml-1 text-slate-600">Warranty does not cover minor screen panel variations like dead pixels or dots within standard manufacturer tolerance limits.</span>
              </div>
            </div>
          </div>

          {/* Service Hours */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-brand-50/60 border border-brand-100 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-brand-500 text-white shadow-2xs shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-brand-900 uppercase tracking-wider">Warranty Service Hours</p>
                <p className="text-xs sm:text-sm text-brand-800">Monday to Friday: <strong>11:30 AM – 6:30 PM</strong></p>
              </div>
            </div>
            <a
              href="tel:+922134960583"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-brand-700 border border-brand-200 shadow-2xs hover:bg-brand-50 transition"
            >
              <PhoneCall size={15} />
              <span>+92 21 34960583</span>
            </a>
          </div>
        </section>
        )}

        {/* =========================================================
            SECTION 2: RETURN & EXCHANGE POLICY
           ========================================================= */}
        {activeTab === "returns" && (
        <section
          id="returns"
          className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 md:p-10 shadow-sm"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="grid size-11 place-items-center rounded-2xl bg-sky-50 text-sky-600 shadow-2xs">
              <RotateCcw size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Return &amp; Exchange Policy
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Criteria, guidelines, and steps for returning or exchanging eligible items
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm sm:text-[15px] leading-relaxed text-slate-600">
            At <strong className="text-slate-900 font-semibold">Wasooli Store</strong>, we strive to provide high-quality networking hardware, cables, and enterprise equipment. Please review our return and exchange policy before completing your purchase.
          </p>

          {/* Eligibility Criteria Cards */}
          <div className="mt-7">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <CheckCircle2 size={18} className="text-emerald-500" />
              <span>Eligibility for Returns &amp; Exchanges</span>
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              We accept returns strictly under all of the following conditions:
            </p>

            <div className="mt-4 grid gap-3.5 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4 text-center">
                <div className="mx-auto grid size-9 place-items-center rounded-full bg-emerald-100 text-emerald-700 font-black text-sm">
                  3
                </div>
                <p className="mt-2.5 text-xs sm:text-sm font-bold text-slate-900">Within 3 Days</p>
                <p className="mt-1 text-xs text-slate-500">
                  Item must be returned within 3 days of the original purchase or delivery date.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4 text-center">
                <div className="mx-auto grid size-9 place-items-center rounded-full bg-emerald-100 text-emerald-700 font-black text-sm">
                  <ShieldCheck size={18} />
                </div>
                <p className="mt-2.5 text-xs sm:text-sm font-bold text-slate-900">Strictly Sealed</p>
                <p className="mt-1 text-xs text-slate-500">
                  Product must be unopened, factory sealed, with all original protective wraps intact.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4 text-center">
                <div className="mx-auto grid size-9 place-items-center rounded-full bg-emerald-100 text-emerald-700 font-black text-sm">
                  <Boxes size={18} />
                </div>
                <p className="mt-2.5 text-xs sm:text-sm font-bold text-slate-900">Original Packaging</p>
                <p className="mt-1 text-xs text-slate-500">
                  Complete with all manuals, accessories, brochures, and box in mint condition.
                </p>
              </div>
            </div>
          </div>

          {/* Non-Returnable Items */}
          <div className="mt-8 rounded-2xl border border-red-200/80 bg-red-50/40 p-5">
            <h3 className="flex items-center gap-2 text-sm sm:text-base font-bold text-red-900">
              <XCircle size={18} className="text-red-600 shrink-0" />
              <span>Non-Returnable Items</span>
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-red-900/80 leading-relaxed">
              The following items and conditions are strictly <strong>not eligible</strong> for return or exchange:
            </p>
            <ul className="mt-3 space-y-2 text-xs sm:text-sm text-red-900/90 list-disc list-inside pl-1">
              <li>
                <strong>Opened or Unsealed Products:</strong> Once the factory packaging or tape seal is broken, the item is considered sold and cannot be returned or restocked.
              </li>
              <li>
                <strong>Backordered / Custom Orders:</strong> Items specially procured or backordered upon customer request are final sale and non-refundable.
              </li>
              <li>
                <strong>Transit Damages:</strong> Products damaged during courier transit must be reported within <strong>24 hours of delivery</strong>.
              </li>
            </ul>

            <div className="mt-3.5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-white/80 p-3 text-xs text-red-800">
              <Video size={17} className="text-red-600 shrink-0 mt-0.5" />
              <span>
                <strong>Unboxing Video Required:</strong> For any shipping damage claim, a clear, continuous unboxing video showing the shipping label, packaging condition, and product state is mandatory.
              </span>
            </div>
          </div>

          {/* Return Process */}
          <div className="mt-8">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <RotateCcw size={18} className="text-brand-500" />
              <span>Return Process</span>
            </h3>
            <ol className="mt-3.5 space-y-3 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">1</span>
                <span>Contact our support team at <a href="mailto:support@wasooli.store" className="font-semibold text-brand-600 underline">support@wasooli.store</a> or call <a href="tel:+922134960583" className="font-semibold text-brand-600">+92 21 34960583</a> within 3 days of purchase/delivery.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">2</span>
                <span>Provide your order number, original invoice, and photos/videos of the sealed box.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">3</span>
                <span>Upon preliminary approval, you will receive instructions on how and where to safely dispatch the item.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">4</span>
                <span><strong>Return Shipping:</strong> The customer is responsible for safe transit and return shipping costs.</span>
              </li>
            </ol>
          </div>

          {/* Refunds */}
          <div className="mt-7 rounded-2xl bg-slate-50 border border-slate-200/80 p-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Refunds</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Once our inspection team receives and verifies that the item satisfies all return conditions (sealed, intact packaging, all accessories present), we will process your refund to your original payment method (Bank Transfer, EasyPaisa, JazzCash, or Credit Card).
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-700">
              <AlertCircle size={15} className="text-amber-500 shrink-0" />
              <span>Please note: Initial shipping and delivery fees are strictly non-refundable.</span>
            </div>
          </div>
        </section>
        )}

        {/* =========================================================
            SECTION 3: ORDER CANCELLATION & COD POLICY
           ========================================================= */}
        {activeTab === "cancellation" && (
        <section
          id="cancellation"
          className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 md:p-10 shadow-sm"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="grid size-11 place-items-center rounded-2xl bg-amber-50 text-amber-600 shadow-2xs">
              <BadgeAlert size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Order Cancellation &amp; Cash on Delivery (COD) Policy
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Verification protocols, cancellation conditions, and COD risk terms
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm sm:text-[15px] leading-relaxed text-slate-600">
            We reserve the right to cancel, refuse, or limit any order placed through our website, online platforms, or other sales channels at our sole discretion. Orders may be cancelled at any stage of the processing cycle, including after initial confirmation, without prior notice where reasonably necessary.
          </p>

          <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Circumstances Leading to Order Cancellation
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Orders may be cancelled in circumstances including, but not limited to, the following:
            </p>

            <div className="mt-3.5 space-y-3">
              {[
                {
                  title: "Product Unavailability",
                  desc: "If the ordered product becomes unavailable due to stock limitations, unexpected supply chain constraints, or inventory discrepancies.",
                },
                {
                  title: "Incomplete or Incorrect Information",
                  desc: "If the shipping address, contact details, CNIC, or other order information provided by the customer is incomplete, inaccurate, or cannot be reasonably verified via phone/call for delivery.",
                },
                {
                  title: "Cash on Delivery (COD) Risk",
                  desc: "If the customer has a recorded history of rejecting, refusing, or failing to accept previous Cash on Delivery parcels placed with our company or affiliate couriers.",
                },
                {
                  title: "Suspicious or High-Risk Orders",
                  desc: "If the order is flagged by our automated fraud detection or internal risk assessment system as suspicious or potentially fraudulent.",
                },
                {
                  title: "Operational or Pricing Errors",
                  desc: "If an order contains typographical errors, pricing discrepancies, technical glitch prices, or system calculation malfunctions affecting the order details.",
                },
              ].map((item, idx) => (
                <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h4>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cancellation Rights & Liability */}
          <div className="mt-6 rounded-2xl border border-slate-200/90 bg-slate-50 p-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">No Claim of Damages</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              In the event of order cancellation prior to payment or dispatch, the customer shall not be entitled to any compensation, loss claims, or damages. If payment has already been received for an order that is subsequently cancelled by Wasooli Store, the customer will be issued a full refund in accordance with our standard Refund Policy.
            </p>
            <p className="mt-3 text-xs sm:text-sm font-semibold text-slate-900">
              By placing an order with our store, the customer acknowledges and agrees to these terms and conditions.
            </p>
          </div>
        </section>
        )}

        {/* =========================================================
            SECTION 4: GOVERNING LAW
           ========================================================= */}
        {activeTab === "governing-law" && (
        <section
          id="governing-law"
          className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 md:p-10 shadow-sm"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="grid size-11 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-2xs">
              <Scale size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Governing Law &amp; Jurisdiction
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Legal framework and dispute resolution jurisdiction in Pakistan
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3.5 text-sm sm:text-[15px] leading-relaxed text-slate-600">
            <p>
              <strong className="text-slate-900">Governing Law:</strong> These Terms, Warranty, and Return Conditions are strictly governed by and construed in accordance with the laws of the <strong className="text-slate-900">Islamic Republic of Pakistan</strong>.
            </p>
            <p>
              By placing an order, browsing our catalog, or using any of our services, you expressly agree that the competent courts of <strong className="text-slate-900">Karachi, Sindh</strong> (including the relevant District Consumer Protection Courts) shall have exclusive jurisdiction to settle any dispute, claim, or controversy arising in connection with our products, transactions, or services.
            </p>
          </div>
        </section>
        )}

        {/* Quick Assistance Help Card */}
        <section className="rounded-3xl bg-linear-to-r from-[#020b24] to-[#0a1e3f] p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-sky-300">
                <HelpCircle size={13} />
                <span>Need Claim or Return Assistance?</span>
              </div>
              <h3 className="mt-2 text-lg sm:text-xl font-bold">Have Questions About Your Warranty or Return?</h3>
              <p className="mt-1 max-w-xl text-xs sm:text-sm text-slate-300">
                Our customer care representatives are available Monday to Saturday to guide you through inspection, claims, and verified order tracking.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href="tel:+922134960583"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0070f3] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#005bb5] transition cursor-pointer"
              >
                <PhoneCall size={16} />
                <span>+92 21 34960583</span>
              </a>
              <Link
                to="/faqs"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-white/20 transition"
              >
                <span>Read FAQs</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
