import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  MessageSquare,
  Send,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  Loader2,
  ArrowRight,
  Phone,
  Mail,
  MessageCircle,
  Clock,
} from "lucide-react";
import { toast } from "react-toastify";
import StoreHeader from "../components/StoreHeader";

const SUBJECT_OPTIONS = [
  { value: "product_inquiry", label: "Product & Technical Inquiry" },
  { value: "bulk_order", label: "Bulk / Wholesale & ISP Quotation" },
  { value: "order_status", label: "Order Status & Tracking" },
  { value: "warranty_return", label: "Warranty, Return & Replacement" },
  { value: "partnership", label: "Vendor & Partnership" },
  { value: "other", label: "General Feedback / Other" },
];

export default function Contact() {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    document.title = "Contact Us — Wasooli Store | Networking & ISP Supplies";
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "product_inquiry",
    orderNumber: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) {
      errs.name = "Full name is required.";
    } else if (form.name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters.";
    }

    if (!form.email.trim()) {
      errs.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = "Please enter a valid email address.";
    }

    if (form.phone.trim() && !/^(\+92|0)?[0-9]{10,11}$/.test(form.phone.replace(/[\s-]/g, ""))) {
      errs.phone = "Please enter a valid Pakistani phone number (e.g. 0300 1234567).";
    }

    if (!form.message.trim()) {
      errs.message = "Message cannot be empty.";
    } else if (form.message.trim().length < 10) {
      errs.message = "Please describe your inquiry in at least 10 characters.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill in all required fields accurately.");
      return;
    }

    setSubmitting(true);

    // Simulate API submission delay for realistic UX
    await new Promise((resolve) => setTimeout(resolve, 1100));

    setSubmitting(false);
    setSubmitted(true);
    toast.success("Thank you! Your inquiry has been dispatched to our support team.");
  }

  function handleReset() {
    setForm({
      name: "",
      email: "",
      phone: "",
      subject: "product_inquiry",
      orderNumber: "",
      message: "",
    });
    setErrors({});
    setSubmitted(false);
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-800">
      <StoreHeader />

      {/* Main Section: Left Text + Right Form */}
      <section className="relative mx-auto max-w-8xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Subtle decorative background ambient glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-12 left-10 h-72 w-96 rounded-full bg-brand-300/15 blur-3xl"
        />

        <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12 items-start">
          
          {/* Left Column: Heading & Description */}
          <div className="space-y-4 lg:col-span-5 lg:sticky lg:top-28">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
              <Link to="/" className="transition hover:text-brand-600">
                Home
              </Link>
              <ChevronRight size={13} className="text-slate-400" />
              <span className="font-semibold text-slate-800">Contact Us</span>
            </nav>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl leading-[1.15]">
              We&apos;re here to power your <span className="text-brand-600">connections.</span>
            </h1>

            <p className="text-sm sm:text-base leading-relaxed text-slate-600">
              Have questions regarding fiber patch cords, enterprise switches, or large bulk orders?
              Our networking specialists in Karachi are ready to help you with product sizing, specifications, and fast nationwide delivery.
            </p>

            {/* Quick Contact Cards: WhatsApp & Email Only */}
            <div className="pt-2 space-y-3.5">
              {/* WhatsApp & Phone Card */}
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition duration-200 hover:border-emerald-300 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-2xs">
                    <Phone size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                      Phone &amp; WhatsApp
                    </span>
                    <p className="mt-0.5 text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      0300 1234567
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Mon – Sat: 9:00 AM – 8:00 PM (PKT)
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <a
                        href="https://wa.me/923001234567?text=Hi%20Wasooli%20Store%2C%20I%20have%20an%20inquiry%20regarding%20products."
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-600 cursor-pointer"
                      >
                        <MessageCircle size={13} />
                        WhatsApp Chat
                      </a>
                      <a
                        href="tel:03001234567"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                      >
                        <Phone size={12} />
                        Call Direct
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Email Card */}
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition duration-200 hover:border-brand-300 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 border border-brand-100 shadow-2xs">
                    <Mail size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                      Email Inquiries
                    </span>
                    <p className="mt-0.5 text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      support@wasooli.store
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      For quotes: <span className="font-medium text-slate-700">sales@wasooli.store</span>
                    </p>
                   
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
              
              {/* Form Header */}
              <div className="border-b border-slate-100 pb-5">
                
                <h3 className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Leave us a message
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                  Fill out the details below. Our technical sales desk will reply to your email directly.
                </p>
              </div>

              {submitted ? (
                /* Success State */
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="py-10 text-center space-y-4"
                >
                  <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-xs">
                    <CheckCircle2 size={34} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">
                      Message Received!
                    </h4>
                    <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Thank you <span className="font-semibold text-slate-900">{form.name}</span>. We have logged your inquiry regarding{" "}
                      <span className="font-semibold text-slate-900">
                        {SUBJECT_OPTIONS.find((s) => s.value === form.subject)?.label}
                      </span>. A confirmation has been drafted to{" "}
                      <span className="font-semibold text-brand-600">{form.email}</span>.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 max-w-md mx-auto text-left text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-500">
                      <span>Sender:</span>
                      <span className="font-medium text-slate-800">{form.name}</span>
                    </div>
                    {form.phone && (
                      <div className="flex justify-between text-slate-500">
                        <span>Phone / WhatsApp:</span>
                        <span className="font-medium text-slate-800">{form.phone}</span>
                      </div>
                    )}
                    {form.orderNumber && (
                      <div className="flex justify-between text-slate-500">
                        <span>Referenced Order:</span>
                        <span className="font-mono font-medium text-slate-800">{form.orderNumber}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-500">
                      <span>Expected Response:</span>
                      <span className="font-semibold text-emerald-600">Within 1–2 Business Hours</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/25 transition hover:bg-brand-600 cursor-pointer"
                    >
                      <span>Send Another Inquiry</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Contact Form */
                <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Full Name */}
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-800 mb-1.5">
                        Your Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g. Muhammad Ali"
                        className={`w-full rounded-xl border bg-slate-50/60 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 transition placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 ${
                          errors.name
                            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                            : "border-slate-200 focus:border-brand-400 focus:ring-brand-100"
                        }`}
                      />
                      {errors.name && (
                        <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-500">
                          <AlertCircle size={12} />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Email Address */}
                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-800 mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="ali@example.com"
                        className={`w-full rounded-xl border bg-slate-50/60 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 transition placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 ${
                          errors.email
                            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                            : "border-slate-200 focus:border-brand-400 focus:ring-brand-100"
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-500">
                          <AlertCircle size={12} />
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Phone / WhatsApp */}
                    <div>
                      <label htmlFor="contact-phone" className="block text-xs font-semibold text-slate-800 mb-1.5">
                        Phone / WhatsApp <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="0300 1234567"
                        className={`w-full rounded-xl border bg-slate-50/60 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 transition placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 ${
                          errors.phone
                            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                            : "border-slate-200 focus:border-brand-400 focus:ring-brand-100"
                        }`}
                      />
                      {errors.phone && (
                        <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-500">
                          <AlertCircle size={12} />
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    {/* Order Number (Optional) */}
                    <div>
                      <label htmlFor="contact-order" className="block text-xs font-semibold text-slate-800 mb-1.5">
                        Order # <span className="text-slate-400 font-normal">(If applicable)</span>
                      </label>
                      <input
                        id="contact-order"
                        type="text"
                        name="orderNumber"
                        value={form.orderNumber}
                        onChange={handleChange}
                        placeholder="e.g. WAS-10492"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 transition placeholder:text-slate-400 focus:bg-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                      />
                    </div>
                  </div>

                  {/* Subject Dropdown */}
                  <div>
                    <label htmlFor="contact-subject" className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Subject / Inquiry Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="contact-subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 transition focus:bg-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 cursor-pointer"
                    >
                      {SUBJECT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-800">
                        Message &amp; Project Details <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] text-slate-400">
                        {form.message.length} chars
                      </span>
                    </div>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Please specify hardware specifications, required quantities, destination city, or your inquiry details here..."
                      className={`w-full rounded-xl border bg-slate-50/60 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 transition placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 ${
                        errors.message
                          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                          : "border-slate-200 focus:border-brand-400 focus:ring-brand-100"
                      }`}
                    />
                    {errors.message && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-500">
                        <AlertCircle size={12} />
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-brand-500 px-7 py-3 text-sm font-bold text-white shadow-md shadow-brand-500/25 transition hover:bg-brand-600 hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Sending message...</span>
                        </>
                      ) : (
                        <>
                          <Send size={15} />
                          <span>Submit Inquiry</span>
                        </>
                      )}
                    </button>
                    <p className="mt-2.5 text-[11px] text-slate-400">
                      By submitting, you agree to our{" "}
                      <Link to="/terms" className="underline hover:text-slate-600">
                        Terms of Service
                      </Link>{" "}
                      and store policies.
                    </p>
                  </div>
                </form>
              )}

            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
