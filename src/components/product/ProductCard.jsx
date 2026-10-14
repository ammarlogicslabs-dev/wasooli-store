
import { Link } from "react-router-dom";
import { ShoppingBag, Star } from "lucide-react";
import { formatPrice } from "../../data/product";

export default function ProductCard({ product }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl">
      <Link
        to={`/products/${product.slug}`}
        className="relative block cursor-pointer overflow-hidden bg-slate-50"
      >
        {product.badge && (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-brand-500 px-2.5 py-0.5 text-[11px] font-semibold text-white">
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

      <div className="p-3 sm:p-3.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">
          {product.category}
        </p>

        <Link to={`/products/${product.slug}`}>
          <h2 className="mt-1  cursor-pointer text-sm font-semibold text-slate-900 transition hover:text-brand-600">
            {product.title}
          </h2>
        </Link>

        <div className="mt-1 flex items-center gap-1 text-xs">
          <Star
            size={13}
            fill="currentColor"
            className="text-amber-400"
          />
          <span className="font-medium text-slate-600">{product.rating}</span>
          <span className="text-slate-400">
            ({product.reviews})
          </span>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="font-bold text-slate-900">
              {formatPrice(product.price)}
            </p>

            {product.oldPrice > product.price && (
              <p className="text-[11px] text-slate-400 line-through">
                {formatPrice(product.oldPrice)}
              </p>
            )}
          </div>

          <Link
            to={`/products/${product.slug}`}
            aria-label={`View ${product.title}`}
            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-xl bg-brand-50 text-brand-600 transition hover:bg-brand-500 hover:text-white"
          >
            <ShoppingBag size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}
