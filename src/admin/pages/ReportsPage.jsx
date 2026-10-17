import { useState } from "react";
import { formatPrice } from "../../data/product";
import { exportOrdersCsv, getReports } from "../../services/storage/adminDataService";
import { PAYMENT_LABELS, statusLabel } from "../../services/storage/orderStatus";
import PageHeader from "../components/PageHeader";
import { buttonClass } from "../components/formStyles";
import { useAdminData } from "../hooks/useAdminData";

const RANGES = [7, 30, 90];

export default function ReportsPage() {
  const data = useAdminData();
  const [days, setDays] = useState(30);
  const report = getReports(days, data);
  const paymentRows = Object.entries(report.payments);

  return (
    <div className="space-y-5">
      <PageHeader
        crumbs={[{ label: "Reports & Payments" }]}
        title="Reports & Payments"
        detail="Figures come from saved demo orders. Refunds only change the mock status."
        actions={(
          <>
            {RANGES.map((range) => (
              <button key={range} type="button" onClick={() => setDays(range)} className={`h-10 cursor-pointer rounded-xl px-3 text-sm font-semibold ${days === range ? "bg-brand-500 text-white" : "border border-slate-200 bg-white text-slate-600"}`}>
                {range} days
              </button>
            ))}
            <button type="button" onClick={() => exportOrdersCsv(report.orders)} className={buttonClass}>Export CSV</button>
          </>
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
    </div>
  );
}
