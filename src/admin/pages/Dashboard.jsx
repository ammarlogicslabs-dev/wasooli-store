import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Inbox,
  Package,
  PackageX,
  Users,
  Wallet,
} from "lucide-react";
import { formatPrice } from "../../data/product";
import { getDashboard } from "../../services/storage/adminDataService";
import { paymentBucket, PAYMENT_LABELS, statusLabel } from "../../services/storage/orderStatus";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { useAdminData } from "../hooks/useAdminData";

const RANGES = [7, 30, 90];

// Colour for each order status dot/bar (falls back to grey for unknown ids).
const STATUS_TONES = [
  [/cancel|fail|refund|return/, "bg-red-500"],
  [/deliver|complete|paid/, "bg-emerald-500"],
  [/ship|dispatch|transit/, "bg-violet-500"],
  [/process|confirm|pack/, "bg-sky-500"],
  [/pending|new/, "bg-amber-500"],
];

function statusTone(id) {
  const key = String(id || "").toLowerCase();
  const match = STATUS_TONES.find(([pattern]) => pattern.test(key));
  return match ? match[1] : "bg-slate-400";
}

const compactNumber = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const compactMoney = (value) => `Rs ${compactNumber.format(value)}`;

const ANIMATIONS = `
@keyframes dash-grow {
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
}
@keyframes dash-rise {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.dash-bar  { transform-origin: bottom; animation: dash-grow .6s cubic-bezier(.22,1,.36,1) both; }
.dash-rise { animation: dash-rise .5s cubic-bezier(.22,1,.36,1) both; }
@media (prefers-reduced-motion: reduce) {
  .dash-bar, .dash-rise { animation: none !important; }
}
`;

function Card({ title, action, children, className = "" }) {
  return (
    <article className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </article>
  );
}

function EmptyState({ icon: Icon = Inbox, children }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-slate-100 text-slate-400">
        <Icon size={20} />
      </span>
      <p className="mt-3 max-w-xs text-sm text-slate-500">{children}</p>
    </div>
  );
}

