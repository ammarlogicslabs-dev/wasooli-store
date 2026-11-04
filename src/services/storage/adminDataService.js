import { normalizeBotInstructions } from "../../data/productInstructions";
import { CANONICAL_CATEGORIES } from "../../data/categories";
import {
  hydrateProductList,
  hydrateProductPriceTiers,
  normalizePriceTiers,
  PRICE_TIERS_BOT_KEY,
  validatePriceTiers,
} from "../../utils/priceTiers";
import { apiRequest, getToken } from "../api/client";
import { ORDER_FLOW, paymentBucket, statusLabel, PAYMENT_LABELS } from "./orderStatus";

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

export {
  FAQ_CATEGORIES,
  DEFAULT_FAQS,
  listFaqs,
  getFaq,
  saveFaq,
  deleteFaq,
  toggleFaqStatus,
  toggleFaqPinned,
  resetDefaultFaqs,
} from "./faqService";

export const DEFAULT_NAVBAR_ANNOUNCEMENTS = [
  "Nationwide delivery on networking cables",
  "Orders packed in 1-2 working days",
  "Standard delivery in 3-5 days",
  "Express in 1-2 days",
];

export const DEFAULT_TOP_BANNER_TEXT =
  "Nationwide delivery on networking cables  ·  Orders packed in 1-2 working days  ·  Standard delivery in 3-5 days  ·  Express in 1-2 days";

export const DEFAULT_FOOTER_ANNOUNCEMENTS = [
  "MON - SAT: 10:00 AM - 10:00 PM | SUN: CLOSED (ONLINE ORDERS 24/7)",
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

function readLocalCoupons() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.coupons);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalCoupons(data) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.coupons, JSON.stringify(data));
  } catch {
    // Ignore quota errors
  }
}

export const CREATED_USERS_KEY = "wasooli_created_users_v1";

export function readCreatedUsers() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CREATED_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function writeCreatedUsers(users) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CREATED_USERS_KEY, JSON.stringify(users));
  } catch {
    // Ignore quota errors
  }
}

export function readLocalCustomers() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.customers);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function writeLocalCustomers(data) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(data));
  } catch {
    // Ignore quota errors
  }
}

export const DELETED_CATEGORIES_KEY = "wasooli_admin_deleted_categories_v1";
export const ARCHIVED_CATEGORIES_KEY = "wasooli_admin_archived_categories_v1";

export function readDeletedCategoryKeys() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DELETED_CATEGORIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function writeDeletedCategoryKeys(keys) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DELETED_CATEGORIES_KEY, JSON.stringify(keys));
  } catch {
    // Ignore quota errors
  }
}

export function readArchivedCategoryKeys() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ARCHIVED_CATEGORIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function writeArchivedCategoryKeys(keys) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ARCHIVED_CATEGORIES_KEY, JSON.stringify(keys));
  } catch {
    // Ignore quota errors
  }
}

export function isCategoryDeleted(category, deletedKeys = readDeletedCategoryKeys()) {
  if (!category) return false;
  const set = new Set(deletedKeys.map((k) => String(k).trim().toLowerCase()));
  if (typeof category === "string") {
    return set.has(category.trim().toLowerCase());
  }
  const id = category.id != null ? String(category.id).trim().toLowerCase() : "";
  const name = category.name ? String(category.name).trim().toLowerCase() : "";
  const slug = category.slug ? String(category.slug).trim().toLowerCase() : "";
  return Boolean((id && set.has(id)) || (name && set.has(name)) || (slug && set.has(slug)));
}

export function isCategoryArchived(category, archivedKeys = readArchivedCategoryKeys()) {
  if (!category) return false;
  if (typeof category === "object" && category !== null && category.status === "archived") {
    return true;
  }
  const set = new Set(archivedKeys.map((k) => String(k).trim().toLowerCase()));
  if (typeof category === "string") {
    return set.has(category.trim().toLowerCase());
  }
  const id = category.id != null ? String(category.id).trim().toLowerCase() : "";
  const name = category.name ? String(category.name).trim().toLowerCase() : "";
  const slug = category.slug ? String(category.slug).trim().toLowerCase() : "";
  return Boolean((id && set.has(id)) || (name && set.has(name)) || (slug && set.has(slug)));
}

