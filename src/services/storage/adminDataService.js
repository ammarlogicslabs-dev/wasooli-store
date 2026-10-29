import { normalizeBotInstructions } from "../../data/productInstructions";
import {
  hydrateProductList,
  hydrateProductPriceTiers,
  normalizePriceTiers,
  PRICE_TIERS_BOT_KEY,
  validatePriceTiers,
} from "../../utils/priceTiers";
import { apiRequest } from "../api/client";
import { ORDER_FLOW, paymentBucket } from "./orderStatus";

export const STORAGE_KEYS = {
  products: "wasooli_admin_products_v1",
  categories: "wasooli_admin_categories_v1",
  orders: "wasooli_orders",
  inventory: "wasooli_admin_inventory_v1",
  coupons: "wasooli_admin_coupons_v1",
  settings: "wasooli_admin_settings_v1",
  customers: "wasooli_admin_customers_v1",
  notifications: "wasooli_notifications",
  wishlist: "wasooli_wishlist",
};

export const ADMIN_SESSION_KEY = "wasooli_demo_admin_session";

export const DEFAULT_NAVBAR_ANNOUNCEMENTS = [
  "Nationwide delivery on networking cables",
  "Orders packed in 1-2 working days",
  "Standard delivery in 3-5 days",
  "Express in 1-2 days",
];

export const DEFAULT_TOP_BANNER_TEXT =
  "Nationwide delivery on networking cables  ·  Orders packed in 1-2 working days  ·  Standard delivery in 3-5 days  ·  Express in 1-2 days";

export const DEFAULT_FOOTER_ANNOUNCEMENTS = [
  "MON - SAT: 10:00 AM - 8:00 PM | SUN: CLOSED (ONLINE ORDERS 24/7)",
  "PRICES & AVAILABILITY MAY VARY DUE TO CURRENCY & TARIFF FLUCTUATIONS",
  "WASOOLI STORE OPERATES ONLY ONE OFFICIAL PLATFORM — BEWARE OF FAKE CHANNELS",
  "NATIONWIDE 1-2 DAY DISPATCH WITH LIVE TRACKING ACROSS ALL CITIES IN PAKISTAN",
  "100% GENUINE & QUALITY-TESTED NETWORKING HARDWARE WITH OFFICIAL STORE WARRANTY",
];

function readLocalSettings() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.settings);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeLocalSettings(data) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(data));
  } catch {
    // Ignore quota errors
  }
}


const cache = {
  products: [],
  categories: [],
  orders: [],
  customers: [],
  history: [],
  settings: {
    storeName: "Wasooli Store",
    currency: "PKR",
    shippingFee: 200,
    expressShippingFee: 300,
    lowStockThreshold: 5,
    notifyLowStock: true,
    notifyNewOrder: true,
    density: "comfortable",
    bankName: "",
    accountTitle: "",
    accountNumber: "",
    iban: "",
    adminName: "Wasooli Admin",
    adminEmail: "admin@wasooli.store",
    avatarUrl: "",
    topBannerText: DEFAULT_TOP_BANNER_TEXT,
    navbarAnnouncements: DEFAULT_NAVBAR_ANNOUNCEMENTS,
    footerAnnouncements: DEFAULT_FOOTER_ANNOUNCEMENTS,
    ...readLocalSettings(),
  },
  storefront: [],
  coupons: [],
  loaded: false,
};

function emit(key) {
  window.dispatchEvent(new CustomEvent("wasooli-data", { detail: { key } }));
}

function slugify(value) {
  const slug = String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || `item-${Date.now()}`;
}

export async function refreshAdminData() {
  const [products, categories, orders, customers, history, settings, coupons] = await Promise.all([
    apiRequest("/api/admin/products", { kind: "admin" }),
    apiRequest("/api/admin/categories", { kind: "admin" }),
    apiRequest("/api/admin/orders", { kind: "admin" }),
    apiRequest("/api/admin/customers", { kind: "admin" }),
    apiRequest("/api/admin/inventory", { kind: "admin" }),
    apiRequest("/api/settings"),
    apiRequest("/api/admin/coupons", { kind: "admin" }),
  ]);
  cache.products = hydrateProductList(Array.isArray(products) ? products : []);
  cache.categories = Array.isArray(categories) ? categories : [];
  cache.orders = Array.isArray(orders) ? orders : [];
  cache.customers = Array.isArray(customers) ? customers : [];
  cache.history = Array.isArray(history) ? history : [];
  cache.coupons = Array.isArray(coupons) ? coupons : [];
  cache.settings = { ...cache.settings, ...(settings || {}) };
  cache.loaded = true;
  emit(STORAGE_KEYS.products);
  emit(STORAGE_KEYS.coupons);
  return snapshot();
}

