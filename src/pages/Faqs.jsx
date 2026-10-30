import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Clock,
  HelpCircle,
  Mail,
  MessageCircle,
  PhoneCall,
  Search,
  Sparkles,
  ThumbsUp,
  X,
  Truck,
  ShieldCheck,
  CreditCard,
  Wrench,
  Boxes,
} from "lucide-react";
import StoreHeader from "../components/StoreHeader";
import { DATA_EVENT } from "../services/storage/storageService";
import { FAQ_CATEGORIES, listFaqs } from "../services/storage/faqService";

const CATEGORY_ICONS = {
  All: Sparkles,
  General: HelpCircle,
  "Orders & Bulk": Boxes,
  "Shipping & Delivery": Truck,
  Payments: CreditCard,
  "Warranty & Returns": ShieldCheck,
  "Technical Support": Wrench,
};

export default function Faqs() {
  const [faqs, setFaqs] = useState(() => listFaqs());
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [openIds, setOpenIds] = useState(() => {
    // Open first 2 pinned FAQs by default
    const initial = listFaqs({ status: "published" });
    return new Set(initial.filter((f) => f.pinned).slice(0, 2).map((f) => f.id));
  });
  const [helpfulMap, setHelpfulMap] = useState({});

  useEffect(() => {
    document.title = "Frequently Asked Questions (FAQs) | Wasooli Store";
  }, []);

  // Listen to storage/admin updates
  useEffect(() => {
    function refresh() {
      setFaqs(listFaqs());
    }
    window.addEventListener(DATA_EVENT, refresh);
    return () => window.removeEventListener(DATA_EVENT, refresh);
  }, []);

  // Filter only published FAQs for storefront
  const publishedFaqs = useMemo(() => {
    return faqs.filter((item) => item.status === "published");
  }, [faqs]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: publishedFaqs.length };
    FAQ_CATEGORIES.forEach((cat) => {
      if (cat !== "All") {
        counts[cat] = publishedFaqs.filter(
          (f) => String(f.category || "").toLowerCase() === cat.toLowerCase()
        ).length;
      }
    });
    return counts;
  }, [publishedFaqs]);

  // Filtered list
  const filteredFaqs = useMemo(() => {
    return publishedFaqs.filter((item) => {
      const matchCat =
        activeCategory === "All" ||
        String(item.category || "").toLowerCase() === activeCategory.toLowerCase();
      if (!matchCat) return false;

      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return (
        item.question?.toLowerCase().includes(q) ||
        item.answer?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
      );
    });
  }, [publishedFaqs, activeCategory, search]);

  const toggleAccordion = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleHelpful = (id) => {
    setHelpfulMap((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800">
      <StoreHeader />

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-linear-to-b from-white via-sky-50/30 to-[#f8fafc] px-4 pt-10 pb-12 sm:px-6 lg:px-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-96 w-full max-w-5xl rounded-full bg-brand-500/8 blur-[110px]"
        />

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/90 px-3.5 py-1 text-[11px] font-bold tracking-[0.16em] uppercase text-brand-600 shadow-2xs">
            <span className="size-1.5 rounded-full bg-brand-500 animate-pulse" />
            <span>Help & Support Center</span>
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-[#0a1e3f] sm:text-4xl lg:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto mt-3.5 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Everything you need to know about purchasing genuine enterprise networking hardware, nationwide shipping, wholesale tier discounts, and warranty services in Pakistan.
          </p>

          {/* Real-time Search Box */}
          <div className="relative mx-auto mt-7 max-w-xl">
            <div className="relative flex items-center">
              <Search
                size={19}
                className="pointer-events-none absolute left-4 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions (e.g. warranty, bulk pricing, COD, delivery)..."
                className="h-12 sm:h-13 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-sm font-medium text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            {search && (
              <p className="mt-2 text-left text-xs text-slate-500">
                Found {filteredFaqs.length} {filteredFaqs.length === 1 ? "answer" : "answers"} for{" "}
                <span className="font-semibold text-slate-800">"{search}"</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
        {/* Category Filter Pills Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FAQ_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat] || HelpCircle;
            const active = activeCategory === cat;
            const count = categoryCounts[cat] ?? 0;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-150 cursor-pointer ${
                  active
                    ? "bg-[#0070f3] text-white shadow-md shadow-blue-500/25"
                    : "border border-slate-200/90 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <Icon size={14} className={active ? "text-white" : "text-brand-500"} />
                <span>{cat}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                    active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* FAQs Accordion List */}
        <div className="mt-6 space-y-3 sm:space-y-3.5">
          {filteredFaqs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <HelpCircle size={40} className="mx-auto text-slate-300" />
              <h3 className="mt-3 text-base font-bold text-slate-900">
                No questions found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                We couldn't find any questions matching "{search}". Try searching for another keyword or browse categories.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveCategory("All");
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-600"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openIds.has(faq.id);
              const isHelpful = helpfulMap[faq.id];

              return (
                <div
                  key={faq.id}
                  className={`group overflow-hidden rounded-2xl border transition-all duration-200 ${
                    isOpen
                      ? "border-sky-300/80 bg-white shadow-md shadow-blue-500/5 ring-1 ring-sky-200"
                      : "border-slate-200/90 bg-white hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  {/* Accordion Trigger */}
                  <button
                    type="button"
                    onClick={() => toggleAccordion(faq.id)}
                    aria-expanded={isOpen}
                    className="flex w-full cursor-pointer items-start justify-between gap-4 p-5 text-left transition sm:p-5.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span
                        className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg text-xs font-bold transition ${
                          isOpen
                            ? "bg-brand-500 text-white"
                            : "bg-slate-100 text-slate-500 group-hover:bg-brand-50 group-hover:text-brand-600"
                        }`}
                      >
                        Q
                      </span>

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                            {faq.category}
                          </span>
                          {faq.pinned && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200/60">
                              <Sparkles size={10} className="text-amber-500" />
                              Popular
                            </span>
                          )}
                        </div>

                        <h3
                          className={`text-sm sm:text-base font-bold transition-colors ${
                            isOpen ? "text-[#0070f3]" : "text-slate-900 group-hover:text-[#0070f3]"
                          }`}
                        >
                          {faq.question}
                        </h3>
                      </div>
                    </div>

                    <div
                      className={`grid size-8 shrink-0 place-items-center rounded-full transition-transform duration-200 ${
                        isOpen ? "rotate-180 bg-brand-50 text-brand-600" : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    >
                      <ChevronDown size={18} />
                    </div>
                  </button>

                  {/* Accordion Answer Content */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="overflow-hidden border-t border-slate-100"
                      >
                        <div className="p-5 sm:p-5.5 pt-4 bg-slate-50/50">
                          <p className="text-xs sm:text-[13.5px] leading-relaxed text-slate-600 whitespace-pre-line">
                            {faq.answer}
                          </p>

                          {/* Was this helpful micro-action */}
                          <div className="mt-4 flex items-center justify-between border-t border-slate-200/70 pt-3">
                            <span className="text-[11px] font-semibold text-slate-400">
                              Category: <span className="text-slate-600">{faq.category}</span>
                            </span>

                            <div className="flex items-center gap-2">
                              {isHelpful ? (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                                  <ThumbsUp size={13} />
                                  Thanks for your feedback!
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleHelpful(faq.id)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-2xs hover:border-brand-300 hover:text-brand-600 active:scale-95 cursor-pointer"
                                >
                                  <ThumbsUp size={12} />
                                  <span>Helpful</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

        {/* Still Have Questions? Contact Box */}
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
            Can't find the answer you're looking for? Reach out to our dedicated networking and enterprise hardware engineers.
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
