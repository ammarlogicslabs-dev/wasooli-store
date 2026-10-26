import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Bot, Heart, ShoppingBag, Star } from "lucide-react";
import { formatPrice, getProductCondition } from "../data/product";
import { useCart } from "../cart/CartContext";
import { resolveMediaUrl } from "../utils/mediaUrl";
import ProductBotModal from "./ProductBotModal";

export default function ProductCard({ product, index = 0, layout = "grid" }) {
  const { addItem, openCart, isWished, toggleWishlist } = useCart();
  const reduceMotion = useReducedMotion();
  const [botOpen, setBotOpen] = useState(false);
  const outOfStock = Number.isFinite(product.stock) && product.stock <= 0;
  const wished = isWished?.(product.id);
  const primary = resolveMediaUrl(product.image);
  const secondaryRaw = (product.images || []).find(
    (src) => src && src !== product.image
  );
  const secondary = secondaryRaw ? resolveMediaUrl(secondaryRaw) : null;
  const hasDiscount = product.oldPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;
  const isList = layout === "list";
  const isUsed = getProductCondition(product) === "Used Product";

  function handleAddToCart(event) {
    event.preventDefault();
    event.stopPropagation();
    if (outOfStock) return;
    addItem(product, 1);
    openCart();
  }

  function handleWishlist(event) {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist?.(product.id);
  }

  function handleBot(event) {
    event.preventDefault();
    event.stopPropagation();
    setBotOpen(true);
  }

  return (
    <>
      <motion.article
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                duration: 0.45,
                delay: Math.min(index * 0.045, 0.32),
                ease: [0.22, 1, 0.36, 1],
              }
        }
        className={`group relative overflow-hidden border border-slate-200/80 bg-white shadow-[0_8px_30px_-18px_rgba(15,23,42,0.35)] transition duration-300 hover:border-brand-300 hover:shadow-[0_28px_55px_-28px_rgba(44,154,255,0.55)] ${
          isList
            ? "flex flex-row rounded-2xl"
            : "flex h-full flex-col rounded-[1.35rem]"
        }`}
      >
        <Link
          to={`/products/${product.slug}`}
          viewTransition
          className={`relative block shrink-0 cursor-pointer overflow-hidden bg-gradient-to-b from-slate-100 to-slate-50 ${
            isList ? "w-[118px] sm:w-[148px] md:w-[168px]" : ""
          }`}
        >
          {product.badge ? (
            <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-slate-950 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md">
              {product.badge}
            </span>
          ) : isUsed ? (
            <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-amber-500/95 backdrop-blur-xs px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md">
              Used
            </span>
          ) : null}
          {hasDiscount ? (
            <span className="absolute right-2.5 top-2.5 z-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
              −{discountPct}%
            </span>
          ) : null}
          {outOfStock ? (
            <span className="absolute bottom-3 left-2.5 z-10 rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
              Out of stock
            </span>
          ) : null}

          <button
            type="button"
            onClick={handleWishlist}
            aria-label={
              wished
                ? `Remove ${product.title} from wishlist`
                : `Save ${product.title} to wishlist`
            }
            aria-pressed={Boolean(wished)}
            className={`absolute z-10 grid place-items-center rounded-full border shadow-md backdrop-blur-md transition focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 ${
              isList ? "right-2 top-2 size-8" : "right-2.5 bottom-2.5 size-9"
            } ${
              wished
                ? "border-red-200 bg-white text-red-500"
                : "border-white/80 bg-white/90 text-slate-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:text-red-500"
            }`}
          >
            <Heart size={isList ? 13 : 15} fill={wished ? "currentColor" : "none"} />
          </button>

          <img
            src={primary}
            alt={product.title}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/products/gigabit-switch.jpg";
            }}
            className={`w-full object-cover transition duration-700 ease-out group-hover:scale-110 ${
              isList ? "aspect-square h-full" : "aspect-square"
            } ${secondary ? "opacity-100 group-hover:opacity-0" : ""}`}
          />
          {secondary ? (
            <img
              src={secondary}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="absolute inset-0 aspect-square h-full w-full object-cover opacity-0 transition duration-700 ease-out group-hover:scale-110 group-hover:opacity-100"
            />
          ) : null}
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950/25 to-transparent opacity-0 transition group-hover:opacity-100" />
        </Link>

        <div
          className={`flex min-w-0 flex-1 flex-col ${
            isList ? "justify-center p-3 sm:p-4" : "p-3 sm:p-3.5"
          }`}
        >
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-brand-600">
            {product.category}
          </p>

          <Link
            to={`/products/${product.slug}`}
            viewTransition
            className="rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-100"
          >
            <h2
              className={`mt-1 font-semibold leading-snug text-slate-900 transition group-hover:text-brand-700 ${
                isList
                  ? "line-clamp-2 text-sm sm:text-[15px]"
                  : "line-clamp-2 min-h-[2.4rem] text-[13px] sm:text-sm"
              }`}
            >
              {product.title}
            </h2>
          </Link>

          {isList && product.brand ? (
            <p className="mt-1 truncate text-xs text-slate-500">{product.brand}</p>
          ) : null}

          {product.rating != null ? (
            <div className="mt-2 flex h-4 items-center gap-1 text-[11px] leading-4">
              <Star size={12} fill="currentColor" className="shrink-0 text-amber-400" />
              <span className="font-semibold text-slate-700">{product.rating}</span>
              {product.reviews != null ? (
                <span className="text-slate-400">({product.reviews})</span>
              ) : null}
            </div>
          ) : (
            <div className="mt-2 h-4" />
          )}

          <div
            className={`flex items-end justify-between gap-2 ${
              isList ? "mt-3 pt-0" : "mt-auto pt-3"
            }`}
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight text-slate-900 sm:text-[15px]">
                {formatPrice(product.price)}
              </p>
              <p className="h-4 truncate text-[11px] leading-4 text-slate-400 line-through">
                {hasDiscount ? formatPrice(product.oldPrice) : "\u00A0"}
              </p>
            </div>

            <div className="mb-0.5 flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleBot}
                title={`Ask Bot for ${product.title} Instructions`}
                aria-label={`Ask bot about ${product.title}`}
                className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-brand-300 hover:bg-brand-600 hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
              >
                <Bot size={15} />
              </button>

              <button
                type="button"
                disabled={outOfStock}
                onClick={handleAddToCart}
                aria-label={`Add ${product.title} to cart`}
                className={`shrink-0 cursor-pointer place-items-center rounded-xl bg-brand-500 text-white shadow-[0_10px_24px_-12px_rgba(44,154,255,0.9)] transition hover:bg-brand-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none ${
                  isList
                    ? "hidden h-9 px-3 text-xs font-semibold sm:inline-flex sm:items-center sm:gap-1.5"
                    : "grid size-9"
                }`}
              >
                {isList ? (
                  <>
                    <ShoppingBag size={14} />
                    Add
                  </>
                ) : (
                  <ShoppingBag size={15} />
                )}
              </button>
              {isList ? (
                <button
                  type="button"
                  disabled={outOfStock}
                  onClick={handleAddToCart}
                  aria-label={`Add ${product.title} to cart`}
                  className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-xl bg-brand-500 text-white shadow-[0_10px_24px_-12px_rgba(44,154,255,0.9)] transition hover:bg-brand-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none sm:hidden"
                >
                  <ShoppingBag size={15} />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </motion.article>

      <ProductBotModal
        product={product}
        isOpen={botOpen}
        onClose={() => setBotOpen(false)}
      />
    </>
  );
}
