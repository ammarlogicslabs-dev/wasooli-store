import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { formatPrice } from "../../data/product";
import { getOrder, updateOrder } from "../../services/storage/adminDataService";
import { ORDER_STATUSES, paymentBucket, PAYMENT_LABELS, statusLabel } from "../../services/storage/orderStatus";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { buttonClass, inputClass, quietButtonClass } from "../components/formStyles";
import { useAdminData } from "../hooks/useAdminData";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { orders } = useAdminData();
  const decodedId = decodeURIComponent(id);
  const order = orders.find((item) => String(item.id) === String(decodedId)) || getOrder(decodedId);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState(order?.adminStatus || "pending");
  const [courier, setCourier] = useState(order?.courier || "Wasooli Express");
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || "");
  const [paymentStatus, setPaymentStatus] = useState(order ? paymentBucket(order) : "cod_pending");

  useEffect(() => {
    if (!order) return;
    setStatus(order.adminStatus || "pending");
    setCourier(order.courier || "Wasooli Express");
    setTrackingNumber(order.trackingNumber || "");
    setPaymentStatus(paymentBucket(order));
  }, [order?.id, order?.adminStatus, order?.courier, order?.trackingNumber, order?.paymentStatus, order?.payment?.method]);

  if (!order) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
        <p className="font-semibold text-slate-900">Order not found.</p>
        <Link to="/admin/orders" className="mt-3 inline-flex text-sm font-semibold text-brand-600">Back to orders</Link>
      </div>
    );
  }

  const isCancelled = order.adminStatus === "cancelled";
  const isRefunded = paymentBucket(order) === "refunded";

  async function apply(changes, success) {
    const updates = { ...changes };

    if (
      Object.prototype.hasOwnProperty.call(changes, "adminStatus") &&
      changes.adminStatus !== order.adminStatus
    ) {
      updates.adminStatusUpdatedAt = new Date().toISOString();
    }

    const result = await updateOrder(order.id, updates);

    if (!result.ok) {
      toast.error(result.message);
      return false;
    }
    toast.success(success);
    return true;
  }

  function requireCancelBeforeRefund() {
    if (isRefunded) {
      toast.info("This order is already refunded.");
      return false;
    }
    if (!isCancelled) {
      toast.error("Cancel the order first, then record the refund.");
      return false;
    }
    return true;
  }

  async function handleUpdatePayment() {
    if (paymentStatus === "refunded" && !requireCancelBeforeRefund()) return;
    await apply({ paymentStatus }, "Payment status updated.");
  }

  async function handleRecordRefund() {
    if (!requireCancelBeforeRefund()) return;
    setPaymentStatus("refunded");
    await apply({ paymentStatus: "refunded", note }, "Refund recorded.");
  }

  const history = [...(order.statusHistory || [])].reverse();

  return (
    <div className="space-y-5">
      <PageHeader
        crumbs={[{ label: "Orders", to: "/admin/orders" }, { label: "Details" }]}
        title={order.delivery?.fullName || "Order"}
        detail={`Placed ${new Date(order.createdAt).toLocaleString("en-PK")}`}
        actions={<StatusBadge status={order.adminStatus || "pending"}>{statusLabel(order.adminStatus || "pending")}</StatusBadge>}
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Items</h2>
            <ul className="mt-3 divide-y divide-slate-100">
              {(order.items || []).map((item, index) => (
                <li key={`${item.title}-${index}`} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span>
                    <span className="block font-semibold text-slate-900">{item.title}</span>
                    <span className="text-slate-500">Qty {item.quantity} · {formatPrice(item.price || 0)}</span>
                  </span>
                  <span className="font-semibold">{formatPrice((item.price || 0) * (item.quantity || 0))}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd>{formatPrice(order.subtotal || 0)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Shipping</dt><dd>{formatPrice(order.deliveryFee || 0)}</dd></div>
              <div className="flex justify-between font-bold text-slate-900"><dt>Total</dt><dd>{formatPrice(order.total || 0)}</dd></div>
            </dl>
          </section>
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Tracking timeline</h2>
            {history.length === 0 ? <p className="mt-3 text-sm text-slate-500">No admin updates yet. The customer page is still using the timed demo timeline.</p> : (
              <ol className="mt-4 space-y-4 border-l border-slate-200 pl-4">
                {history.map((event, index) => (
                  <li key={`${event.at}-${index}`}>
                    <p className="text-sm font-semibold text-slate-900">{event.type === "note" ? "Internal note" : event.type === "refund" ? "Refund" : statusLabel(event.status)}</p>
                    <p className="text-xs text-slate-500">{new Date(event.at).toLocaleString("en-PK")}</p>
                    {event.note ? <p className="mt-1 text-sm text-slate-600">{event.note}</p> : null}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
        <div className="space-y-5">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Customer</h2>
            <p className="mt-3 text-sm font-semibold text-slate-900">{order.delivery?.fullName}</p>
            <p className="text-sm text-slate-600">{order.delivery?.phone}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {order.delivery?.address}{order.delivery?.landmark ? `, ${order.delivery.landmark}` : ""}
              <br />
              {order.delivery?.city}, {order.delivery?.province}
            </p>
          </section>
          <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Fulfillment</h2>
            <label className="block text-sm font-semibold text-slate-900">Status
              <select value={status} onChange={(event) => setStatus(event.target.value)} className={`${inputClass} mt-1.5`}>
                {ORDER_STATUSES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-900">Courier
              <input value={courier} onChange={(event) => setCourier(event.target.value)} className={`${inputClass} mt-1.5`} />
            </label>
            <label className="block text-sm font-semibold text-slate-900">Tracking number
              <input value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} className={`${inputClass} mt-1.5`} />
            </label>
            <label className="block text-sm font-semibold text-slate-900">Internal note
              <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} className={`${inputClass} mt-1.5`} />
            </label>
            <button
              type="button"
              className={buttonClass}
              onClick={() => apply({ adminStatus: status, note, courier, trackingNumber }, "Order updated. The customer tracking page will follow this status.")}
            >
              Save status
            </button>
            <button type="button" className={quietButtonClass} onClick={() => { apply({ note, courier, trackingNumber }, "Note saved."); setNote(""); }}>
              Add note only
            </button>
          </section>
          <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Payment</h2>
            <p className="text-sm text-slate-500">{order.payment?.label || "Payment"} {order.payment?.reference ? `· ${order.payment.reference}` : ""}</p>
            {/* {isRefunded ? (
              <p className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                Refund recorded. Payment details are read-only.
              </p>
            ) : !isCancelled ? (
              <p className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Cancel the order first before recording a refund.
              </p>
            ) : null} */}
            <select
              value={paymentStatus}
              onChange={(event) => setPaymentStatus(event.target.value)}
              disabled={isRefunded}
              className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70`}
            >
              {Object.entries(PAYMENT_LABELS).map(([value, label]) => (
                <option key={value} value={value} disabled={value === "refunded" && !isCancelled && !isRefunded}>
                  {label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={quietButtonClass}
              disabled={isRefunded}
              onClick={handleUpdatePayment}
            >
              Update payment
            </button>
            <button
              type="button"
              disabled={isRefunded}
              className="inline-flex h-10 cursor-pointer items-center rounded-xl border border-rose-200 px-4 text-sm font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleRecordRefund}
            >
              Record refund
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