export async function refreshStorefrontProducts() {
  const pageSize = 100;
  const items = [];
  let page = 1;

  for (;;) {
    const result = await apiRequest(`/api/products?page=${page}&pageSize=${pageSize}`);
    const batch = Array.isArray(result?.items) ? result.items : [];
    items.push(...batch);
    if (batch.length < pageSize) break;
    page += 1;
  }

  cache.storefront = hydrateProductList(items);
  emit(STORAGE_KEYS.products);
  return cache.storefront;
}

function snapshot() {
  return {
    products: listProducts(),
    categories: listCategories(),
    orders: listOrders(),
    customers: listCustomers(),
    coupons: listCoupons(),
    history: listInventoryHistory(),
    settings: getSettings(),
  };
}

export function listProducts() {
  return hydrateProductList(cache.products)
    .slice()
    .sort((a, b) => String(a.title).localeCompare(String(b.title)));
}

export function getCatalog() {
  return listProducts();
}

export function getStorefrontProducts() {
  const list = cache.storefront.length
    ? cache.storefront
    : cache.products.filter((product) => product.status === "active");
  return hydrateProductList(list);
}

export function getProduct(id) {
  const found = listProducts().find((product) => Number(product.id) === Number(id)) || null;
  return found ? hydrateProductPriceTiers(found) : null;
}

export function listCategories() {
  return cache.categories.map((category) => ({
    ...category,
    productCount:
      category.productCount ??
      listProducts().filter((product) => product.category === category.name && product.status !== "archived").length,
  }));
}

export function getSettings() {
  return { ...cache.settings };
}

export async function saveSettings(patch) {
  const local = readLocalSettings();
  cache.settings = {
    ...cache.settings,
    ...local,
    ...patch,
  };
  writeLocalSettings(cache.settings);
  emit(STORAGE_KEYS.settings);

  try {
    const result = await apiRequest("/api/admin/settings", {
      method: "PUT",
      kind: "admin",
      body: {
        storeName: patch.storeName,
        currency: patch.currency,
        shippingFee: patch.shippingFee,
        expressShippingFee: patch.expressShippingFee,
        lowStockThreshold: patch.lowStockThreshold,
        notifyLowStock: patch.notifyLowStock,
        notifyNewOrder: patch.notifyNewOrder,
        density: patch.density,
        bankName: patch.bankName ?? "",
        accountTitle: patch.accountTitle ?? "",
        accountNumber: patch.accountNumber ?? "",
        iban: patch.iban ?? "",
      },
    });
    const navbarAnnouncements = Array.isArray(patch.navbarAnnouncements)
      ? patch.navbarAnnouncements.map((s) => String(s).trim()).filter(Boolean)
      : (cache.settings.navbarAnnouncements || DEFAULT_NAVBAR_ANNOUNCEMENTS);

    const topBannerText = navbarAnnouncements.length > 0
      ? navbarAnnouncements.join("  ·  ")
      : String(patch.topBannerText ?? cache.settings.topBannerText ?? DEFAULT_TOP_BANNER_TEXT).trim();

    const footerAnnouncements = Array.isArray(patch.footerAnnouncements)
      ? patch.footerAnnouncements.map((s) => String(s).trim()).filter(Boolean)
      : (cache.settings.footerAnnouncements || DEFAULT_FOOTER_ANNOUNCEMENTS);

    cache.settings = {
      ...cache.settings,
      ...(result?.settings || {}),
      navbarAnnouncements,
      topBannerText,
      footerAnnouncements,
    };
    writeLocalSettings(cache.settings);
    emit(STORAGE_KEYS.settings);
    return { ok: true, settings: getSettings() };
  } catch (error) {
    return { ok: true, settings: getSettings(), warning: error.message };
  }
}

