import { useEffect, useMemo, useState } from "react";
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
import { products } from "../data/product";
import ProductCard from "../components/product/ProductCard";

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

const formatPrice = (value) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);

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

    let result = products.filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);

      const matchesCategory =
        category === "All" || product.category === category;

      const matchesPrice = Number(product.price) <= priceLimit;

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
  }, [search, category, sort, priceLimit]);

  useEffect(() => {
    document.title = "Shop | Wasooli Store";
  }, []);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, category, sort, priceLimit]);
  useEffect(() => {
    document.body.style.overflow = filtersOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [filtersOpen]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const priceActive = priceLimit < maxPrice;
  const activeFilters = [
    category !== "All" && {
      key: "category",
      label: category,
      clear: () => setCategory("All"),
    },
    priceActive && {
      key: "price",
      label: `Up to ${formatPrice(priceLimit)}`,
      clear: () => setPriceLimit(maxPrice),
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
    setPriceLimit(maxPrice);
  };

  const FilterPanel = (
    <div className="space-y-8">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-900">
          Categories
        </h3>
        <ul className="mt-4 space-y-1">
          {categories.map((item) => {
            const active = category === item;
            return (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                    active
                      ? "bg-brand-50 font-semibold text-brand-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>{item}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
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
          Max Price
        </h3>
        <div className="mt-4 px-1">
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={priceLimit}
            onChange={(event) => setPriceLimit(Number(event.target.value))}
            aria-label="Maximum price"
            className="w-full cursor-pointer accent-brand-500"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{formatPrice(minPrice)}</span>
            <span className="rounded-md bg-brand-50 px-2 py-1 font-semibold text-brand-700">
              {formatPrice(priceLimit)}
            </span>
          </div>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-600"
        >
          Reset all filters
        </button>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-brand-100 bg-gradient-to-br from-brand-50 via-white to-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-100/60 blur-3xl" />
        <div className="relative mx-auto max-w-8xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
            <span className="hover:text-brand-600">Home</span>
            <span className="mx-2">/</span>
            <span className="font-medium text-slate-900">Shop</span>
          </nav>

          <p className="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-brand-600">
            Welcome to Wasooli Store
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Explore Products<span className="text-brand-500">.</span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
            Discover products selected by Wasooli Store for your everyday style
            and needs.
          </p>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-8xl grid-cols-2 gap-4 px-4 py-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {TRUST.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <Icon size={18} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
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

      <section className="mx-auto max-w-8xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-[250px_1fr] lg:gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              {FilterPanel}
            </div>
          </aside>

          <div>
            {/* Toolbar */}
            <div className="sticky top-0 z-20 -mx-4 border-b border-slate-200 bg-slate-50/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search products..."
                    aria-label="Search products"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm shadow-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(true)}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-500 lg:hidden"
                  >
                    <SlidersHorizontal size={16} className="text-brand-600" />
                    Filters
                    {activeFilters.length > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-xs font-semibold text-white">
                        {activeFilters.length}
                      </span>
                    )}
                  </button>

                  <label className="relative flex flex-1 items-center sm:flex-none">
                    <select
                      value={sort}
                      onChange={(event) => setSort(event.target.value)}
                      aria-label="Sort products"
                      className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-10 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 text-slate-400"
                    />
                  </label>
                </div>
              </div>

              {/* Mobile category chips */}
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`whitespace-nowrap cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition ${
                      category === item
                        ? "bg-brand-500 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-brand-500 hover:text-brand-600"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Results summary + active filters */}
            <div className="mb-5 mt-5 flex flex-wrap items-center gap-2">
              <p className="mr-2 text-sm text-slate-500">
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

              {activeFilters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={filter.clear}
                  className="group flex cursor-pointer items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 py-1 pl-3 pr-2 text-xs font-medium text-brand-700 transition hover:bg-brand-100"
                  aria-label={`Remove filter ${filter.label}`}
                >
                  {filter.label}
                  <X size={14} className="opacity-70 group-hover:opacity-100" />
                </button>
              ))}

              {activeFilters.length > 1 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="cursor-pointer text-xs font-semibold text-slate-500 underline-offset-2 hover:text-brand-600 hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Grid */}
            {visibleProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-3 gap-4 sm:gap-6 md:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4">
                  {visibleProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                <div className="mt-10 flex flex-col items-center gap-3">
                  <div className="h-1.5 w-48 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all"
                      style={{
                        width: `${
                          (visibleProducts.length / filteredProducts.length) *
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
                      className="cursor-pointer rounded-xl border border-brand-500 bg-white px-8 py-3 text-sm font-semibold text-brand-600 shadow-sm transition hover:bg-brand-500 hover:text-white"
                    >
                      Load more products
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <Search size={24} />
                </span>
                <h2 className="mt-4 text-lg font-semibold text-slate-900">
                  No products found
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Try a different search, category, or price range.
                </p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-5 cursor-pointer rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
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
        className={`fixed inset-0 z-50 lg:hidden ${
          filtersOpen ? "" : "pointer-events-none"
        }`}
        aria-hidden={!filtersOpen}
      >
        <div
          onClick={() => setFiltersOpen(false)}
          className={`absolute inset-0 cursor-pointer bg-slate-900/50 transition-opacity ${
            filtersOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute inset-y-0 left-0 flex w-80 max-w-[85%] flex-col bg-white shadow-xl transition-transform duration-300 ${
            filtersOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-900">Filters</h2>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              aria-label="Close filters"
              className="cursor-pointer rounded-full p-1.5 text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-6">{FilterPanel}</div>
          <div className="border-t border-slate-200 p-4">
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="w-full cursor-pointer rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              Show {filteredProducts.length} products
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}