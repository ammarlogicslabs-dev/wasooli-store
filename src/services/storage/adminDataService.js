import { products as baseProducts } from "../../data/product";
import { normalizeBotInstructions } from "../../data/productInstructions";
import { readJson, removeStorageKey, writeJson } from "./storageService";
import { ORDER_FLOW, paymentBucket } from "./orderStatus";

export const STORAGE_KEYS = {
  products: "wasooli_admin_products_v1",
  categories: "wasooli_admin_categories_v1",
  orders: "wasooli_orders",
  inventory: "wasooli_admin_inventory_v1",
  coupons: "wasooli_admin_coupons_v1",
  settings: "wasooli_admin_settings_v1",
  customers: "wasooli_admin_customers_v1",
  stock: "wasooli_stock",
  notifications: "wasooli_notifications",
  wishlist: "wasooli_wishlist",
};

export const ADMIN_SESSION_KEY = "wasooli_demo_admin_session";

const DEFAULT_SETTINGS = {
  storeName: "Wasooli Store",
  currency: "PKR",
  shippingFee: 200,
  lowStockThreshold: 5,
  notifyLowStock: true,
  notifyNewOrder: true,
  density: "comfortable",
  adminName: "Wasooli Admin",
  adminEmail: "admin@wasooli.store",
  avatarUrl: "",
};

const DEMO_CUSTOMERS = [
  {
    key: "Ayesha",
    name: "Ayesha Khan",
    email: "ayesha@example.com",
    phone: "0300-1112233",
    city: "Karachi",
    address: "House 18, DHA Phase 6",
    status: "active",
    createdAt: "2026-09-02T08:00:00.000Z",
  },
  {
    key: "Bilal",
    name: "Bilal Ahmed",
    email: "bilal@example.com",
    phone: "0321-5558899",
    city: "Lahore",
    address: "Street 4, Gulberg",
    status: "active",
    createdAt: "2026-09-12T08:00:00.000Z",
  },
  {
    key: "Sara",
    name: "Sara Malik",
    email: "sara@example.com",
    phone: "0333-4442211",
    city: "Islamabad",
    address: "F-10 Markaz",
    status: "inactive",
    createdAt: "2026-08-20T08:00:00.000Z",
  },
];

const DEMO_COUPONS = [
  {
    id: "cpn-wasooli10",
    code: "WASOOLI10",
    type: "percent",
    value: 10,
    minOrder: 1000,
    startDate: "2026-10-01",
    expiryDate: "2026-12-31",
    usageLimit: 100,
    used: 12,
    active: true,
  },
  {
    id: "cpn-flat200",
    code: "FLAT200",
    type: "fixed",
    value: 200,
    minOrder: 2000,
    startDate: "2026-10-01",
    expiryDate: "2026-11-30",
    usageLimit: 50,
    used: 4,
    active: false,
  },
];

function defaultProductState() {
  return { overrides: {}, created: [], deletedIds: [] };
}

function slugify(value) {
  const slug = String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || `item-${Date.now()}`;
}

function normalizeProduct(product) {
  const images = Array.isArray(product.images)
    ? product.images.filter(Boolean)
    : product.image
      ? [product.image]
      : [];
  return {
    ...product,
    id: Number(product.id),
    sku: product.sku || `WS-${String(product.id).padStart(4, "0")}`,
    status: product.status || "active",
    brand: product.brand || "Wasooli",
    portType: product.portType || "",
    category: product.category || "Uncategorized",
    image: product.image || images[0] || "",
    images,
    features: Array.isArray(product.features) ? product.features : [],
    specifications: Array.isArray(product.specifications) ? product.specifications : [],
    botInstructions: product.botInstructions
      ? normalizeBotInstructions(product.botInstructions)
      : undefined,
    price: Number(product.price) || 0,
    oldPrice: product.oldPrice == null || product.oldPrice === "" ? null : Number(product.oldPrice),
    stock: Math.max(0, Number(product.stock) || 0),
    rating: Number(product.rating) || 0,
    reviews: Number(product.reviews) || 0,
  };
}