export function listOrders() {
  return cache.orders.slice().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

export function getOrder(id) {
  return listOrders().find((order) => String(order.id) === String(id) || String(order.internalId) === String(id)) || null;
}

export function listInventoryHistory() {
  return cache.history.slice();
}

export async function setProductStock(productId, nextStock, reason) {
  try {
    const result = await apiRequest(`/api/admin/inventory/${productId}`, {
      method: "POST",
      kind: "admin",
      body: { quantity: Number(nextStock), reason },
    });
    await refreshAdminData();
    await refreshStorefrontProducts();
    return { ok: true, stock: result.stock };
  } catch (error) {
    return { ok: false, message: error.message || "Could not update stock." };
  }
}

export function recordSaleAdjustments() {
  // Stock adjustments are applied server-side when orders are placed.
}

export async function updateOrder(orderId, changes) {
  try {
    const result = await apiRequest(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
      method: "PUT",
      kind: "admin",
      body: {
        adminStatus: changes.adminStatus,
        note: changes.note,
        courier: changes.courier,
        trackingNumber: changes.trackingNumber,
        paymentStatus: changes.paymentStatus,
      },
    });
    await refreshAdminData();
    return { ok: true, order: result.order };
  } catch (error) {
    return { ok: false, message: error.message || "Could not update order." };
  }
}

const DUMMY_CUSTOMER_KEYS = new Set(["ayesha", "bilal", "sara"]);

function isDummyCustomer(customer) {
  if (!customer) return false;
  const key = String(customer.key || "").trim().toLowerCase();
  const email = String(customer.email || "").trim().toLowerCase();
  return DUMMY_CUSTOMER_KEYS.has(key) || email.endsWith("@example.com");
}

export function listCustomers() {
  return cache.customers.filter((customer) => !isDummyCustomer(customer));
}

export async function setCustomerStatus(key, status) {
  try {
    await apiRequest(`/api/admin/customers/${encodeURIComponent(key)}/status`, {
      method: "PUT",
      kind: "admin",
      body: { status },
    });
    await refreshAdminData();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error.message || "Could not update customer." };
  }
}

export function ordersForCustomer(customer, allOrders = listOrders()) {
  if (!customer) return [];
  return allOrders.filter(
    (order) =>
      order.customerId === customer.id ||
      (customer.phone && order.delivery?.phone === customer.phone) ||
      order.customerEmail === customer.email
  );
}

export function validateProduct(input, products = listProducts()) {
  const errors = {};
  const title = String(input.title || "").trim();
  const sku = String(input.sku || "").trim();
  const category = String(input.category || "").trim();
  const subcategory = String(input.subcategory || "").trim();
  const price = Number(input.price);
  const oldPrice = input.oldPrice === "" || input.oldPrice == null ? null : Number(input.oldPrice);
  const stock = Number(input.stock);
  const slug = slugify(input.slug || title);

  if (!title) errors.title = "Product name is required.";
  if (!sku) errors.sku = "SKU is required.";
  if (!category) errors.category = "Category is required.";
  if (!subcategory) errors.subcategory = "Subcategory is required.";
  if (!input.image) errors.image = "Select a product image.";
  if (!Number.isFinite(price) || price < 0) errors.price = "Enter a valid price.";
  if (oldPrice != null && (!Number.isFinite(oldPrice) || oldPrice < price)) {
    errors.oldPrice = "Compare-at price must be higher than the selling price.";
  }
  if (!Number.isInteger(stock) || stock < 0) errors.stock = "Stock must be a whole number.";
  if (!["active", "draft", "archived"].includes(input.status)) errors.status = "Choose a valid status.";

  const tierError = validatePriceTiers(input.priceTiers);
  if (tierError) errors.priceTiers = tierError;

  const skuTaken = products.some((product) => product.sku.toLowerCase() === sku.toLowerCase() && Number(product.id) !== Number(input.id));
  if (sku && skuTaken) errors.sku = "This SKU is already used.";
  const slugTaken = products.some((product) => product.slug === slug && Number(product.id) !== Number(input.id));
  if (slugTaken) errors.slug = "This product link is already used.";
  return errors;
}

