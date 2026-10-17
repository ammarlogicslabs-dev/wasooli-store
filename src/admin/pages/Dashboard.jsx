import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatPrice } from "../../data/product";
import { getDashboard } from "../../services/storage/adminDataService";
import { paymentBucket, PAYMENT_LABELS, statusLabel } from "../../services/storage/orderStatus";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { useAdminData } from "../hooks/useAdminData";

const RANGES = [7, 30, 90];

function SalesChart({ points }) {
  const max = Math.max(...points.map((point) => point.total), 1);
  return (
    <div className="flex h-56 items-end gap-2">
      {points.map((point) => (
        <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <div className="flex h-44 w-full items-end">
            <div
              className="w-full rounded-t-lg bg-brand-500"
              style={{ height: `${Math.max(6, (point.total / max) * 100)}%` }}
              title={formatPrice(point.total)}
            />
          </div>
          {points.length <= 12 ? <span className="truncate text-[10px] text-slate-400">{point.label}</span> : null}
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const data = useAdminData();
  const navigate = useNavigate();
  const [days, setDays] = useState(30);
  const dashboard = getDashboard(days, data);
  const cards = [
    ["Orders", dashboard.totalOrders],
    ["Sales", formatPrice(dashboard.sales)],
    ["Products", dashboard.productCount],
    ["Customers", dashboard.customerCount],
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        crumbs={[{ label: "Dashboard" }]}
        title="Dashboard"
        detail={`${data.settings.storeName} · last ${days} days, calculated from saved orders and products.`}
        actions={RANGES.map((range) => (
          <button
            key={range}
            type="button"
            onClick={() => setDays(range)}
            className={`h-10 cursor-pointer rounded-xl px-3 text-sm font-semibold ${days === range ? "bg-brand-500 text-white" : "border border-slate-200 bg-white text-slate-600"}`}
          >
            {range} days
          </button>
        ))}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <article key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Sales</h2>
          <div className="mt-4">
            {dashboard.chart.every((point) => point.total === 0) ? (
              <p className="py-16 text-center text-sm text-slate-500">No paid or open sales in this range yet.</p>
            ) : <SalesChart points={dashboard.chart} />}
          </div>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Order status</h2>
          <ul className="mt-4 space-y-3">
            {dashboard.statusCounts.map((status) => (
              <li key={status.id}>
                <button type="button" onClick={() => navigate(`/admin/orders?status=${status.id}`)} className="flex w-full cursor-pointer items-center justify-between rounded-xl px-2 py-1.5 text-left hover:bg-slate-50">
                  <span className="text-sm text-slate-600">{status.label}</span>
                  <span className="text-sm font-bold text-slate-900">{status.count}</span>
                </button>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Recent orders</h2>
            <Link to="/admin/orders" className="text-sm font-semibold text-brand-600">View all</Link>
          </div>
          <ul className="mt-3 divide-y divide-slate-100">
            {dashboard.recent.length === 0 ? <li className="py-8 text-sm text-slate-500">No orders yet.</li> : dashboard.recent.map((order) => (
              <li key={order.id}>
                <button type="button" onClick={() => navigate(`/admin/orders/${encodeURIComponent(order.id)}`)} className="flex w-full cursor-pointer items-center justify-between gap-3 py-3 text-left">
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-900">{order.delivery?.fullName || "Customer"}</span>
                    <span className="block truncate text-xs text-slate-600">
                      {(order.items || []).map((item) => `${item.title} × ${item.quantity || 1}`).join(", ") || "Order items"}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleString("en-PK", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })} · {PAYMENT_LABELS[paymentBucket(order)]}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-bold text-slate-900">{formatPrice(order.total || 0)}</span>
                    <StatusBadge status={order.adminStatus || "pending"}>{statusLabel(order.adminStatus || "pending")}</StatusBadge>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </article>

        <div className="space-y-4">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Top-selling products</h2>
            <ul className="mt-3 space-y-3">
              {dashboard.top.length === 0 ? <li className="text-sm text-slate-500">Sales will appear after orders are placed.</li> : dashboard.top.map((item) => (
                <li key={item.title} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-medium text-slate-800">{item.title}</span>
                  <span className="shrink-0 text-slate-500">{item.quantity} sold</span>
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Stock alerts</h2>
            <div className="mt-3 space-y-2">
              <button type="button" onClick={() => navigate("/admin/inventory?stock=low")} className="flex w-full cursor-pointer items-center justify-between rounded-2xl bg-amber-50 px-4 py-3 text-left">
                <span className="text-sm font-semibold text-amber-800">Low stock</span>
                <span className="text-sm font-bold text-amber-800">{dashboard.lowStock.length}</span>
              </button>
              <button type="button" onClick={() => navigate("/admin/inventory?stock=out")} className="flex w-full cursor-pointer items-center justify-between rounded-2xl bg-red-50 px-4 py-3 text-left">
                <span className="text-sm font-semibold text-red-700">Out of stock</span>
                <span className="text-sm font-bold text-red-700">{dashboard.outOfStock.length}</span>
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
