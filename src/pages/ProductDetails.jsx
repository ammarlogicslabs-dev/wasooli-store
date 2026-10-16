import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  Zap,
} from "lucide-react";
import { products, formatPrice } from "../data/product";
import ProductCard from "../components/ProductCard";
import StoreHeader from "../components/StoreHeader";
import { useCart } from "../cart/CartContext";

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
  const navigate = useNavigate();
  const { addItem, isWished, toggleWishlist } = useCart();
  const addedTimer = useRef(null);

  const product = products.find((item) => item.slug === slug);

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [tab, setTab] = useState("overview");
  const [openPolicy, setOpenPolicy] = useState("shipping");
  const wished = product ? isWished(product.id) : false;

  // Reset page state when navigating between products
  useEffect(() => {
    setQuantity(1);
    setActiveImage(0);
    setAdded(false);
    setTab("overview");
    setOpenPolicy("shipping");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  useEffect(() => {
    return () => {
      if (addedTimer.current) {
        window.clearTimeout(addedTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    document.title = product
      ? `${product.title} | ${STORE_NAME}`
      : `Product not found | ${STORE_NAME}`;
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StoreHeader />
        <main className="grid min-h-[70vh] place-items-center px-4">
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
      </div>
    );
  }

  const images = [
    ...new Set([product.image, ...(product.images ?? [])].filter(Boolean)),
  ];

  const stock = Number.isFinite(product.stock) ? product.stock : null;
  const outOfStock = stock !== null && stock === 0 || stock === null;
  const lowStock = stock !== null && stock <= 5;

  const hasDiscount = product.oldPrice > product.price;
  const discount = hasDiscount
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const description = product.description || product.shortDescription;
  const hasFeatures = product.features?.length > 0;
  const hasSpecs = product.specifications?.length > 0;

  const detailTabs = [
    { id: "overview", label: "Overview" },
    { id: "reviews", label: "Reviews" },
  ];

  const relatedProducts = products.filter((item) => item.id !== product.id && item.category === product.category).slice(0, 4);

  function handleAddToCart() {
    if (outOfStock) return;

    addItem(product, quantity);
    setAdded(true);
    if (addedTimer.current) {
      window.clearTimeout(addedTimer.current);
    }
    addedTimer.current = window.setTimeout(() => setAdded(false), 1800);
  }

  function handleBuyNow() {
    if (outOfStock) return;

    navigate("/checkout", {
      state: {
        buyNow: {
          product: {
            id: product.id,
            slug: product.slug,
            title: product.title,
            image: product.image,
            price: product.price,
            stock: product.stock,
          },
          quantity,
        },
      },
    });
  }

  const cartLabel = outOfStock ? "Out of Stock" : added ? "Added to Cart!" : "Add to Cart";

  return (
    <main className="min-h-screen bg-white pb-24 lg:pb-0">
      <StoreHeader />
      {/* Breadcrumb */}
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto flex max-w-8xl flex-wrap items-center gap-1.5 px-4 py-3 text-xs text-slate-500 sm:px-6 sm:text-sm lg:px-8">
          <Link to="/shop" className="hover:text-brand-600">
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
        <div className="lg:top-24 lg:self-start">
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
              onClick={() => toggleWishlist(product.id)}
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

            <div className="aspect-4/4.5 w-full overflow-hidden sm:aspect-square">
              <div
                className="flex h-full transition-transform duration-300 ease-out motion-reduce:transition-none"
                style={{ transform: `translateX(-${activeImage * 100}%)` }}
              >
                {images.map((image, index) => (
                  <div key={image} className="h-full w-full shrink-0 overflow-hidden">
                    <img
                      src={image}
                      alt={index === 0 ? product.title : `${product.title} view ${index + 1}`}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                  </div>
                ))}
              </div>
            </div>
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
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="flex h-13 w-fit shrink-0 items-center rounded-3xl border border-slate-200 bg-white">
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

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={outOfStock}
                  onClick={handleAddToCart}
                  className={`inline-flex h-13 flex-1 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-3xl px-5 font-semibold text-white shadow-sm transition focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-300 sm:flex-none sm:px-6 ${
                    added
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : "bg-brand-500 hover:bg-brand-600"
                  }`}
                >
                  {added ? <Check size={19} /> : <ShoppingBag size={19} />}
                  {cartLabel}
                </button>

                <button
                  type="button"
                  disabled={outOfStock}
                  onClick={handleBuyNow}
                  className="inline-flex h-13 flex-1 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-3xl border border-slate-900 bg-white px-5 font-semibold text-slate-900 shadow-sm transition hover:bg-slate-900 hover:text-white focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 sm:flex-none sm:px-6"
                >
                  <Zap size={19} />
                  Buy it now
                </button>
              </div>
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
                text: "Ships in 1-2 working days",
              },
              {
                icon: RotateCcw,
                title: "Exchanges",
                text: "Sealed items within 2 days",
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

          <div className="mt-6 border-t border-slate-200">
            {[
              {
                id: "shipping",
                title: "Shipping and Returns",
                body: "We offer fast and reliable shipping on every order. Orders are packed within 1-2 working days. Standard delivery usually arrives in 3-5 working days, and express delivery in 1-2 working days. You choose the option at checkout.",
              },
              {
                id: "returns",
                title: "Return and Exchange Policy",
                body: "Wasooli Store does not accept returns. An exchange is available only when the item is unused and still in its original sealed packaging, and the request is made within 2 days of delivery. Opened or used items cannot be exchanged. Pre-order and back-order items cannot be exchanged or returned.",
              },
            ].map((item) => {
              const open = openPolicy === item.id;
              return (
                <div key={item.id} className="border-b border-slate-200">
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() =>
                      setOpenPolicy((current) =>
                        current === item.id ? "" : item.id
                      )
                    }
                    className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left"
                  >
                    <span className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </span>
                    {open ? (
                      <Minus size={16} className="shrink-0 text-slate-700" />
                    ) : (
                      <Plus size={16} className="shrink-0 text-slate-700" />
                    )}
                  </button>
                  {open && (
                    <p className="pb-4 text-sm leading-7 text-slate-600">
                      {item.body}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      <section className="mx-auto max-w-8xl px-4 pb-14 sm:px-6 lg:px-8">
        <div
          role="tablist"
          className="flex gap-6 overflow-x-auto overflow-y-hidden border-b border-slate-200 scrollbar-none"
        >
          {detailTabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`-mb-px cursor-pointer whitespace-nowrap border-b-2 pb-3 text-sm font-semibold transition ${
                tab === item.id
                  ? "border-brand-500 text-brand-600"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div role="tabpanel" className="pt-6">
          {tab === "overview" && (
            <div className="space-y-8">
              {description && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Description
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                    {description}
                  </p>
                </div>
              )}

              {hasFeatures && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Features</h2>
                  <ul className="mt-3 space-y-3">
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
                </div>
              )}

              {hasSpecs && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Specifications
                  </h2>
                  <div className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100">
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
                </div>
              )}
            </div>
          )}

          {tab === "reviews" && (
            <div>
              <div className="flex items-center gap-4">
                <p className="text-4xl font-bold text-slate-900">
                  {product.rating ?? "—"}
                </p>
                <div>
                  <Stars rating={product.rating} />
                  <p className="mt-1 text-sm text-slate-500">
                    {product.reviews != null
                      ? `${product.reviews} ratings from Wasooli Store shoppers`
                      : "No ratings yet"}
                  </p>
                </div>
              </div>

              <ul className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-100">
                {[
                  "The cable matches the listing and the connection has stayed stable.",
                  "It arrived sealed and was simple to connect to the router.",
                  "Solid build for the price. I would order another length from Wasooli Store.",
                ].map((note) => (
                  <li key={note} className="px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Stars rating={product.rating} />
                      <span className="text-xs font-semibold text-slate-500">
                        Verified buyer
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {note}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
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
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500">{product.title}</p>
            <p className="text-lg font-bold leading-none text-slate-900">
              {formatPrice(product.price)}
            </p>
          </div>

          <button
            type="button"
            disabled={outOfStock}
            onClick={handleAddToCart}
            className={`inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300 ${
              added
                ? "bg-emerald-500"
                : "bg-brand-500 hover:bg-brand-600"
            }`}
          >
            {added ? <Check size={18} /> : <ShoppingBag size={18} />}
            {cartLabel}
          </button>
          <button
            type="button"
            disabled={outOfStock}
            onClick={handleBuyNow}
            className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-900 bg-white px-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
          >
            <Zap size={18} />
            Buy it now
          </button>
        </div>
      </div>
    </main>
  );
}