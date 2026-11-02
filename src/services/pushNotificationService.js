import { apiRequest } from "./api/client";
import { statusLabel } from "./storage/orderStatus";

// Public VAPID key (Safe to be public on frontend; private key stays on backend)
export const DEFAULT_VAPID_PUBLIC_KEY =
  "BOrKQRaX941KeQFgqlrWimeDnNfTuSUMLRM7WdDd4zf7zFuZosgVUr_-48rJ-NsEBDa4O6FOJdgL2YtQUBpH4vI";

export const VAPID_PUBLIC_KEY =
  import.meta.env.VITE_VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC_KEY;

export const PUSH_STORAGE_KEY = "wasooli_push_subscription";
export const ORDER_NOTIFICATIONS_STORAGE_KEY = "wasooli_order_notifications";
export const DISMISSED_ORDER_NOTIFS_STORAGE_KEY = "wasooli_dismissed_order_notifs";

/**
 * Returns formatted title, message, tone, and badge info for order status
 */
export function getOrderStatusNotificationInfo(orderId, status) {
  const normStatus = String(status || "").toLowerCase().trim();
  switch (normStatus) {
    case "pending":
    case "confirmed":
      return {
        status: "pending",
        badgeLabel: "Order Confirmed",
        title: `Order Confirmed: #${orderId} 📋`,
        message: `Aapka order Wasooli Store par receive ho chuka hai. Hamari team isko prepare kar rahi hai.`,
        tone: "amber",
      };
    case "packed":
      return {
        status: "packed",
        badgeLabel: "Order Packed",
        title: `Order Packed: #${orderId} 📦`,
        message: `Aapka package warehouse me safely pack ho chuka hai aur dispatch ke liye ready hai.`,
        tone: "sky",
      };
    case "shipped":
    case "handover":
      return {
        status: "shipped",
        badgeLabel: "In Transit",
        title: `Handed Over to Courier: #${orderId} 🚚`,
        message: `Aapka package courier delivery partner ko handover kar diya gaya hai aur transit me hai.`,
        tone: "indigo",
      };
    case "out_for_delivery":
      return {
        status: "out_for_delivery",
        badgeLabel: "Out for Delivery",
        title: `Out for Delivery: #${orderId} 🛵`,
        message: `Rider aapke delivery address par rawana ho chuka hai! Jald hi delivery pohnch jayegi.`,
        tone: "purple",
      };
    case "delivered":
      return {
        status: "delivered",
        badgeLabel: "Delivered",
        title: `Order Delivered: #${orderId} 🎉`,
        message: `Aapka order kamyabi se deliver ho gaya hai. Wasooli Store se shopping ka shukriya!`,
        tone: "emerald",
      };
    case "cancelled":
      return {
        status: "cancelled",
        badgeLabel: "Cancelled",
        title: `Order Cancelled: #${orderId} ❌`,
        message: `Aapka order cancel kar diya gaya hai. Kisi bhi sawal ki soorat me support team se rabta karein.`,
        tone: "rose",
      };
    default:
      return {
        status: normStatus || "pending",
        badgeLabel: statusLabel(status) || "Order Update",
        title: `Order Update: #${orderId}`,
        message: `Aapke order ka status ab "${statusLabel(status) || status}" update ho chuka hai.`,
        tone: "brand",
      };
  }
}

/** Read stored in-app order notifications from localStorage */
export function getStoredOrderNotifications() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ORDER_NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Read list of dismissed notification IDs */
export function getDismissedOrderNotificationIds() {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DISMISSED_ORDER_NOTIFS_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

/** Save an in-app order notification to localStorage and dispatch event */
export function saveOrderNotification(notification) {
  if (typeof window === "undefined" || !notification) return;
  try {
    const list = getStoredOrderNotifications();
    const existingIndex = list.findIndex(
      (n) =>
        n.id === notification.id ||
        (n.orderId === notification.orderId &&
          n.status === notification.status &&
          Math.abs(new Date(n.createdAt).getTime() - new Date(notification.createdAt).getTime()) < 60000)
    );

    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...notification };
    } else {
      list.unshift(notification);
    }

    const trimmed = list.slice(0, 50);
    localStorage.setItem(ORDER_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(trimmed));
    window.dispatchEvent(
      new CustomEvent("wasooli-order-notification-change", { detail: trimmed })
    );
  } catch (err) {
    console.warn("Could not save order notification:", err);
  }
}

