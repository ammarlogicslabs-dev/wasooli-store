import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { formatPrice } from "../../data/product";
import { ORDER_STATUSES, paymentBucket, PAYMENT_LABELS, statusLabel } from "../../services/storage/orderStatus";
import AdminPagination from "../components/AdminPagination";
import AdminTable from "../components/AdminTable";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { inputClass } from "../components/formStyles";
import { paginate, useAdminData } from "../hooks/useAdminData";

export default function OrdersPage() {
  const { orders } = useAdminData();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [payment, setPayment] = useState("all");
  const [page, setPage] = useState(1);
  const status = params.get("status") || "all";

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return orders.filter((order) => {
      const orderStatus = order.adminStatus || "pending";
      const haystack = [order.id, order.delivery?.fullName, order.delivery?.phone, order.delivery?.city].join(" ").toLowerCase();
      const matchesQuery = !needle || haystack.includes(needle);
      const matchesStatus = status === "all" || orderStatus === status;
      const matchesPayment = payment === "all" || paymentBucket(order) === payment;
      return matchesQuery && matchesStatus && matchesPayment;
    });
  }, [orders, query, status, payment]);

  const view = paginate(filtered, page, 8);

  return (
    <div className="space-y-5">
      <PageHeader crumbs={[{ label: "Orders" }]} title="Orders" detail="Open an order to update fulfillment, payment, and tracking." />
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search customer, city, or order" className={inputClass} />
          <select
            value={status}
            onChange={(event) => { setParams(event.target.value === "all" ? {} : { status: event.target.value }); setPage(1); }}
            className={inputClass}
          >
            <option value="all">All statuses</option>
            {ORDER_STATUSES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
          <select value={payment} onChange={(event) => { setPayment(event.target.value); setPage(1); }} className={inputClass}>
            <option value="all">All payments</option>
            {Object.entries(PAYMENT_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
        </div>
        <div className="mt-4">
          <AdminTable
            rows={view.items}
            rowKey={(order) => order.id}
            onRowClick={(order) => navigate(`/admin/orders/${encodeURIComponent(order.id)}`)}
            empty="No orders match these filters."
            columns={[
              { key: "date", label: "Date", render: (order) => new Date(order.createdAt).toLocaleString("en-PK", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) },
              {
                key: "customer",
                label: "Customer & items",
                render: (order) => (
                  <span>
                    <span className="block font-semibold text-slate-900">{order.delivery?.fullName || "Customer"}</span>
                    <span className="block max-w-xs truncate text-xs text-slate-500">
                      {(order.items || []).map((item) => `${item.title} × ${item.quantity || 1}`).join(", ")}
                    </span>
                  </span>
                ),
              },
              { key: "city", label: "City", render: (order) => order.delivery?.city || "—" },
              { key: "total", label: "Total", render: (order) => formatPrice(order.total || 0) },
              { key: "payment", label: "Payment", render: (order) => <StatusBadge status={paymentBucket(order)}>{PAYMENT_LABELS[paymentBucket(order)]}</StatusBadge> },
              { key: "status", label: "Status", render: (order) => <StatusBadge status={order.adminStatus || "pending"}>{statusLabel(order.adminStatus || "pending")}</StatusBadge> },
            ]}
          />
          <AdminPagination page={view.page} pages={view.pages} total={view.total} onPage={setPage} />
        </div>
      </section>
    </div>
  );
}
