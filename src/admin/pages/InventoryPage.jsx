import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Boxes,
  Calendar,
  CheckCircle2,
  Clock,
  FileEdit,
  Filter,
  History,
  Loader2,
  PackageCheck,
  PackagePlus,
  ReceiptText,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Tag,
  X,
} from "lucide-react";
import { listInventoryHistory, setProductStock } from "../../services/storage/adminDataService";
import AdminModal from "../components/AdminModal";
import AdminTable from "../components/AdminTable";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { buttonClass, inputClass, quietButtonClass } from "../components/formStyles";
import { useAdminData } from "../hooks/useAdminData";

const HISTORY_REASONS = ["all", "Restock", "Damaged", "Returned", "Correction", "Order", "Other"];

function formatHistoryDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

function formatMonthName(monthKey) {
  if (!monthKey || monthKey === "all") return "All Months";
  const parts = monthKey.split("-");
  if (parts.length !== 2) return monthKey;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
  return new Intl.DateTimeFormat("en-PK", { month: "long", year: "numeric" }).format(d);
}

function getReasonBadge(reasonStr) {
  const r = String(reasonStr || "").toLowerCase();
  if (r.includes("restock")) {
    return {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
      label: "Restock",
    };
  }
  if (r.includes("damaged")) {
    return {
      bg: "bg-rose-50 text-rose-700 border-rose-200/70",
      label: "Damaged",
    };
  }
  if (r.includes("return")) {
    return {
      bg: "bg-sky-50 text-sky-700 border-sky-200/70",
      label: "Returned",
    };
  }
  if (r.includes("correction")) {
    return {
      bg: "bg-amber-50 text-amber-700 border-amber-200/70",
      label: "Correction",
    };
  }
  if (r.includes("order") || r.includes("sale")) {
    return {
      bg: "bg-purple-50 text-purple-700 border-purple-200/70",
      label: "Order Sale",
    };
  }
  return {
    bg: "bg-slate-100 text-slate-700 border-slate-200/70",
    label: "Adjustment",
  };
}

