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
      ) : null}

      <div className="relative mx-auto max-w-8xl px-4 py-8 sm:px-6 sm:py-9 lg:px-8 2xl:max-w-[1536px]">
        <div className="mb-5 min-w-0">
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

        <div className="group/rail relative">
          <button
            type="button"
            aria-label={`Previous ${title}`}
            onClick={() => swiper?.slidePrev()}
            className={`absolute left-0 top-1/2 z-20 grid size-11 -translate-x-1 -translate-y-1/2 place-items-center rounded-full border shadow-lg backdrop-blur-md transition duration-300 focus:outline-none focus-visible:opacity-100 focus-visible:ring-4 focus-visible:ring-brand-100 md:-translate-x-1/2 ${
              dark
                ? "border-white/20 bg-slate-950/80 text-white hover:border-brand-400 hover:bg-brand-500"
                : "border-slate-200 bg-white/95 text-slate-700 hover:border-brand-400 hover:text-brand-600"
            } opacity-100 md:pointer-events-none md:opacity-0 md:group-hover/rail:pointer-events-auto md:group-hover/rail:opacity-100 md:group-focus-within/rail:pointer-events-auto md:group-focus-within/rail:opacity-100`}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            aria-label={`Next ${title}`}
            onClick={() => swiper?.slideNext()}
            className={`absolute right-0 top-1/2 z-20 grid size-11 translate-x-1 -translate-y-1/2 place-items-center rounded-full border shadow-lg backdrop-blur-md transition duration-300 focus:outline-none focus-visible:opacity-100 focus-visible:ring-4 focus-visible:ring-brand-100 md:translate-x-1/2 ${
              dark
                ? "border-white/20 bg-slate-950/80 text-white hover:border-brand-400 hover:bg-brand-500"
                : "border-slate-200 bg-white/95 text-slate-700 hover:border-brand-400 hover:text-brand-600"
            } opacity-100 md:pointer-events-none md:opacity-0 md:group-hover/rail:pointer-events-auto md:group-hover/rail:opacity-100 md:group-focus-within/rail:pointer-events-auto md:group-focus-within/rail:opacity-100`}
          >
            <ChevronRight size={20} />
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
            return (
              <SwiperSlide key={product.id}>
                <Link
                  to={`/products/${product.slug}`}
                  viewTransition
                  className={`group block overflow-hidden rounded-3xl border transition focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 ${
                    dark
                      ? "border-white/10 bg-white/5 hover:border-brand-400/40 hover:bg-white/10 hover:shadow-[0_24px_50px_-28px_rgba(44,154,255,0.55)]"
                      : "border-slate-200 bg-slate-50/80 hover:border-brand-300 hover:shadow-[0_24px_50px_-28px_rgba(44,154,255,0.45)]"
                  }`}
                >
                  <span className="relative block aspect-[4/3] overflow-hidden bg-white">
                    <img
                      src={resolveMediaUrl(product.image)}
                      alt={product.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-70" />
                    {hasDiscount ? (
                      <span className="absolute left-2.5 top-2.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
                        Sale
                      </span>
                    ) : null}
                    {outOfStock ? (
                      <span className="absolute inset-x-0 bottom-0 bg-slate-900/75 px-2 py-1.5 text-center text-[10px] font-semibold text-white">
                        Out of stock
                      </span>
                    ) : null}
                  </span>
                  <span className="block px-3.5 py-3">
                    <span
                      className={`line-clamp-2 min-h-[2.4rem] text-sm font-semibold ${
                        dark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {product.title}
                    </span>
                    <span className="mt-2 flex items-baseline gap-2">
                      <span
                        className={`text-base font-bold ${
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