function linesToList(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function toProductPayload(input) {
  const images = (Array.isArray(input.images) ? input.images : linesToList(input.imagesText)).filter(Boolean);
  const primary = String(input.image || images[0] || "").trim();
  const specs = Array.isArray(input.specifications)
    ? input.specifications
    : linesToList(input.specificationsText).map((line) => {
        const [label, ...rest] = line.split("|");
        return { label: label.trim(), value: rest.join("|").trim() };
      }).filter((item) => item.label && item.value);

  const botInstructions = normalizeBotInstructions(input.botInstructions);
  const hasBotContent = Object.values(botInstructions).some((value) => Array.isArray(value) && value.length > 0);
  const priceTiers = normalizePriceTiers(input.priceTiers);
  // Top-level priceTiers is primary (including [] when cleared). Nest under botInstructions for older bots.
  const botPayload = hasBotContent
    ? {
        ...botInstructions,
        ...(priceTiers.length ? { [PRICE_TIERS_BOT_KEY]: priceTiers } : {}),
      }
    : priceTiers.length
      ? { [PRICE_TIERS_BOT_KEY]: priceTiers }
      : null;

  return {
    title: String(input.title).trim(),
    slug: slugify(input.slug || input.title),
    sku: String(input.sku).trim(),
    category: String(input.category).trim(),
    subcategory: String(input.subcategory || "").trim(),
    condition: String(input.condition || "New Product").trim(),
    brand: String(input.brand || "").trim(),
    portType: String(input.portType || "").trim(),
    image: primary,
    images: images.length ? images : [primary],
    price: Number(input.price),
    oldPrice: input.oldPrice === "" || input.oldPrice == null ? null : Number(input.oldPrice),
    stock: Number(input.stock),
    status: input.status,
    shortDescription: String(input.shortDescription || "").trim(),
    description: String(input.description || "").trim(),
    features: Array.isArray(input.features) ? input.features : linesToList(input.featuresText),
    specifications: specs,
    botInstructions: botPayload,
    priceTiers,
    rating: Number(input.rating) || 0,
    reviews: Number(input.reviews) || 0,
  };
}

export async function saveProduct(input) {
  const products = listProducts();
  const errors = validateProduct(input, products);
  if (Object.keys(errors).length) return { ok: false, errors };

  const payload = toProductPayload(input);
  try {
    let result;
    if (input.id) {
      result = await apiRequest(`/api/admin/products/${input.id}`, {
        method: "PUT",
        kind: "admin",
        body: payload,
      });
    } else {
      result = await apiRequest("/api/admin/products", {
        method: "POST",
        kind: "admin",
        body: payload,
      });
    }
    await refreshAdminData();
    await refreshStorefrontProducts();
    return { ok: true, id: result.id };
  } catch (error) {
    return { ok: false, message: error.message, errors: error.data?.errors || {} };
  }
}

export function getCategoryFallbackImage(category) {
  const cat = String(category || "").toLowerCase();
  if (cat.includes("switch")) return "/products/gigabit-switch.jpg";
  if (cat.includes("wireless") || cat.includes("access point")) return "/products/ceiling-access-point.jpg";
  if (cat.includes("cable") || cat.includes("cabling")) return "/products/cat6-cable.jpg";
  if (cat.includes("poe")) return "/products/poe-injector.jpg";
  if (cat.includes("fiber") || cat.includes("optical")) return "/products/media-converter.jpg";
  if (cat.includes("adapter") || cat.includes("nic")) return "/products/pcie-network-card.jpg";
  if (cat.includes("rack") || cat.includes("power")) return "/products/bulk-rack.jpg";
  if (cat.includes("tool")) return "/products/cable-test-2.jpg";
  return "/products/wifi6-router.jpg";
}

export async function bulkSaveProducts(items, onProgress) {
  const existingProducts = listProducts();
  const usedSkus = new Set(existingProducts.map((p) => String(p.sku || "").toLowerCase()));
  const usedSlugs = new Set(existingProducts.map((p) => String(p.slug || "").toLowerCase()));

  const results = {
    total: items.length,
    successCount: 0,
    failedCount: 0,
    errors: [],
  };

  for (let i = 0; i < items.length; i++) {
    const raw = items[i];
    let sku = String(raw.sku || "").trim();
    if (!sku) {
      sku = `WAS-${Date.now().toString(36).toUpperCase()}-${i + 1}`;
    }
    if (usedSkus.has(sku.toLowerCase())) {
      sku = `${sku}-${i + 1}`;
    }
    usedSkus.add(sku.toLowerCase());

    let slug = slugify(raw.slug || raw.title || `product-${Date.now()}-${i + 1}`);
    if (usedSlugs.has(slug)) {
      slug = `${slug}-${i + 1}`;
    }
    usedSlugs.add(slug);

    const price = Math.max(0, Number(raw.price) || 0);
    const rawOldPrice = Number(raw.oldPrice);
    const oldPrice = Number.isFinite(rawOldPrice) && rawOldPrice > price ? rawOldPrice : null;

    const rawStock = Number(raw.stock);
    const stock = Number.isInteger(rawStock) && rawStock >= 0 ? rawStock : 10;

    const category = raw.category || "Routing";
    const productData = {
      ...raw,
      title: String(raw.title || "").trim() || `Imported Product #${i + 1}`,
      sku,
      slug,
      category,
      subcategory: raw.subcategory || "SOHO Home Routers",
      status: raw.status || "active",
      brand: raw.brand || "",
      stock,
      price,
      oldPrice,
      condition: raw.condition || "New Product",
      image: raw.image || getCategoryFallbackImage(category),
    };

    const payload = toProductPayload(productData);

    try {
      await apiRequest("/api/admin/products", {
        method: "POST",
        kind: "admin",
        body: payload,
      });
      results.successCount++;
    } catch (apiErr) {
      console.warn("API saveProduct failed during bulk import, saving locally:", apiErr);
      const mockId = Date.now() + i + 100;
      const localProduct = {
        id: mockId,
        ...payload,
        createdAt: new Date().toISOString(),
      };
      cache.products.push(localProduct);
      results.successCount++;
    }

    if (typeof onProgress === "function") {
      onProgress(i + 1, items.length);
    }
  }

  try {
    await refreshAdminData();
  } catch {
    cache.products = hydrateProductList(cache.products);
  }
  try {
    await refreshStorefrontProducts();
  } catch {
    // ignore
  }

  emit(STORAGE_KEYS.products);

  return results;
}

export async function archiveProduct(id) {
  try {
    await apiRequest(`/api/admin/products/${id}/archive`, { method: "POST", kind: "admin" });
    await refreshAdminData();
    await refreshStorefrontProducts();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error.message || "Product not found." };
  }
}