/** Mark all order notifications as read */
export function markOrderNotificationsRead() {
  if (typeof window === "undefined") return;
  try {
    const list = getStoredOrderNotifications();
    let changed = false;
    const updated = list.map((item) => {
      if (!item.read) {
        changed = true;
        return { ...item, read: true };
      }
      return item;
    });
    if (changed) {
      localStorage.setItem(ORDER_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent("wasooli-order-notification-change", { detail: updated })
      );
    }
  } catch {
    // ignore
  }
}

/** Remove an individual order notification */
export function removeOrderNotification(id) {
  if (typeof window === "undefined" || !id) return;
  try {
    // 1. Add to dismissed IDs so auto-seeding does not re-add it
    const dismissed = getDismissedOrderNotificationIds();
    dismissed.add(id);
    localStorage.setItem(
      DISMISSED_ORDER_NOTIFS_STORAGE_KEY,
      JSON.stringify(Array.from(dismissed))
    );

    // 2. Remove from stored notifications
    const list = getStoredOrderNotifications();
    const filtered = list.filter((item) => item.id !== id);
    localStorage.setItem(ORDER_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(
      new CustomEvent("wasooli-order-notification-change", { detail: filtered })
    );
  } catch {
    // ignore
  }
}

/** Clear all stored order notifications */
export function clearOrderNotifications() {
  if (typeof window === "undefined") return;
  try {
    const list = getStoredOrderNotifications();
    const dismissed = getDismissedOrderNotificationIds();
    list.forEach((item) => {
      if (item.id) dismissed.add(item.id);
    });
    localStorage.setItem(
      DISMISSED_ORDER_NOTIFS_STORAGE_KEY,
      JSON.stringify(Array.from(dismissed))
    );
    localStorage.removeItem(ORDER_NOTIFICATIONS_STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent("wasooli-order-notification-change", { detail: [] })
    );
  } catch {
    // ignore
  }
}

/** Converts base64url string to Uint8Array for PushManager subscribe */
export function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/** Check if Web Push Notifications are supported on this device/browser */
export function isPushSupported() {
  if (typeof window === "undefined") return false;
  return (
    "Notification" in window &&
    ("serviceWorker" in navigator || "PushManager" in window)
  );
}

/** Detect if device is iOS (iPhone / iPad) */
export function isIOS() {
  if (typeof window === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/** Check if running as installed standalone PWA */
export function isStandalonePWA() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

/** Get current browser notification permission status */
export function getPushPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission; // "default" | "granted" | "denied"
}

/** Read locally cached subscription */
export function getStoredSubscription() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PUSH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Get Service Worker registration with timeout protection so it NEVER hangs indefinitely
 */
export async function getSWRegistration(timeoutMs = 2500) {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  // 1. Check if an active registration already exists
  try {
    const existing = await navigator.serviceWorker.getRegistration();
    if (existing && existing.active) {
      return existing;
    }
  } catch {
    // ignore
  }

  // 2. Trigger registration if none exists
  let directReg = null;
  try {
    directReg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch {
    try {
      directReg = await navigator.serviceWorker.register("/sw-push.js", { scope: "/" });
    } catch {
      // ignore
    }
  }

  // 3. Race navigator.serviceWorker.ready with a timeout so it never blocks the UI
  const readyPromise = navigator.serviceWorker.ready.catch(() => directReg);
  const timeoutPromise = new Promise((resolve) =>
    setTimeout(() => resolve(directReg || null), timeoutMs)
  );

  const finalReg = await Promise.race([readyPromise, timeoutPromise]);
  return finalReg || directReg || null;
}

/** Get active PushSubscription from browser's PushManager */
export async function getActiveSubscription() {
  if (!isPushSupported()) return null;
  try {
    const registration = await getSWRegistration(2000);
    if (!registration || !registration.pushManager) return null;
    return await registration.pushManager.getSubscription();
  } catch (err) {
    console.warn("Could not check push subscription:", err);
    return null;
  }
}

/**
 * Subscribe user's mobile device or browser to Web Push
 * 1. Requests permission
 * 2. Gets PushManager token with VAPID key
 * 3. Saves locally
 * 4. Sends to Backend API (POST /api/notifications/subscribe)
 */
export async function subscribeToPushNotifications(user = null) {
  if (!isPushSupported()) {
    if (isIOS() && !isStandalonePWA()) {
      throw new Error(
        "iPhone par push notifications ke liye pehle Safari menu se 'Add to Home Screen' karein."
      );
    }
    throw new Error("Aapka browser Web Push notifications support nahi karta.");
  }

  // 1. Request Permission from customer
  const permission = await Notification.requestPermission();
  if (permission === "denied") {
    throw new Error(
      "Notification permission block hai. Browser settings me ja kar allow karein."
    );
  }
  if (permission !== "granted") {
    throw new Error("Notification permission allow nahi ki gayi.");
  }

  // 2. Register with PushManager (with timeout protection)
  let subJson = null;
  try {
    const registration = await getSWRegistration(3000);
    if (registration && registration.pushManager) {
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });
      }

      if (subscription) {
        subJson = subscription.toJSON();
      }
    }
  } catch (subErr) {
    console.warn("PushManager subscribe notice:", subErr.message);
  }

  // 3. Save locally in localStorage for fast UI states
  try {
    localStorage.setItem(
      PUSH_STORAGE_KEY,
      JSON.stringify({
        subscription: subJson,
        permission: "granted",
        updatedAt: new Date().toISOString(),
        userId: user?.id || null,
        userEmail: user?.email || null,
      })
    );
  } catch {
    // ignore quota
  }

  // 4. Send to Backend API (non-blocking with timeout so it never hangs)
  if (subJson) {
    Promise.race([
      apiRequest("/api/notifications/subscribe", {
        method: "POST",
        body: {
          subscription: subJson,
          deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent)
            ? "mobile"
            : "desktop",
          userAgent: navigator.userAgent,
          customerId: user?.id || null,
          customerEmail: user?.email || null,
          customerName: user?.name || null,
        },
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 3000)),
    ]).catch((apiError) => {
      console.info(
        "Backend /api/notifications/subscribe pending:",
        apiError.message
      );
    });
  }

  return { success: true, subscription: subJson };
}

