import { readJson, writeJson } from "./storageService";

export const FAQ_STORAGE_KEY = "wasooli_faqs_v1";

export const FAQ_CATEGORIES = [
  "All",
  "General",
  "Orders & Bulk",
  "Shipping & Delivery",
  "Payments",
  "Warranty & Returns",
  "Technical Support",
];

export const DEFAULT_FAQS = [
  {
    id: "faq-1",
    question: "What is Wasooli Store and what products do you sell?",
    answer:
      "Wasooli Store is Pakistan's dedicated B2B and direct-to-consumer destination for genuine enterprise networking equipment. Our catalog includes managed & unmanaged Gigabit/PoE switches, enterprise routers, Wi-Fi 6/7 access points, Cat6/Cat8 network cables, optical transceivers, server racks, and termination tools.",
    category: "General",
    status: "published",
    pinned: true,
    order: 1,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "faq-2",
    question: "Are all products 100% genuine and original?",
    answer:
      "Yes, 100%. We have zero tolerance for counterfeit or refurbished clones. Every product is sourced directly through verified authorized distributor channels from leading global brands including Cisco, MikroTik, TP-Link, Ubiquiti, Huawei, and CommScope.",
    category: "General",
    status: "published",
    pinned: true,
    order: 2,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "faq-3",
    question: "Do you provide official GST sales tax invoices for corporate buyers?",
    answer:
      "Yes! Every commercial order comes with an official FBR-compliant GST sales tax invoice. During checkout, businesses can provide their Registered Company Name, NTN, and STRN. For enterprise procurement or advance tender quotes, contact sales@wasooli.store.",
    category: "General",
    status: "published",
    pinned: false,
    order: 3,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "faq-4",
    question: "How do automated tiered wholesale discounts work?",
    answer:
      "We provide automatic volume-based wholesale pricing. When you add 5+, 10+, or 50+ units (or multiple Cat6 305m cable drums) to your shopping cart, the discounted unit rate applies immediately at checkout without needing to contact sales or enter promo codes.",
    category: "Orders & Bulk",
    status: "published",
    pinned: true,
    order: 4,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "faq-5",
    question: "Can I order custom patch cable lengths?",
    answer:
      "Yes. While we stock standard factory patch cords (0.5m, 1m, 2m, 3m, 5m, 10m, 15m), our technical team can terminate custom length snagless Cat6 and Cat6A patch leads with boot protectors and gold-plated RJ45 connectors for specific data rack configurations.",
    category: "Orders & Bulk",
    status: "published",
    pinned: false,
    order: 5,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "faq-6",
    question: "How can I track my active order shipment?",
    answer:
      "As soon as your shipment is dispatched from our central warehouse, an automated SMS and email containing your courier tracking number will be sent. You can also view live delivery status under 'Account > Orders' on our website.",
    category: "Orders & Bulk",
    status: "published",
    pinned: false,
    order: 6,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "faq-7",
    question: "What are your delivery charges and delivery times across Pakistan?",
    answer:
      "We offer Free Standard Delivery nationwide on all orders over Rs. 5,000. For orders under Rs. 5,000, flat delivery is Rs. 200 (delivered within 3–5 business days). Major metropolitan cities (Karachi, Lahore, Islamabad/Rawalpindi) usually receive delivery within 24–48 hours.",
    category: "Shipping & Delivery",
    status: "published",
    pinned: true,
    order: 7,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "faq-8",
    question: "Do you deliver to smaller cities, towns, and remote areas?",
    answer:
      "Yes. We deliver to over 250+ cities, towns, and industrial zones across all four provinces, Azad Kashmir, and Gilgit-Baltistan through premier logistic partners including TCS, Leopards, and Wasooli Express.",
    category: "Shipping & Delivery",
    status: "published",
    pinned: false,
    order: 8,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "faq-9",
    question: "How is delicate and heavy networking hardware packaged?",
    answer:
      "All routers, sensitive PoE switches, and optical fiber reels are enclosed in thick industrial bubble wrap, reinforced corner protectors, and heavy double-wall corrugated shipping boxes to guarantee zero-damage transit.",
    category: "Shipping & Delivery",
    status: "published",
    pinned: false,
    order: 9,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "faq-10",
    question: "What payment methods do you support?",
    answer:
      "We support Cash on Delivery (COD) nationwide, Direct Bank Transfer (IBFT/Raast) to our corporate Meezan/HBL bank accounts, and Advance Corporate Purchase Orders for registered companies.",
    category: "Payments",
    status: "published",
    pinned: true,
    order: 10,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "faq-11",
    question: "Is Cash on Delivery (COD) available for high-value orders?",
    answer:
      "Cash on Delivery is available for orders up to Rs. 50,000. For enterprise orders exceeding Rs. 50,000, we require a minimum 20% advance confirmation deposit or full payment via Online Bank Transfer (IBFT) before pallet dispatch.",
    category: "Payments",
    status: "published",
    pinned: false,
    order: 11,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "faq-12",
    question: "What is your hardware warranty and replacement policy?",
    answer:
      "All active networking equipment (switches, routers, access points, injectors) comes with an official 1-Year brand warranty. We also provide a 7-day hassle-free replacement period if any item arrives damaged or non-functional.",
    category: "Warranty & Returns",
    status: "published",
    pinned: true,
    order: 12,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "faq-13",
    question: "How do I claim a return, exchange, or warranty?",
    answer:
      "Log into your Account, navigate to 'Orders', and click 'Request Return/Claim' on the relevant invoice. Alternatively, contact our WhatsApp customer care at 0300 1234567 with photos/videos of the serial number and issue. Our technical team responds within 24 hours.",
    category: "Warranty & Returns",
    status: "published",
    pinned: false,
    order: 13,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "faq-14",
    question: "Can Wasooli network engineers help me plan my infrastructure?",
    answer:
      "Yes! Our in-house certified network engineers provide complimentary pre-sales architectural guidance. Whether you are wiring a multi-floor commercial building, setting up high-density Wi-Fi, or planning an ISP distribution node, we can recommend the optimal hardware stack.",
    category: "Technical Support",
    status: "published",
    pinned: false,
    order: 14,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "faq-15",
    question: "How can I contact Wasooli Customer Care?",
    answer:
      "You can contact us 6 days a week (Mon–Sat 10:00 AM – 10:00 PM) via Phone/WhatsApp at 0300 1234567 or email us at support@wasooli.store. Our online store and technical ticketing system are available 24/7.",
    category: "Technical Support",
    status: "published",
    pinned: true,
    order: 15,
    updatedAt: new Date().toISOString(),
  },
];