function SalesChart({ points }) {
  const max = Math.max(...points.map((point) => point.total), 1);
  const ticks = [1, 0.75, 0.5, 0.25, 0];
  const labelStep = Math.ceil(points.length / 8);

  return (
    <div className="flex gap-3">
      <div className="flex h-48 flex-col justify-between text-right text-[10px] leading-none text-slate-400">
        {ticks.map((tick) => (
          <span key={tick}>{compactMoney(max * tick)}</span>
        ))}
      </div>

      <div className="min-w-0 flex-1">
        <div className="relative h-48">
          <div className="absolute inset-0 flex flex-col justify-between" aria-hidden="true">
            {ticks.map((tick) => (
              <div key={tick} className="border-t border-dashed border-slate-100" />
            ))}
          </div>

          <div className="relative flex h-full items-end gap-1 sm:gap-1.5">
            {points.map((point, index) => (
              <div key={point.label} className="group relative flex h-full min-w-0 flex-1 items-end">
                <div
                  className="relative w-full"
                  style={{ height: `${Math.max(point.total > 0 ? 4 : 1, (point.total / max) * 100)}%` }}
                >
                  <div
                    className="dash-bar h-full w-full rounded-t-md bg-gradient-to-t from-brand-600 to-brand-400 transition group-hover:from-brand-700 group-hover:to-brand-500"
                    style={{ animationDelay: `${Math.min(index * 20, 400)}ms` }}
                  />
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                    <span className="block text-[10px] text-slate-300">{point.label}</span>
                    <span className="font-semibold">{formatPrice(point.total)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-2 flex gap-1 sm:gap-1.5">
          {points.map((point, index) => (
            <span key={point.label} className="min-w-0 flex-1 truncate text-center text-[10px] text-slate-400">
              {index % labelStep === 0 ? point.label : ""}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const data = useAdminData();
  const navigate = useNavigate();
  const [days, setDays] = useState(30);
  const dashboard = getDashboard(days, data);

  const attention = dashboard.lowStock.length + dashboard.outOfStock.length;
  const cards = [
    {
      label: "Orders",
      value: dashboard.totalOrders,
      note: `Last ${days} days`,
      icon: ClipboardList,
      tone: "bg-brand-50 text-brand-600",
      to: "/admin/orders",
    },
    {
      label: "Sales",
      value: formatPrice(dashboard.sales),
      note: `Last ${days} days`,
      icon: Wallet,
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Products",
      value: dashboard.productCount,
      note: attention > 0 ? `${attention} need attention` : "All well stocked",
      icon: Package,
      tone: "bg-violet-50 text-violet-600",
      to: "/admin/inventory",
    },
    {
      label: "Customers",
      value: dashboard.customerCount,
      note: "From saved orders",
      icon: Users,
      tone: "bg-amber-50 text-amber-600",
    },
  ];

  const chartTotal = dashboard.chart.reduce((sum, point) => sum + point.total, 0);
  const chartAverage = dashboard.chart.length ? chartTotal / dashboard.chart.length : 0;
  const bestPoint = dashboard.chart.reduce((best, point) => (point.total > (best?.total ?? 0) ? point : best), null);
  const noSales = dashboard.chart.every((point) => point.total === 0);

  const statusTotal = dashboard.statusCounts.reduce((sum, status) => sum + status.count, 0);
  const topMax = Math.max(...dashboard.top.map((item) => item.quantity), 1);

  return (
    <div className="space-y-6">
      <style>{ANIMATIONS}</style>

      <PageHeader
        crumbs={[{ label: "Dashboard" }]}
        title="Dashboard"
        detail={`${data.settings.storeName} · last ${days} days, calculated from saved orders and products.`}
        actions={
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1" role="group" aria-label="Date range">
            {RANGES.map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setDays(range)}
                aria-pressed={days === range}
                className={`h-8 cursor-pointer rounded-lg px-3 text-sm font-semibold transition ${
                  days === range ? "bg-brand-500 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {range} days
              </button>
            ))}
          </div>
        }
      />

      {/* Key numbers */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, note, icon: Icon, tone, to }, index) => {
          const content = (
            <>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tone}`}>
                  <Icon size={18} />
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{value}</p>
              <p className="mt-1 text-xs text-slate-500">{note}</p>
            </>
          );
          const classes =
            "dash-rise block rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md";
          return to ? (
            <Link key={label} to={to} className={classes} style={{ animationDelay: `${index * 60}ms` }}>
              {content}
            </Link>
          ) : (
            <article key={label} className={classes} style={{ animationDelay: `${index * 60}ms` }}>
              {content}
            </article>
          );
        })}
      </section>

      {/* Sales + status */}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        <Card title="Sales">
          {noSales ? (
            <EmptyState icon={Wallet}>No paid or open sales in this range yet.</EmptyState>
          ) : (
            <>
              <div className="mb-5 grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-3 text-center sm:text-left">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Total</p>
                  <p className="mt-0.5 text-sm font-bold text-slate-900 sm:text-base">{formatPrice(chartTotal)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Average</p>
                  <p className="mt-0.5 text-sm font-bold text-slate-900 sm:text-base">{formatPrice(Math.round(chartAverage))}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Best day</p>
                  <p className="mt-0.5 truncate text-sm font-bold text-slate-900 sm:text-base">{bestPoint?.label || "-"}</p>
                </div>
              </div>
              <SalesChart points={dashboard.chart} />
            </>
          )}
        </Card>

        <Card title="Order status">
          {statusTotal === 0 ? (
            <EmptyState icon={ClipboardList}>Orders will be grouped by status here.</EmptyState>
          ) : (
            <ul className="space-y-1">
              {dashboard.statusCounts.map((status) => {
                const share = statusTotal ? (status.count / statusTotal) * 100 : 0;
                return (
                  <li key={status.id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/orders?status=${status.id}`)}
                      className="group w-full cursor-pointer rounded-xl px-2 py-2 text-left transition hover:bg-slate-50"
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
                          <span className={`size-2 shrink-0 rounded-full ${statusTone(status.id)}`} />
                          <span className="truncate">{status.label}</span>
                        </span>
                        <span className="text-sm font-bold text-slate-900">{status.count}</span>
                      </span>
                      <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <span
                          className={`block h-full rounded-full transition-all duration-500 ${statusTone(status.id)}`}
                          style={{ width: `${share}%` }}
                        />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </section>

      {/* Orders + products + stock */}
      <section className="grid gap-4 xl:grid-cols-2">
        <Card
          title="Recent orders"
          action={
            <Link to="/admin/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
              View all <ArrowRight size={14} />
            </Link>
          }
        >
          {dashboard.recent.length === 0 ? (
            <EmptyState>No orders yet.</EmptyState>
          ) : (
            <ul className="-my-1 divide-y divide-slate-100">
              {dashboard.recent.map((order) => {
                const name = order.delivery?.fullName || "Customer";
                return (
                  <li key={order.id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/orders/${encodeURIComponent(order.id)}`)}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-xl py-3 text-left transition hover:bg-slate-50 sm:px-2"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-600">
                        {name.charAt(0).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-900">{name}</span>
                        <span className="block truncate text-xs text-slate-600">
                          {(order.items || []).map((item) => `${item.title} × ${item.quantity || 1}`).join(", ") || "Order items"}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {new Date(order.createdAt).toLocaleString("en-PK", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })} · {PAYMENT_LABELS[paymentBucket(order)]}
                        </span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-1">
                        <span className="text-sm font-bold text-slate-900">{formatPrice(order.total || 0)}</span>
                        <StatusBadge status={order.adminStatus || "pending"}>{statusLabel(order.adminStatus || "pending")}</StatusBadge>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <div className="space-y-4">
          <Card title="Top-selling products">
            {dashboard.top.length === 0 ? (
              <EmptyState icon={Package}>Sales will appear after orders are placed.</EmptyState>
            ) : (
              <ul className="space-y-4">
                {dashboard.top.map((item, index) => (
                  <li key={item.title} className="flex items-center gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate font-medium text-slate-800">{item.title}</span>
                        <span className="shrink-0 text-slate-500">{item.quantity} sold</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-500"
                          style={{ width: `${(item.quantity / topMax) * 100}%` }}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Stock alerts">
            {attention === 0 ? (
              <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-800">
                <CheckCircle2 size={20} />
                <p className="text-sm font-semibold">All products are well stocked.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => navigate("/admin/inventory?stock=low")}
                  className="group flex cursor-pointer items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-left transition hover:bg-amber-100"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/70 text-amber-700">
                    <AlertTriangle size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xl font-bold text-amber-800">{dashboard.lowStock.length}</span>
                    <span className="block text-xs font-semibold text-amber-800">Low stock</span>
                  </span>
                  <ArrowRight size={16} className="text-amber-700 transition group-hover:translate-x-0.5" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/admin/inventory?stock=out")}
                  className="group flex cursor-pointer items-center gap-3 rounded-2xl bg-red-50 px-4 py-3 text-left transition hover:bg-red-100"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/70 text-red-700">
                    <PackageX size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xl font-bold text-red-700">{dashboard.outOfStock.length}</span>
                    <span className="block text-xs font-semibold text-red-700">Out of stock</span>
                  </span>
                  <ArrowRight size={16} className="text-red-700 transition group-hover:translate-x-0.5" />
                </button>
              </div>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}