
import { useState } from "react";
import { Link } from "react-router-dom";
import { Bot, ShoppingBag, Star } from "lucide-react";
import { formatPrice } from "../data/product";
import { useCart } from "../cart/CartContext";
import { resolveMediaUrl } from "../utils/mediaUrl";
import ProductBotModal from "./ProductBotModal";

export default function ProductCard({ product }) {
  const { addItem, openCart } = useCart();
  const [botOpen, setBotOpen] = useState(false);
  const outOfStock = Number.isFinite(product.stock) && product.stock <= 0;

  function handleAddToCart() {
    if (outOfStock) return;
    addItem(product, 1);
    openCart();
  }
  return (
    <>
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl">
        <Link
          to={`/products/${product.slug}`}
          className="relative block cursor-pointer overflow-hidden bg-slate-50"
        >
          {product.badge && (
            <span className="absolute left-2 top-2 z-10 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-xs sm:left-2.5 sm:top-2.5 sm:px-2.5 sm:text-[11px]">
              {product.badge}
            </span>
          )}

          <img
            src={resolveMediaUrl(product.image)}
            alt={product.title}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/products/cat6-cable.jpg";
            }}
            className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>

        <div className="flex flex-1 flex-col p-2.5">
          <p className="truncate text-[11px] font-semibold uppercase leading-4 tracking-wide text-brand-600">
            {product.category}
          </p>

          <Link to={`/products/${product.slug}`}>
            <h2 className="mt-1 line-clamp-2 h-[28px] text-[13px] font-semibold leading-[14px] text-slate-900 transition hover:text-brand-600">
              {product.title}
            </h2>
          </Link>

          <div className="mt-1 flex h-4 items-center gap-1 text-[11px] leading-4">
            <Star size={11} fill="currentColor" className="shrink-0 text-amber-400" />
            <span className="font-medium text-slate-600">{product.rating}</span>
            <span className="text-slate-400">({product.reviews})</span>
          </div>

          <div className="mt-auto flex items-end justify-between gap-1.5 pt-2">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-bold leading-4 text-slate-900">
                {formatPrice(product.price)}
              </p>
              <p className="h-4 truncate text-[10px] leading-4 text-slate-400 line-through">
                {product.oldPrice > product.price ? formatPrice(product.oldPrice) : "\u00A0"}
              </p>
            </div>

            <div className="mb-0.5 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setBotOpen(true)}
                title={`Ask Bot for ${product.title} Instructions`}
                aria-label={`Ask bot about ${product.title}`}
                className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-lg bg-slate-100 text-slate-700 transition hover:bg-brand-600 hover:text-white"
              >
                <Bot size={14} />
              </button>

              <button
                type="button"
                disabled={outOfStock}
                onClick={handleAddToCart}
                aria-label={`Add ${product.title} to cart`}
                className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-lg bg-brand-50 text-brand-600 transition hover:bg-brand-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ShoppingBag size={14} />
              </button>
            </div>
          </div>
        </div>
      </article>

      <ProductBotModal
        product={product}
        isOpen={botOpen}
        onClose={() => setBotOpen(false)}
      />
    </>
  );
}
