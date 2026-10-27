import { useState } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, Keyboard } from "swiper/modules";
import "swiper/css";
import { formatPrice } from "../data/product";
import { resolveMediaUrl } from "../utils/mediaUrl";

export default function ShopProductRail({
  title,
  subtitle,
  products = [],
  tone = "light",
  autoplay = false,
}) {
  const [swiper, setSwiper] = useState(null);
  const reduceMotion = useReducedMotion();
  const dark = tone === "dark";
  const enableAutoplay = autoplay && !reduceMotion && products.length > 2;

  if (!products.length) return null;

  return (
    <section
      className={`relative overflow-hidden border-b ${
        dark
          ? "border-slate-800 bg-[#0b1524] text-white"
          : "border-slate-200/80 bg-white"
      }`}
    >
      {dark ? (
        <>
          <div className="pointer-events-none absolute -left-10 top-0 h-48 w-48 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-8 bottom-0 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl" />
        </>
      ) : (
        <div
          className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-brand-50/60 blur-3xl"
          aria-hidden="true"
        />
      )}

      <div className="relative mx-auto max-w-8xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 2xl:max-w-[1536px]">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div className="min-w-0">
            {subtitle ? (
              <p
                className={`text-[11px] font-bold uppercase tracking-[0.2em] ${
                  dark ? "text-brand-300" : "text-brand-600"
                }`}
              >
                {subtitle}
              </p>
            ) : null}
            <h2
              className={`mt-1.5 text-xl font-bold tracking-tight sm:text-2xl ${
                dark ? "text-white" : "text-slate-900"
              }`}
            >
              {title}
            </h2>
          </div>
          <Link
            to="/shop"
            className={`group inline-flex shrink-0 items-center gap-1 text-sm font-semibold transition ${
              dark
                ? "text-brand-300 hover:text-white"
                : "text-brand-600 hover:text-brand-700"
            }`}
          >
            View all
            <ChevronRight
              size={15}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </div>

        <div className="group/rail relative">
          <button
            type="button"
            aria-label={`Previous ${title}`}
            onClick={() => swiper?.slidePrev()}
            className={`absolute left-0 top-1/2 z-20 grid size-10 -translate-x-1 -translate-y-1/2 place-items-center rounded-full border shadow-md transition duration-300 focus:outline-none focus-visible:opacity-100 focus-visible:ring-4 focus-visible:ring-brand-100 md:-translate-x-1/2 ${
              dark
                ? "border-white/20 bg-slate-950/90 text-white hover:border-brand-400 hover:bg-brand-500"
                : "border-slate-200 bg-white text-slate-700 hover:border-brand-500 hover:bg-brand-500 hover:text-white hover:shadow-lg"
            } opacity-100 md:pointer-events-none md:opacity-0 md:group-hover/rail:pointer-events-auto md:group-hover/rail:opacity-100 md:group-focus-within/rail:pointer-events-auto md:group-focus-within/rail:opacity-100`}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label={`Next ${title}`}
            onClick={() => swiper?.slideNext()}
            className={`absolute right-0 top-1/2 z-20 grid size-10 translate-x-1 -translate-y-1/2 place-items-center rounded-full border shadow-md transition duration-300 focus:outline-none focus-visible:opacity-100 focus-visible:ring-4 focus-visible:ring-brand-100 md:translate-x-1/2 ${
              dark
                ? "border-white/20 bg-slate-950/90 text-white hover:border-brand-400 hover:bg-brand-500"
                : "border-slate-200 bg-white text-slate-700 hover:border-brand-500 hover:bg-brand-500 hover:text-white hover:shadow-lg"
            } opacity-100 md:pointer-events-none md:opacity-0 md:group-hover/rail:pointer-events-auto md:group-hover/rail:opacity-100 md:group-focus-within/rail:pointer-events-auto md:group-focus-within/rail:opacity-100`}
          >
            <ChevronRight size={18} />
          </button>

          <Swiper
            modules={[Keyboard, A11y, ...(enableAutoplay ? [Autoplay] : [])]}
            onSwiper={setSwiper}
            keyboard={{ enabled: true }}
            loop={enableAutoplay}
            speed={enableAutoplay ? 900 : 500}
            autoplay={
              enableAutoplay
                ? {
                    delay: 2600,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }
                : false
            }
            spaceBetween={14}
            slidesPerView={1.25}
            breakpoints={{
              480: { slidesPerView: 2.05, spaceBetween: 14 },
              768: { slidesPerView: 3.05, spaceBetween: 16 },
              1024: { slidesPerView: 4.05, spaceBetween: 18 },
              1280: { slidesPerView: 4.5, spaceBetween: 18 },
            }}
            className="!overflow-visible"
          >
            {products.map((product) => {
              const outOfStock = Number.isFinite(product.stock) && product.stock <= 0;
              const hasDiscount = product.oldPrice > product.price;
              const discountPct = hasDiscount
                ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
                : 0;

              return (
                <SwiperSlide key={product.id}>
                  <Link
                    to={`/products/${product.slug}`}
                    viewTransition
                    className={`group flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 ${
                      dark
                        ? "border-white/10 bg-slate-900/80 hover:border-brand-400/50 hover:bg-slate-900 hover:shadow-[0_20px_40px_-20px_rgba(44,154,255,0.45)]"
                        : "border-slate-200/90 bg-white shadow-[0_4px_20px_-10px_rgba(15,23,42,0.06)] hover:border-brand-300 hover:shadow-[0_16px_36px_-16px_rgba(44,154,255,0.3)] hover:-translate-y-1"
                    }`}
                  >
                    <span
                      className={`relative block aspect-square w-full overflow-hidden ${
                        dark
                          ? "bg-slate-800/80 border-b border-white/5"
                          : "bg-slate-100/70 border-b border-slate-100"
                      }`}
                    >
                      <img
                        src={resolveMediaUrl(product.image)}
                        alt={product.title}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/products/gigabit-switch.jpg";
                        }}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                      {hasDiscount ? (
                        <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                          −{discountPct}%
                        </span>
                      ) : null}
                      {outOfStock ? (
                        <span className="absolute inset-x-0 bottom-0 z-10 bg-slate-900/85 py-1 text-center text-[10px] font-semibold text-white backdrop-blur-xs">
                          Out of stock
                        </span>
                      ) : null}
                      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-slate-950/20 to-transparent opacity-0 transition group-hover:opacity-100" />
                    </span>

                    <span className="flex flex-1 flex-col justify-between p-3.5">
                      <div>
                        {product.category ? (
                          <span
                            className={`block truncate text-[10px] font-bold uppercase tracking-[0.14em] ${
                              dark ? "text-brand-300" : "text-brand-600"
                            }`}
                          >
                            {product.category}
                          </span>
                        ) : null}
                        <span
                          className={`mt-1 line-clamp-2 min-h-[2.4rem] text-[13px] font-semibold leading-snug transition ${
                            dark
                              ? "text-white group-hover:text-brand-300"
                              : "text-slate-900 group-hover:text-brand-600"
                          }`}
                        >
                          {product.title}
                        </span>
                      </div>

                      <span className="mt-3 flex items-baseline justify-between gap-2 pt-2 border-t border-slate-100/60 dark:border-white/5">
                        <span className="flex items-baseline gap-2">
                          <span
                            className={`text-sm sm:text-[15px] font-bold tracking-tight ${
                              dark ? "text-brand-300" : "text-slate-900"
                            }`}
                          >
                            {formatPrice(product.price)}
                          </span>
                          {hasDiscount ? (
                            <span
                              className={`text-xs line-through ${
                                dark ? "text-slate-500" : "text-slate-400"
                              }`}
                            >
                              {formatPrice(product.oldPrice)}
                            </span>
                          ) : null}
                        </span>

                        <span
                          className={`text-xs font-semibold ${
                            dark ? "text-brand-400" : "text-brand-600"
                          }`}
                        >
                          View →
                        </span>
                      </span>
                    </span>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
