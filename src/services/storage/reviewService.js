import { STORAGE_KEYS } from "./adminDataService";

export const REVIEWS_STORAGE_KEY = "wasooli_product_reviews";

function readAllReviews() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((r) => r && !String(r.id || "").startsWith("rev_seed_"));
  } catch {
    return [];
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

export function getProductReviewStats(productId, slug) {
  const reviews = getProductReviews(productId, slug);
  const total = reviews.length;
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  if (total === 0) {
    return {
      reviews: [],
      total: 0,
      rating: 0,
      distribution,
      percentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  let sum = 0;
  reviews.forEach((r) => {
    const star = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5)));
    distribution[star] = (distribution[star] || 0) + 1;
    sum += Number(r.rating) || 5;
  });

  const rawAvg = sum / total;
  const rating = Math.round(rawAvg * 10) / 10;
  const percentages = {
    5: Math.round((distribution[5] / total) * 100),
    4: Math.round((distribution[4] / total) * 100),
    3: Math.round((distribution[3] / total) * 100),
    2: Math.round((distribution[2] / total) * 100),
    1: Math.round((distribution[1] / total) * 100),
  };

  return {
    reviews,
    total,
    rating,
    distribution,
    percentages,
  };
}

export function getProductReviewSummary(productId, slug) {
  const stats = getProductReviewStats(productId, slug);
  return {
    count: stats.total,
    rating: stats.rating,
  };
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

