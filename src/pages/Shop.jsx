import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
} from "lucide-react";
import { formatPrice, products } from "../data/product";
import ProductCard from "../components/ProductCard";
import StoreHeader from "../components/StoreHeader";

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: "low", label: "Price: Low to High" },
  { value: "high", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

const TRUST = [
  { icon: Truck, title: "Free Shipping", text: "On eligible orders" },
  { icon: RotateCcw, title: "Easy Returns", text: "Hassle-free policy" },
  { icon: ShieldCheck, title: "Secure Checkout", text: "Protected payments" },
  { icon: Headphones, title: "24/7 Support", text: "We're here to help" },
];

function FilterPanel({
  categories,
  category,
  categoryCounts,
  minPrice,
  maxPrice,
  minPriceLimit,
  priceLimit,
  setCategory,
  setMinPriceLimit,
  setPriceLimit,
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

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-900">
          Categories
        </h3>
        <ul className="mt-3 sm:mt-4 space-y-1">
          {categories.map((item) => {
            const active = category === item;
            return (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => {
                    setCategory(item);
                    onCategorySelect?.();
                  }}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs sm:text-sm transition ${
                    active
                      ? "bg-brand-50 font-semibold text-brand-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span className="truncate pr-2">{item}</span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] sm:text-xs ${
                      active
                        ? "bg-brand-500 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {categoryCounts[item] || 0}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-900">
          Price Range
        </h3>
        <div className="mt-3 sm:mt-4 px-1">
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

            <span className="text-slate-400 font-medium">to</span>

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
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("low");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { minPrice, maxPrice } = useMemo(() => {
    const prices = products.map((p) => Number(p.price) || 0);
    return {
      minPrice: Math.floor(Math.min(...prices, 0)),
      maxPrice: Math.ceil(Math.max(...prices, 0)),
    };
  }, []);

  const [minPriceLimit, setMinPriceLimit] = useState(minPrice);
  const [priceLimit, setPriceLimit] = useState(maxPrice);

  const categories = useMemo(
    () => ["All", ...new Set(products.map((product) => product.category))],
    []
  );

  const categoryCounts = useMemo(() => {
    const counts = { All: products.length };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const rawMin = minPriceLimit === "" ? minPrice : Number(minPriceLimit);
    const rawMax = priceLimit === "" ? maxPrice : Number(priceLimit);
    const min = Math.min(rawMin, rawMax);
    const max = Math.max(rawMin, rawMax);

    let result = products.filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);

      const matchesCategory =
        category === "All" || product.category === category;

      const price = Number(product.price);
      const matchesPrice = price >= min && price <= max;

      return matchesSearch && matchesCategory && matchesPrice;
    });

    if (sort === "low") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sort === "high") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sort === "name-asc" || sort === "name") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "name-desc") {
      result = [...result].sort((a, b) => b.title.localeCompare(a.title));
    }

    return result;
  }, [search, category, sort, minPriceLimit, priceLimit, minPrice, maxPrice]);

  useEffect(() => {
    document.title = "Shop | Wasooli Store";
  }, []);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, category, sort, minPriceLimit, priceLimit]);
  useEffect(() => {
    document.body.style.overflow = filtersOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [filtersOpen]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const priceActive =
    (minPriceLimit !== "" && Number(minPriceLimit) > minPrice) ||
    (priceLimit !== "" && Number(priceLimit) < maxPrice);
  const activeFilters = [
    category !== "All" && {
      key: "category",
      label: category,
      clear: () => setCategory("All"),
    },
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
    search.trim() && {
      key: "search",
      label: `"${search.trim()}"`,
      clear: () => setSearch(""),
    },
  ].filter(Boolean);

  const clearAll = () => {
    setSearch("");
    setCategory("All");
    setMinPriceLimit(minPrice);
    setPriceLimit(maxPrice);
  };

  const filterProps = {
    categories,
    category,
    categoryCounts,
    minPrice,
    maxPrice,
    minPriceLimit,
    priceLimit,
    setCategory,
    setMinPriceLimit,
    setPriceLimit,
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <StoreHeader />
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-brand-100 bg-gradient-to-br from-brand-50 via-white to-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-100/60 blur-3xl" />
        <div className="relative mx-auto max-w-8xl 2xl:max-w-[1536px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
            <Link to="/shop" className="hover:text-brand-600">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-slate-900">Shop</span>
          </nav>

          <p className="mt-4 sm:mt-5 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-brand-600">
            Welcome to Wasooli Store
          </p>

          <h1 className="mt-2 sm:mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Explore Products<span className="text-brand-500">.</span>
          </h1>

          <p className="mt-3 sm:mt-4 max-w-xl text-xs sm:text-sm md:text-base leading-relaxed text-slate-600">
            Discover products selected by Wasooli Store for your everyday style
            and needs.
          </p>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-8xl 2xl:max-w-[1536px] grid-cols-2 gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4 lg:grid-cols-4 lg:px-8">
          {TRUST.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-2.5 sm:gap-3">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <Icon size={16} className="sm:hidden" />
                <Icon size={18} className="hidden sm:block" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs sm:text-sm font-semibold text-slate-900">
                  {title}
                </p>
                <p className="hidden truncate text-xs text-slate-500 sm:block">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-8xl 2xl:max-w-[1536px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="lg:grid lg:grid-cols-[250px_1fr] lg:gap-8 xl:grid-cols-[270px_1fr] xl:gap-10">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <FilterPanel {...filterProps} />
            </div>
          </aside>

          <div className="min-w-0">
            {/* Toolbar */}
            <div className="sticky top-16 z-20 -mx-4 border-b border-slate-200 bg-slate-50/95 px-4 py-2.5 backdrop-blur-md sm:-mx-6 sm:px-6 sm:py-3 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
                <div className="relative flex-1">
                  <Search
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 sm:left-4"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search products..."
                    aria-label="Search products"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-xs sm:text-sm shadow-xs outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 sm:py-3 sm:pl-11 sm:pr-4"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-600"
                      aria-label="Clear search"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(true)}
                    className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-xs transition hover:border-brand-500 sm:h-auto sm:px-4 sm:py-3 sm:text-sm lg:hidden"
                  >
                    <SlidersHorizontal size={15} className="text-brand-600" />
                    <span>Filters</span>
                    {activeFilters.length > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-xs font-semibold text-white">
                        {activeFilters.length}
                      </span>
                    )}
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
                </div>
              </div>

              {/* Mobile category chips */}
              <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`shrink-0 whitespace-nowrap cursor-pointer rounded-full px-3 py-1 text-xs sm:text-sm font-medium transition ${category === item
                        ? "bg-brand-500 text-white shadow-xs"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-brand-500 hover:text-brand-600"
                      }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Results summary + active filters */}
            <div className="mb-4 mt-3 sm:mb-5 sm:mt-5 flex flex-wrap items-center gap-1.5 sm:gap-2">
              <p className="mr-2 text-xs sm:text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-900">
                  {visibleProducts.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-900">
                  {filteredProducts.length}
                </span>{" "}
                products
              </p>
              {activeFilters.length > 1 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="cursor-pointer text-[11px] sm:text-xs font-semibold text-slate-500 underline-offset-2 hover:text-brand-600 hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Grid */}
            {visibleProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 min-[340px]:grid-cols-2 min-[540px]:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 min-[1800px]:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                  {visibleProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                <div className="mt-8 sm:mt-12 flex flex-col items-center gap-3">
                  <div className="h-1.5 w-40 sm:w-56 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all"
                      style={{
                        width: `${(visibleProducts.length / filteredProducts.length) *
                          100
                          }%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    You've viewed {visibleProducts.length} of{" "}
                    {filteredProducts.length} products
                  </p>
                  {hasMore && (
                    <button
                      type="button"
                      onClick={() =>
                        setVisibleCount((count) => count + PAGE_SIZE)
                      }
                      className="w-full max-w-xs sm:w-auto cursor-pointer rounded-xl border border-brand-500 bg-white px-8 py-3 text-sm font-semibold text-brand-600 shadow-xs transition hover:bg-brand-500 hover:text-white"
                    >
                      Load more products
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-12 sm:px-6 sm:py-16 text-center">
                <span className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <Search size={22} className="sm:hidden" />
                  <Search size={24} className="hidden sm:block" />
                </span>
                <h2 className="mt-4 text-base sm:text-lg font-semibold text-slate-900">
                  No products found
                </h2>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                  Try a different search, category, or price range.
                </p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-5 w-full max-w-xs sm:w-auto cursor-pointer rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile filter drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${filtersOpen ? "visible" : "invisible pointer-events-none"
          }`}
        aria-hidden={!filtersOpen}
      >
        <div
          onClick={() => setFiltersOpen(false)}
          className={`absolute inset-0 cursor-pointer bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300 ${filtersOpen ? "opacity-100" : "opacity-0"
            }`}
        />
        <aside
          className={`absolute inset-y-0 left-0 flex w-[85vw] max-w-xs sm:max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${filtersOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Filters</h2>
              <p className="text-xs text-slate-500">{filteredProducts.length} products available</p>
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              aria-label="Close filters"
              className="cursor-pointer rounded-full p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-6">
            <FilterPanel
              {...filterProps}
              onCategorySelect={() => setFiltersOpen(false)}
            />
          </div>
          <div className="border-t border-slate-200 p-4">
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="w-full cursor-pointer rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 active:scale-[0.99]"
            >
              Show {filteredProducts.length} products
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}