export async function activateProduct(id) {
  const product = getProduct(id);
  if (!product) return { ok: false, message: "Product not found." };
  return saveProduct({ ...product, status: "active" });
}

export async function deleteProduct(id) {
  try {
    await apiRequest(`/api/admin/products/${id}`, { method: "DELETE", kind: "admin" });
    await refreshAdminData();
    await refreshStorefrontProducts();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error.message || "Product not found." };
  }
}

export async function saveCategory(input) {
  try {
    const body = {
      name: input.name,
      slug: input.slug,
      description: input.description,
      image: input.image,
      status: input.status,
    };
    if (input.id && Number.isFinite(Number(input.id))) {
      await apiRequest(`/api/admin/categories/${input.id}`, { method: "PUT", kind: "admin", body });
    } else {
      await apiRequest("/api/admin/categories", { method: "POST", kind: "admin", body });
    }
    await refreshAdminData();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error.message || "Could not save category." };
  }
}

export async function deleteCategory(id) {
  try {
    await apiRequest(`/api/admin/categories/${id}`, { method: "DELETE", kind: "admin" });
    await refreshAdminData();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error.message || "Could not delete category." };
  }
}

export function listCoupons() {
  return Array.isArray(cache.coupons) ? cache.coupons.slice() : [];
}

export async function saveCoupon(input) {
  const code = String(input.code || "").trim().toUpperCase();
  const type = input.type === "fixed" ? "fixed" : "percent";
  const value = Number(input.value);
  const minOrder = Number(input.minOrder || 0);
  const usageLimit = Number(input.usageLimit);
  const used = Number(input.used || 0);

  if (!/^[A-Z0-9-]{3,20}$/.test(code)) return { ok: false, message: "Use 3–20 letters or numbers for the coupon code." };
  if (type === "percent" && (!Number.isFinite(value) || value <= 0 || value > 100)) {
    return { ok: false, message: "Percentage discount must be between 1 and 100." };
  }
  if (type === "fixed" && (!Number.isFinite(value) || value <= 0)) {
    return { ok: false, message: "Fixed discount must be greater than 0." };
  }
  if (!Number.isFinite(minOrder) || minOrder < 0) return { ok: false, message: "Minimum order cannot be negative." };
  if (!Number.isInteger(usageLimit) || usageLimit < 1) return { ok: false, message: "Usage limit must be at least 1." };
  if (!Number.isInteger(used) || used < 0 || used > usageLimit) {
    return { ok: false, message: "Used count must stay within the usage limit." };
  }
  if (input.startDate && input.expiryDate && input.expiryDate < input.startDate) {
    return { ok: false, message: "Expiry date must be on or after the start date." };
  }

  const body = {
    code,
    type,
    value,
    minOrder,
    startDate: input.startDate || "",
    expiryDate: input.expiryDate || "",
    usageLimit,
    used,
    active: Boolean(input.active),
  };

  try {
    if (input.id && Number.isFinite(Number(input.id))) {
      await apiRequest(`/api/admin/coupons/${input.id}`, { method: "PUT", kind: "admin", body });
    } else {
      await apiRequest("/api/admin/coupons", { method: "POST", kind: "admin", body });
    }
    await refreshAdminData();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error.message || "Could not save coupon." };
  }
}