export function isCategoryHidden(category) {
  return isCategoryDeleted(category) || isCategoryArchived(category);
}

export function readLocalCategories() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.categories);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function writeLocalCategories(data) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(data));
  } catch {
    // Ignore quota errors
  }
}

export function filterActiveCategories(categoriesList) {
  if (!Array.isArray(categoriesList)) return [];
  const deletedKeys = readDeletedCategoryKeys();
  if (!deletedKeys.length) return categoriesList;
  return categoriesList.filter((category) => !isCategoryDeleted(category, deletedKeys));
}


const cache = {
  products: [],
  categories: filterActiveCategories(readLocalCategories()),
  orders: [],
  customers: readLocalCustomers(),
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
  coupons: readLocalCoupons(),
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
  const incomingCategories = Array.isArray(categories) && categories.length > 0 ? categories : readLocalCategories();
  const archivedKeys = new Set(readArchivedCategoryKeys().map((k) => String(k).trim().toLowerCase()));
  const mergedCategories = incomingCategories.map((c) => {
    const isArch =
      c.status === "archived" ||
      isCategoryArchived(c, Array.from(archivedKeys));
    if (isArch) {
      if (c.name) archivedKeys.add(String(c.name).toLowerCase());
      if (c.id != null) archivedKeys.add(String(c.id).toLowerCase());
      if (c.slug) archivedKeys.add(String(c.slug).toLowerCase());
    }
    return {
      ...c,
      status: isArch ? "archived" : (c.status || "active"),
    };
  });
  writeArchivedCategoryKeys(Array.from(archivedKeys));
  cache.categories = filterActiveCategories(mergedCategories);
  writeLocalCategories(cache.categories);
  cache.orders = Array.isArray(orders) ? orders : [];
  const incomingCustomers = Array.isArray(customers) && customers.length > 0 ? customers : readLocalCustomers();
  const createdUsers = readCreatedUsers();
  const customerMap = new Map();
  incomingCustomers.forEach((c) => {
    if (c?.key) customerMap.set(c.key, c);
  });
  createdUsers.forEach((u) => {
    if (u?.key) {
      if (!customerMap.has(u.key)) {
        customerMap.set(u.key, u);
      } else {
        customerMap.set(u.key, { ...customerMap.get(u.key), ...u });
      }
    }
  });
  cache.customers = Array.from(customerMap.values());
  writeLocalCustomers(cache.customers);
  cache.history = Array.isArray(history) ? history : [];
  cache.coupons = Array.isArray(coupons) ? coupons : [];
  writeLocalCoupons(cache.coupons);
  cache.settings = { ...cache.settings, ...(settings || {}) };
  cache.loaded = true;
  emit(STORAGE_KEYS.products);
  emit(STORAGE_KEYS.categories);
  emit(ARCHIVED_CATEGORIES_KEY);
  emit(STORAGE_KEYS.coupons);
  emit(STORAGE_KEYS.customers);
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

export async function refreshStorefrontCategories() {
  try {
    const list = await apiRequest("/api/categories");
    if (Array.isArray(list) && list.length > 0) {
      const archivedKeys = new Set(readArchivedCategoryKeys().map((k) => String(k).trim().toLowerCase()));
      const merged = list.map((c) => {
        const isArch = c.status === "archived" || isCategoryArchived(c, Array.from(archivedKeys));
        return {
          ...c,
          status: isArch ? "archived" : (c.status || "active"),
        };
      });
      cache.categories = filterActiveCategories(merged);
      writeLocalCategories(cache.categories);
      emit(STORAGE_KEYS.categories);
      return cache.categories;
    }
  } catch (error) {
    console.warn("Could not fetch storefront categories:", error);
  }
  return getStorefrontCategories();
}

export function getStorefrontCategories() {
  const local = readLocalCategories();
  const list =
    Array.isArray(cache.categories) && cache.categories.length > 0
      ? cache.categories
      : Array.isArray(local) && local.length > 0
      ? local
      : [];

  const active = filterActiveCategories(list).filter((c) => !isCategoryHidden(c));
  if (active.length > 0) {
    return active;
  }

  return CANONICAL_CATEGORIES.filter((cat) => !isCategoryHidden(cat)).map((name) => ({
    name,
    slug: slugify(name),
    status: "active",
  }));
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
  return filterActiveCategories(cache.categories).map((category) => ({
    ...category,
    status: isCategoryArchived(category) ? "archived" : (category.status || "active"),
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
  const list = Array.isArray(cache.customers) && cache.customers.length > 0 ? cache.customers : readLocalCustomers();
  return list.filter((customer) => !isDummyCustomer(customer));
}

export async function saveCustomer(input) {
  const name = String(input.name || "").trim();
  const email = String(input.email || "").trim().toLowerCase();
  const phone = String(input.phone || "").trim();
  const password = String(input.password || "").trim();
  const city = String(input.city || "").trim();
  const address = String(input.address || "").trim();
  const role = input.role || "Customer";
  const status = input.status || "active";

  if (!name) return { ok: false, message: "Please enter the customer's name." };
  if (!email && !phone) return { ok: false, message: "Please provide either an email or a phone number." };

  const existingCustomers = listCustomers();
  const duplicate = existingCustomers.find(
    (c) => (email && c.email?.toLowerCase() === email) || (phone && c.phone && c.phone === phone)
  );
  if (duplicate && duplicate.key !== input.key) {
    return { ok: false, message: "A user with this email or phone number already exists." };
  }

  const key =
    input.key ||
    (email ? email.split("@")[0].replace(/[^a-z0-9]/g, "-") : phone.replace(/[^0-9]/g, "")) +
      "-" +
      Date.now().toString(36);
  const id = input.id || `cust_${Date.now()}`;

  const customerRecord = {
    key,
    id,
    name,
    email,
    phone,
    city: city || "Karachi",
    address: address || "",
    role,
    status,
    orders: Number(input.orders) || 0,
    spent: Number(input.spent) || 0,
    createdAt: input.createdAt || new Date().toISOString(),
  };

  // 1. Save in created users store (with password for login)
  const createdUsers = readCreatedUsers();
  const userIndex = createdUsers.findIndex((u) => u.key === key || (email && u.email?.toLowerCase() === email));
  const authRecord = {
    ...customerRecord,
    password: password || (userIndex >= 0 ? createdUsers[userIndex].password : "wasooli123"),
  };

  if (userIndex >= 0) {
    createdUsers[userIndex] = authRecord;
  } else {
    createdUsers.unshift(authRecord);
  }
  writeCreatedUsers(createdUsers);

  // 2. Update in cache and local storage
  const custIndex = cache.customers.findIndex((c) => c.key === key);
  if (custIndex >= 0) {
    cache.customers[custIndex] = customerRecord;
  } else {
    cache.customers.unshift(customerRecord);
  }
  writeLocalCustomers(cache.customers);
  emit(STORAGE_KEYS.customers);

  // 3. Attempt API request if supported
  try {
    await apiRequest("/api/admin/customers", {
      method: "POST",
      kind: "admin",
      body: customerRecord,
    });
  } catch {
    // API 405/404 handled gracefully
  }

  return { ok: true, customer: customerRecord };
}

export async function deleteCustomer(key) {
  cache.customers = cache.customers.filter((c) => c.key !== key);
  writeLocalCustomers(cache.customers);

  const createdUsers = readCreatedUsers().filter((u) => u.key !== key);
  writeCreatedUsers(createdUsers);

  emit(STORAGE_KEYS.customers);

  try {
    await apiRequest(`/api/admin/customers/${encodeURIComponent(key)}`, {
      method: "DELETE",
      kind: "admin",
    });
  } catch {
    // handled
  }

  return { ok: true };
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
  const brand = String(input.brand || "").trim();
  const price = Number(input.price);
  const oldPrice = input.oldPrice === "" || input.oldPrice == null ? null : Number(input.oldPrice);
  const stock = Number(input.stock);
  const slug = slugify(input.slug || title);
  const image = input.image || (Array.isArray(input.images) && input.images[0]);

  if (!title) errors.title = "Product name is required.";
  if (!sku) errors.sku = "SKU is required.";
  if (!category) errors.category = "Category is required.";
  if (!brand) errors.brand = "Brand name is required.";
  if (!image) errors.image = "Select a product image.";
  if (!Number.isFinite(price) || price < 0) errors.price = "Enter a valid price.";
  if (oldPrice != null && (!Number.isFinite(oldPrice) || oldPrice < price)) {
    errors.oldPrice = "Compare-at price must be higher than the selling price.";
  }
  if (!Number.isInteger(stock) || stock < 0) errors.stock = "Stock must be a whole number.";
  if (!["active", "draft", "archived"].includes(input.status)) errors.status = "Choose a valid status.";

  const tierError = validatePriceTiers(input.priceTiers);
  if (tierError) errors.priceTiers = tierError;

  const currentId = input.id != null ? String(input.id) : null;

  if (title && brand) {
    const cleanTitle = title.toLowerCase().replace(/\s+/g, " ");
    const cleanBrand = brand.toLowerCase().replace(/\s+/g, " ");
    const nameBrandTaken = products.some(
      (product) =>
        String(product.id) !== currentId &&
        String(product.title || "").trim().toLowerCase().replace(/\s+/g, " ") === cleanTitle &&
        String(product.brand || "").trim().toLowerCase().replace(/\s+/g, " ") === cleanBrand
    );
    if (nameBrandTaken) {
      const duplicateMsg = "A product with this name and brand already exists.";
      errors.title = duplicateMsg;
      errors.brand = duplicateMsg;
    }
  }

  const skuTaken = products.some(
    (product) =>
      product.sku &&
      String(product.sku).toLowerCase() === sku.toLowerCase() &&
      String(product.id) !== currentId
  );
  if (sku && skuTaken) errors.sku = "This SKU is already used.";
  const slugTaken = products.some(
    (product) =>
      product.slug &&
      product.slug === slug &&
      String(product.id) !== currentId
  );
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
  if (Object.keys(errors).length) {
    const firstError = Object.values(errors)[0];
    return { ok: false, errors, message: firstError };
  }

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
  const usedNameBrands = new Set(
    existingProducts.map(
      (p) => `${String(p.title || "").trim().toLowerCase().replace(/\s+/g, " ")}:::${String(p.brand || "").trim().toLowerCase().replace(/\s+/g, " ")}`
    )
  );

  const results = {
    total: items.length,
    successCount: 0,
    failedCount: 0,
    errors: [],
  };

  for (let i = 0; i < items.length; i++) {
    const raw = items[i];

    const cleanRawTitle = String(raw.title || "").trim().toLowerCase().replace(/\s+/g, " ");
    const cleanRawBrand = String(raw.brand || "Generic").trim().toLowerCase().replace(/\s+/g, " ");
    const nameBrandKey = `${cleanRawTitle}:::${cleanRawBrand}`;

    if (cleanRawTitle && cleanRawBrand && usedNameBrands.has(nameBrandKey)) {
      results.failedCount++;
      results.errors.push(`Row ${i + 1}: Product with name "${raw.title}" and brand "${raw.brand || "Generic"}" already exists.`);
      continue;
    }
    usedNameBrands.add(nameBrandKey);

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
      brand: raw.brand || "Generic",
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

export async function activateProduct(id, fallbackProduct = null) {
  const product = fallbackProduct || getProduct(id);
  if (!product) return { ok: false, message: "Product not found." };

  const primaryImage = product.image || (Array.isArray(product.images) && product.images[0]) || "";
  const images = Array.isArray(product.images) && product.images.length
    ? product.images
    : (primaryImage ? [primaryImage] : []);

  const payload = toProductPayload({
    ...product,
    image: primaryImage,
    images,
    status: "active",
  });

  try {
    await apiRequest(`/api/admin/products/${id}`, {
      method: "PUT",
      kind: "admin",
      body: payload,
    });
    await refreshAdminData();
    await refreshStorefrontProducts();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error.message || "Could not update the product." };
  }
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
    const isArchived = input.status === "archived";
    const body = {
      name: input.name,
      slug: input.slug,
      description: input.description,
      image: input.image,
      status: input.status,
    };

    // If this category was previously marked as deleted, un-mark it so it can be restored/re-added
    const deletedKeys = readDeletedCategoryKeys();
    if (deletedKeys.length > 0) {
      const toRemove = new Set(
        [input.id != null ? String(input.id) : null, input.slug, input.name]
          .filter(Boolean)
          .map((s) => String(s).trim().toLowerCase())
      );
      const nextKeys = deletedKeys.filter((k) => !toRemove.has(String(k).trim().toLowerCase()));
      if (nextKeys.length !== deletedKeys.length) {
        writeDeletedCategoryKeys(nextKeys);
      }
    }

    // Handle archived status tracking
    const currentArchived = readArchivedCategoryKeys();
    const archivedSet = new Set(currentArchived.map((k) => String(k).trim().toLowerCase()));
    const categoryIdentifiers = [
      input.id != null ? String(input.id) : null,
      input.slug,
      input.name,
    ]
      .filter(Boolean)
      .map((s) => String(s).trim().toLowerCase());

    if (isArchived) {
      categoryIdentifiers.forEach((id) => archivedSet.add(id));
    } else {
      categoryIdentifiers.forEach((id) => archivedSet.delete(id));
    }
    writeArchivedCategoryKeys(Array.from(archivedSet));

    // Instantly update in local cache & localStorage
    const targetId = input.id;
    const foundIndex = cache.categories.findIndex(
      (c) =>
        (targetId != null && String(c.id) === String(targetId)) ||
        (c.slug && input.slug && String(c.slug) === String(input.slug)) ||
        (c.name && input.name && String(c.name).toLowerCase() === String(input.name).toLowerCase())
    );

    if (foundIndex >= 0) {
      cache.categories[foundIndex] = {
        ...cache.categories[foundIndex],
        ...body,
        id: cache.categories[foundIndex].id ?? targetId,
      };
    } else {
      cache.categories.push({
        id: targetId || Date.now(),
        ...body,
      });
    }
    writeLocalCategories(cache.categories);
    emit(STORAGE_KEYS.categories);
    emit(ARCHIVED_CATEGORIES_KEY);

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

export async function deleteCategory(idOrCategory) {
  const targetId = typeof idOrCategory === "object" && idOrCategory !== null ? idOrCategory.id : idOrCategory;
  const found =
    cache.categories.find(
      (c) =>
        String(c.id) === String(targetId) ||
        (c.slug && String(c.slug) === String(targetId)) ||
        (c.name && String(c.name) === String(targetId))
    ) || (typeof idOrCategory === "object" && idOrCategory !== null ? idOrCategory : null);

  // Permanently record all identifiers for this category in the deleted blacklist
  const keysToAdd = [
    targetId != null ? String(targetId) : null,
    found?.id != null ? String(found.id) : null,
    found?.name,
    found?.slug,
  ]
    .filter(Boolean)
    .map((s) => String(s).trim().toLowerCase());

  const currentDeleted = readDeletedCategoryKeys();
  const deletedSet = new Set(currentDeleted.map((k) => String(k).trim().toLowerCase()));
  keysToAdd.forEach((k) => deletedSet.add(k));
  writeDeletedCategoryKeys(Array.from(deletedSet));

  // Remove from archived keys as well
  const currentArchived = readArchivedCategoryKeys();
  const nextArchived = currentArchived.filter((k) => !keysToAdd.includes(String(k).trim().toLowerCase()));
  if (nextArchived.length !== currentArchived.length) {
    writeArchivedCategoryKeys(nextArchived);
  }

  // Instantly remove from local cache and localStorage
  cache.categories = cache.categories.filter((cat) => !isCategoryDeleted(cat, Array.from(deletedSet)));
  writeLocalCategories(cache.categories);
  emit(STORAGE_KEYS.categories);
  emit(ARCHIVED_CATEGORIES_KEY);

  try {
    if (targetId && Number.isFinite(Number(targetId))) {
      await apiRequest(`/api/admin/categories/${targetId}`, { method: "DELETE", kind: "admin" });
    }
  } catch (apiError) {
    console.warn("Backend category deletion API warning:", apiError);
  }

  try {
    await refreshAdminData();
  } catch {
    // Already updated cache and local storage
  }

  return { ok: true };
}

export function listCoupons() {
  if (Array.isArray(cache.coupons) && cache.coupons.length > 0) {
    return cache.coupons.slice();
  }
  const local = readLocalCoupons();
  if (Array.isArray(local) && local.length > 0) {
    cache.coupons = local;
    return local.slice();
  }
  return [];
}

export async function fetchPublicCoupons() {
  try {
    const adminToken = getToken("admin");
    if (adminToken) {
      const data = await apiRequest("/api/admin/coupons", { kind: "admin" });
      if (Array.isArray(data)) {
        cache.coupons = data;
        writeLocalCoupons(data);
        emit(STORAGE_KEYS.coupons);
        return data.filter((c) => c && c.active !== false);
      }
    }
  } catch {
    // fallback
  }
  return listCoupons().filter((c) => c && c.active !== false);
}

export async function saveCoupon(input) {
  const code = String(input.code || "").trim().toUpperCase();
  const type = input.type === "fixed" ? "fixed" : "percent";
  const value = Number(input.value);
  const minOrder = Number(input.minOrder || 0);
  const maxDiscountRaw = input.maxDiscount;
  const maxDiscount =
    maxDiscountRaw !== "" && maxDiscountRaw != null ? Number(maxDiscountRaw) : null;
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
  if (maxDiscount !== null && (!Number.isFinite(maxDiscount) || maxDiscount < 0)) {
    return { ok: false, message: "Maximum discount cannot be negative." };
  }
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
    maxDiscount: Number.isFinite(maxDiscount) && maxDiscount > 0 ? maxDiscount : null,
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

function inPreviousRange(order, days) {
  const created = new Date(order.createdAt).getTime();
  if (Number.isNaN(created)) return false;
  const currentStart = new Date();
  currentStart.setHours(0, 0, 0, 0);
  currentStart.setDate(currentStart.getDate() - (days - 1));
  const prevStart = new Date(currentStart);
  prevStart.setDate(prevStart.getDate() - days);
  return created >= prevStart.getTime() && created < currentStart.getTime();
}

function calcPercentageChange(current, previous) {
  if (previous > 0) {
    return Number((((current - previous) / previous) * 100).toFixed(1));
  }
  if (current > 0) {
    return 100.0;
  }
  return 0.0;
}

export function getDashboard(days = 30, source = null) {
  const allOrders = Array.isArray(source?.orders) ? source.orders : listOrders();
  const orders = allOrders.filter((order) => inRange(order, days));
  const activeOrders = orders.filter((order) => order.adminStatus !== "cancelled");
  const prevOrders = allOrders.filter((order) => inPreviousRange(order, days));
  const activePrevOrders = prevOrders.filter((order) => order.adminStatus !== "cancelled");

  const currentSales = activeOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const prevSales = activePrevOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const salesGrowth = calcPercentageChange(currentSales, prevSales);
  const ordersGrowth = calcPercentageChange(activeOrders.length, activePrevOrders.length);

  const products = Array.isArray(source?.products) ? source.products : listProducts();
  const customers = Array.isArray(source?.customers) ? source.customers : listCustomers();
  const threshold = (source?.settings || getSettings()).lowStockThreshold;

  const currentStart = new Date();
  currentStart.setHours(0, 0, 0, 0);
  currentStart.setDate(currentStart.getDate() - (days - 1));
  const currentStartTime = currentStart.getTime();

  const prevStart = new Date(currentStart);
  prevStart.setDate(prevStart.getDate() - days);
  const prevStartTime = prevStart.getTime();

  // Active customer growth (new signups or unique customers who ordered)
  const validCustomers = customers.filter((customer) => customer.status !== "inactive");
  const currentNewCust = validCustomers.filter((c) => {
    const t = new Date(c.createdAt || c.date || 0).getTime();
    return !Number.isNaN(t) && t >= currentStartTime;
  });
  const prevNewCust = validCustomers.filter((c) => {
    const t = new Date(c.createdAt || c.date || 0).getTime();
    return !Number.isNaN(t) && t >= prevStartTime && t < currentStartTime;
  });

  const customersGrowth =
    currentNewCust.length > 0 || prevNewCust.length > 0
      ? calcPercentageChange(currentNewCust.length, prevNewCust.length)
      : calcPercentageChange(
          new Set(
            activeOrders
              .map((o) => o.customerPhone || o.customerEmail || o.delivery?.phone || o.delivery?.email || o.customerId)
              .filter(Boolean)
          ).size,
          new Set(
            activePrevOrders
              .map((o) => o.customerPhone || o.customerEmail || o.delivery?.phone || o.delivery?.email || o.customerId)
              .filter(Boolean)
          ).size
        );

  // Active product catalog growth
  const activeProducts = products.filter((product) => product.status !== "archived");
  const currentNewProd = activeProducts.filter((p) => {
    const t = new Date(p.createdAt || p.date || 0).getTime();
    return !Number.isNaN(t) && t >= currentStartTime;
  });
  const prevNewProd = activeProducts.filter((p) => {
    const t = new Date(p.createdAt || p.date || 0).getTime();
    return !Number.isNaN(t) && t >= prevStartTime && t < currentStartTime;
  });

  const productsGrowth =
    currentNewProd.length > 0 || prevNewProd.length > 0
      ? calcPercentageChange(currentNewProd.length, prevNewProd.length)
      : 0.0;

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
    sales: currentSales,
    salesGrowth,
    salesChange: salesGrowth,
    ordersGrowth,
    ordersChange: ordersGrowth,
    productCount: activeProducts.length,
    productsGrowth,
    productsChange: productsGrowth,
    customerCount: validCustomers.length,
    customersGrowth,
    customersChange: customersGrowth,
    statusCounts,
    recent: allOrders.slice(0, 6),
    top: [...productSales.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5),
    lowStock: products.filter((product) => product.status === "active" && product.stock > 0 && product.stock <= threshold),
    outOfStock: products.filter((product) => product.status === "active" && product.stock <= 0),
    chart: (() => {
      const stepCount = days <= 7 ? 7 : days <= 30 ? 7 : 8;
      const now = new Date();
      const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const intervalDays = Math.max(1, Math.floor(days / stepCount));
      const points = [];

      for (let i = stepCount - 1; i >= 0; i--) {
        const dayStart = todayMidnight - i * intervalDays * 86400000;
        const dayEnd = dayStart + intervalDays * 86400000;
        const d = new Date(dayStart);
        const label = `${d.getDate()} ${d.toLocaleDateString("en-US", { month: "short" })}`;

        const matching = activeOrders.filter((o) => {
          const t = new Date(o.createdAt || o.created_at || 0).getTime();
          return !Number.isNaN(t) && t >= dayStart && t < dayEnd;
        });

        const revenue = matching.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        points.push({
          label,
          date: d.toISOString().slice(0, 10),
          revenue,
          total: revenue,
          sales: revenue,
          orders: matching.length,
          count: matching.length,
        });
      }
      return points;
    })(),
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

export async function exportReportPdf(report, days = 30) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.width;

  // Header Brand
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(2, 132, 199); // Sky / Wasooli Blue
  doc.text("WASOOLI STORE", 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Transactions & Financial Performance Report", 14, 24);

  // Metadata block (right aligned)
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Generated: ${dateStr} ${timeStr}`, pageWidth - 14, 16, { align: "right" });
  doc.text(`Period: Last ${days} Days`, pageWidth - 14, 21, { align: "right" });
  doc.text(`Total Orders: ${report?.orders?.length || 0}`, pageWidth - 14, 26, { align: "right" });

  // Accent Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(14, 29, pageWidth - 14, 29);

  // Summary Metrics Table
  const totalSales = Number(report?.sales || 0);
  const totalOrders = report?.orders?.length || 0;
  const collectedPaid = Number(report?.payments?.paid || 0) + Number(report?.payments?.cod_collected || 0);
  const codPending = Number(report?.payments?.cod_pending || 0);

  autoTable(doc, {
    startY: 33,
    margin: { left: 14, right: 14 },
    head: [["TOTAL SALES", "TOTAL ORDERS", "COLLECTED / PAID", "COD PENDING"]],
    body: [[
      `Rs. ${totalSales.toLocaleString()}`,
      `${totalOrders} Orders`,
      `Rs. ${collectedPaid.toLocaleString()}`,
      `Rs. ${codPending.toLocaleString()}`,
    ]],
    theme: "plain",
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [100, 116, 139],
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
      cellPadding: 2.5,
    },
    styles: {
      fontSize: 10.5,
      fontStyle: "bold",
      textColor: [15, 23, 42],
      halign: "center",
      cellPadding: 3.5,
    },
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.2,
  });

  const nextY = doc.lastAutoTable.finalY + 8;

  // Section Heading
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("Transactions & Orders List", 14, nextY);

  const orders = Array.isArray(report?.orders) ? report.orders : [];
  const rows = orders.length > 0 ? orders.map((order) => {
    const rawDate = order.createdAt ? String(order.createdAt).slice(0, 10) : "-";
    const custName = order.delivery?.fullName || "Guest Customer";
    const city = order.delivery?.city || "-";
    const status = statusLabel(order.adminStatus || "pending");
    const payment = PAYMENT_LABELS[paymentBucket(order)] || paymentBucket(order);
    const amount = `Rs. ${Number(order.total || 0).toLocaleString()}`;
    return [
      String(order.id || "").startsWith("#") ? String(order.id) : `#${order.id}`,
      rawDate,
      custName,
      city,
      status,
      payment,
      amount,
    ];
  }) : [["-", "-", "No orders found in this period", "-", "-", "-", "Rs. 0"]];

  autoTable(doc, {
    startY: nextY + 3,
    margin: { left: 14, right: 14, bottom: 16 },
    head: [["Order #", "Date", "Customer", "City", "Status", "Payment", "Amount"]],
    body: rows,
    foot: [["Total Sales", "", "", "", "", `${orders.length} orders`, `Rs. ${totalSales.toLocaleString()}`]],
    theme: "striped",
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [30, 41, 59],
      overflow: "linebreak",
    },
    columnStyles: {
      0: { fontStyle: "bold" },
      6: { halign: "right", fontStyle: "bold" },
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: "bold",
      fontSize: 8.5,
      cellPadding: 3,
    },
  });

  // Multi-page page numbers and professional footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const h = doc.internal.pageSize.height;
    const w = doc.internal.pageSize.width;

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(14, h - 12, w - 14, h - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Wasooli Store — Official Transactions & Sales Report (Confidential)", 14, h - 7);
    doc.text(`Page ${i} of ${pageCount}`, w - 14, h - 7, { align: "right" });
  }

  const fileDate = now.toISOString().slice(0, 10);
  doc.save(`wasooli-report-${days}days-${fileDate}.pdf`);
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
  try {
    const result = await apiRequest("/api/coupons/validate", {
      method: "POST",
      kind: "customer",
      body: { code, subtotal },
    });
    const local = listCoupons().find(
      (c) => String(c?.code).toUpperCase() === String(code).toUpperCase()
    );
    const maxCap = Number(result?.coupon?.maxDiscount ?? result?.maxDiscount ?? local?.maxDiscount);
    if (result && Number.isFinite(maxCap) && maxCap > 0 && Number(result.discount) > maxCap) {
      result.discount = maxCap;
    }
    return result;
  } catch (apiError) {
    const local = listCoupons().find(
      (c) => String(c?.code).toUpperCase() === String(code).toUpperCase() && c.active !== false
    );
    if (local) {
      const sub = Number(subtotal) || 0;
      const min = Number(local.minOrder) || 0;
      if (sub < min) {
        throw new Error(`Minimum order of Rs ${min.toLocaleString()} required for this coupon.`, {
          cause: apiError,
        });
      }
      let discount =
        local.type === "percent"
          ? (sub * Number(local.value)) / 100
          : Number(local.value);
      const maxDiscount = Number(local.maxDiscount);
      if (Number.isFinite(maxDiscount) && maxDiscount > 0 && discount > maxDiscount) {
        discount = maxDiscount;
      }
      return {
        code: local.code,
        discount: Math.round(discount),
        coupon: local,
      };
    }
    throw apiError;
  }
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
