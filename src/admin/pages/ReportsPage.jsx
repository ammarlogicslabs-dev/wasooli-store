import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { formatPrice } from "../../data/product";
import { exportOrdersCsv, exportReportPdf, getReports } from "../../services/storage/adminDataService";
import { PAYMENT_LABELS, paymentBucket, statusLabel } from "../../services/storage/orderStatus";
import AdminTable from "../components/AdminTable";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { useAdminData } from "../hooks/useAdminData";

const RANGES = [7, 30, 90];

export default function ReportsPage() {
  const data = useAdminData();
  const navigate = useNavigate();
  const [days, setDays] = useState(30);
  const [exportingPdf, setExportingPdf] = useState(false);
  const report = getReports(days, data);
  const paymentRows = Object.entries(report.payments);

  const handleExportPdf = async () => {
    try {
      setExportingPdf(true);
      await exportReportPdf(report, days);
    } catch (err) {
      console.error("Failed to generate PDF report:", err);
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        crumbs={[{ label: "Transactions & Reports" }]}
        title="Transactions & Reports"
        detail="Figures and transaction history generated from live store activity."
        actions={(
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1">
              {RANGES.map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setDays(range)}
                  className={`h-8 cursor-pointer rounded-lg px-3 text-xs font-semibold transition ${
                    days === range
                      ? "bg-brand-500 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {range} days
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => exportOrdersCsv(report.orders)}
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              title="Export transactions spreadsheet as CSV"
            >
              <FileSpreadsheet size={15} className="text-emerald-600" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={exportingPdf}
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-500 px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:opacity-60"
              title="Download full financial & transactions report as PDF"
            >
              {exportingPdf ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <FileText size={15} />
              )}
              <span>{exportingPdf ? "Generating PDF..." : "Export PDF"}</span>
            </button>
          </div>
        )}
      />

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Sales", formatPrice(report.sales)],
          ["Orders", report.orders.length],
          ["Refunds", report.refunds.length],
        ].map(([label, value]) => (
          <article key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Payment methods</h2>
          <ul className="mt-4 space-y-3">
            {paymentRows.map(([key, amount]) => (
              <li key={key} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{PAYMENT_LABELS[key]}</span>
                <span className="font-semibold text-slate-900">{formatPrice(amount)}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Orders by status</h2>
          <ul className="mt-4 space-y-3">
            {report.statusCounts.map((status) => (
              <li key={status.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{status.label || statusLabel(status.id)}</span>
                <span className="font-semibold text-slate-900">{status.count}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Top products</h2>
          <ul className="mt-4 space-y-3">
            {report.top.length === 0 ? <li className="text-sm text-slate-500">No product sales in this range.</li> : report.top.map((item) => (
              <li key={item.title} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-slate-700">{item.title}</span>
                <span className="shrink-0 font-semibold">{formatPrice(item.revenue)}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Category sales</h2>
          <ul className="mt-4 space-y-3">
            {report.categories.length === 0 ? <li className="text-sm text-slate-500">No category sales in this range.</li> : report.categories.map((item) => (
              <li key={item.category} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-700">{item.category}</span>
                <span className="font-semibold">{formatPrice(item.revenue)}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {/* Transactions & Orders List */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Transactions & Orders ({report.orders.length})
            </h2>
            <p className="text-xs text-slate-500">
              Orders recorded in the selected {days}-day period. Click any row to view complete order details.
            </p>
          </div>
        </div>
        <AdminTable
          rows={report.orders}
          rowKey={(order) => order.id}
          onRowClick={(order) => navigate(`/admin/orders/${encodeURIComponent(order.id)}`)}
          empty="No transactions found in this period."
          columns={[
            {
              key: "id",
              label: "Order #",
              render: (order) => (
                <span className="font-semibold text-slate-900">
                  {String(order.id).startsWith("#") ? order.id : `#${order.id}`}
                </span>
              ),
            },
            {
              key: "date",
              label: "Date",
              render: (order) =>
                order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString("en-PK", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—",
            },
            {
              key: "customer",
              label: "Customer",
              render: (order) => (
                <div>
                  <span className="font-medium text-slate-900">
                    {order.delivery?.fullName || "Guest Customer"}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {order.delivery?.city || "—"}
                  </span>
                </div>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (order) => (
                <StatusBadge status={order.adminStatus || "pending"}>
                  {statusLabel(order.adminStatus || "pending")}
                </StatusBadge>
              ),
            },
            {
              key: "payment",
              label: "Payment",
              render: (order) => (
                <StatusBadge status={paymentBucket(order)}>
                  {PAYMENT_LABELS[paymentBucket(order)] || paymentBucket(order)}
                </StatusBadge>
              ),
            },
            {
              key: "total",
              label: "Total Amount",
              render: (order) => (
                <span className="font-semibold text-slate-900">
                  {formatPrice(order.total || 0)}
                </span>
              ),
            },
          ]}
        />
      </section>
    </div>
  );
}