export async function deleteCoupon(id) {
  try {
    await apiRequest(`/api/admin/coupons/${id}`, { method: "DELETE", kind: "admin" });
    await refreshAdminData();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error.message || "Could not delete coupon." };
  }
}

function inRange(order, days) {
  const created = new Date(order.createdAt).getTime();
  if (Number.isNaN(created)) return false;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return created >= start.getTime();
}

export function getDashboard(days = 30, source = null) {
  const allOrders = Array.isArray(source?.orders) ? source.orders : listOrders();
  const orders = allOrders.filter((order) => inRange(order, days));
  const activeOrders = orders.filter((order) => order.adminStatus !== "cancelled");
  const products = Array.isArray(source?.products) ? source.products : listProducts();
  const customers = Array.isArray(source?.customers) ? source.customers : listCustomers();
  const threshold = (source?.settings || getSettings()).lowStockThreshold;
  const statusCounts = ORDER_FLOW.map((step) => ({
    ...step,
    count: orders.filter((order) => (order.adminStatus || "pending") === step.id).length,
  }));
  statusCounts.push({
    id: "cancelled",
    label: "Cancelled",
    count: orders.filter((order) => order.adminStatus === "cancelled").length,
  });

  const productSales = new Map();
  activeOrders.forEach((order) => {
    (order.items || []).forEach((item) => {
      const current = productSales.get(item.title) || { title: item.title, quantity: 0, revenue: 0, image: item.image || "" };
      current.quantity += Number(item.quantity) || 0;
      current.revenue += (Number(item.price) || 0) * (Number(item.quantity) || 0);
      productSales.set(item.title, current);
    });
  });

  return {
    totalOrders: activeOrders.length,
    sales: activeOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0),
    productCount: products.filter((product) => product.status !== "archived").length,
    customerCount: customers.filter((customer) => customer.status !== "inactive").length,
    statusCounts,
    recent: allOrders.slice(0, 6),
    top: [...productSales.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5),
    lowStock: products.filter((product) => product.status === "active" && product.stock > 0 && product.stock <= threshold),
    outOfStock: products.filter((product) => product.status === "active" && product.stock <= 0),
    chart: [],
  };
}

export async function fetchDashboard(days = 30) {
  return apiRequest(`/api/admin/dashboard?days=${days}`, { kind: "admin" });
}

export function getReports(days = 30, source = null) {
  const dashboard = getDashboard(days, source);
  const allOrders = Array.isArray(source?.orders) ? source.orders : listOrders();
  const orders = allOrders.filter((order) => inRange(order, days));
  const payments = { cod_pending: 0, cod_collected: 0, paid: 0, refunded: 0 };
  orders.forEach((order) => {
    payments[paymentBucket(order)] += Number(order.total) || 0;
  });
  const categorySales = new Map();
  const catalog = Array.isArray(source?.products) ? source.products : listProducts();
  orders.filter((order) => order.adminStatus !== "cancelled").forEach((order) => {
    (order.items || []).forEach((item) => {
      const product = catalog.find((entry) => Number(entry.id) === Number(item.id));
      const category = product?.category || "Other";
      const current = categorySales.get(category) || { category, revenue: 0, quantity: 0 };
      current.quantity += Number(item.quantity) || 0;
      current.revenue += (Number(item.price) || 0) * (Number(item.quantity) || 0);
      categorySales.set(category, current);
    });
  });
  return {
    ...dashboard,
    orders,
    payments,
    categories: [...categorySales.values()].sort((a, b) => b.revenue - a.revenue),
    refunds: orders.filter((order) => order.paymentStatus === "refunded"),
  };
}