export function readProductState() {
  const saved = readJson(STORAGE_KEYS.products, null);
  if (!saved || typeof saved !== "object" || Array.isArray(saved)) return defaultProductState();
  return {
    overrides: saved.overrides && typeof saved.overrides === "object" ? saved.overrides : {},
    created: Array.isArray(saved.created) ? saved.created : [],
    deletedIds: Array.isArray(saved.deletedIds) ? saved.deletedIds.map(Number) : [],
  };
}

function writeProductState(state) {
  writeJson(STORAGE_KEYS.products, state);
}

export function readStockMap() {
  const saved = readJson(STORAGE_KEYS.stock, {});
  return saved && typeof saved === "object" ? saved : {};
}

function writeStockMap(stockMap) {
  writeJson(STORAGE_KEYS.stock, stockMap);
}

export function getCatalog() {
  const state = readProductState();
  const deleted = new Set(state.deletedIds);
  const fromBase = baseProducts
    .filter((product) => !deleted.has(Number(product.id)))
    .map((product) => normalizeProduct({ ...product, ...(state.overrides[product.id] || {}) }));
  const created = state.created.map((product) => normalizeProduct(product));
  return [...created, ...fromBase];
}

export function applyLiveStock(product, stockMap = readStockMap()) {
  const override = stockMap?.[product.id];
  return Number.isFinite(Number(override))
    ? { ...product, stock: Math.max(0, Number(override)) }
    : product;
}

