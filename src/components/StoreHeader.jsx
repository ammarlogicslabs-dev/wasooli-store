import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, ShoppingBag, X } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";
import { formatPrice } from "../data/product";

export default function StoreHeader() {
  const { user, logout } = useAuth();
  const { items, cartCount, removeItem } = useCart();
  const navigate = useNavigate();
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = cartOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-8xl 2xl:max-w-[1536px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/shop" className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full border border-slate-200 bg-white">
              <img
                src="/wasooli.png"
                alt=""
                className="h-full w-full object-cover"
              />
            </span>
            <span className="truncate text-sm font-bold tracking-tight text-slate-900 sm:text-base">
              Wasooli Store
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {user?.name && (
              <span className="hidden max-w-32 truncate text-xs font-medium text-slate-600 sm:inline sm:max-w-none sm:text-sm">
                {user.name}
              </span>
            )}

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Open cart, ${cartCount} items`}
              className="relative grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-700 transition hover:border-brand-500 hover:text-brand-600"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:text-sm"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          cartOpen ? "visible" : "invisible pointer-events-none"
        }`}
        aria-hidden={!cartOpen}
      >
        <div
          onClick={() => setCartOpen(false)}
          className={`absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300 ${
            cartOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute inset-y-0 right-0 flex w-[85vw] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
            cartOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-900">Your cart</h2>
            <button
              type="button"
              onClick={() => setCartOpen(false)}
              aria-label="Close cart"
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {items.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">
                Your cart is empty.
              </p>
            ) : (
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    <Link
                      to={`/products/${item.slug}`}
                      onClick={() => setCartOpen(false)}
                      className="size-16 shrink-0 overflow-hidden rounded-xl bg-slate-50"
                    >
                      <img
                        src={item.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/products/${item.slug}`}
                        onClick={() => setCartOpen(false)}
                        className="line-clamp-2 text-sm font-semibold text-slate-900 hover:text-brand-600"
                      >
                        {item.title}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">
                        Qty {item.quantity} · {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="self-start text-xs font-semibold text-slate-400 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
