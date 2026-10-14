import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";
import { products, formatPrice } from "../data/product";
import ProductCard from "../components/product/ProductCard";

const STORE_NAME = "Wasooli Store";

function Stars({ rating }) {
  const filled = Math.round(Number(rating) || 0);
  return (
    <div className="flex items-center gap-0.5 text-amber-400" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={17}
          fill={n <= filled ? "currentColor" : "none"}
          className={n <= filled ? "" : "text-slate-300"}
        />
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();

  const product = products.find((item) => item.slug === slug);

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [wished, setWished] = useState(false);
  const [tab, setTab] = useState("description");

  // Reset page state when navigating between products
  useEffect(() => {
    setQuantity(1);
    setActiveImage(0);
    setAdded(false);
    setWished(false);
    setTab("description");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  useEffect(() => {
    document.title = product
      ? `${product.title} | ${STORE_NAME}`
      : `Product not found | ${STORE_NAME}`;
  }, [product]);

  if (!product) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-600">
            <ShoppingBag size={28} />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Product not found
          </h1>

          <p className="mt-2 text-slate-500">
            The product you are looking for does not exist.
          </p>

          <Link
            to="/shop"
            className="mt-6 inline-flex cursor-pointer rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-600"
          >
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  const images = [
    ...new Set([product.image, ...(product.images ?? [])].filter(Boolean)),
  ];

  const stock = Number.isFinite(product.stock) ? product.stock : null;
  const outOfStock = stock !== null && stock <= 0;
  const lowStock = stock !== null && stock > 0 && stock <= 5;

  const hasDiscount = product.oldPrice > product.price;
  const discount = hasDiscount
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const description = product.description || product.shortDescription;
  const hasFeatures = product.features?.length > 0;
  const hasSpecs = product.specifications?.length > 0;

  const tabs = [
    description && { id: "description", label: "Description" },
    hasFeatures && { id: "features", label: "Features" },
    hasSpecs && { id: "specs", label: "Specifications" },
  ].filter(Boolean);

  const currentTab = tabs.some((t) => t.id === tab) ? tab : tabs[0]?.id;

  const relatedProducts = products
    .filter(
      (item) => item.id !== product.id && item.category === product.category
    )
    .slice(0, 4);

  function handleAddToCart() {
    if (outOfStock) return;

    // Temporary UI feedback; cart functionality comes next.
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  const cartLabel = outOfStock
    ? "Out of Stock"
    : added
      ? "Added to Cart!"
      : "Add to Cart";

  return (
    <main className="min-h-screen bg-white pb-24 lg:pb-0">
      {/* Breadcrumb */}
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto flex max-w-8xl flex-wrap items-center gap-1.5 px-4 py-3 text-xs text-slate-500 sm:px-6 sm:text-sm lg:px-8">
          <Link to="/" className="hover:text-brand-600">
            Home
          </Link>
          <ChevronRight size={14} className="text-slate-300" />
          <Link to="/shop" className="hover:text-brand-600">
            Shop
          </Link>
          <ChevronRight size={14} className="text-slate-300" />
          <span>{product.category}</span>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="max-w-48 truncate font-medium text-slate-900 sm:max-w-none">
            {product.title}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-8xl px-4 pt-5 sm:px-6 lg:px-8">
        <Link
          to="/shop"
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-brand-600"
        >
          <ArrowLeft size={17} />
          Back to products
        </Link>
      </div>

      <section className="mx-auto grid max-w-8xl 2xl:max-w-[1536px] gap-8 px-4 py-6 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:py-10">
        {/* Gallery */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-slate-50">
            <div className="absolute left-4 top-4 z-10 flex flex-col items-start gap-2">
              {product.badge && (
                <span className="rounded-full bg-brand-500 px-4 py-1.5 text-xs font-bold text-white shadow-sm">
                  {product.badge}
                </span>
              )}
              {hasDiscount && (
                <span className="rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                  -{discount}%
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setWished((value) => !value)}
              aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={wished}
              className="absolute right-4 top-4 z-10 grid size-10 cursor-pointer place-items-center rounded-full bg-white/90 text-slate-600 shadow-sm backdrop-blur transition hover:text-red-500"
            >
              <Heart
                size={19}
                className={wished ? "text-red-500" : ""}
                fill={wished ? "currentColor" : "none"}
              />
            </button>

            <img
              src={images[activeImage]}
              alt={product.title}
              className="aspect-4/4.5 w-full cursor-zoom-in object-cover transition duration-500 group-hover:scale-110 sm:aspect-square"
            />
          </div>

          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`View image ${index + 1}`}
                  aria-pressed={activeImage === index}
                  className={`overflow-hidden rounded-xl border-2 transition cursor-pointer ${
                    activeImage === index
                      ? "border-brand-500 ring-4 ring-brand-100"
                      : "border-slate-200 opacity-80 hover:border-brand-200 hover:opacity-100"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.title} view ${index + 1}`}
                    className="aspect-square w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="py-2 lg:py-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600 sm:text-sm">
            {product.category}
          </p>

          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            {product.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            {product.rating != null && (
              <div className="flex items-center gap-2">
                <Stars rating={product.rating} />
                <span className="text-sm font-semibold text-slate-900">
                  {product.rating}
                </span>
                {product.reviews != null && (
                  <span className="text-sm text-slate-500">
                    ({product.reviews} reviews)
                  </span>
                )}
              </div>
            )}

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                outOfStock
                  ? "bg-red-50 text-red-600"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  outOfStock ? "bg-red-500" : "bg-emerald-500"
                }`}
              />
              {outOfStock ? "Out of stock" : "In stock"}
            </span>
          </div>

          {/* Price card */}
          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <div className="flex flex-wrap items-end gap-3">
              <span className="text-3xl font-bold text-slate-900 sm:text-4xl">
                {formatPrice(product.price)}
              </span>

              {hasDiscount && (
                <>
                  <span className="pb-1 text-lg text-slate-400 line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                  <span className="mb-1 rounded-lg bg-red-50 px-2.5 py-1 text-sm font-semibold text-red-600">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            {hasDiscount && (
              <p className="mt-2 text-sm text-emerald-700">
                You save {formatPrice(product.oldPrice - product.price)} on this
                item
              </p>
            )}

            {lowStock && (
              <p className="mt-2 text-sm font-medium text-amber-600">
                Hurry! Only {stock} left in stock
              </p>
            )}
            {!outOfStock && !lowStock && stock !== null && (
              <p className="mt-2 text-sm text-slate-500">
                {stock} items available
              </p>
            )}
          </div>

          {/* Quantity and cart */}
          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold text-slate-900">
              Quantity
            </p>
            <div className="flex gap-3">
              <div className="flex h-13 shrink-0 items-center rounded-xl border border-slate-200 bg-white">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() =>
                    setQuantity((current) => Math.max(1, current - 1))
                  }
                  aria-label="Decrease quantity"
                  className="grid size-11 cursor-pointer place-items-center text-slate-600 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Minus size={17} />
                </button>

                <span
                  className="min-w-8 text-center font-semibold text-slate-900"
                  aria-live="polite"
                >
                  {quantity}
                </span>

                <button
                  type="button"
                  disabled={stock !== null && quantity >= stock}
                  onClick={() =>
                    setQuantity((current) =>
                      stock === null
                        ? current + 1
                        : Math.min(stock, current + 1)
                    )
                  }
                  aria-label="Increase quantity"
                  className="grid size-11 cursor-pointer place-items-center text-slate-600 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Plus size={17} />
                </button>
              </div>

              <button
                type="button"
                disabled={outOfStock}
                onClick={handleAddToCart}
                className={`flex min-h-13 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 font-semibold text-white shadow-sm transition focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-300 ${
                  added
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-brand-500 hover:bg-brand-600"
                }`}
              >
                {added ? <Check size={19} /> : <ShoppingBag size={19} />}
                {cartLabel}
              </button>
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Total:{" "}
              <span className="font-semibold text-slate-900">
                {formatPrice(product.price * quantity)}
              </span>
            </p>
          </div>

          {/* Trust */}
          <div className="mt-6 grid gap-4 rounded-2xl border border-slate-100 p-4 sm:grid-cols-3">
            {[
              {
                icon: Truck,
                title: "Fast Delivery",
                text: "Details at checkout",
              },
              {
                icon: RotateCcw,
                title: "Easy Returns",
                text: "Hassle-free policy",
              },
              {
                icon: ShieldCheck,
                title: "Secure Shopping",
                text: `Shop safely at ${STORE_NAME}`,
              },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon size={19} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">{text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          {tabs.length > 0 && (
            <section className="mt-8">
              <div
                role="tablist"
                className="flex gap-6 overflow-x-auto border-b border-slate-200"
              >
                {tabs.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={currentTab === item.id}
                    onClick={() => setTab(item.id)}
                    className={`-mb-px whitespace-nowrap border-b-2 pb-3 text-sm font-semibold transition cursor-pointer ${
                      currentTab === item.id
                        ? "border-brand-500 text-brand-600"
                        : "border-transparent text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div role="tabpanel" className="pt-5">
                {currentTab === "description" && (
                  <p className="text-sm leading-7 text-slate-600 sm:text-base">
                    {description}
                  </p>
                )}

                {currentTab === "features" && hasFeatures && (
                  <ul className="space-y-3">
                    {product.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm leading-6 text-slate-600"
                      >
                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                          <Check size={13} />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}

                {currentTab === "specs" && hasSpecs && (
                  <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100">
                    {product.specifications.map((spec, index) => (
                      <div
                        key={spec.label}
                        className={`flex justify-between gap-4 px-4 py-3 text-sm ${
                          index % 2 === 0 ? "bg-slate-50" : "bg-white"
                        }`}
                      >
                        <span className="text-slate-500">{spec.label}</span>
                        <span className="text-right font-medium text-slate-900">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </section>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="bg-slate-50">
          <div className="mx-auto max-w-8xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">
                  More from {STORE_NAME}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                  You may also like
                </h2>
              </div>

              <Link
                to="/shop"
                className="hidden shrink-0 text-sm font-semibold text-brand-600 hover:text-brand-700 sm:block"
              >
                View all products
              </Link>
            </div>

            <div className="mt-7 grid grid-cols-1 min-[340px]:grid-cols-2 min-[540px]:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mobile sticky buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-8xl items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs text-slate-500">{product.title}</p>
            <p className="text-lg font-bold text-slate-900">
              {formatPrice(product.price)}
            </p>
          </div>

          <button
            type="button"
            disabled={outOfStock}
            onClick={handleAddToCart}
            className={`ml-auto flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300 ${
              added
                ? "bg-emerald-500"
                : "bg-brand-500 hover:bg-brand-600"
            }`}
          >
            {added ? <Check size={18} /> : <ShoppingBag size={18} />}
            {cartLabel}
          </button>
        </div>
      </div>
    </main>
  );
}