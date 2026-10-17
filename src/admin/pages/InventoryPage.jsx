import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { listInventoryHistory, setProductStock } from "../../services/storage/adminDataService";
import AdminModal from "../components/AdminModal";
import AdminTable from "../components/AdminTable";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { buttonClass, inputClass } from "../components/formStyles";
import { useAdminData } from "../hooks/useAdminData";

const REASONS = ["Restock", "Damaged", "Correction", "Returned", "Other"];

export default function InventoryPage() {
  const { products, settings, history } = useAdminData();
  const [params, setParams] = useSearchParams();
  const filter = params.get("stock") || "all";
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [nextStock, setNextStock] = useState("");
  const [reason, setReason] = useState(REASONS[0]);
  const [customReason, setCustomReason] = useState("");

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    // Skip empty/null entries so nothing below reads a property of null.
    return (products || []).filter(Boolean).filter((product) => {
      const matchesQuery = !needle || `${product.title} ${product.sku}`.toLowerCase().includes(needle);
      const low = product.stock > 0 && product.stock <= settings.lowStockThreshold;
      const out = product.stock <= 0;
      const matchesFilter = filter === "all" || (filter === "low" && low) || (filter === "out" && out);
      return matchesQuery && matchesFilter && product.status !== "archived";
    });
  }, [products, query, filter, settings.lowStockThreshold]);

  const log = (history?.length ? history : listInventoryHistory() || []).filter(Boolean);

  function openAdjust(product) {
    setSelected(product);
    setNextStock(String(product.stock));
    setReason(REASONS[0]);
    setCustomReason("");
  }

  function saveAdjustment(event) {
    event.preventDefault();
    if (!selected) return;
    const result = setProductStock(selected.id, Number(nextStock), reason === "Other" ? customReason : reason);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success("Stock updated across products and the dashboard.");
    setSelected(null);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        crumbs={[{ label: "Inventory" }]}
        title="Inventory"
        detail={`Low stock means ${settings.lowStockThreshold} or fewer items. Changes update the shop immediately.`}
      />
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search product or SKU" className={inputClass} />
          <select value={filter} onChange={(event) => setParams(event.target.value === "all" ? {} : { stock: event.target.value })} className={inputClass}>
            <option value="all">All stock levels</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
        </div>
        <div className="mt-4">
          <AdminTable
            rows={rows}
            rowKey={(product) => product.id}
            empty="No products in this stock view."
            columns={[
              { key: "title", label: "Product", render: (product) => <span className="font-semibold text-slate-900">{product.title}<span className="mt-0.5 block text-xs font-normal text-slate-500">{product.sku}</span></span> },
              { key: "stock", label: "On hand" },
              {
                key: "level",
                label: "Level",
                render: (product) => (
                  <StatusBadge status={product.stock <= 0 ? "cancelled" : product.stock <= settings.lowStockThreshold ? "draft" : "active"}>
                    {product.stock <= 0 ? "Out of stock" : product.stock <= settings.lowStockThreshold ? "Low" : "In stock"}
                  </StatusBadge>
                ),
              },
              { key: "adjust", label: "Stock", render: (product) => <button type="button" onClick={() => openAdjust(product)} className="cursor-pointer text-xs font-semibold text-brand-600">Adjust</button> },
            ]}
          />
        </div>
      </section>
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="px-2 text-base font-semibold text-slate-900">Stock history</h2>
        <AdminTable
          rows={log.slice(0, 30)}
          rowKey={(entry) => entry.id}
          empty="Adjustments and order deductions will show up here."
          columns={[
            { key: "when", label: "When", render: (entry) => new Date(entry.createdAt).toLocaleString("en-PK", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) },
            { key: "title", label: "Product", render: (entry) => <span>{entry.title}<span className="mt-0.5 block text-xs text-slate-500">{entry.sku}</span></span> },
            { key: "delta", label: "Change", render: (entry) => `${entry.delta > 0 ? "+" : ""}${entry.delta}` },
            { key: "next", label: "After", render: (entry) => entry.next },
            { key: "reason", label: "Reason" },
          ]}
        />
      </section>
      <AdminModal open={Boolean(selected)} title="Adjust stock" onClose={() => setSelected(null)}>
        {selected && (
          <form onSubmit={saveAdjustment} className="space-y-3">
            <p className="text-sm text-slate-600">{selected.title} currently has <strong>{selected.stock}</strong> in stock.</p>
            <label className="block text-sm font-semibold text-slate-900">New quantity
              <input value={nextStock} onChange={(event) => setNextStock(event.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" className={`${inputClass} mt-1.5`} />
            </label>
            <label className="block text-sm font-semibold text-slate-900">Reason
              <select value={reason} onChange={(event) => setReason(event.target.value)} className={`${inputClass} mt-1.5`}>
                {REASONS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            {reason === "Other" && (
              <input value={customReason} onChange={(event) => setCustomReason(event.target.value)} placeholder="Describe the change" className={inputClass} />
            )}
            <button type="submit" className={buttonClass}>Save adjustment</button>
          </form>
        )}
      </AdminModal>
    </div>
  );
}