/** Read all FAQs from storage (with fallback to default) */
export function listFaqs({ category, search, status } = {}) {
  const all = readJson(FAQ_STORAGE_KEY, DEFAULT_FAQS);
  if (!Array.isArray(all) || all.length === 0) {
    writeJson(FAQ_STORAGE_KEY, DEFAULT_FAQS, { silent: true });
    return filterFaqs(DEFAULT_FAQS, { category, search, status });
  }
  return filterFaqs(all, { category, search, status });
}

function filterFaqs(list, { category, search, status }) {
  let result = [...list];

  if (category && category !== "All") {
    result = result.filter(
      (item) => String(item.category || "").toLowerCase() === category.toLowerCase()
    );
  }

  if (status && status !== "all") {
    result = result.filter((item) => item.status === status);
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    result = result.filter(
      (item) =>
        item.question?.toLowerCase().includes(q) ||
        item.answer?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
    );
  }

  // Sort by pinned first, then order, then id
  return result.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return (a.order ?? 999) - (b.order ?? 999);
  });
}

/** Get a single FAQ by ID */
export function getFaq(id) {
  const all = listFaqs();
  return all.find((item) => String(item.id) === String(id)) || null;
}

/** Save or update an FAQ */
export async function saveFaq(input) {
  const question = String(input.question || "").trim();
  const answer = String(input.answer || "").trim();
  const category = String(input.category || "General").trim();
  const status = input.status === "draft" ? "draft" : "published";
  const pinned = Boolean(input.pinned);
  const order = Number.isFinite(Number(input.order)) ? Number(input.order) : 10;

  if (!question) {
    return { ok: false, message: "Please enter the FAQ question." };
  }
  if (!answer) {
    return { ok: false, message: "Please enter the answer for this question." };
  }

  const all = readJson(FAQ_STORAGE_KEY, DEFAULT_FAQS);
  const existingIndex = input.id ? all.findIndex((item) => String(item.id) === String(input.id)) : -1;

  const now = new Date().toISOString();
  if (existingIndex >= 0) {
    all[existingIndex] = {
      ...all[existingIndex],
      question,
      answer,
      category,
      status,
      pinned,
      order,
      updatedAt: now,
    };
  } else {
    const newId = `faq-${Date.now()}`;
    all.push({
      id: newId,
      question,
      answer,
      category,
      status,
      pinned,
      order,
      updatedAt: now,
    });
  }

  writeJson(FAQ_STORAGE_KEY, all);
  return { ok: true };
}

/** Delete an FAQ by ID */
export async function deleteFaq(id) {
  const all = readJson(FAQ_STORAGE_KEY, DEFAULT_FAQS);
  const next = all.filter((item) => String(item.id) !== String(id));
  if (next.length === all.length) {
    return { ok: false, message: "FAQ not found." };
  }
  writeJson(FAQ_STORAGE_KEY, next);
  return { ok: true };
}

/** Quick toggle published/draft */
export async function toggleFaqStatus(id) {
  const all = readJson(FAQ_STORAGE_KEY, DEFAULT_FAQS);
  const target = all.find((item) => String(item.id) === String(id));
  if (!target) return { ok: false, message: "FAQ not found." };
  target.status = target.status === "draft" ? "published" : "draft";
  target.updatedAt = new Date().toISOString();
  writeJson(FAQ_STORAGE_KEY, all);
  return { ok: true, status: target.status };
}

/** Quick toggle pinned */
export async function toggleFaqPinned(id) {
  const all = readJson(FAQ_STORAGE_KEY, DEFAULT_FAQS);
  const target = all.find((item) => String(item.id) === String(id));
  if (!target) return { ok: false, message: "FAQ not found." };
  target.pinned = !target.pinned;
  target.updatedAt = new Date().toISOString();
  writeJson(FAQ_STORAGE_KEY, all);
  return { ok: true, pinned: target.pinned };
}

/** Reset to defaults */
export function resetDefaultFaqs() {
  writeJson(FAQ_STORAGE_KEY, DEFAULT_FAQS);
  return { ok: true };
}