export function listProducts() {
  const stockMap = readStockMap();
  return getCatalog()
    .map((product) => applyLiveStock(product, stockMap))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getStorefrontProducts(stockMap = readStockMap(), _tick = 0) {
  void _tick;
  return getCatalog()
    .filter((product) => product.status === "active")
    .map((product) => applyLiveStock(product, stockMap));
}

export function getProduct(id) {
  return listProducts().find((product) => Number(product.id) === Number(id)) || null;
}

function categorySeed() {
  const names = [...new Set(baseProducts.map((product) => product.category).filter(Boolean))];
  return names.map((name) => ({
    id: `cat-${slugify(name)}`,
    name,
    slug: slugify(name),
    description: `${name} available at Wasooli Store.`,
    image: baseProducts.find((product) => product.category === name)?.image || "",
    status: "active",
  }));
}

export function listCategories() {
  const stored = readJson(STORAGE_KEYS.categories, null);
  const categories = Array.isArray(stored) ? stored : categorySeed();
  const known = new Set(categories.map((category) => category.name));
  getCatalog().forEach((product) => {
    if (product.category && !known.has(product.category)) {
      known.add(product.category);
      categories.push({
        id: `cat-${slugify(product.category)}`,
        name: product.category,
        slug: slugify(product.category),
        description: "",
        image: product.image || "",
        status: "active",
      });
    }
  });
  return categories.map((category) => ({
    ...category,
    productCount: listProducts().filter((product) => product.category === category.name && product.status !== "archived").length,
  }));
}

export function getSettings() {
  const saved = readJson(STORAGE_KEYS.settings, null);
  return { ...DEFAULT_SETTINGS, ...(saved && typeof saved === "object" ? saved : {}) };
}

export function saveSettings(patch) {
  const next = { ...getSettings(), ...patch };
  const shippingFee = Number(next.shippingFee);
  const threshold = Number(next.lowStockThreshold);
  if (!next.storeName?.trim()) return { ok: false, message: "Store name is required." };
  if (!Number.isFinite(shippingFee) || shippingFee < 0) return { ok: false, message: "Shipping fee must be 0 or more." };
  if (!Number.isInteger(threshold) || threshold < 0) return { ok: false, message: "Low-stock threshold must be a whole number." };
  next.storeName = next.storeName.trim();
  next.shippingFee = shippingFee;
  next.lowStockThreshold = threshold;
  next.adminName = String(next.adminName || "Wasooli Admin").trim();
  writeJson(STORAGE_KEYS.settings, next);
  return { ok: true, settings: next };
}

function readOrders() {
  const saved = readJson(STORAGE_KEYS.orders, []);
  return Array.isArray(saved) ? saved : [];
}

export function listOrders() {
  return readOrders()
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

export function getOrder(id) {
  return listOrders().find((order) => String(order.id) === String(id)) || null;
}

function readHistory() {
  const saved = readJson(STORAGE_KEYS.inventory, []);
  return Array.isArray(saved) ? saved : [];
}

function logInventory(entry) {
  const history = readHistory();
  history.unshift({
    id: `inv-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    ...entry,
  });
  writeJson(STORAGE_KEYS.inventory, history.slice(0, 200));
}

export function listInventoryHistory() {
  return readHistory();
}

function liveStockOf(product, stockMap) {
  return applyLiveStock(product, stockMap).stock;
}

function pushNotification(product, type) {
  const list = readJson(STORAGE_KEYS.notifications, []);
  const notifications = Array.isArray(list) ? list : [];
  const message = type === "in_stock"
    ? `${product.title} is now available in stock (${product.stock} items available).`
    : `${product.title} from your wishlist is now out of stock.`;
  notifications.unshift({
    id: `notif-${product.id}-${Date.now()}`,
    productId: product.id,
    slug: product.slug,
    title: product.title,
    image: product.image,
    type,
    message,
    createdAt: new Date().toISOString(),
    read: false,
  });
  writeJson(STORAGE_KEYS.notifications, notifications.slice(0, 50));
}

function isWished(productId) {
  const wishlist = readJson(STORAGE_KEYS.wishlist, []);
  if (!Array.isArray(wishlist)) return false;
  return wishlist.some((entry) => Number(entry?.id ?? entry) === Number(productId));
}

export function setProductStock(productId, nextStock, reason) {
  const product = getCatalog().find((item) => Number(item.id) === Number(productId));
  if (!product) return { ok: false, message: "Product not found." };
  const quantity = Number(nextStock);
  if (!Number.isInteger(quantity) || quantity < 0) {
    return { ok: false, message: "Stock must be a whole number, 0 or more." };
  }
  if (!String(reason || "").trim()) return { ok: false, message: "Add a reason for this stock change." };

  const stockMap = readStockMap();
  const previous = liveStockOf(product, stockMap);
  const hasOverride = Object.prototype.hasOwnProperty.call(stockMap, product.id)
    || Object.prototype.hasOwnProperty.call(stockMap, String(product.id));
  if (previous === quantity && hasOverride) return { ok: false, message: "Stock is already at that quantity." };

  stockMap[product.id] = quantity;
  writeStockMap(stockMap);
  if (previous === quantity) return { ok: true, stock: quantity };
  logInventory({
    productId: product.id,
    sku: product.sku,
    title: product.title,
    previous,
    next: quantity,
    delta: quantity - previous,
    reason: String(reason).trim(),
  });

  if (isWished(product.id) && previous <= 0 && quantity > 0) {
    pushNotification({ ...product, stock: quantity }, "in_stock");
  } else if (isWished(product.id) && previous > 0 && quantity <= 0) {
    pushNotification({ ...product, stock: quantity }, "out_of_stock");
  }

  return { ok: true, stock: quantity };
}

export function recordSaleAdjustments(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return;
  const catalog = getCatalog();
  entries.forEach((entry) => {
    const product = catalog.find((item) => Number(item.id) === Number(entry.productId));
    if (!product || !Number.isFinite(entry.previous) || !Number.isFinite(entry.next)) return;
    logInventory({
      productId: product.id,
      sku: product.sku,
      title: product.title,
      previous: entry.previous,
      next: entry.next,
      delta: entry.next - entry.previous,
      reason: entry.reason || "Order placed",
    });
  });
}

function restoreOrderStock(order) {
  const stockMap = readStockMap();
  const catalog = getCatalog();
  (order.items || []).forEach((item) => {
    const product = catalog.find((entry) => Number(entry.id) === Number(item.id));
    if (!product) return;
    const previous = liveStockOf(product, stockMap);
    const qty = Math.max(0, Number(item.quantity) || 0);
    const next = previous + qty;
    stockMap[product.id] = next;
    logInventory({
      productId: product.id,
      sku: product.sku,
      title: product.title,
      previous,
      next,
      delta: qty,
      reason: "Order cancelled — stock restored",
    });
  });
  writeStockMap(stockMap);
}

export function updateOrder(orderId, changes) {
  const orders = readOrders();
  const index = orders.findIndex((order) => String(order.id) === String(orderId));
  if (index < 0) return { ok: false, message: "Order not found." };

  const order = { ...orders[index] };
  const history = Array.isArray(order.statusHistory) ? [...order.statusHistory] : [];
  const now = new Date().toISOString();
  const note = String(changes.note || "").trim();

  if (changes.adminStatus && changes.adminStatus !== order.adminStatus) {
    if (changes.adminStatus === "cancelled") {
      if (order.adminStatus === "delivered") {
        return { ok: false, message: "Delivered orders cannot be cancelled." };
      }
      if (!order.stockRestored) {
        restoreOrderStock(order);
        order.stockRestored = true;
      }
      history.push({ status: "cancelled", note: note || "Order cancelled", at: now });
      order.adminStatus = "cancelled";
    } else if (ORDER_FLOW.some((step) => step.id === changes.adminStatus)) {
      // if (order.adminStatus === "cancelled") {
      //   return { ok: false, message: "Cancelled orders stay cancelled in this demo." };
      // }
      const target = ORDER_FLOW.findIndex((step) => step.id === changes.adminStatus);
      ORDER_FLOW.slice(0, target + 1).forEach((step) => {
        if (!history.some((event) => event.status === step.id && event.type !== "note" && event.type !== "refund")) {
          history.push({
            status: step.id,
            note: step.id === changes.adminStatus ? (note || "Status updated") : "Stage recorded",
            at: now,
          });
        }
      });
      order.adminStatus = changes.adminStatus;
    }
  } else if (note) {
    history.push({
      status: order.adminStatus || "pending",
      note,
      at: now,
      type: "note",
    });
  }

  if (changes.courier != null) order.courier = String(changes.courier).trim();
  if (changes.trackingNumber != null) order.trackingNumber = String(changes.trackingNumber).trim();
  if (changes.paymentStatus) {
    order.paymentStatus = changes.paymentStatus;
    if (changes.paymentStatus === "refunded") {
      history.push({
        status: order.adminStatus || "pending",
        note: note || "Refund recorded. No real payment was sent.",
        at: now,
        type: "refund",
      });
    }
  }

  order.statusHistory = history;
  orders[index] = order;
  writeJson(STORAGE_KEYS.orders, orders);
  return { ok: true, order };
}

function customerKeyFromDelivery(delivery = {}) {
  const phone = String(delivery.phone || "").replace(/\s+/g, "");
  if (phone) return `phone-${phone}`;
  const name = slugify(delivery.fullName || "customer");
  return `name-${name}`;
}

export function listCustomers() {
  const meta = readJson(STORAGE_KEYS.customers, null);
  const stored = Array.isArray(meta?.records) ? meta.records : DEMO_CUSTOMERS;
  const statusMap = meta?.status && typeof meta.status === "object" ? meta.status : {};
  const byKey = new Map();

  stored.forEach((customer) => {
    byKey.set(customer.key, {
      ...customer,
      status: statusMap[customer.key] || customer.status || "active",
      orders: 0,
      spent: 0,
    });
  });

  listOrders().forEach((order) => {
    const key = customerKeyFromDelivery(order.delivery);
    const current = byKey.get(key) || {
      key,
      name: order.delivery?.fullName || "Customer",
      email: order.customerEmail || "",
      phone: order.delivery?.phone || "",
      city: order.delivery?.city || "",
      address: order.delivery?.address || "",
      status: statusMap[key] || "active",
      createdAt: order.createdAt,
      orders: 0,
      spent: 0,
    };
    current.orders += 1;
    if (order.adminStatus !== "cancelled") current.spent += Number(order.total) || 0;
    current.name = current.name || order.delivery?.fullName || "Customer";
    current.email = current.email || order.customerEmail || "";
    current.phone = current.phone || order.delivery?.phone || "";
    current.city = current.city || order.delivery?.city || "";
    current.address = current.address || order.delivery?.address || "";
    current.status = statusMap[key] || current.status || "active";
    byKey.set(key, current);
  });

  return [...byKey.values()].sort((a, b) => b.orders - a.orders || a.name.localeCompare(b.name));
}

export function setCustomerStatus(key, status) {
  const meta = readJson(STORAGE_KEYS.customers, { records: DEMO_CUSTOMERS, status: {} });
  const records = Array.isArray(meta.records) ? meta.records : DEMO_CUSTOMERS;
  const nextStatus = { ...(meta.status || {}), [key]: status };
  writeJson(STORAGE_KEYS.customers, { records, status: nextStatus });
  return { ok: true };
}

export function ordersForCustomer(customer, allOrders = listOrders()) {
  if (!customer) return [];
  return allOrders.filter((order) => customerKeyFromDelivery(order.delivery) === customer.key || (
    customer.phone && order.delivery?.phone === customer.phone
  ));
}

function linesToList(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function validateProduct(input, products = listProducts()) {
  const errors = {};
  const title = String(input.title || "").trim();
  const sku = String(input.sku || "").trim();
  const category = String(input.category || "").trim();
  const price = Number(input.price);
  const oldPrice = input.oldPrice === "" || input.oldPrice == null ? null : Number(input.oldPrice);
  const stock = Number(input.stock);
  const slug = slugify(input.slug || title);

  if (!title) errors.title = "Product name is required.";
  if (!sku) errors.sku = "SKU is required.";
  if (!category) errors.category = "Category is required.";
  if (!input.image) errors.image = "Select a product image.";
  if (!Number.isFinite(price) || price < 0) errors.price = "Enter a valid price.";
  if (oldPrice != null && (!Number.isFinite(oldPrice) || oldPrice < price)) {
    errors.oldPrice = "Compare-at price must be higher than the selling price.";
  }
  if (!Number.isInteger(stock) || stock < 0) errors.stock = "Stock must be a whole number.";
  if (!["active", "draft", "archived"].includes(input.status)) errors.status = "Choose a valid status.";

  const skuTaken = products.some((product) => product.sku.toLowerCase() === sku.toLowerCase() && Number(product.id) !== Number(input.id));
  if (sku && skuTaken) errors.sku = "This SKU is already used.";
  const slugTaken = products.some((product) => product.slug === slug && Number(product.id) !== Number(input.id));
  if (slugTaken) errors.slug = "This product link is already used.";
  return errors;
}

function upsertCategoryName(name, image) {
  const categories = listCategories().map(({ productCount, ...category }) => category);
  if (categories.some((category) => category.name === name)) return;
  categories.push({
    id: `cat-${slugify(name)}`,
    name,
    slug: slugify(name),
    description: "",
    image: image || "",
    status: "active",
  });
  writeJson(STORAGE_KEYS.categories, categories);
}

export function saveProduct(input) {
  const products = listProducts();
  const errors = validateProduct(input, products);
  if (Object.keys(errors).length) return { ok: false, errors };

  const state = readProductState();
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

  const payload = {
    title: String(input.title).trim(),
    slug: slugify(input.slug || input.title),
    sku: String(input.sku).trim(),
    category: String(input.category).trim(),
    brand: String(input.brand || "Wasooli").trim(),
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
    botInstructions: hasBotContent ? botInstructions : undefined,
    rating: Number(input.rating) || 0,
    reviews: Number(input.reviews) || 0,
  };

  let id = Number(input.id);
  const isBase = baseProducts.some((product) => Number(product.id) === id);
  if (!id) {
    const maxId = Math.max(0, ...getCatalog().map((product) => Number(product.id) || 0), ...baseProducts.map((product) => product.id));
    id = maxId + 1;
    state.created.unshift(normalizeProduct({ ...payload, id }));
  } else if (isBase) {
    state.overrides[id] = { ...(state.overrides[id] || {}), ...payload };
  } else {
    state.created = state.created.map((product) => (
      Number(product.id) === id ? normalizeProduct({ ...product, ...payload, id }) : product
    ));
  }

  writeProductState(state);
  upsertCategoryName(payload.category, payload.image);

  const existing = products.find((product) => Number(product.id) === id);
  const previousStock = existing ? existing.stock : payload.stock;
  if (!existing || previousStock !== payload.stock) {
    setProductStock(id, payload.stock, existing ? "Updated from product form" : "Opening stock");
  }

  return { ok: true, id };
}

export function archiveProduct(id) {
  const product = getProduct(id);
  if (!product) return { ok: false, message: "Product not found." };
  return saveProduct({ ...product, status: "archived", imagesText: product.images });
}

export function deleteProduct(id) {
  const product = getCatalog().find((item) => Number(item.id) === Number(id));
  if (!product) return { ok: false, message: "Product not found." };
  const state = readProductState();
  const isBase = baseProducts.some((item) => Number(item.id) === Number(id));
  if (isBase) {
    if (!state.deletedIds.includes(Number(id))) state.deletedIds.push(Number(id));
    delete state.overrides[id];
  } else {
    state.created = state.created.filter((item) => Number(item.id) !== Number(id));
  }
  writeProductState(state);
  const stockMap = readStockMap();
  delete stockMap[id];
  delete stockMap[String(id)];
  writeStockMap(stockMap);
  return { ok: true };
}

export function saveCategory(input) {
  const name = String(input.name || "").trim();
  if (!name) return { ok: false, message: "Category name is required." };
  const categories = listCategories().map(({ productCount, ...category }) => category);
  const slug = slugify(input.slug || name);
  const duplicate = categories.some((category) => category.slug === slug && category.id !== input.id);
  if (duplicate) return { ok: false, message: "A category with this link already exists." };

  const next = {
    id: input.id || `cat-${slug}`,
    name,
    slug, 
    description: String(input.description || "").trim(),
    image: String(input.image || "").trim(),
    status: input.status === "archived" ? "archived" : "active",
  };
  const existing = categories.find((category) => category.id === next.id);
  if (existing && existing.name !== name) {
    const state = readProductState();
    getCatalog()
      .filter((product) => product.category === existing.name)
      .forEach((product) => {
        const isBase = baseProducts.some((item) => item.id === product.id);
        if (isBase) {
          state.overrides[product.id] = { ...(state.overrides[product.id] || {}), category: name };
        } else {
          state.created = state.created.map((item) => (
            item.id === product.id ? { ...item, category: name } : item
          ));
        }
      });
    writeProductState(state);
  }

  const without = categories.filter((category) => category.id !== next.id);
  writeJson(STORAGE_KEYS.categories, [next, ...without]);
  return { ok: true };
}

export function deleteCategory(id) {
  const category = listCategories().find((item) => item.id === id);
  if (!category) return { ok: false, message: "Category not found." };
  const linked = getCatalog().filter((product) => product.category === category.name);
  if (linked.length > 0) {
    return {
      ok: false,
      message: `${linked.length} products still use ${category.name}. Archive the category or move those products first.`,
    };
  }
  const categories = listCategories()
    .filter((item) => item.id !== id)
    .map(({ productCount, ...item }) => item);
  writeJson(STORAGE_KEYS.categories, categories);
  return { ok: true };
}

export function listCoupons() {
  const saved = readJson(STORAGE_KEYS.coupons, null);
  return Array.isArray(saved) ? saved : DEMO_COUPONS;
}

export function saveCoupon(input) {
  const coupons = listCoupons();
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
  if (coupons.some((coupon) => coupon.code === code && coupon.id !== input.id)) {
    return { ok: false, message: "That coupon code already exists." };
  }

  const next = {
    id: input.id || `cpn-${Date.now()}`,
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
  const rest = coupons.filter((coupon) => coupon.id !== next.id);
  writeJson(STORAGE_KEYS.coupons, [next, ...rest]);
  return { ok: true };
}

export function deleteCoupon(id) {
  writeJson(STORAGE_KEYS.coupons, listCoupons().filter((coupon) => coupon.id !== id));
  return { ok: true };
}

function inRange(order, days) {
  const created = new Date(order.createdAt).getTime();
  if (Number.isNaN(created)) return false;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return created >= start.getTime();
}

function buildChart(orders, days) {
  const bucketSize = days <= 7 ? 1 : days <= 30 ? 5 : 10;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const buckets = [];
  for (let offset = days; offset > 0; offset -= bucketSize) {
    const from = new Date(today);
    from.setDate(from.getDate() - offset + 1);
    const to = new Date(from);
    to.setDate(from.getDate() + bucketSize - 1);
    const end = to > today ? today : to;
    const total = orders
      .filter((order) => {
        const time = new Date(order.createdAt).getTime();
        return time >= from.getTime() && time < end.getTime() + 86400000 && order.adminStatus !== "cancelled";
      })
      .reduce((sum, order) => sum + (Number(order.total) || 0), 0);
    buckets.push({
      label: from.toLocaleDateString("en-PK", { day: "numeric", month: "short" }),
      total,
    });
  }
  return buckets;
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
    chart: buildChart(allOrders, days),
  };
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

export function ensureAdminSeed() {
  if (!Array.isArray(readJson(STORAGE_KEYS.categories, null))) {
    writeJson(STORAGE_KEYS.categories, categorySeed(), { silent: true });
  }
  if (!Array.isArray(readJson(STORAGE_KEYS.coupons, null))) {
    writeJson(STORAGE_KEYS.coupons, DEMO_COUPONS, { silent: true });
  }
  if (!readJson(STORAGE_KEYS.settings, null)) {
    writeJson(STORAGE_KEYS.settings, DEFAULT_SETTINGS, { silent: true });
  }
  if (!readJson(STORAGE_KEYS.customers, null)) {
    writeJson(STORAGE_KEYS.customers, { records: DEMO_CUSTOMERS, status: {} }, { silent: true });
  }
  if (!Array.isArray(readJson(STORAGE_KEYS.inventory, null))) {
    writeJson(STORAGE_KEYS.inventory, [], { silent: true });
  }
}

export function resetDemoData({ clearOrders = false } = {}) {
  removeStorageKey(STORAGE_KEYS.products);
  removeStorageKey(STORAGE_KEYS.stock);
  writeJson(STORAGE_KEYS.categories, categorySeed(), { silent: true });
  writeJson(STORAGE_KEYS.coupons, DEMO_COUPONS, { silent: true });
  writeJson(STORAGE_KEYS.settings, DEFAULT_SETTINGS, { silent: true });
  writeJson(STORAGE_KEYS.customers, { records: DEMO_CUSTOMERS, status: {} }, { silent: true });
  writeJson(STORAGE_KEYS.inventory, [], { silent: true });
  if (clearOrders) writeJson(STORAGE_KEYS.orders, []);
  window.dispatchEvent(new CustomEvent("wasooli-data", { detail: { key: STORAGE_KEYS.products } }));
  window.dispatchEvent(new CustomEvent("wasooli-data", { detail: { key: STORAGE_KEYS.stock } }));
  window.dispatchEvent(new CustomEvent("wasooli-data", { detail: { key: STORAGE_KEYS.orders } }));
  return { ok: true };
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