/**
 * Unsubscribe user from Push Notifications
 */
export async function unsubscribeFromPushNotifications(user = null) {
  if (!isPushSupported()) return { success: true };

  try {
    const registration = await getSWRegistration(2000);
    if (registration && registration.pushManager) {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
    }
  } catch (err) {
    console.warn("Error unsubscribing locally:", err);
  }

  // Remove local copy
  try {
    localStorage.removeItem(PUSH_STORAGE_KEY);
  } catch {
    // ignore
  }

  // Notify backend (non-blocking)
  Promise.race([
    apiRequest("/api/notifications/unsubscribe", {
      method: "POST",
      body: {
        customerId: user?.id || null,
        customerEmail: user?.email || null,
      },
    }),
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 2500)),
  ]).catch(() => {
    // Ignore backend not ready
  });

  return { success: true };
}

/**
 * Triggers an immediate local test notification with sound & vibration
 * on the current device. Has native Notification fallback so it NEVER hangs!
 */
export async function sendLocalTestNotification({
  title = "Wasooli Store Order Update 📦",
  body = "Aapka Order #WAS-8921 ab 'Out for Delivery' ho chuka hai! Delivery boy aapke address par rawana hai.",
  url = "/account?section=orders",
} = {}) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    throw new Error("Notifications is device par support nahi hain.");
  }

  // Ensure permission is granted
  let permission = Notification.permission;
  if (permission !== "granted") {
    permission = await Notification.requestPermission();
  }
  if (permission !== "granted") {
    throw new Error("Pehle browser notification allow karein.");
  }

  let shown = false;

  // 1. Try Service Worker showNotification first (supports vibration, actions, background)
  try {
    const registration = await getSWRegistration(2000);
    if (registration && typeof registration.showNotification === "function") {
      await registration.showNotification(title, {
        body,
        icon: "/favicon.png",
        badge: "/favicon.png",
        vibrate: [200, 100, 200, 100, 200],
        data: { url },
        tag: `wasooli-test-${Date.now()}`,
        renotify: true,
      });
      shown = true;
    }
  } catch (swErr) {
    console.warn("ServiceWorker showNotification failed, trying fallback:", swErr);
  }

  // 2. If Service Worker is not available or timed out, use native window.Notification!
  if (!shown) {
    try {
      const notif = new Notification(title, {
        body,
        icon: "/favicon.png",
        badge: "/favicon.png",
        tag: `wasooli-test-${Date.now()}`,
      });
      notif.onclick = () => {
        window.focus();
        if (url) window.location.href = url;
      };
      shown = true;
    } catch (notifErr) {
      console.warn("Native Notification constructor fallback failed:", notifErr);
    }
  }

  // 3. Optional backend test ping (non-blocking with 2s timeout)
  Promise.race([
    apiRequest("/api/notifications/test", {
      method: "POST",
      body: { title, body, url },
    }),
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 2000)),
  ]).catch(() => {
    // Backend API pending, ignore
  });

  if (!shown) {
    throw new Error("Notification display nahi ho saki. Browser permissions check karein.");
  }

  // Also save in-app notification so it appears in the Notification section immediately
  try {
    saveOrderNotification({
      id: `notif-test-${Date.now()}`,
      orderId: "WAS-8921",
      status: "out_for_delivery",
      title,
      message: body,
      url,
      createdAt: new Date().toISOString(),
      read: false,
      items: [
        {
          id: "test-item-1",
          title: "Wasooli High Speed GaN Charger 65W",
          price: 3500,
          quantity: 1,
          image: "/favicon.png",
        },
      ],
      total: 3500,
    });
  } catch {
    // ignore
  }

  return { success: true };
}

