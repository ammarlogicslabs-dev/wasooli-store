import { STORAGE_KEYS } from "./adminDataService";

export const REVIEWS_STORAGE_KEY = "wasooli_product_reviews";

const SEED_REVIEWS = [
  {
    id: "rev_seed_1",
    productId: "prod_switch_1",
    productTitle: "24-Port Gigabit Managed Switch",
    rating: 5,
    comment: "Excellent build quality and silent operation. Configured VLANs effortlessly. Dispatched and arrived in Lahore within 2 days.",
    userName: "Muhammad Bilal",
    userEmail: "bilal.net@gmail.com",
    verifiedPurchase: true,
    createdAt: "2026-10-15T10:30:00.000Z",
  },
  {
    id: "rev_seed_2",
    productId: "prod_cable_1",
    productTitle: "Cat6 Pure Copper UTP Cable 305m",
    rating: 5,
    comment: "Tested all 305 meters with Fluke tester — flawless 1Gbps bandwidth and zero packet loss. Original genuine copper drum.",
    userName: "Hamza Tariq",
    userEmail: "hamza.networks@gmail.com",
    verifiedPurchase: true,
    createdAt: "2026-10-18T14:15:00.000Z",
  },
  {
    id: "rev_seed_3",
    productId: "prod_router_1",
    productTitle: "Wi-Fi 6 Dual-Band Gigabit Router",
    rating: 5,
    comment: "Coverage across double-story office is fantastic. Low latency and fast mesh pairing. 100% recommended seller.",
    userName: "Zeeshan Ahmed",
    userEmail: "zeeshan@outlook.com",
    verifiedPurchase: true,
    createdAt: "2026-10-22T09:00:00.000Z",
  },
];

function readAllReviews() {
  if (typeof window === "undefined") return SEED_REVIEWS;
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(SEED_REVIEWS));
      return SEED_REVIEWS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_REVIEWS;
  } catch {
    return SEED_REVIEWS;
  }
}

function writeAllReviews(reviews) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    window.dispatchEvent(new CustomEvent("wasooli-review-added", { detail: reviews }));
  } catch {
    // ignore
  }
}

export function getAllReviews() {
  return readAllReviews();
}

export function getProductReviews(productId, slug) {
  const all = readAllReviews();
  const pid = String(productId || "");
  const pslug = String(slug || "");
  return all
    .filter((r) => {
      if (!r) return false;
      const rid = String(r.productId || "");
      const rslug = String(r.productSlug || "");
      return (pid && (rid === pid || rslug === pid)) || (pslug && (rid === pslug || rslug === pslug));
    })
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

export function getUserReviewedOrderMap(userEmailOrId) {
  const all = readAllReviews();
  const identifier = String(userEmailOrId || "").trim().toLowerCase();
  const map = {};
  all.forEach((r) => {
    if (!r) return;
    const matchUser =
      !identifier ||
      String(r.userEmail || "").trim().toLowerCase() === identifier ||
      String(r.userId || "").trim().toLowerCase() === identifier;

    if (matchUser && r.orderId && r.productId) {
      map[`${r.orderId}_${r.productId}`] = r;
    }
  });
  return map;
}

export function submitReview({
  orderId,
  productId,
  productSlug,
  productTitle,
  productImage,
  rating,
  comment,
  user,
}) {
  const all = readAllReviews();
  const cleanRating = Math.max(1, Math.min(5, Number(rating) || 5));
  const newReview = {
    id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    orderId: String(orderId || ""),
    productId: String(productId || ""),
    productSlug: String(productSlug || ""),
    productTitle: String(productTitle || "Product"),
    productImage: productImage || "",
    rating: cleanRating,
    comment: String(comment || "").trim(),
    userName: user?.name || "Verified Customer",
    userEmail: user?.email || "",
    userId: user?.id || "",
    verifiedPurchase: true,
    createdAt: new Date().toISOString(),
  };

  const updated = [newReview, ...all];
  writeAllReviews(updated);

  // If local products exist, update review count & average rating
  try {
    const rawProds = localStorage.getItem(STORAGE_KEYS.products);
    if (rawProds) {
      const prods = JSON.parse(rawProds);
      if (Array.isArray(prods)) {
        const prodIndex = prods.findIndex(
          (p) => String(p.id) === String(productId) || String(p.slug) === String(productId)
        );
        if (prodIndex >= 0) {
          const productReviews = getProductReviews(productId, productSlug);
          const avgRating =
            productReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) /
            (productReviews.length || 1);
          prods[prodIndex].reviews = productReviews.length;
          prods[prodIndex].rating = Math.round(avgRating * 10) / 10;
          localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(prods));
          window.dispatchEvent(
            new CustomEvent("wasooli-data", { detail: { key: STORAGE_KEYS.products } })
          );
        }
      }
    }
  } catch {
    // non-fatal
  }

  return newReview;
}

