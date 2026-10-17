const TONES = {
  active: "bg-emerald-50 text-emerald-700",
  draft: "bg-amber-50 text-amber-700",
  archived: "bg-slate-100 text-slate-500",
  inactive: "bg-slate-100 text-slate-500",
  pending: "bg-brand-50 text-brand-700",
  packed: "bg-sky-50 text-sky-700",
  shipped: "bg-indigo-50 text-indigo-700",
  out_for_delivery: "bg-amber-50 text-amber-700",
  delivered: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-600",
  paid: "bg-emerald-50 text-emerald-700",
  refunded: "bg-rose-50 text-rose-700",
  cod_pending: "bg-amber-50 text-amber-700",
  cod_collected: "bg-emerald-50 text-emerald-700",
};

export default function StatusBadge({ status, children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${TONES[status] || "bg-slate-100 text-slate-600"}`}>
      {children || String(status || "").replace(/_/g, " ")}
    </span>
  );
}