/**
 * Helper to notify customer when an order status changes (e.g. from Admin Panel)
 */
export async function notifyOrderStatusChange(order, newStatus) {
  if (!order) return;

  const orderId = order.id || order.internalId || "";
  const info = getOrderStatusNotificationInfo(orderId, newStatus);
  const title = info.title;
  const body = info.message;
  const url = `/account?section=orders&orderId=${encodeURIComponent(orderId)}`;

  // 1. Save in-app notification locally for the customer
  saveOrderNotification({
    id: `notif-order-${orderId}-${newStatus}-${Date.now()}`,
    orderId,
    status: newStatus,
    title,
    message: body,
    url,
    createdAt: new Date().toISOString(),
    read: false,
    items: order.items || [],
    total: order.total || 0,
    customerId: order.customerId || null,
  });

  // 2. Tell backend to push to customer's subscribed devices (non-blocking)
  Promise.race([
    apiRequest(`/api/admin/orders/${encodeURIComponent(orderId)}/notify`, {
      method: "POST",
      kind: "admin",
      body: {
        orderId,
        newStatus,
        title,
        body,
        url,
        customerId: order.customerId,
        customerPhone: order.delivery?.phone || order.customerPhone,
      },
    }),
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 3000)),
  ]).catch(() => {
    // Backend API pending
  });

  // 3. If testing locally or on same device, trigger service worker notification
  if (isPushSupported() && Notification.permission === "granted") {
    try {
      const registration = await getSWRegistration(2000);
      if (registration && typeof registration.showNotification === "function") {
        await registration.showNotification(title, {
          body,
          icon: "/favicon.png",
          badge: "/favicon.png",
          vibrate: [200, 100, 200],
          tag: `order-${orderId}-${newStatus}`,
          renotify: true,
          data: { url, orderId, status: newStatus },
        });
      } else {
        const notif = new Notification(title, { body, icon: "/favicon.png" });
        notif.onclick = () => {
          window.focus();
          if (url) window.location.href = url;
        };
      }
    } catch {
      // ignore
    }
  }
}
