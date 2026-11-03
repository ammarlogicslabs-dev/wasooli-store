// 1. Listen for incoming Web Push events from backend / web-push server
self.addEventListener("push", (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = {
        title: "Wasooli Store",
        body: event.data.text() || "Order update received.",
      };
    }
  }

  const title = data.title || "Wasooli Store Order Update";
  const options = {
    body: data.body || "Your order status has been updated.",
    icon: data.icon || "/favicon.png",
    badge: data.badge || "/favicon.png",
    image: data.image || undefined,
    vibrate: data.vibrate || [200, 100, 200, 100, 200],
    tag: data.tag || `wasooli-order-${data.orderId || Date.now()}`,
    renotify: true,
    requireInteraction: true,
    data: {
      url: data.url || (data.orderId ? `/account?section=orders&orderId=${data.orderId}` : "/account"),
      orderId: data.orderId,
      timestamp: Date.now(),
    },
    actions: data.actions || [
      { action: "view_order", title: "View Order" },
      { action: "close", title: "Dismiss" },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 2. Listen for clicks on the notification pop-up
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") return;

  const targetUrl = event.notification.data?.url || "/account";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if ("focus" in client) {
            client.focus();
            if ("navigate" in client) {
              client.navigate(targetUrl);
            }
            return;
          }
        }
        // If not open, open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

