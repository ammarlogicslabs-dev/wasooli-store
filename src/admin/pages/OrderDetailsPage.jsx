import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ChevronDown, Search, X } from "lucide-react";
import { formatPrice } from "../../data/product";
import { getOrder, updateOrder } from "../../services/storage/adminDataService";
import { ORDER_STATUSES, paymentBucket, PAYMENT_LABELS, statusLabel } from "../../services/storage/orderStatus";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { buttonClass, inputClass, quietButtonClass } from "../components/formStyles";
import { useAdminData } from "../hooks/useAdminData";

function OrderSearchSwitcher({ orders = [], currentOrder, onSelect }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const currentLabel = currentOrder
    ? `${currentOrder.id} - ${currentOrder.delivery?.fullName || "Customer"}`
    : "";

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders.slice(0, 20);
    return orders.filter((o) => {
      const haystack = [
        o.id,
        o.delivery?.fullName,
        o.delivery?.phone,
        o.delivery?.city,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [orders, search]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(id) {
    setOpen(false);
    setSearch("");
    inputRef.current?.blur();
    onSelect(id);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && filteredOrders.length > 0) {
      e.preventDefault();
      handleSelect(filteredOrders[0].id);
    } else if (e.key === "Escape") {
      setOpen(false);
      setSearch("");
      inputRef.current?.blur();
    }
  }

  return (
    <div ref={containerRef} className="relative w-64 sm:w-80">
      <div className="relative">
        <Search
          size={14}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          ref={inputRef}
          type="text"
          value={open ? search : currentLabel}
          onFocus={() => {
            setOpen(true);
            setSearch("");
          }}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={open ? "Search order ID or name…" : currentLabel}
          title="Search order by ID or customer name"
          className="h-8.5 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-7 text-xs font-medium text-slate-800 shadow-2xs outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 placeholder:text-slate-400"
        />
        {open && search ? (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X size={13} />
          </button>
        ) : (
          <ChevronDown
            size={13}
            className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 transition-transform duration-200 ${
              open ? "rotate-180 text-brand-600" : ""
            }`}
          />
        )}
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl scrollbar-thin [scrollbar-color:#cbd5e1_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-button]:hidden">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {search ? `Results (${filteredOrders.length})` : "Recent Orders"}
          </div>
          {filteredOrders.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-slate-400">
              No orders found for &ldquo;{search}&rdquo;
            </div>
          ) : (
            filteredOrders.map((o) => {
              const isSelected = o.id === currentOrder?.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(o.id);
                  }}
                  className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition ${
                    isSelected
                      ? "bg-brand-50 font-semibold text-brand-700"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="font-semibold text-slate-900 shrink-0">
                    {o.id}
                  </span>
                  <span className="text-slate-300 shrink-0">-</span>
                  <span className="truncate text-slate-600 font-medium">
                    {o.delivery?.fullName || "Customer"}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function orderFormKey(order) {
  if (!order) return "";
  return [
    order.id,
    order.adminStatus,
    order.courier,
    order.trackingNumber,
    order.paymentStatus,
    order.payment?.method,
  ].join("|");
}

export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders } = useAdminData();
  const decodedId = decodeURIComponent(id || "");
  const order =
    id && id !== "details" && id !== "latest"
      ? orders.find((item) => String(item.id) === String(decodedId)) || getOrder(decodedId)
      : orders?.[0] || null;
  const [note, setNote] = useState("");
  const [status, setStatus] = useState(order?.adminStatus || "pending");
  const [courier, setCourier] = useState(order?.courier || "Wasooli Express");
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || "");
  const [paymentStatus, setPaymentStatus] = useState(order ? paymentBucket(order) : "cod_pending");
  const [syncedKey, setSyncedKey] = useState(() => orderFormKey(order));

  const nextKey = orderFormKey(order);
  if (order && nextKey !== syncedKey) {
    setSyncedKey(nextKey);
    setStatus(order.adminStatus || "pending");
    setCourier(order.courier || "Wasooli Express");
    setTrackingNumber(order.trackingNumber || "");
    setPaymentStatus(paymentBucket(order));
  }

  if (!order) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs">
        <p className="font-semibold text-slate-900">No orders found.</p>
        <p className="mt-1 text-sm text-slate-500">There are no orders placed in the store yet.</p>
        <Link to="/admin/orders" className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-600">Back to all orders</Link>
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
        crumbs={[{ label: "Orders", to: "/admin/orders" }, { label: `#${order.id || "Details"}` }]}
        title={order.delivery?.fullName || "Order"}
        detail={`Placed ${new Date(order.createdAt).toLocaleString("en-PK")} · Order #${order.id}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {orders.length > 0 && (
              <OrderSearchSwitcher
                orders={orders}
                currentOrder={order}
                onSelect={(selectedId) => navigate(`/admin/orders/${encodeURIComponent(selectedId)}`)}
              />
            )}
            <StatusBadge status={order.adminStatus || "pending"}>
              {statusLabel(order.adminStatus || "pending")}
            </StatusBadge>
          </div>
        }
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
            {history.length === 0 ? <p className="mt-3 text-sm text-slate-500">No status updates yet for this order.</p> : (
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
              <input value={courier} onChange={(event) => setCourier(event.target.value)} placeholder="e.g. TCS, Leopards, Trax" className={`${inputClass} mt-1.5`} />
            </label>
            <label className="block text-sm font-semibold text-slate-900">Tracking number
              <input value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} placeholder="e.g. TRK123456789" className={`${inputClass} mt-1.5`} />
            </label>
            <label className="block text-sm font-semibold text-slate-900">Internal note
              <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add an internal note or update about this order..." rows={3} className={`${inputClass} mt-1.5`} />
            </label>
           <div className="flex flex-wrap items-center gap-3">
  <button
    type="button"
    className={buttonClass}
    onClick={() => apply({ adminStatus: status, note, courier, trackingNumber }, "Order updated. The customer tracking page will follow this status.")}
  >
    Save status
  </button>
  <button
    type="button"
    className={quietButtonClass}
    onClick={() => { apply({ note, courier, trackingNumber }, "Note saved."); setNote(""); }}
  >
    Add note only
  </button>
</div>
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
