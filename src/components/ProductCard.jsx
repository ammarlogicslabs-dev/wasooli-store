
import { Link } from "react-router-dom";
import { ShoppingBag, Star } from "lucide-react";
import { formatPrice } from "../data/product";
import { useCart } from "../cart/CartContext";

export default function ProductCard({ product }) {
  const { addItem, openCart } = useCart();
  const outOfStock = Number.isFinite(product.stock) && product.stock <= 0;

  function handleAddToCart() {
    if (outOfStock) return;
    addItem(product, 1);
    openCart();
  }
  return (
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
          src={product.image}
          alt={product.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/products/cat6-cable.jpg";
          }}
          className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col justify-between p-2.5 min-[400px]:p-3 sm:p-3.5">
        <div>
          <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-brand-600 sm:text-[11px]">
            {product.category}
          </p>

          <Link to={`/products/${product.slug}`}>
            <h2 className="mt-1 line-clamp-2 text-xs font-semibold leading-snug text-slate-900 transition hover:text-brand-600 sm:text-sm">
              {product.title}
            </h2>
          </Link>

          <div className="mt-1 flex items-center gap-1 text-[11px] sm:text-xs">
            <Star
              size={12}
              fill="currentColor"
              className="shrink-0 text-amber-400 sm:size-[13px]"
            />
            <span className="font-medium text-slate-600">{product.rating}</span>
            <span className="text-slate-400">
              ({product.reviews})
            </span>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-1.5 pt-1">
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-slate-900 min-[400px]:text-sm sm:text-base">
              {formatPrice(product.price)}
            </p>

            {product.oldPrice > product.price && (
              <p className="truncate text-[10px] text-slate-400 line-through sm:text-[11px]">
                {formatPrice(product.oldPrice)}
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={outOfStock}
            onClick={handleAddToCart}
            aria-label={`Add ${product.title} to cart`}
            className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-xl bg-brand-50 text-brand-600 transition hover:bg-brand-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 min-[400px]:size-9"
          >
            <ShoppingBag size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
