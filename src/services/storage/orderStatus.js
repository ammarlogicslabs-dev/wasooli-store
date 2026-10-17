export const ORDER_FLOW = [
  { id: "pending", label: "Order Confirmed", stage: 0 },
  { id: "packed", label: "Order Packed", stage: 1 },
  { id: "shipped", label: "Handed Over to Delivery Partner", stage: 2 },
  { id: "out_for_delivery", label: "Rider Will Arrive Soon", stage: 3 },
  { id: "delivered", label: "Delivered", stage: 4 },
];

export const ORDER_STATUSES = [
  ...ORDER_FLOW,
  { id: "cancelled", label: "Cancelled", stage: null },
];

const STAGE_BY_STATUS = {
  pending: 0,
  confirmed: 0,
  packed: 1,
  shipped: 2,
  handover: 2,
  out_for_delivery: 3,
  delivered: 4,
};

export function statusLabel(status) {
  return ORDER_STATUSES.find((item) => item.id === status)?.label || "Order Confirmed";
}

export function adminStage(order) {
  if (!order?.adminStatus) return null;
  if (order.adminStatus === "cancelled") {
    const previous = [...(order.statusHistory || [])]
      .reverse()
      .find((event) => event.type !== "note" && event.type !== "refund" && STAGE_BY_STATUS[event.status] != null && event.status !== "cancelled");
    return previous ? STAGE_BY_STATUS[previous.status] : 0;
  }
  const stage = STAGE_BY_STATUS[order.adminStatus];
  return Number.isInteger(stage) ? stage : null;
}

export function historyTimeForStage(order, stage) {
  const match = (order?.statusHistory || []).find(
    (event) => event.type !== "note" && event.type !== "refund" && STAGE_BY_STATUS[event.status] === stage
  );
  return match?.at || null;
}

export function paymentBucket(order) {
  if (order?.paymentStatus === "refunded") return "refunded";
  if (order?.paymentStatus === "paid" || order?.payment?.method === "bank") return "paid";
  if (order?.paymentStatus === "cod_collected" || order?.adminStatus === "delivered") return "cod_collected";
  return "cod_pending";
}

export const PAYMENT_LABELS = {
  cod_pending: "COD pending",
  cod_collected: "COD collected",
  paid: "Paid",
  refunded: "Refunded",
};
