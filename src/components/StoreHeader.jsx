import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, ShoppingBag, Trash2, X } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";
import { formatPrice } from "../data/product";

const STORE_NAME = "Wasooli Store";

function CartItem({ item, onNavigate, onRemove }) {
  const productPath = `/products/${item.slug}`;

  return (
    <li className="flex gap-3">
      <Link
        to={productPath}
        onClick={onNavigate}
        className="size-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50"
      >
        <img src={item.image} alt="" className="h-full w-full object-cover" />
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          to={productPath}
          onClick={onNavigate}
          className="line-clamp-2 text-sm font-semibold text-slate-900 transition hover:text-brand-600"
        >
          {item.title}
        </Link>
        <p className="mt-1 text-xs text-slate-500">
          Qty {item.quantity} &times; {formatPrice(item.price)}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-slate-900">
          {formatPrice(item.price * item.quantity)}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.title} from cart`}
        className="grid size-8 shrink-0 place-items-center self-start rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 size={16} />
      </button>
    </li>
  );
}

export default function StoreHeader() {
  const { user, logout } = useAuth();
  const { items, cartCount, removeItem } = useCart();
  const navigate = useNavigate();
  const [cartOpen, setCartOpen] = useState(false);

  const closeCart = () => setCartOpen(false);

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Lock page scroll and allow Escape to close while the cart is open
  useEffect(() => {
    if (!cartOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setCartOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [cartOpen]);

  function handleLogout() {
    closeCart();
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-8xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/shop" className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full border border-slate-200 bg-white">
              <img
                src="/wasooli.png"
                alt=""
                className="h-full w-full object-cover"
              />
            </span>
            <span className="truncate text-base font-bold tracking-tight text-slate-900">
              {STORE_NAME}
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {user?.name && (
              <span className="hidden max-w-40 truncate text-sm font-medium text-slate-600 sm:inline">
                {user.name}
              </span>
            )}

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Open cart, ${cartCount} ${
                cartCount === 1 ? "item" : "items"
              }`}
              className="relative grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-700 transition hover:border-brand-500 hover:text-brand-600"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-[11px] font-bold leading-none text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Cart drawer */}
      <div
        className={`fixed inset-0 z-50 ${
          cartOpen ? "visible" : "invisible pointer-events-none"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        aria-hidden={!cartOpen}
      >
        <div
          onClick={closeCart}
          className={`absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${
            cartOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <aside
          className={`absolute inset-y-0 right-0 flex w-[85vw] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
            cartOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-900">
              Your cart
              {cartCount > 0 && (
                <span className="ml-2 text-sm font-normal text-slate-500">
                  ({cartCount} {cartCount === 1 ? "item" : "items"})
                </span>
              )}
            </h2>
            <button
              type="button"
              onClick={closeCart}
              aria-label="Close cart"
              className="grid size-9 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <span className="grid size-14 place-items-center rounded-full bg-brand-50 text-brand-600">
                  <ShoppingBag size={24} />
                </span>
                <p className="mt-4 text-base font-semibold text-slate-900">
                  Your cart is empty
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Add some products to see them here.
                </p>
                <Link
                  to="/shop"
                  onClick={closeCart}
                  className="mt-5 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  Browse products
                </Link>
              </div>
            ) : (
              <ul className="space-y-5">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onNavigate={closeCart}
                    onRemove={removeItem}
                  />
                ))}
              </ul>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-slate-200 px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Subtotal</span>
                <span className="text-base font-bold text-slate-900">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Delivery details are shown at checkout.
              </p>
              <Link
                to="/shop"
                onClick={closeCart}
                className="mt-4 flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-600"
              >
                Continue shopping
              </Link>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}