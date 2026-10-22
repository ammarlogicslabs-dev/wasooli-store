import { Plus, Trash2 } from "lucide-react";
import { formatTierRange, normalizePriceTiers } from "../../utils/priceTiers";
import { inputClass, quietButtonClass } from "./formStyles";

export default function PriceTiersEditor({ value = [], onChange, basePrice, error }) {
  const tiers = Array.isArray(value) && value.length
    ? value.map((tier) => ({
        minQty: tier.minQty ?? "",
        maxQty: tier.maxQty ?? "",
        price: tier.price ?? "",
      }))
    : [];

  function emit(next) {
    onChange(next);
  }

  function updateTier(index, patch) {
    emit(tiers.map((tier, i) => (i === index ? { ...tier, ...patch } : tier)));
  }

  function addTier() {
    if (tiers.length === 0) {
      emit([{ minQty: "1", maxQty: "10", price: basePrice === "" || basePrice == null ? "" : String(basePrice) }]);
      return;
    }
    const last = tiers[tiers.length - 1];
    const lastMax = Number(last.maxQty);
    const nextMin = Number.isFinite(lastMax) && lastMax > 0 ? lastMax + 1 : "";
    emit([...tiers, { minQty: nextMin ? String(nextMin) : "", maxQty: "", price: "" }]);
  }

  function removeTier(index) {
    emit(tiers.filter((_, i) => i !== index));
  }

  const preview = normalizePriceTiers(
    tiers.map((tier) => ({
      minQty: tier.minQty,
      maxQty: tier.maxQty === "" ? null : tier.maxQty,
      price: tier.price,
    })),
  );

  return (
    <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Bulk pricing</h2>
          <p className="mt-1 text-sm text-slate-500">
            Optional Alibaba-style tiers. Leave empty to use the single product price for every quantity.
          </p>
        </div>
        <button type="button" onClick={addTier} className={quietButtonClass}>
          <Plus size={16} />
          Add tier
        </button>
      </div>

      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}

      {tiers.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          No bulk tiers yet. Customers will pay the standard price for any quantity.
        </p>
      ) : (
        <div className="space-y-2">
          {tiers.map((tier, index) => (
            <div
              key={`tier-${index}`}
              className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
            >
              <label className="block text-xs font-semibold text-slate-700">
                Min qty
                <input
                  inputMode="numeric"
                  value={tier.minQty}
                  onChange={(event) => updateTier(index, { minQty: event.target.value.replace(/[^\d]/g, "") })}
                  className={`${inputClass} mt-1`}
                  placeholder="1"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Max qty
                <input
                  inputMode="numeric"
                  value={tier.maxQty}
                  onChange={(event) => updateTier(index, { maxQty: event.target.value.replace(/[^\d]/g, "") })}
                  className={`${inputClass} mt-1`}
                  placeholder="Open end"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Unit price
                <input
                  inputMode="decimal"
                  value={tier.price}
                  onChange={(event) => updateTier(index, { price: event.target.value })}
                  className={`${inputClass} mt-1`}
                  placeholder="0"
                />
              </label>
              <button
                type="button"
                aria-label="Remove tier"
                onClick={() => removeTier(index)}
                className="grid size-10 place-items-center self-end rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {preview.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Qty</th>
                <th className="px-3 py-2">Unit price</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((tier) => (
                <tr key={formatTierRange(tier)} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-medium text-slate-800">{formatTierRange(tier)}</td>
                  <td className="px-3 py-2 text-slate-700">Rs {Number(tier.price).toLocaleString("en-PK")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