export function exportOrdersCsv(orders) {
  const header = ["Order", "Date", "Customer", "City", "Status", "Payment", "Total"];
  const lines = orders.map((order) => [
    order.id,
    order.createdAt || "",
    order.delivery?.fullName || "",
    order.delivery?.city || "",
    order.adminStatus || "pending",
    paymentBucket(order),
    order.total ?? "",
  ]);
  const csv = [header, ...lines]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "wasooli-orders.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function placeOrderApi(payload) {
  return apiRequest("/api/orders", {
    method: "POST",
    kind: "customer",
    body: payload,
  });
}

export async function fetchMyOrders() {
  return apiRequest("/api/orders/mine", { kind: "customer" });
}

export async function fetchPublicSettings() {
  try {
    const settings = await apiRequest("/api/settings");
    const local = readLocalSettings();
    cache.settings = {
      ...cache.settings,
      ...(settings || {}),
      navbarAnnouncements: local.navbarAnnouncements || cache.settings.navbarAnnouncements || DEFAULT_NAVBAR_ANNOUNCEMENTS,
      topBannerText: local.topBannerText || cache.settings.topBannerText,
      footerAnnouncements: local.footerAnnouncements || cache.settings.footerAnnouncements,
    };
    return getSettings();
  } catch {
    return getSettings();
  }
}

export async function fetchSavedAddress() {
  return apiRequest("/api/me/address", { kind: "customer" });
}

export async function saveSavedAddress(address) {
  return apiRequest("/api/me/address", {
    method: "PUT",
    kind: "customer",
    body: {
      fullName: address.fullName,
      phone: address.phone,
      province: address.province,
      city: address.city,
      address: address.address,
      landmark: address.landmark,
      instructions: address.instructions,
      preferredDeliveryMethod: address.delivery || address.preferredDeliveryMethod || "standard",
    },
  });
}

export async function fetchCartApi() {
  return apiRequest("/api/cart", { kind: "customer" });
}

export async function replaceCartApi(items) {
  return apiRequest("/api/cart", {
    method: "PUT",
    kind: "customer",
    body: {
      items: (items || []).map((item) => ({
        productId: Number(item.id ?? item.productId),
        quantity: Number(item.quantity) || 1,
      })),
    },
  });
}

export async function clearCartApi() {
  return apiRequest("/api/cart", { method: "DELETE", kind: "customer" });
}

export async function fetchWishlistApi() {
  return apiRequest("/api/wishlist", { kind: "customer" });
}

export async function addWishlistApi(productId) {
  return apiRequest(`/api/wishlist/${productId}`, { method: "POST", kind: "customer" });
}

export async function removeWishlistApi(productId) {
  return apiRequest(`/api/wishlist/${productId}`, { method: "DELETE", kind: "customer" });
}

export async function fetchNotificationsApi() {
  return apiRequest("/api/notifications", { kind: "customer" });
}

export async function markNotificationReadApi(id) {
  return apiRequest(`/api/notifications/${id}/read`, { method: "POST", kind: "customer" });
}

export async function markAllNotificationsReadApi() {
  return apiRequest("/api/notifications/read-all", { method: "POST", kind: "customer" });
}

export async function validateCouponApi(code, subtotal) {
  return apiRequest("/api/coupons/validate", {
    method: "POST",
    kind: "customer",
    body: { code, subtotal },
  });
}

export async function uploadImage(file, kind = "product") {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest(`/api/uploads?kind=${encodeURIComponent(kind)}`, {
    method: "POST",
    kind: "admin",
    formData,
  });
}

// Unused local helpers kept for import compatibility.
export function readProductState() {
  return { overrides: {}, created: [], deletedIds: [] };
}
export function readStockMap() {
  return {};
}
export function applyLiveStock(product) {
  return product;
}
