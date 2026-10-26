import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  BadgePercent,
  Trash2,
  ArrowUp,
  LayoutGrid,
  List,
  Check,
} from "lucide-react";
import { formatPrice, getProductCondition } from "../data/product";
import {
  CANONICAL_CATEGORIES,
  CATEGORY_SUBCATEGORIES,
  normalizeCategory,
} from "../data/categories";
import ProductCard from "../components/ProductCard";
import { Link, useSearchParams } from "react-router-dom";
import ShopCategoryStrip from "../components/ShopCategoryStrip";
import ShopProductRail from "../components/ShopProductRail";
import StoreHeader from "../components/StoreHeader";
import { useCart } from "../cart/CartContext";
import { getRecentlyViewedIds } from "../utils/recentlyViewed";
import { smoothScrollTo } from "../utils/smoothScroll";

const PAGE_SIZE = 12;
const VIEW_STORAGE_KEY = "wasooli-shop-view";

const SORT_OPTIONS = [
  { value: "popular", label: "Most popular" },
  { value: "rating", label: "Top rated" },
  { value: "low", label: "Price: Low to High" },
  { value: "high", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

const TRUST = [
  { icon: Truck, title: "Fast Delivery", text: "Packed in 1–2 days" },
  { icon: RotateCcw, title: "Easy Exchanges", text: "Hassle-free policy" },
  { icon: ShieldCheck, title: "Secure Checkout", text: "Protected payments" },
  { icon: Headphones, title: "Expert Support", text: "Networking help" },
  { icon: BadgePercent, title: "Bulk Pricing", text: "Save on volume" },
];

const FILTER_VISIBLE = 6;

function FilterGroup({
  title,
  options,
  value,
  counts,
  onChange,
  defaultOpen = true,
  searchable = false,
  multiple = false,
  showCheckbox = false,
  showAll = false,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");

  const selected = multiple
    ? Array.isArray(value)
      ? value
      : []
    : value;

  const listOptions = useMemo(() => {
    if (!multiple) return options;
    return options.filter((item) => item !== "All");
  }, [options, multiple]);

  const activeCount = multiple
    ? selected.length
    : listOptions.filter((item) => item !== "All" && selected === item).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return listOptions;
    return listOptions.filter(
      (item) => item === "All" || item.toLowerCase().includes(q)
    );
  }, [listOptions, query]);

  const visible =
    showAll || expanded ? filtered : filtered.slice(0, FILTER_VISIBLE);
  const hiddenCount = showAll
    ? 0
    : Math.max(filtered.length - FILTER_VISIBLE, 0);

  function handleSelect(item) {
    if (!multiple) {
      onChange(item);
      return;
    }
    if (item === "All") {
      onChange([]);
      return;
    }
    const next = selected.includes(item)
      ? selected.filter((entry) => entry !== item)
      : [...selected, item];
    onChange(next);
  }

  function isActive(item) {
    if (multiple) return selected.includes(item);
    return selected === item;
  }

  return (
    <div className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-2 py-0.5 text-left"
      >
        <span className="flex items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-900">
            {title}
          </h3>
          {activeCount > 0 ? (
            <span className="rounded-full bg-brand-500 px-1.5 py-px text-[10px] font-bold text-white">
              {activeCount}
            </span>
          ) : null}
        </span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div className="mt-3">
          {searchable && listOptions.length > FILTER_VISIBLE ? (
            <div className="relative mb-2.5">
              <Search
                size={13}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setExpanded(true);
                }}
                placeholder={`Search ${title.toLowerCase()}…`}
                aria-label={`Search ${title}`}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-2 text-xs text-slate-700 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
              />
            </div>
          ) : null}

          <ul className="space-y-0.5">
            {visible.map((item) => {
              const active = isActive(item);
              const count = counts[item] || 0;
              return (
                <li key={item}>
                  <button
                    type="button"
                    role={showCheckbox ? "checkbox" : undefined}
                    aria-checked={showCheckbox ? active : undefined}
                    onClick={() => handleSelect(item)}
                    className={`shop-filter-item flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition ${active
                        ? "bg-brand-50 font-semibold text-brand-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                  >
                    {showCheckbox ? (
                      <span
                        className={`grid size-4 shrink-0 place-items-center rounded border transition ${active
                            ? "border-brand-500 bg-brand-500 text-white"
                            : "border-slate-300 bg-white"
                          }`}
                        aria-hidden="true"
                      >
                        {active ? <Check size={10} strokeWidth={3} /> : null}
                      </span>
                    ) : null}
                    <span className="min-w-0 flex-1 truncate text-[13px]">{item}</span>
                    <span
                      className={`shop-chip-sm shrink-0 rounded-full px-1.5 py-px tabular-nums ${active
                          ? "bg-brand-500 text-white"
                          : "bg-slate-100 text-slate-500"
                        }`}
                    >
                      {count}
                    </span>
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 ? (
              <li className="px-2 py-2 text-xs text-slate-400">No matches</li>
            ) : null}
          </ul>

          {hiddenCount > 0 && !query.trim() ? (
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              className="mt-2 text-xs font-semibold text-brand-600 transition hover:text-brand-700"
            >
              {expanded ? "Show less" : `Show ${hiddenCount} more`}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export {
  CANONICAL_CATEGORIES,
  CATEGORY_SUBCATEGORIES,
  normalizeCategory,
};

export { getProductCondition };

function CategoryFilterGroup({
  title = "Categories",
  options = [],
  value = "All",
  counts = {},
  subcategory = "",
  onSelectCategory,
  onSelectSubcategory,
  products = [],
  defaultOpen = true,
  searchable = true,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState(() => {
    return value && value !== "All" ? value : null;
  });

  const lastSyncedValueRef = useRef(value);

  useEffect(() => {
    if (value && value !== "All" && value !== lastSyncedValueRef.current) {
      setExpandedCategory(value);
    }
    lastSyncedValueRef.current = value;
  }, [value]);

  function handleCategoryClick(item, hasSubcategories) {
    if (hasSubcategories) {
      const isCurrentlyOpen = expandedCategory === item;
      if (isCurrentlyOpen) {
        setExpandedCategory(null);
      } else {
        setExpandedCategory(item);
        onSelectCategory(item);
      }
    } else {
      setExpandedCategory(null);
      onSelectCategory(item);
    }
  }

  const subcategoriesMap = useMemo(() => {
    const map = {};
    options.forEach((cat) => {
      if (cat === "All") return;
      const dynamic = new Set();
      (products || []).forEach((p) => {
        if (
          p.category === cat ||
          normalizeCategory(p.category) === normalizeCategory(cat)
        ) {
          if (p.subcategory) dynamic.add(p.subcategory);
        }
      });
      const predefined =
        CATEGORY_SUBCATEGORIES[cat] ||
        CATEGORY_SUBCATEGORIES[normalizeCategory(cat)] ||
        [];
      const list = Array.from(new Set([...predefined, ...dynamic]));
      if (list.length > 0) {
        map[cat] = list;
      }
    });
    return map;
  }, [options, products]);

  const subcategoryCounts = useMemo(() => {
    const countsMap = {};
    Object.entries(subcategoriesMap).forEach(([cat, subs]) => {
      subs.forEach((sub) => {
        const key = `${cat}:::${sub}`;
        const count = (products || []).filter((p) => {
          if (
            p.category !== cat &&
            normalizeCategory(p.category) !== normalizeCategory(cat)
          ) {
            return false;
          }
          if (p.subcategory)
            return p.subcategory.toLowerCase() === sub.toLowerCase();
          const q = sub.toLowerCase();
          return (
            p.title?.toLowerCase().includes(q) ||
            p.shortDescription?.toLowerCase().includes(q) ||
            p.portType?.toLowerCase().includes(q)
          );
        }).length;
        countsMap[key] = count;
      });
    });
    return countsMap;
  }, [subcategoriesMap, products]);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((cat) => {
      if (cat === "All") return true;
      if (cat.toLowerCase().includes(q)) return true;
      const subs = subcategoriesMap[cat] || [];
      return subs.some((sub) => sub.toLowerCase().includes(q));
    });
  }, [options, query, subcategoriesMap]);

  return (
    <div className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-2 py-0.5 text-left"
      >
        <span className="flex items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-900">
            {title}
          </h3>
          {value !== "All" ? (
            <span className="rounded-full bg-brand-500 px-1.5 py-px text-[10px] font-bold text-white">
              1
            </span>
          ) : null}
        </span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="mt-3">
          {/* {searchable && options.length > 5 && (
            <div className="relative mb-2.5">
              <Search
                size={13}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search categories & subcategories…"
                aria-label="Search categories"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-2 text-xs text-slate-700 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
              />
            </div>
          )} */}

          {/* All categories shown directly without any 'Show more' button */}
          <ul className="space-y-1">
            {filteredOptions.map((item) => {
              const isAll = item === "All";
              const isSelected = value === item && !subcategory;
              const hasSelectedSub = value === item && Boolean(subcategory);
              const count = counts[item] || 0;
              const subcategories = subcategoriesMap[item] || [];
              const hasSubcategories = !isAll && subcategories.length > 0;
              const isExpanded = expandedCategory === item || Boolean(query.trim());

              return (
                <li key={item} className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => handleCategoryClick(item, hasSubcategories)}
                    className={`group flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-left transition-all duration-200 ${isSelected
                        ? "bg-brand-50/90 font-semibold text-brand-700 shadow-2xs ring-1 ring-brand-200/60"
                        : hasSelectedSub
                          ? "bg-slate-50 font-medium text-slate-900"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="min-w-0 flex-1 truncate text-[13px] font-medium tracking-tight">
                        {item}
                      </span>
                      <span
                        className={`shop-chip-sm shrink-0 rounded-full px-1.5 py-px text-[10px] tabular-nums transition-colors ${isSelected
                            ? "bg-brand-500 text-white font-bold"
                            : "bg-slate-100 text-slate-500 group-hover:bg-slate-200/80"
                          }`}
                      >
                        {count}
                      </span>
                    </div>

                    {hasSubcategories && (
                      <div
                        className={`pointer-events-none grid size-6 shrink-0 place-items-center rounded-md transition-all duration-200 ${isExpanded ? "text-brand-600 bg-brand-50/70" : "text-slate-400 group-hover:text-slate-700"
                          }`}
                      >
                        <ChevronRight
                          size={13}
                          className={`transition-transform duration-200 ease-out ${isExpanded ? "rotate-90 text-brand-600" : ""
                            }`}
                        />
                      </div>
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {hasSubcategories && isExpanded && (() => {
                      const activeSubIndex =
                        value === item && subcategory
                          ? subcategories.indexOf(subcategory)
                          : -1;
                      const hasActiveSub = activeSubIndex !== -1;
                      const fillPercent =
                        hasActiveSub && subcategories.length > 1
                          ? (activeSubIndex / (subcategories.length - 1)) * 100
                          : 0;

                      return (
                        <motion.div
                          key={`sub-${item}`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden relative ml-3 pl-4 py-1.5"
                        >
                          {/* Vertical Tree Connector Guide Line with Dynamic Theme Fill */}
                          <div className="absolute left-1.5 top-3.5 bottom-3.5 w-[1.5px] bg-slate-200 pointer-events-none">
                            {/* Animated Active Filled Line according to selected subcategory */}
                            <motion.div
                              initial={false}
                              animate={{
                                height: hasActiveSub ? `${fillPercent}%` : "0%",
                              }}
                              transition={{ type: "spring", stiffness: 350, damping: 28 }}
                              className="absolute top-0 left-05 w-full bg-brand-500 rounded-full shadow-[0_0_8px_rgba(44,154,255,0.45)]"
                            />

                            {/* Top Dot */}
                            <span
                              className={`absolute -top-1 -left-[3px] size-2 rounded-full ring-2 ring-white transition-colors duration-200 ${hasActiveSub || value === item
                                  ? "bg-brand-500 shadow-[0_0_8px_rgba(44,154,255,0.6)]"
                                  : "bg-slate-300"
                                }`}
                            />

                            {/* Bottom Dot */}
                            <span
                              className={`absolute -bottom-1 -left-[2.5px] size-1.5 rounded-full ring-2 ring-white transition-colors duration-200 ${hasActiveSub && activeSubIndex === subcategories.length - 1
                                  ? "bg-brand-500 scale-125 shadow-[0_0_8px_rgba(44,154,255,0.6)]"
                                  : "bg-slate-300"
                                }`}
                            />
                          </div>

                          <ul className="space-y-0.5">
                            {subcategories.map((sub) => {
                              const isSubActive = value === item && subcategory === sub;
                              const subKey = `${item}:::${sub}`;
                              const subCount = subcategoryCounts[subKey] ?? 0;

                              return (
                                <li key={sub}>
                                  <button
                                    type="button"
                                    onClick={() => onSelectSubcategory(item, sub)}
                                    className={`group/sub relative flex w-full cursor-pointer items-center justify-between gap-1.5 rounded-md px-2 py-1 text-left transition-all duration-150 ${isSubActive
                                        ? "text-brand-600 font-semibold"
                                        : "text-slate-600 hover:text-slate-900 font-medium"
                                      }`}
                                  >
                                    <span className="truncate text-[11.5px] leading-tight tracking-tight">
                                      {sub}
                                    </span>
                                    {subCount > 0 && (
                                      <span
                                        className={`shrink-0 rounded-full px-1.5 py-px text-[9.5px] font-medium tabular-nums leading-none ${isSubActive
                                            ? "bg-brand-50 text-brand-600"
                                            : "bg-slate-100 text-slate-400 group-hover/sub:bg-slate-200/80 group-hover/sub:text-slate-600"
                                          }`}
                                      >
                                        {subCount}
                                      </span>
                                    )}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </motion.div>
                      );
                    })()}
                  </AnimatePresence>
                </li>
              );
            })}

            {filteredOptions.length === 0 && (
              <li className="px-2 py-2 text-xs text-slate-400">No categories found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function AppliedFilters({ filters, onClearAll }) {
  if (filters.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-slate-800">Filter by</p>
        <button
          type="button"
          onClick={onClearAll}
          aria-label="Clear all filters"
          className="cursor-pointer rounded-full p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 size={15} />
        </button>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {filters.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={filter.clear}
            className="shop-chip-sm inline-flex cursor-pointer items-center gap-0.5 rounded-full bg-brand-50 py-px pl-1.5 pr-1 text-brand-700 transition hover:bg-brand-100"
          >
            {filter.label}
            <X size={9} aria-hidden="true" />
            <span className="sr-only">Remove {filter.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function FilterPanel({
  categories,
  category,
  categoryCounts,
  subcategory,
  products,
  brands,
  brand,
  brandCounts,
  availabilityOptions,
  availability,
  availabilityCounts,
  portTypes,
  portType,
  portTypeCounts,
  conditionOptions,
  condition,
  conditionCounts,
  minPrice,
  maxPrice,
  minPriceLimit,
  priceLimit,
  setCategory,
  setBrand,
  setAvailability,
  setPortType,
  setCondition,
  setMinPriceLimit,
  setPriceLimit,
  activeFilters,
  onClearAll,
  onCategorySelect,
}) {
  function clampMin() {
    const currentMax = Number(priceLimit === "" ? maxPrice : priceLimit);
    let next =
      minPriceLimit === "" ? minPrice : Number(minPriceLimit);

    if (!Number.isFinite(next) || next < minPrice) next = minPrice;
    if (next > maxPrice) next = maxPrice;
    if (next > currentMax) {
      setPriceLimit(next);
    }
    setMinPriceLimit(next);
  }

  function clampMax() {
    const currentMin = Number(minPriceLimit === "" ? minPrice : minPriceLimit);
    let next = priceLimit === "" ? maxPrice : Number(priceLimit);

    if (!Number.isFinite(next) || next > maxPrice) next = maxPrice;
    if (next < minPrice) next = minPrice;
    if (next < currentMin) next = currentMin;
    setPriceLimit(next);
  }

  const sliderMin = Number(minPriceLimit === "" ? minPrice : minPriceLimit);
  const sliderMax = Number(priceLimit === "" ? maxPrice : priceLimit);
  const priceSpan = Math.max(maxPrice - minPrice, 1);
  const minPercent = ((Math.min(sliderMin, sliderMax) - minPrice) / priceSpan) * 100;
  const maxPercent = ((Math.max(sliderMax, sliderMin) - minPrice) / priceSpan) * 100;
  const minOnTop = sliderMin > maxPrice - priceSpan * 0.1;

  const pricePresets = useMemo(() => {
    if (maxPrice <= minPrice) return [];
    const span = maxPrice - minPrice;
    const low = Math.round(minPrice + span * 0.33);
    const mid = Math.round(minPrice + span * 0.66);
    return [
      { key: "under", label: `Under ${formatPrice(low)}`, min: minPrice, max: low },
      { key: "mid", label: `${formatPrice(low)} – ${formatPrice(mid)}`, min: low, max: mid },
      { key: "high", label: `${formatPrice(mid)}+`, min: mid, max: maxPrice },
      { key: "all", label: "Any price", min: minPrice, max: maxPrice },
    ];
  }, [minPrice, maxPrice]);

  function isPresetActive(preset) {
    return Number(sliderMin) === preset.min && Number(sliderMax) === preset.max;
  }

  return (
    <div className="space-y-5">
      <AppliedFilters filters={activeFilters} onClearAll={onClearAll} />
      <CategoryFilterGroup
        title="Categories"
        options={categories}
        value={category}
        counts={categoryCounts}
        subcategory={subcategory}
        products={products}
        searchable
        defaultOpen
        onSelectCategory={(item) => {
          setCategory(item, "");
          const subs = CATEGORY_SUBCATEGORIES[item] || [];
          if (subs.length === 0) {
            onCategorySelect?.();
          }
        }}
        onSelectSubcategory={(cat, sub) => {
          setCategory(cat, sub);
          onCategorySelect?.();
        }}
      />
      <FilterGroup
        title="Condition"
        options={conditionOptions}
        value={condition}
        counts={conditionCounts}
        multiple
        showCheckbox
        onChange={setCondition}
      />
      <FilterGroup
        title="Brand"
        options={brands}
        value={brand}
        counts={brandCounts}
        searchable
        multiple
        showCheckbox
        onChange={setBrand}
      />
      <FilterGroup
        title="Availability"
        options={availabilityOptions}
        value={availability}
        counts={availabilityCounts}
        multiple
        showCheckbox
        onChange={setAvailability}
      />
      <FilterGroup
        title="Port type"
        options={portTypes}
        value={portType}
        counts={portTypeCounts}
        multiple
        showCheckbox
        showAll
        onChange={setPortType}
      />

      <div className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-900">
          Price Range
        </h3>

        {pricePresets.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {pricePresets.map((preset) => {
              const active = isPresetActive(preset);
              return (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => {
                    setMinPriceLimit(preset.min);
                    setPriceLimit(preset.max);
                  }}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${active
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700"
                    }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="mt-3 px-1 sm:mt-4">
          <div className="relative h-5">
            <div className="absolute top-1/2 right-0 left-0 h-1 -translate-y-1/2 rounded-full bg-slate-200" />
            <div
              className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-brand-500"
              style={{
                left: `${minPercent}%`,
                width: `${Math.max(maxPercent - minPercent, 0)}%`,
              }}
            />
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={Math.min(sliderMin, sliderMax)}
              onChange={(event) => {
                const next = Number(event.target.value);
                setMinPriceLimit(Math.min(next, sliderMax));
              }}
              aria-label="Minimum price"
              className="dual-range"
              style={{ zIndex: minOnTop ? 5 : 3 }}
            />
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={Math.max(sliderMax, sliderMin)}
              onChange={(event) => {
                const next = Number(event.target.value);
                setPriceLimit(Math.max(next, sliderMin));
              }}
              aria-label="Maximum price"
              className="dual-range"
              style={{ zIndex: 4 }}
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between gap-2 text-xs">
            <div className="flex flex-1 items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1.5 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
              <span className="text-[11px] font-medium text-slate-400">Rs</span>
              <input
                type="text"
                inputMode="numeric"
                value={minPriceLimit}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setMinPriceLimit(val === "" ? "" : Number(val));
                }}
                onBlur={clampMin}
                placeholder={minPrice.toString()}
                aria-label="Minimum price"
                className="w-full text-xs font-semibold text-slate-700 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            <span className="font-medium text-slate-400">to</span>

            <div className="flex flex-1 items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1.5 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
              <span className="text-[11px] font-medium text-slate-400">Rs</span>
              <input
                type="text"
                inputMode="numeric"
                value={priceLimit}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setPriceLimit(val === "" ? "" : Number(val));
                }}
                onBlur={clampMax}
                placeholder={maxPrice.toString()}
                aria-label="Maximum price"
                className="w-full text-xs font-semibold text-brand-700 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Shop() {
  const { products, ready } = useCart();
  const reduceMotion = useReducedMotion();
  const [searchParams, setSearchParams] = useSearchParams();
  const loadMoreRef = useRef(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [category, setCategory] = useState(
    () => searchParams.get("category") || "All"
  );
  const [subcategory, setSubcategory] = useState(
    () => searchParams.get("subcategory") || ""
  );
  const [brand, setBrand] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [portType, setPortType] = useState([]);
  const [condition, setCondition] = useState(() => {
    const fromUrl = searchParams.get("condition");
    return fromUrl ? fromUrl.split(",").filter(Boolean) : [];
  });
  const [sort, setSort] = useState("featured");
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem(VIEW_STORAGE_KEY) === "list" ? "list" : "grid";
    } catch {
      return "grid";
    }
  });
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const catalogLoading = !ready && products.length === 0;

  const { minPrice, maxPrice } = useMemo(() => {
    if (!products.length) return { minPrice: 0, maxPrice: 0 };
    const prices = products
      .map((p) => Number(p.price))
      .filter((price) => Number.isFinite(price) && price >= 0);
    if (!prices.length) return { minPrice: 0, maxPrice: 0 };
    return {
      minPrice: Math.floor(Math.min(...prices)),
      maxPrice: Math.ceil(Math.max(...prices)),
    };
  }, [products]);

  const [minPriceLimit, setMinPriceLimit] = useState("");
  const [priceLimit, setPriceLimit] = useState("");
  const priceRangeKey = `${products.length}:${minPrice}:${maxPrice}`;
  const [syncedPriceRangeKey, setSyncedPriceRangeKey] = useState(priceRangeKey);

  if (
    products.length &&
    maxPrice > 0 &&
    priceRangeKey !== syncedPriceRangeKey
  ) {
    setSyncedPriceRangeKey(priceRangeKey);
    setMinPriceLimit(minPrice);
    setPriceLimit(maxPrice);
  }

  const priceBounds = useMemo(() => {
    const rawMin = minPriceLimit === "" ? minPrice : Number(minPriceLimit);
    const rawMax = priceLimit === "" ? maxPrice : Number(priceLimit);
    return {
      min: Math.min(rawMin, rawMax),
      max: Math.max(rawMin, rawMax),
    };
  }, [minPriceLimit, priceLimit, minPrice, maxPrice]);

  const searchQuery = debouncedSearch.trim().toLowerCase();

  // Faceted pool: apply every filter except the one being counted.
  const facetPool = useMemo(() => {
    function matchesSearch(product) {
      if (!searchQuery) return true;
      return (
        product.title.toLowerCase().includes(searchQuery) ||
        product.category.toLowerCase().includes(searchQuery) ||
        product.brand.toLowerCase().includes(searchQuery) ||
        product.portType.toLowerCase().includes(searchQuery)
      );
    }

    function matchesPrice(product) {
      const price = Number(product.price);
      return price >= priceBounds.min && price <= priceBounds.max;
    }

    function matchesAvailabilitySelected(product, selected) {
      if (!selected.length) return true;
      return selected.some((value) =>
        value === "In stock" ? product.stock > 0 : product.stock <= 0
      );
    }

    function pool(ignore) {
      return products.filter((product) => {
        if (ignore !== "category" && category !== "All") {
          const normSelected = normalizeCategory(category);
          const normProd = normalizeCategory(product.category);
          if (normSelected !== normProd && product.category !== category) {
            return false;
          }
        }
        if (ignore !== "brand" && brand.length > 0 && !brand.includes(product.brand)) {
          return false;
        }
        if (
          ignore !== "availability" &&
          !matchesAvailabilitySelected(product, availability)
        ) {
          return false;
        }
        if (
          ignore !== "portType" &&
          portType.length > 0 &&
          !portType.includes(product.portType)
        ) {
          return false;
        }
        if (
          ignore !== "condition" &&
          condition.length > 0 &&
          !condition.includes(getProductCondition(product))
        ) {
          return false;
        }
        return true;
      });
    }

    function countBy(list, keyFn) {
      const counts = { All: list.length };
      list.forEach((item) => {
        const key = keyFn(item);
        if (!key) return;
        counts[key] = (counts[key] || 0) + 1;
      });
      return counts;
    }

    function optionsFromCounts(counts, selected) {
      const selectedList = Array.isArray(selected)
        ? selected
        : selected && selected !== "All"
          ? [selected]
          : [];
      return [
        "All",
        ...Object.keys(counts)
          .filter(
            (key) =>
              key !== "All" && (counts[key] > 0 || selectedList.includes(key))
          )
          .sort((a, b) => a.localeCompare(b)),
      ];
    }

    const forCategory = pool("category");
    const forBrand = pool("brand");
    const forAvailability = pool("availability");
    const forPort = pool("portType");
    const forCondition = pool("condition");

    const categoryCounts = { All: forCategory.length };
    CANONICAL_CATEGORIES.forEach((cat) => {
      categoryCounts[cat] = forCategory.filter(
        (p) => normalizeCategory(p.category) === cat
      ).length;
    });
    const poeCount = forCategory.filter(
      (p) =>
        normalizeCategory(p.category) === "PoE" ||
        p.title?.toLowerCase().includes("poe") ||
        p.subcategory?.toLowerCase().includes("poe")
    ).length;
    if (poeCount > 0) {
      categoryCounts["PoE"] = poeCount;
    }
    const brandCounts = countBy(forBrand, (product) => product.brand);
    const portTypeCounts = countBy(forPort, (product) => product.portType);
    const conditionCounts = {
      All: forCondition.length,
      "New Product": forCondition.filter((p) => getProductCondition(p) === "New Product").length,
      "Used Product": forCondition.filter((p) => getProductCondition(p) === "Used Product").length,
    };
    const conditionOptions = [
      "All",
      ...(conditionCounts["New Product"] > 0 || condition.includes("New Product") ? ["New Product"] : []),
      ...(conditionCounts["Used Product"] > 0 || condition.includes("Used Product") ? ["Used Product"] : []),
    ];

    const inStock = forAvailability.filter((product) => product.stock > 0).length;
    const availabilityCounts = {
      All: forAvailability.length,
      "In stock": inStock,
      "Out of stock": forAvailability.length - inStock,
    };

    return {
      categories: ["All", ...CANONICAL_CATEGORIES],
      categoryCounts,
      brands: optionsFromCounts(brandCounts, brand),
      brandCounts,
      availabilityOptions: [
        "All",
        ...(availabilityCounts["In stock"] > 0 || availability.includes("In stock")
          ? ["In stock"]
          : []),
        ...(availabilityCounts["Out of stock"] > 0 ||
          availability.includes("Out of stock")
          ? ["Out of stock"]
          : []),
      ],
      availabilityCounts,
      portTypes: optionsFromCounts(portTypeCounts, portType),
      portTypeCounts,
      conditionOptions,
      conditionCounts,
    };
  }, [
    products,
    searchQuery,
    priceBounds,
    category,
    brand,
    availability,
    portType,
    condition,
  ]);

  const {
    categories,
    categoryCounts,
    brands,
    brandCounts,
    availabilityOptions,
    availabilityCounts,
    portTypes,
    portTypeCounts,
    conditionOptions,
    conditionCounts,
  } = facetPool;

  const normCurrentCat = normalizeCategory(category);
  if (
    category !== "All" &&
    !categories.includes(category) &&
    !CANONICAL_CATEGORIES.includes(normCurrentCat)
  ) {
    setCategory("All");
  }

  const nextBrand = brand.filter((item) => brands.includes(item));
  if (nextBrand.length !== brand.length) setBrand(nextBrand);

  const nextAvailability = availability.filter((item) =>
    availabilityOptions.includes(item)
  );
  if (nextAvailability.length !== availability.length) {
    setAvailability(nextAvailability);
  }

  const nextPortType = portType.filter((item) => portTypes.includes(item));
  if (nextPortType.length !== portType.length) setPortType(nextPortType);

  const nextCondition = condition.filter((item) =>
    conditionOptions.includes(item)
  );
  if (nextCondition.length !== condition.length) setCondition(nextCondition);

  const filteredProducts = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    const rawMin = minPriceLimit === "" ? minPrice : Number(minPriceLimit);
    const rawMax = priceLimit === "" ? maxPrice : Number(priceLimit);
    const min = Math.min(rawMin, rawMax);
    const max = Math.max(rawMin, rawMax);

    let result = products.filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.portType.toLowerCase().includes(query);

      const matchesSubcategory =
        !subcategory ||
        (product.subcategory &&
          product.subcategory.toLowerCase() === subcategory.toLowerCase()) ||
        product.title?.toLowerCase().includes(subcategory.toLowerCase()) ||
        product.shortDescription?.toLowerCase().includes(subcategory.toLowerCase()) ||
        product.portType?.toLowerCase().includes(subcategory.toLowerCase());

      const normCat = normalizeCategory(category);
      const normProdCat = normalizeCategory(product.category);
      const isPoeCategory = normCat === "PoE";
      const isPoeProduct =
        normProdCat === "PoE" ||
        product.title?.toLowerCase().includes("poe") ||
        product.subcategory?.toLowerCase().includes("poe");

      const matchesCategory =
        (category === "All" ||
          product.category === category ||
          normCat === normProdCat ||
          (isPoeCategory && isPoeProduct)) &&
        matchesSubcategory;
      const matchesBrand =
        brand.length === 0 || brand.includes(product.brand);
      const matchesAvailability =
        availability.length === 0 ||
        availability.some((value) =>
          value === "In stock" ? product.stock > 0 : product.stock <= 0
        );
      const matchesPort =
        portType.length === 0 || portType.includes(product.portType);
      const matchesCondition =
        condition.length === 0 || condition.includes(getProductCondition(product));

      const price = Number(product.price);
      const matchesPrice = price >= min && price <= max;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesBrand &&
        matchesAvailability &&
        matchesPort &&
        matchesCondition &&
        matchesPrice
      );
    });

    if (sort === "low") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sort === "high") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sort === "name-asc" || sort === "name") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "name-desc") {
      result = [...result].sort((a, b) => b.title.localeCompare(a.title));
    } else if (sort === "popular") {
      result = [...result].sort(
        (a, b) => (Number(b.reviews) || 0) - (Number(a.reviews) || 0)
      );
    } else if (sort === "rating") {
      result = [...result].sort(
        (a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0)
      );
    } else {
      result = [...result].sort((a, b) => {
        const score = (p) =>
          (Number(p.rating) || 0) * 20 + (Number(p.reviews) || 0);
        return score(b) - score(a);
      });
    }

    return result;
  }, [
    products,
    debouncedSearch,
    category,
    subcategory,
    brand,
    availability,
    portType,
    condition,
    sort,
    minPriceLimit,
    priceLimit,
    minPrice,
    maxPrice,
  ]);

  useEffect(() => {
    const query = search.trim();
    const delay = query ? 500 : 0;
    const timer = setTimeout(() => {
      setDebouncedSearch(query ? search : "");
    }, delay);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    document.title = "Shop | Wasooli Store";
  }, []);

  useEffect(() => {
    const fromUrl = searchParams.get("category");
    setCategory(fromUrl && fromUrl.trim() ? fromUrl : "All");
    const subFromUrl = searchParams.get("subcategory");
    setSubcategory(subFromUrl && subFromUrl.trim() ? subFromUrl : "");
    const condFromUrl = searchParams.get("condition");
    setCondition(condFromUrl ? condFromUrl.split(",").filter(Boolean) : []);
  }, [searchParams]);

  function selectCategory(name, sub = "") {
    const next = typeof name === "function" ? name(category) : name;
    setCategory(next);
    setSubcategory(sub);
    setSearchParams(
      (current) => {
        const params = new URLSearchParams(current);
        if (!next || next === "All") {
          params.delete("category");
          params.delete("subcategory");
        } else {
          params.set("category", next);
          if (sub) params.set("subcategory", sub);
          else params.delete("subcategory");
        }
        return params;
      },
      { replace: true }
    );
  }

  function handleConditionChange(next) {
    const val = typeof next === "function" ? next(condition) : next;
    setCondition(val);
    setSearchParams(
      (current) => {
        const params = new URLSearchParams(current);
        if (!val || val.length === 0) {
          params.delete("condition");
        } else {
          params.set("condition", val.join(","));
        }
        return params;
      },
      { replace: true }
    );
  }

  const visibleResetKey = [
    debouncedSearch,
    category,
    subcategory,
    brand.join(","),
    availability.join(","),
    portType.join(","),
    condition.join(","),
    sort,
    minPriceLimit,
    priceLimit,
  ].join("|");
  const [syncedVisibleKey, setSyncedVisibleKey] = useState(visibleResetKey);
  if (visibleResetKey !== syncedVisibleKey) {
    setSyncedVisibleKey(visibleResetKey);
    setVisibleCount(PAGE_SIZE);
  }

  useEffect(() => {
    document.body.style.overflow = filtersOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [filtersOpen]);

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, viewMode);
    } catch {
      /* ignore */
    }
  }, [viewMode]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  useEffect(() => {
    if (!hasMore) return undefined;
    const node = loadMoreRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((count) => count + PAGE_SIZE);
        }
      },
      { rootMargin: "280px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, visibleProducts.length, filteredProducts.length]);

  useEffect(() => {
    function onScroll() {
      setShowScrollTop(window.scrollY > 720);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const priceActive =
    (minPriceLimit !== "" && Number(minPriceLimit) > minPrice) ||
    (priceLimit !== "" && Number(priceLimit) < maxPrice);
  const activeFilters = [
    category !== "All" && {
      key: "category",
      label: subcategory ? `${category} › ${subcategory}` : category,
      clear: () => selectCategory("All", ""),
    },
    ...brand.map((item) => ({
      key: `brand-${item}`,
      label: item,
      clear: () => setBrand((current) => current.filter((entry) => entry !== item)),
    })),
    ...availability.map((item) => ({
      key: `availability-${item}`,
      label: item,
      clear: () =>
        setAvailability((current) => current.filter((entry) => entry !== item)),
    })),
    ...portType.map((item) => ({
      key: `port-${item}`,
      label: item,
      clear: () =>
        setPortType((current) => current.filter((entry) => entry !== item)),
    })),
    ...condition.map((item) => ({
      key: `condition-${item}`,
      label: item,
      clear: () =>
        handleConditionChange((current) =>
          current.filter((entry) => entry !== item)
        ),
    })),
    priceActive && {
      key: "price",
      label:
        minPriceLimit > minPrice && priceLimit < maxPrice
          ? `${formatPrice(minPriceLimit)} - ${formatPrice(priceLimit)}`
          : minPriceLimit > minPrice
            ? `From ${formatPrice(minPriceLimit)}`
            : `Up to ${formatPrice(priceLimit)}`,
      clear: () => {
        setMinPriceLimit(minPrice);
        setPriceLimit(maxPrice);
      },
    },
  ].filter(Boolean);

  const clearFilters = () => {
    selectCategory("All", "");
    setBrand([]);
    setAvailability([]);
    setPortType([]);
    handleConditionChange([]);
    setMinPriceLimit(minPrice);
    setPriceLimit(maxPrice);
  };

  const clearAll = () => {
    setSearch("");
    clearFilters();
  };

  const categoryStripItems = useMemo(() => {
    const map = new Map();
    products.forEach((product) => {
      const name = product.category;
      if (!name) return;
      const entry = map.get(name) || { name, count: 0, image: null };
      entry.count += 1;
      if (!entry.image && product.image) entry.image = product.image;
      map.set(name, entry);
    });
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const featuredProducts = useMemo(() => {
    return [...products]
      .filter((product) => !Number.isFinite(product.stock) || product.stock > 0)
      .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
      .slice(0, 10);
  }, [products]);

  const trendingProducts = useMemo(() => {
    return [...products]
      .filter((product) => !Number.isFinite(product.stock) || product.stock > 0)
      .sort((a, b) => (Number(b.reviews) || 0) - (Number(a.reviews) || 0))
      .slice(0, 10);
  }, [products]);

  const recentProducts = useMemo(() => {
    const ids = getRecentlyViewedIds();
    if (!ids.length || !products.length) return [];
    const byId = new Map(products.map((product) => [String(product.id), product]));
    return ids.map((id) => byId.get(id)).filter(Boolean).slice(0, 10);
  }, [products]);

  const filterProps = {
    categories,
    category,
    categoryCounts,
    subcategory,
    products,
    brands,
    brand,
    brandCounts,
    availabilityOptions,
    availability,
    availabilityCounts,
    portTypes,
    portType,
    portTypeCounts,
    conditionOptions,
    condition,
    conditionCounts,
    minPrice,
    maxPrice,
    minPriceLimit,
    priceLimit,
    setCategory: selectCategory,
    setBrand,
    setAvailability,
    setPortType,
    setCondition: handleConditionChange,
    setMinPriceLimit,
    setPriceLimit,
    activeFilters,
    onClearAll: clearFilters,
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <StoreHeader />

      {/* Breadcrumb Navigation */}
      <div className="border-b border-slate-200/80 bg-white">
        <nav
          aria-label="Breadcrumb"
          className="page-crumb page-offset mx-auto flex max-w-8xl flex-wrap items-center gap-x-0 px-4 py-3 sm:px-6 lg:px-8 2xl:max-w-384"
        >
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>

          {category && category !== "All" ? (
            <>
              <Link
                to="/shop"
                onClick={() => selectCategory("All", "")}
                className="cursor-pointer transition hover:text-brand-600"
              >
                Shop
              </Link>
              <span aria-hidden="true">/</span>
              {subcategory ? (
                <>
                  <Link
                    to={`/shop?category=${encodeURIComponent(category)}`}
                    onClick={() => selectCategory(category, "")}
                    className="cursor-pointer transition hover:text-brand-600"
                  >
                    {category}
                  </Link>
                  <span aria-hidden="true">/</span>
                  <span
                    aria-current="page"
                    className="max-w-48 truncate font-medium text-slate-900 sm:max-w-md"
                  >
                    {subcategory}
                  </span>
                </>
              ) : (
                <span
                  aria-current="page"
                  className="max-w-48 truncate font-medium text-slate-900 sm:max-w-md"
                >
                  {category}
                </span>
              )}
            </>
          ) : condition.length === 1 ? (
            <>
              <Link
                to="/shop"
                onClick={() => setCondition([])}
                className="cursor-pointer transition hover:text-brand-600"
              >
                Shop
              </Link>
              <span aria-hidden="true">/</span>
              <span
                aria-current="page"
                className="max-w-48 truncate font-medium text-slate-900 sm:max-w-md"
              >
                {condition[0]}s
              </span>
            </>
          ) : (
            <span aria-current="page" className="font-medium text-slate-900">
              Shop
            </span>
          )}
        </nav>
      </div>

      <section
        className="border-b border-slate-200 bg-white"
        aria-label="Store benefits"
      >
        <div className="shop-trust-marquee py-4 sm:py-5">
          <div className="shop-trust-track">
            {[0, 1].map((copy) => (
              <div
                key={copy}
                className="shop-trust-set"
                aria-hidden={copy === 1 ? true : undefined}
              >
                {TRUST.map(({ icon: Icon, title, text }) => (
                  <div
                    key={`${copy}-${title}`}
                    className="flex w-[220px] shrink-0 items-center gap-3 rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white px-3 py-3 shadow-xs sm:w-[240px]"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-[0_12px_24px_-12px_rgba(44,154,255,0.9)]">
                      <Icon size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{title}</p>
                      <p className="truncate text-xs text-slate-500">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>


      <section
        id="shop-browse"
        className="mx-auto max-w-8xl scroll-mt-24 px-4 py-5 sm:px-6 sm:py-7 lg:px-8 2xl:max-w-[1536px]"
      >
        <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start lg:gap-8 xl:grid-cols-[280px_minmax(0,1fr)] xl:gap-10">
          <aside className="hidden lg:block lg:self-start">
            <div className="sticky top-[calc(var(--store-header-height,72px)+1rem)] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand-600">
                    <SlidersHorizontal size={15} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Filters</p>
                    <p className="text-[11px] text-slate-500">
                      {filteredProducts.length} result{filteredProducts.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
               
              </div>
              <FilterPanel {...filterProps} />
            </div>
          </aside>

          <div className="min-w-0">
            <div className="sticky top-(--store-header-height,0px) z-30 -mx-4 mb-5 border-b border-slate-200 bg-slate-50/95 px-4 py-2.5 shadow-sm backdrop-blur-md sm:-mx-6 sm:px-6 sm:py-3 lg:static lg:top-auto lg:mx-0 lg:mb-5 lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-white lg:px-4 lg:py-3.5 lg:shadow-sm lg:backdrop-blur-none">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4">
                <div className="relative min-w-0 flex-1">
                  <Search
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 sm:left-4"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search products, brands, ports..."
                    aria-label="Search products"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-xs shadow-xs outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 sm:py-3 sm:pl-11 sm:pr-4 sm:text-sm"
                  />
                  {search ? (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-100"
                      aria-label="Clear search"
                    >
                      <X size={15} />
                    </button>
                  ) : null}
                </div>

                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(true)}
                    className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-xs transition hover:border-brand-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 sm:h-auto sm:px-4 sm:py-3 sm:text-sm lg:hidden"
                  >
                    <SlidersHorizontal size={15} className="text-brand-600" />
                    <span>Filters</span>
                    {activeFilters.length > 0 ? (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-xs font-semibold text-white">
                        {activeFilters.length}
                      </span>
                    ) : null}
                  </button>

                  <label className="relative flex h-10 min-w-0 flex-1 items-center sm:h-auto sm:w-52 sm:flex-none">
                    <select
                      value={sort}
                      onChange={(event) => setSort(event.target.value)}
                      aria-label="Sort products"
                      className="h-full w-full min-w-0 cursor-pointer appearance-none truncate rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-xs outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 sm:py-3 sm:pl-4 sm:pr-10 sm:text-sm"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-2.5 text-slate-400 sm:right-3"
                    />
                  </label>

                  <div
                    className="hidden h-10 shrink-0 items-center rounded-xl border border-slate-200 bg-white p-1 shadow-xs sm:flex"
                    role="group"
                    aria-label="View mode"
                  >
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      aria-pressed={viewMode === "grid"}
                      aria-label="Grid view"
                      className={`grid size-8 place-items-center rounded-lg transition ${viewMode === "grid"
                          ? "bg-brand-500 text-white"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                        }`}
                    >
                      <LayoutGrid size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      aria-pressed={viewMode === "list"}
                      aria-label="List view"
                      className={`grid size-8 place-items-center rounded-lg transition ${viewMode === "list"
                          ? "bg-brand-500 text-white"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                        }`}
                    >
                      <List size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {catalogLoading ? (
              <div className="grid grid-cols-1 gap-2.5 min-[340px]:grid-cols-2 min-[540px]:grid-cols-3 sm:gap-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white"
                  >
                    <div className="aspect-square animate-pulse bg-slate-100" />
                    <div className="space-y-2 p-3">
                      <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                      <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                      <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                      <div className="h-5 w-1/2 animate-pulse rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : visibleProducts.length > 0 ? (
              <>
                <motion.div
                  key={`${category}-${subcategory}-${sort}`}
                  initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className={
                    viewMode === "list"
                      ? "flex flex-col gap-3"
                      : "grid grid-cols-1 gap-2 min-[340px]:grid-cols-2 min-[540px]:grid-cols-3 sm:gap-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 min-[1800px]:grid-cols-5"
                  }
                >
                  {visibleProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                      layout={viewMode}
                    />
                  ))}
                </motion.div>

                <div className="mt-8 flex flex-col items-center gap-3 sm:mt-12">
                  <div className="h-1.5 w-40 overflow-hidden rounded-full bg-slate-200 sm:w-56">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all"
                      style={{
                        width: `${(visibleProducts.length / Math.max(filteredProducts.length, 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    You&apos;ve viewed {visibleProducts.length} of {filteredProducts.length} products
                  </p>
                  {hasMore && (
                    <>
                      <div ref={loadMoreRef} className="h-4 w-full" aria-hidden="true" />
                      <button
                        type="button"
                        onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                        className="w-full max-w-xs cursor-pointer rounded-xl border border-brand-500 bg-white px-8 py-3 text-sm font-semibold text-brand-600 shadow-xs transition hover:bg-brand-500 hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 sm:w-auto"
                      >
                        Load more products
                      </button>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center sm:px-6 sm:py-16">
                <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <Search size={24} />
                </span>
                <h2 className="mt-4 text-lg font-semibold text-slate-900">No products found</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                  Try a different search, category, or price range.
                </p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-5 w-full max-w-xs cursor-pointer rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 sm:w-auto"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>


      <AnimatePresence>
        {showScrollTop ? (
          <motion.button
            type="button"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 12 }}
            aria-label="Back to top"
            onClick={() =>
              window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })
            }
            className="fixed bottom-6 right-5 z-40 grid size-11 place-items-center rounded-full bg-brand-500 text-white shadow-[0_12px_30px_-10px_rgba(44,154,255,0.9)] transition hover:bg-brand-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 sm:bottom-8 sm:right-8"
          >
            <ArrowUp size={18} />
          </motion.button>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {filtersOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.25 }}
              onClick={() => setFiltersOpen(false)}
              className="absolute inset-0 cursor-pointer bg-slate-900/50 backdrop-blur-xs"
            />
            <motion.aside
              initial={reduceMotion ? false : { x: "-100%" }}
              animate={{ x: 0 }}
              exit={reduceMotion ? undefined : { x: "-100%" }}
              transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-y-0 left-0 flex w-[85vw] max-w-xs flex-col bg-white shadow-2xl sm:max-w-sm"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <p className="text-sm font-semibold text-slate-900">Filters</p>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  aria-label="Close filters"
                  className="grid size-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <FilterPanel
                  {...filterProps}
                  onCategorySelect={() => setFiltersOpen(false)}
                />
              </div>
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
