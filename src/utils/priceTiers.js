/**
 * Bulk price tiers: send/read top-level `priceTiers` (including [] when cleared).
 * Nested `botInstructions.priceTiers` remains a fallback for older bot payloads.
 */
export const PRICE_TIERS_BOT_KEY = "priceTiers";

/** Normalize bulk price tiers from API / form input. */
export function normalizePriceTiers(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((tier) => {
      const minQty = Math.max(1, Math.floor(Number(tier?.minQty) || 0));
      const maxRaw = tier?.maxQty;
      const maxQty =
        maxRaw === "" || maxRaw == null || maxRaw === undefined
          ? null
          : Math.floor(Number(maxRaw));
      const price = Number(tier?.price);
      return { minQty, maxQty: Number.isFinite(maxQty) && maxQty > 0 ? maxQty : null, price };
    })
    .filter((tier) => Number.isFinite(tier.minQty) && Number.isFinite(tier.price) && tier.price >= 0)
    .sort((a, b) => a.minQty - b.minQty);
}

export function validatePriceTiers(tiers) {
  if (!Array.isArray(tiers) || tiers.length === 0) return "";

  for (let index = 0; index < tiers.length; index += 1) {
    const tier = tiers[index];
    const minQty = Math.floor(Number(tier?.minQty));
    const price = Number(tier?.price);
    if (!Number.isFinite(minQty) || minQty < 1) {
      return `Tier ${index + 1}: enter a valid min quantity.`;
    }
    if (!Number.isFinite(price) || price < 0) {
      return `Tier ${index + 1}: enter a valid unit price.`;
    }
    const maxRaw = tier?.maxQty;
    if (!(maxRaw === "" || maxRaw == null)) {
      const maxQty = Math.floor(Number(maxRaw));
      if (!Number.isFinite(maxQty) || maxQty < 1) {
        return `Tier ${index + 1}: enter a valid max quantity, or leave it blank for open-ended.`;
      }
    }
  }

  const list = normalizePriceTiers(tiers);
  if (list.length === 0) return "";

  if (list[0].minQty !== 1) {
    return "The first bulk tier must start at quantity 1.";
  }

  for (let index = 0; index < list.length; index += 1) {
    const tier = list[index];
    if (tier.maxQty != null && tier.maxQty < tier.minQty) {
      return `Tier ${index + 1}: max quantity must be ≥ min quantity.`;
    }
    if (index > 0) {
      const prev = list[index - 1];
      const expectedMin = prev.maxQty == null ? null : prev.maxQty + 1;
      if (expectedMin == null) {
        return "Only the last bulk tier can have an open-ended max quantity.";
      }
      if (tier.minQty !== expectedMin) {
        return `Tier ${index + 1} must start at ${expectedMin} (right after the previous tier).`;
      }
    }
    if (index < list.length - 1 && tier.maxQty == null) {
      return "Only the last bulk tier can have an open-ended max quantity.";
    }
  }

  return "";
}

/**
 * Display-only unit price for a quantity (matching tier, else product.price).
 * Checkout place-order sends only { productId, quantity }; the API prices the order.
 */
export function getUnitPrice(product, quantity = 1) {
  const qty = Math.max(1, Math.floor(Number(quantity) || 1));
  const base = Number(product?.price);
  const fallback = Number.isFinite(base) ? base : 0;
  const tiers = normalizePriceTiers(product?.priceTiers);

  if (tiers.length === 0) return fallback;

  const match = tiers.find((tier) => {
    if (qty < tier.minQty) return false;
    if (tier.maxQty == null) return true;
    return qty <= tier.maxQty;
  });

  return match ? match.price : fallback;
}

export function getActiveTier(product) {
  return normalizePriceTiers(product?.priceTiers);
}

export function formatTierRange(tier) {
  if (!tier) return "";
  if (tier.maxQty == null) return `${tier.minQty}+`;
  if (tier.minQty === tier.maxQty) return String(tier.minQty);
  return `${tier.minQty}–${tier.maxQty}`;
}

export function tierLabelForQty(product, quantity) {
  const qty = Math.max(1, Math.floor(Number(quantity) || 1));
  const tiers = getActiveTier(product);
  const match = tiers.find((tier) => {
    if (qty < tier.minQty) return false;
    if (tier.maxQty == null) return true;
    return qty <= tier.maxQty;
  });
  return match ? formatTierRange(match) : null;
}

export function lineTotal(product, quantity) {
  const qty = Math.max(1, Math.floor(Number(quantity) || 1));
  return getUnitPrice(product, qty) * qty;
}

/** Pull tiers from root (preferred, including empty) or botInstructions payload. */
export function extractPriceTiers(product) {
  if (!product || typeof product !== "object") return [];
  if (Array.isArray(product.priceTiers)) {
    return normalizePriceTiers(product.priceTiers);
  }
  const nested = product.botInstructions?.[PRICE_TIERS_BOT_KEY];
  return normalizePriceTiers(nested);
}

/** Attach hydrated priceTiers and strip the nested copy from botInstructions for UI/bot. */
export function hydrateProductPriceTiers(product) {
  if (!product || typeof product !== "object") return product;
  const priceTiers = extractPriceTiers(product);
  const bot = product.botInstructions;
  let botInstructions = bot;
  if (bot && typeof bot === "object" && PRICE_TIERS_BOT_KEY in bot) {
    const rest = { ...bot };
    delete rest[PRICE_TIERS_BOT_KEY];
    botInstructions = rest;
  }
  return {
    ...product,
    priceTiers,
    botInstructions,
  };
}

export function hydrateProductList(list) {
  if (!Array.isArray(list)) return [];
  return list.map(hydrateProductPriceTiers);
}