export default function InventoryPage() {
  const { products, settings, history } = useAdminData();
  const [params, setParams] = useSearchParams();
  const filter = params.get("stock") || "all";
  const [query, setQuery] = useState("");

  // Adjust stock modal state
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState("Restock");
  const [saving, setSaving] = useState(false);

  // Dynamic inputs per reason
  const [restockQty, setRestockQty] = useState("");
  const [costPerPiece, setCostPerPiece] = useState("");
  const [damagedQty, setDamagedQty] = useState("");
  const [damageNote, setDamageNote] = useState("");
  const [returnedQty, setReturnedQty] = useState("");
  const [returnRestockable, setReturnRestockable] = useState(true);
  const [returnNote, setReturnNote] = useState("");
  const [correctionCount, setCorrectionCount] = useState("");
  const [otherMode, setOtherMode] = useState("add");
  const [otherQty, setOtherQty] = useState("");
  const [customReason, setCustomReason] = useState("");

  // Stock History modal state
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyMonth, setHistoryMonth] = useState("all");
  const [historyReason, setHistoryReason] = useState("all");
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const HISTORY_PAGE_SIZE = 12;

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (products || []).filter(Boolean).filter((product) => {
      const matchesQuery = !needle || `${product.title} ${product.sku}`.toLowerCase().includes(needle);
      const low = product.stock > 0 && product.stock <= settings.lowStockThreshold;
      const out = product.stock <= 0;
      const matchesFilter = filter === "all" || (filter === "low" && low) || (filter === "out" && out);
      return matchesQuery && matchesFilter && product.status !== "archived";
    });
  }, [products, query, filter, settings.lowStockThreshold]);

  const log = useMemo(() => {
    const list = (history?.length ? history : listInventoryHistory() || []).filter(Boolean);
    return list.slice().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [history]);

  // Derived available months from history
  const availableMonths = useMemo(() => {
    const set = new Set();
    log.forEach((entry) => {
      if (entry?.createdAt) {
        const d = new Date(entry.createdAt);
        if (!isNaN(d.getTime())) {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          set.add(key);
        }
      }
    });
    return Array.from(set).sort().reverse();
  }, [log]);

  // Filtered history entries
  const filteredHistory = useMemo(() => {
    const q = historyQuery.trim().toLowerCase();
    return log.filter((entry) => {
      if (!entry) return false;
      // Month filter
      if (historyMonth !== "all" && entry.createdAt) {
        const d = new Date(entry.createdAt);
        if (!isNaN(d.getTime())) {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          if (key !== historyMonth) return false;
        }
      }
      // Reason filter
      if (historyReason !== "all") {
        const r = String(entry.reason || "").toLowerCase();
        if (!r.includes(historyReason.toLowerCase())) return false;
      }
      // Text search
      if (q) {
        const match = `${entry.title || ""} ${entry.sku || ""} ${entry.reason || ""}`.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [log, historyMonth, historyReason, historyQuery]);

  const paginatedHistory = useMemo(() => {
    const start = (historyPage - 1) * HISTORY_PAGE_SIZE;
    return filteredHistory.slice(start, start + HISTORY_PAGE_SIZE);
  }, [filteredHistory, historyPage]);

  const totalHistoryPages = Math.ceil(filteredHistory.length / HISTORY_PAGE_SIZE) || 1;
  const historyStart = filteredHistory.length === 0 ? 0 : (historyPage - 1) * HISTORY_PAGE_SIZE + 1;
  const historyEnd = Math.min(historyPage * HISTORY_PAGE_SIZE, filteredHistory.length);

  function openAdjust(product) {
    setSelected(product);
    setReason("Restock");
    setRestockQty("");
    setCostPerPiece("");
    setDamagedQty("");
    setDamageNote("");
    setReturnedQty("");
    setReturnNote("");
    setReturnRestockable(true);
    setCorrectionCount(String(product.stock ?? 0));
    setOtherQty("");
    setOtherMode("add");
    setCustomReason("");
  }

  // Dynamic adjustment calculation
  const adjustmentCalc = useMemo(() => {
    if (!selected) {
      return { resultingStock: 0, delta: 0, isValid: false, formattedReason: "", totalCost: 0 };
    }
    const current = Number(selected.stock) || 0;

    if (reason === "Restock") {
      const add = Math.floor(Number(restockQty)) || 0;
      const cost = Number(costPerPiece) || 0;
      const totalCost = add * cost;
      const next = current + add;
      // Purchase price is strictly compulsory
      const isValid = add > 0 && cost > 0;
      const formattedReason = `Restock (+${add} pcs @ Purchase Price: Rs ${cost.toLocaleString()}/pc = Total: Rs ${totalCost.toLocaleString()})`;
      return { resultingStock: next, delta: add, isValid, formattedReason, totalCost };
    }

    if (reason === "Damaged") {
      const sub = Math.floor(Number(damagedQty)) || 0;
      const next = Math.max(0, current - sub);
      const isValid = sub > 0 && sub <= current;
      const note = damageNote.trim();
      const formattedReason = note
        ? `Damaged (-${sub} pcs: ${note})`
        : `Damaged (-${sub} pcs)`;
      return { resultingStock: next, delta: -sub, isValid, formattedReason, totalCost: 0 };
    }

    if (reason === "Returned") {
      const ret = Math.floor(Number(returnedQty)) || 0;
      const next = returnRestockable ? current + ret : current;
      const isValid = ret > 0;
      const note = returnNote.trim();
      const formattedReason = returnRestockable
        ? (note ? `Customer Return (+${ret} pcs: ${note})` : `Customer Return (+${ret} pcs)`)
        : (note ? `Customer Return (Non-restocked: ${note})` : `Customer Return (Non-restocked)`);
      return { resultingStock: next, delta: returnRestockable ? ret : 0, isValid, formattedReason, totalCost: 0 };
    }

    if (reason === "Correction") {
      const count = Math.floor(Number(correctionCount));
      const isValid = Number.isFinite(count) && count >= 0;
      const d = isValid ? count - current : 0;
      const formattedReason = `Correction (Recount: ${current} -> ${count})`;
      return { resultingStock: isValid ? count : current, delta: d, isValid: isValid && d !== 0, formattedReason, totalCost: 0 };
    }

    // Other
    const qty = Math.floor(Number(otherQty)) || 0;
    const next = otherMode === "add" ? current + qty : Math.max(0, current - qty);
    const d = otherMode === "add" ? qty : -qty;
    const isValid = qty > 0 && customReason.trim().length > 0 && (otherMode === "add" || qty <= current);
    const formattedReason = `${customReason.trim()} (${d > 0 ? "+" : ""}${d} pcs)`;
    return { resultingStock: next, delta: d, isValid, formattedReason, totalCost: 0 };
  }, [
    selected,
    reason,
    restockQty,
    costPerPiece,
    damagedQty,
    damageNote,
    returnedQty,
    returnNote,
    returnRestockable,
    correctionCount,
    otherQty,
    otherMode,
    customReason,
  ]);

  async function saveAdjustment(event) {
    event.preventDefault();
    if (!selected || !adjustmentCalc.isValid || saving) return;
    setSaving(true);
    const result = await setProductStock(selected.id, adjustmentCalc.resultingStock, adjustmentCalc.formattedReason);
    setSaving(false);
    if (!result.ok) {
      toast.error(result.message || "Could not update stock.");
      return;
    }
    toast.success(`Stock adjusted successfully. New on-hand: ${adjustmentCalc.resultingStock}`);
    setSelected(null);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        crumbs={[{ label: "Inventory" }]}
        title="Inventory"
        detail={`Low stock means ${settings.lowStockThreshold} or fewer items. Changes update the shop immediately.`}
        actions={
          <button
            type="button"
            onClick={() => {
              setHistoryPage(1);
              setHistoryOpen(true);
            }}
            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-brand-300 hover:bg-brand-50/70 hover:text-brand-700 sm:text-sm"
          >
            <History size={16} className="text-brand-600" />
            <span>Stock History</span>
            {/* {log.length > 0 && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                {log.length}
              </span>
            )} */}
          </button>
        }
      />

      {/* Main Stock Products Table */}
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search product or SKU..."
            className={inputClass}
          />
          <select
            value={filter}
            onChange={(event) => setParams(event.target.value === "all" ? {} : { stock: event.target.value })}
            className={inputClass}
          >
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
              {
                key: "title",
                label: "Product",
                render: (product) => (
                  <span className="font-semibold text-slate-900">
                    {product.title}
                    <span className="mt-0.5 block text-xs font-normal text-slate-500">{product.sku}</span>
                  </span>
                ),
              },
              {
                key: "stock",
                label: "On hand",
                render: (product) => (
                  <span className="font-bold text-slate-800 text-sm">{product.stock} pcs</span>
                ),
              },
              {
                key: "level",
                label: "Level",
                render: (product) => (
                  <StatusBadge
                    status={
                      product.stock <= 0
                        ? "cancelled"
                        : product.stock <= settings.lowStockThreshold
                        ? "draft"
                        : "active"
                    }
                  >
                    {product.stock <= 0
                      ? "Out of stock"
                      : product.stock <= settings.lowStockThreshold
                      ? "Low"
                      : "In stock"}
                  </StatusBadge>
                ),
              },
              {
                key: "adjust",
                label: "Action",
                render: (product) => (
                  <button
                    type="button"
                    onClick={() => openAdjust(product)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-600 shadow-2xs hover:border-brand-300 hover:bg-brand-50 transition cursor-pointer"
                  >
                    <SlidersHorizontal size={13} />
                    <span>Adjust</span>
                  </button>
                ),
              },
            ]}
          />
        </div>
      </section>

      {/* =========================================================
          MODAL 1: ADJUST STOCK MODAL (REASON-BASED FLOW)
         ========================================================= */}
      <AdminModal
        open={Boolean(selected)}
        title="Adjust stock"
        onClose={() => !saving && setSelected(null)}
      >
        {selected && (
          <form onSubmit={saveAdjustment} className="space-y-4">
            {/* Product Summary Header */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white border border-slate-200 text-brand-600">
                <Boxes size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-slate-900 truncate">{selected.title}</h3>
                <p className="text-xs text-slate-500">
                  SKU: <span className="font-semibold text-slate-700">{selected.sku}</span> · Category:{" "}
                  <span className="font-semibold text-slate-700">{selected.category}</span>
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <Tag size={13} className="text-slate-400" />
                    <span>Selling Price:</span>{" "}
                    <strong className="text-slate-900">
                      Rs {Number(selected.price || 0).toLocaleString()}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Current Stock Field (Disabled / Read-only) */}
            <div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <PackageCheck size={14} className="text-slate-500" />
                  <span>Current Quantity</span>
                </label>
               
              </div>
              <div className="relative mt-1.5">
                <input
                  type="text"
                  value={`${selected.stock} pieces`}
                  disabled
                  readOnly
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 text-sm font-black text-slate-700 cursor-not-allowed select-none"
                />
              </div>
            </div>

            {/* Reason Selector */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                {reason === "Restock" && <PackagePlus size={14} className="text-emerald-600" />}
                {reason === "Damaged" && <AlertTriangle size={14} className="text-rose-600" />}
                {reason === "Returned" && <RotateCcw size={14} className="text-sky-600" />}
                {reason === "Correction" && <FileEdit size={14} className="text-amber-600" />}
                {reason === "Other" && <SlidersHorizontal size={14} className="text-slate-600" />}
                <span>Adjustment Reason</span>
              </label>
              <select
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                disabled={saving}
                className={`${inputClass} mt-1.5`}
              >
                <option value="Restock">Restock (Purchase new stock)</option>
                <option value="Damaged">Damaged (Breakage / Defective items)</option>
                <option value="Returned">Customer Return (Restock items)</option>
                <option value="Correction">Correction (Physical audit count)</option>
                <option value="Other">Other (Custom adjustment)</option>
              </select>
            </div>

            {/* DYNAMIC FIELDS: RESTOCK */}
            {reason === "Restock" && (
              <div className="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  <PackagePlus size={15} />
                  <span>Restock Details</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-xs font-semibold text-slate-900">
                    Quantity to add (Pieces) *
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={restockQty}
                      onChange={(e) => setRestockQty(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="e.g. 10"
                      disabled={saving}
                      className={`${inputClass} mt-1`}
                      required
                    />
                  </label>

                  <label className="block text-xs font-semibold text-slate-900">
                    <span className="flex items-center justify-between">
                      <span>Purchase Price per piece (Rs) *</span>
                     
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={costPerPiece}
                      onChange={(e) => setCostPerPiece(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="e.g. 1500"
                      disabled={saving}
                      className={`${inputClass} mt-1 ${
                        restockQty && (!costPerPiece || Number(costPerPiece) <= 0)
                          ? "border-amber-400 focus:border-amber-500 focus:ring-amber-100"
                          : ""
                      }`}
                      required
                    />
                  </label>
                </div>

               

                {/* Total Purchase Amount Live Calculation */}
                {Number(restockQty) > 0 && Number(costPerPiece) > 0 && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-100/70 p-3 text-xs sm:text-sm text-emerald-950 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="grid size-9 place-items-center rounded-lg bg-emerald-200/80 text-emerald-800 shrink-0">
                        <ReceiptText size={18} />
                      </div>
                      <div>
                        <span className="font-bold text-emerald-900">Purchase Price Breakdown:</span>
                        <p className="text-[11px] text-emerald-800 font-medium">
                          {restockQty} pcs × Rs {Number(costPerPiece).toLocaleString()} (Purchase Price)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-extrabold text-emerald-700 block">Total Purchase Cost</span>
                      <span className="text-base font-black text-emerald-900">
                        Rs {adjustmentCalc.totalCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DYNAMIC FIELDS: DAMAGED */}
            {reason === "Damaged" && (
              <div className="space-y-3 rounded-2xl border border-rose-100 bg-rose-50/30 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-800 uppercase tracking-wider">
                  <AlertTriangle size={15} />
                  <span>Damaged / Defect Deductions</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-900">
                    How many pieces damaged? *
                    <input
                      type="number"
                      min="1"
                      max={selected.stock}
                      step="1"
                      value={damagedQty}
                      onChange={(e) => setDamagedQty(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder={`Max ${selected.stock}`}
                      disabled={saving}
                      className={`${inputClass} mt-1`}
                      required
                    />
                  </label>
                  {Number(damagedQty) > selected.stock && (
                    <p className="mt-1 text-xs font-medium text-rose-600">
                      Cannot remove more than current on-hand stock ({selected.stock}).
                    </p>
                  )}
                </div>

                <label className="block text-xs font-semibold text-slate-900">
                  Damage Notes / Reason (Optional)
                  <input
                    type="text"
                    value={damageNote}
                    onChange={(e) => setDamageNote(e.target.value)}
                    placeholder="e.g. Water damage, broken LAN port, transit defect"
                    disabled={saving}
                    className={`${inputClass} mt-1`}
                  />
                </label>
              </div>
            )}

            {/* DYNAMIC FIELDS: RETURNED */}
            {reason === "Returned" && (
              <div className="space-y-3 rounded-2xl border border-sky-100 bg-sky-50/30 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-800 uppercase tracking-wider">
                  <RotateCcw size={15} />
                  <span>Customer Return Details</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-900">
                    Returned Quantity (Pieces) *
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={returnedQty}
                      onChange={(e) => setReturnedQty(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="e.g. 1"
                      disabled={saving}
                      className={`${inputClass} mt-1`}
                      required
                    />
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="return-restock-check"
                    checked={returnRestockable}
                    onChange={(e) => setReturnRestockable(e.target.checked)}
                    disabled={saving}
                    className="size-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <label htmlFor="return-restock-check" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Restock items back into sellable on-hand inventory (+ stock)
                  </label>
                </div>

                <label className="block text-xs font-semibold text-slate-900">
                  Order / Invoice Number or Note (Optional)
                  <input
                    type="text"
                    value={returnNote}
                    onChange={(e) => setReturnNote(e.target.value)}
                    placeholder="e.g. Order #WS-1045 / Customer exchange"
                    disabled={saving}
                    className={`${inputClass} mt-1`}
                  />
                </label>
              </div>
            )}

            {/* DYNAMIC FIELDS: CORRECTION */}
            {reason === "Correction" && (
              <div className="space-y-3 rounded-2xl border border-amber-100 bg-amber-50/30 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
                  <CheckCircle2 size={15} />
                  <span>Physical Audit Count</span>
                </div>

                <label className="block text-xs font-semibold text-slate-900">
                  Actual Physical Count in Warehouse *
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={correctionCount}
                    onChange={(e) => setCorrectionCount(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="e.g. 25"
                    disabled={saving}
                    className={`${inputClass} mt-1`}
                    required
                  />
                </label>
                <p className="text-[11px] text-slate-500">
                  Directly sets the on-hand stock to your manual inventory audit count.
                </p>
              </div>
            )}

            {/* DYNAMIC FIELDS: OTHER */}
            {reason === "Other" && (
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-900">Operation</label>
                    <select
                      value={otherMode}
                      onChange={(e) => setOtherMode(e.target.value)}
                      disabled={saving}
                      className={`${inputClass} mt-1`}
                    >
                      <option value="add">Add Stock (+)</option>
                      <option value="deduct">Deduct Stock (-)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-900">Quantity *</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={otherQty}
                      onChange={(e) => setOtherQty(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="e.g. 5"
                      disabled={saving}
                      className={`${inputClass} mt-1`}
                      required
                    />
                  </div>
                </div>

                <label className="block text-xs font-semibold text-slate-900">
                  Describe Adjustment Reason *
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Describe reason for this manual change"
                    disabled={saving}
                    className={`${inputClass} mt-1`}
                    required
                  />
                </label>
              </div>
            )}

            {/* Live Stock Transition Summary Bar */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 flex items-center justify-between text-xs sm:text-sm">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Before</span>
                <span className="font-bold text-slate-800 text-sm sm:text-base">{selected.stock} pcs</span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Change</span>
                <span
                  className={`font-black text-xs sm:text-sm px-2 py-0.5 rounded-full ${
                    adjustmentCalc.delta > 0
                      ? "bg-emerald-100 text-emerald-800"
                      : adjustmentCalc.delta < 0
                      ? "bg-rose-100 text-rose-800"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {adjustmentCalc.delta > 0 ? `+${adjustmentCalc.delta}` : adjustmentCalc.delta} pcs
                </span>
              </div>

              <ArrowRight size={18} className="text-slate-400" />

              <div className="text-right">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">New On-Hand</span>
                <span className="font-black text-brand-600 text-base sm:text-lg">
                  {adjustmentCalc.resultingStock} pcs
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelected(null)}
                disabled={saving}
                className={quietButtonClass}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!adjustmentCalc.isValid || saving}
                className={buttonClass}
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Updating stock...</span>
                  </>
                ) : (
                  <span>Save adjustment</span>
                )}
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      {/* =========================================================
          MODAL 2: STOCK HISTORY MODAL (WITH MONTH-WISE & REASON FILTERS)
         ========================================================= */}
      <AdminModal
        open={historyOpen}
        title="Stock Adjustment History"
        maxWidth="sm:max-w-4xl lg:max-w-5xl"
        onClose={() => setHistoryOpen(false)}
      >
        <div className="space-y-4">
          {/* Header Filter Bar */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
            <div className="grid gap-2.5 sm:grid-cols-12">
              {/* Product/SKU Search */}
              <div className="sm:col-span-5 relative">
                <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={historyQuery}
                  onChange={(e) => {
                    setHistoryQuery(e.target.value);
                    setHistoryPage(1);
                  }}
                  placeholder="Filter product title, SKU, or notes..."
                  className={`${inputClass} pl-9 text-xs sm:text-sm`}
                />
                {historyQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setHistoryQuery("");
                      setHistoryPage(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Month-Wise Dropdown Filter */}
              <div className="sm:col-span-4 relative">
                <Calendar size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={historyMonth}
                  onChange={(e) => {
                    setHistoryMonth(e.target.value);
                    setHistoryPage(1);
                  }}
                  className={`${inputClass} pl-9 text-xs sm:text-sm`}
                >
                  <option value="all">All Months</option>
                  {availableMonths.map((m) => (
                    <option key={m} value={m}>
                      {formatMonthName(m)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reason Dropdown Filter */}
              <div className="sm:col-span-3 relative">
                <Filter size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={historyReason}
                  onChange={(e) => {
                    setHistoryReason(e.target.value);
                    setHistoryPage(1);
                  }}
                  className={`${inputClass} pl-9 text-xs sm:text-sm`}
                >
                  <option value="all">All Reasons</option>
                  {HISTORY_REASONS.filter((r) => r !== "all").map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filter Bar if Active */}
            {(historyMonth !== "all" || historyReason !== "all" || historyQuery) && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                <span className="text-slate-500">Filtered view active</span>
                <button
                  type="button"
                  onClick={() => {
                    setHistoryMonth("all");
                    setHistoryReason("all");
                    setHistoryQuery("");
                    setHistoryPage(1);
                  }}
                  className="font-bold text-brand-600 hover:text-brand-700 cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>

          {/* History Table */}
          <div className="overflow-x-auto custom-scrollbar rounded-2xl border border-slate-200">
            <AdminTable
              rows={paginatedHistory}
              rowKey={(entry) => entry.id || `${entry.createdAt}-${entry.sku}`}
              empty="No stock adjustments match your selected filters."
              columns={[
                {
                  key: "when",
                  label: "Date & Time",
                  render: (entry) => (
                    <div className="whitespace-nowrap text-xs text-slate-700 py-1">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                        <Clock size={12} className="text-slate-400" />
                        <span>{formatHistoryDate(entry.createdAt)}</span>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "product",
                  label: "Product",
                  render: (entry) => (
                    <div className="py-1">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">{entry.title}</p>
                      <span className="text-[11px] font-mono text-slate-500">{entry.sku}</span>
                    </div>
                  ),
                },
                {
                  key: "change",
                  label: "Adjustment",
                  render: (entry) => {
                    const isPositive = Number(entry.delta) > 0;
                    const isZero = Number(entry.delta) === 0;
                    return (
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-black border ${
                          isPositive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : isZero
                            ? "bg-slate-100 text-slate-700 border-slate-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {isPositive ? `+${entry.delta}` : entry.delta}
                      </span>
                    );
                  },
                },
                {
                  key: "next",
                  label: "Stock After",
                  render: (entry) => (
                    <span className="font-bold text-xs sm:text-sm text-slate-800">{entry.next} pcs</span>
                  ),
                },
                {
                  key: "reason",
                  label: "Reason & Details",
                  render: (entry) => {
                    const badge = getReasonBadge(entry.reason);
                    const reasonText = String(entry.reason || "");
                    const isRestock = badge.label === "Restock";
                    const hasPurchasePrice = isRestock && (reasonText.includes("Purchase Price") || reasonText.includes("@ Rs"));
                    return (
                      <div className="py-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold border ${badge.bg}`}
                          >
                            {badge.label}
                          </span>
                          {hasPurchasePrice && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100/80 text-emerald-800 px-2 py-0.5 text-[10px] font-extrabold border border-emerald-300">
                              <Banknote size={12} className="shrink-0 text-emerald-700" />
                              <span>Purchase Price Recorded</span>
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-600 leading-snug line-clamp-2">{entry.reason}</p>
                      </div>
                    );
                  },
                },
              ]}
            />
          </div>

          {/* Modal Footer with Record Count & Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="text-slate-600 font-medium">
              Showing{" "}
              <strong className="text-slate-900 font-bold">
                {paginatedHistory.length}
              </strong>{" "}
              of{" "}
              <strong className="text-slate-900 font-bold">
                {filteredHistory.length}
              </strong>{" "}
              records
              {filteredHistory.length > 0 && (
                <span className="text-slate-500 ml-1">
                  ({historyStart}–{historyEnd})
                </span>
              )}
              {filteredHistory.length !== log.length && (
                <span className="text-slate-400 ml-1.5">
                  (filtered from {log.length} total)
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span className="text-slate-500 font-medium">
                Page {historyPage} of {totalHistoryPages}
              </span>

              {totalHistoryPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                    disabled={historyPage === 1}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryPage((p) => Math.min(totalHistoryPages, p + 1))}
                    disabled={historyPage === totalHistoryPages}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
