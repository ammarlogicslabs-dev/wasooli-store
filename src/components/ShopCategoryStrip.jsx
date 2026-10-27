import { motion, useReducedMotion } from "framer-motion";
import { resolveMediaUrl } from "../utils/mediaUrl";

export default function ShopCategoryStrip({ items, active, onSelect }) {
  const reduceMotion = useReducedMotion();

  if (!items?.length) return null;

  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
      <div className="pointer-events-none absolute -right-16 top-0 h-40 w-40 rounded-full bg-brand-100/60 blur-3xl" />
      <div className="relative mx-auto max-w-8xl px-4 py-7 sm:px-6 sm:py-8 lg:px-8 2xl:max-w-[1536px]">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-600">
              Shop by category
            </p>
            <h2 className="mt-1.5 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Find the right gear faster
            </h2>
          </div>
        </div>

        <div className="mt-5 flex gap-3.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item, index) => {
            const selected = active === item.name;
            return (
              <motion.button
                key={item.name}
                type="button"
                onClick={() => onSelect(item.name)}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.4, delay: 0.04 * index, ease: [0.22, 1, 0.36, 1] }
                }
                className={`group relative flex w-[148px] shrink-0 cursor-pointer flex-col overflow-hidden rounded-3xl border text-left transition sm:w-[168px] ${
                  selected
                    ? "border-brand-500 bg-white shadow-[0_18px_40px_-20px_rgba(44,154,255,0.65)] ring-2 ring-brand-200"
                    : "border-slate-200/90 bg-white shadow-[0_10px_30px_-22px_rgba(15,23,42,0.4)] hover:border-brand-300"
                }`}
              >
                <span className="relative aspect-[5/4] overflow-hidden bg-slate-100">
                  {item.image ? (
                    <img
                      src={resolveMediaUrl(item.image)}
                      alt=""
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <span className="grid h-full place-items-center text-sm font-bold text-slate-400">
                      {item.name.slice(0, 1)}
                    </span>
                  )}
                  <span className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                  <span className="absolute bottom-2.5 left-2.5 right-2.5 text-xs font-bold text-white drop-shadow sm:text-sm">
                    {item.name}
                  </span>
                </span>
                <span className="flex items-center justify-between px-3.5 py-2.5">
                  <span className="text-[11px] font-semibold text-slate-500">
                    {item.count} {item.count === 1 ? "item" : "items"}
                  </span>
                  {selected ? (
                    <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      Active
                    </span>
                  ) : null}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
