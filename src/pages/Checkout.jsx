import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Banknote,
  Building2,
  Check,
  ChevronRight,
  Copy,
  MapPin,
  Phone,
  ShoppingBag,
  Truck,
} from "lucide-react";
import StoreHeader from "../components/StoreHeader";
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";
import { formatPrice } from "../data/product";

const ADDRESS_KEY = "wasooli_address";
const ORDERS_KEY = "wasooli_orders";

const PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Azad Jammu & Kashmir",
  "Gilgit-Baltistan",
];

const CITIES = {
  Punjab: ["Lahore", "Faisalabad", "Rawalpindi", "Multan", "Gujranwala", "Sialkot"],
  Sindh: ["Karachi", "Hyderabad", "Sukkur"],
  "Khyber Pakhtunkhwa": ["Peshawar", "Mardan", "Abbottabad"],
  Balochistan: ["Quetta", "Gwadar"],
  "Islamabad Capital Territory": ["Islamabad"],
  "Azad Jammu & Kashmir": ["Muzaffarabad", "Mirpur"],
  "Gilgit-Baltistan": ["Gilgit", "Skardu"],
};

const BANK_ACCOUNT = {
  bank: "Meezan Bank",
  title: "Wasooli Store",
  accountNumber: "0123-4567890-01",
  iban: "PK00MEZN0001234567890101",
};

const PAYMENT_OPTIONS = [
  {
    id: "cod",
    title: "Cash on delivery",
    text: "Pay the rider in cash when the order arrives.",
  },
  {
    id: "bank",
    title: "Bank transfer",
    text: "Transfer the total, then enter the transaction reference.",
  },
];

const DELIVERY_OPTIONS = [
  {
    id: "standard",
    title: "Standard delivery",
    text: "3–5 working days",
    fee: 200,
  },
  {
    id: "express",
    title: "Express delivery",
    text: "1–2 working days",
    fee: 300,
  },
];

const EMPTY_FORM = {
  fullName: "",
  phone: "",
  province: "",
  city: "",
  address: "",
  landmark: "",
  instructions: "",
  delivery: "standard",
  payment: "cod",
  transactionRef: "",
};

function readSavedAddress() {
  try {
    const saved = localStorage.getItem(ADDRESS_KEY);
    return saved ? { ...EMPTY_FORM, ...JSON.parse(saved) } : null;
  } catch {
    return null;
  }
}

function isValidPhone(value) {
  const digits = value.replace(/\D/g, "");
  return (
    (digits.length === 11 && digits.startsWith("03")) ||
    (digits.length === 12 && digits.startsWith("923"))
  );
}

function validate(form) {
  const errors = {};
  if (form.fullName.trim().length < 3) {
    errors.fullName = "Enter the recipient's full name.";
  }
  if (!form.phone.trim()) {
    errors.phone = "Enter a mobile number.";
  } else if (!isValidPhone(form.phone)) {
    errors.phone = "Use a Pakistani number, like 03001234567.";
  }
  if (!form.province) {
    errors.province = "Select a province.";
  }
  if (form.city.trim().length < 2) {
    errors.city = "Enter the city.";
  }
  if (form.address.trim().length < 8) {
    errors.address = "Enter the complete street address.";
  }
  if (form.payment === "bank" && form.transactionRef.trim().length < 4) {
    errors.transactionRef = "Enter the bank transaction reference.";
  }
  return errors;
}

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p
      id={id}
      className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600"
    >
      <AlertCircle size={14} />
      {message}
    </p>
  );
}

export default function Checkout() {
  const { user } = useAuth();
  const { items, clearCart } = useCart();
  const [form, setForm] = useState(() => {
    const saved = readSavedAddress();
    return {
      ...EMPTY_FORM,
      fullName: user?.name || "",
      ...saved,
    };
  });
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [order, setOrder] = useState(null);
  const [copiedField, setCopiedField] = useState("");

  useEffect(() => {
    document.title = order
      ? "Order placed | Wasooli Store"
      : "Checkout | Wasooli Store";
  }, [order]);

  const errors = validate(form);
  const showError = (name) =>
    (touched[name] || submitAttempted) && errors[name];

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const deliveryOption =
    DELIVERY_OPTIONS.find((option) => option.id === form.delivery) ||
    DELIVERY_OPTIONS[0];
  const deliveryFee = items.length ? deliveryOption.fee : 0;
  const total = subtotal + deliveryFee;
  const citySuggestions = CITIES[form.province] || [];
  const paymentOption =
    PAYMENT_OPTIONS.find((option) => option.id === form.payment) ||
    PAYMENT_OPTIONS[0];

  async function copyBankDetail(field, value) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      window.setTimeout(() => setCopiedField(""), 1500);
    } catch {
      setCopiedField("");
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === "province" && value !== current.province) {
        next.city = "";
      }
      return next;
    });
  }

  function handleBlur(event) {
    const { name } = event.target;
    setTouched((current) => ({ ...current, [name]: true }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitAttempted(true);
    if (Object.keys(errors).length > 0 || items.length === 0 || placing) {
      const firstInvalid = Object.keys(errors)[0];
      if (firstInvalid) {
        document.getElementById(firstInvalid)?.focus();
      }
      return;
    }

    setPlacing(true);
    const placed = {
      id: `WS-${Date.now().toString().slice(-8)}`,
      items,
      delivery: {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        province: form.province,
        city: form.city.trim(),
        address: form.address.trim(),
        landmark: form.landmark.trim(),
        instructions: form.instructions.trim(),
        method: deliveryOption,
      },
      subtotal,
      deliveryFee,
      total,
      payment: {
        method: form.payment,
        label: paymentOption.title,
        reference: form.payment === "bank" ? form.transactionRef.trim() : "",
      },
      createdAt: new Date().toISOString(),
    };

    const addressToSave = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      province: form.province,
      city: form.city.trim(),
      address: form.address.trim(),
      landmark: form.landmark.trim(),
      instructions: form.instructions.trim(),
      delivery: form.delivery,
    };
    localStorage.setItem(ADDRESS_KEY, JSON.stringify(addressToSave));

    const previous = (() => {
      try {
        return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
      } catch {
        return [];
      }
    })();
    localStorage.setItem(ORDERS_KEY, JSON.stringify([placed, ...previous]));

    setOrder(placed);
    clearCart();
    setPlacing(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const inputClass = (name) =>
    `w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
      showError(name)
        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
        : "border-slate-200 focus:border-brand-500 focus:ring-brand-100"
    }`;

  if (order) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StoreHeader />
        <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm sm:px-10">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <Check size={30} />
            </span>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
              Order placed
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Thank you, {order.delivery.fullName.split(" ")[0]}.
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Order <span className="font-semibold text-slate-900">{order.id}</span>{" "}
              is confirmed.{" "}
              {order.payment.method === "bank"
                ? `Bank transfer reference ${order.payment.reference} is saved. The order ships after the payment is confirmed.`
                : `Pay ${formatPrice(order.total)} in cash when it arrives.`}
            </p>

            <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                Delivering to
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {order.delivery.fullName}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {order.delivery.address}
                {order.delivery.landmark ? `, ${order.delivery.landmark}` : ""}
                <br />
                {order.delivery.city}, {order.delivery.province}
                <br />
                {order.delivery.phone}
              </p>
              <p className="mt-3 text-sm text-slate-600">
                {order.delivery.method.title} · {order.delivery.method.text}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                Payment: {order.payment.label}
              </p>
            </div>

            <Link
              to="/shop"
              className="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-brand-500 px-6 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              Continue shopping
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StoreHeader />
        <main className="grid min-h-[70vh] place-items-center px-4">
          <div className="text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <ShoppingBag size={28} />
            </span>
            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              Your cart is empty
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Add a product before entering delivery details.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-brand-500 px-6 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              Browse products
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <StoreHeader />
      <main className="mx-auto max-w-8xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 sm:text-sm"
        >
          <Link to="/shop" className="hover:text-brand-600">
            Home
          </Link>
          <ChevronRight size={14} className="text-slate-300" />
          <Link to="/shop" className="hover:text-brand-600">
            Shop
          </Link>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="font-medium text-slate-900">Checkout</span>
        </nav>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Checkout<span className="text-brand-500">.</span>
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Enter the delivery address, then choose cash on delivery or bank transfer.
        </p>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <form id="checkout-form" onSubmit={handleSubmit} noValidate className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <MapPin size={18} />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Delivery information
                  </h2>
                  <p className="text-xs text-slate-500">
                    Used to deliver this order, like a shipping address.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="fullName" className="mb-1.5 block text-sm font-semibold text-slate-900">
                    Full name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    autoComplete="name"
                    value={form.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Recipient name"
                    aria-invalid={Boolean(showError("fullName"))}
                    aria-describedby={showError("fullName") ? "fullName-error" : undefined}
                    className={inputClass("fullName")}
                  />
                  <FieldError id="fullName-error" message={showError("fullName")} />
                </div>

                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-slate-900">
                    Mobile number
                  </label>
                  <div className="relative">
                    <Phone
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="03XXXXXXXXX"
                      aria-invalid={Boolean(showError("phone"))}
                      aria-describedby={showError("phone") ? "phone-error" : undefined}
                      className={`${inputClass("phone")} pl-10`}
                    />
                  </div>
                  <FieldError id="phone-error" message={showError("phone")} />
                </div>

                <div>
                  <label htmlFor="province" className="mb-1.5 block text-sm font-semibold text-slate-900">
                    Province
                  </label>
                  <select
                    id="province"
                    name="province"
                    value={form.province}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={Boolean(showError("province"))}
                    aria-describedby={showError("province") ? "province-error" : undefined}
                    className={inputClass("province")}
                  >
                    <option value="">Select province</option>
                    {PROVINCES.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                  <FieldError id="province-error" message={showError("province")} />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="city" className="mb-1.5 block text-sm font-semibold text-slate-900">
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    list="checkout-cities"
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="City"
                    aria-invalid={Boolean(showError("city"))}
                    aria-describedby={showError("city") ? "city-error" : undefined}
                    className={inputClass("city")}
                  />
                  <datalist id="checkout-cities">
                    {citySuggestions.map((city) => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                  <FieldError id="city-error" message={showError("city")} />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address" className="mb-1.5 block text-sm font-semibold text-slate-900">
                    Complete address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    autoComplete="street-address"
                    value={form.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="House no., street, area"
                    aria-invalid={Boolean(showError("address"))}
                    aria-describedby={showError("address") ? "address-error" : undefined}
                    className={`${inputClass("address")} resize-y`}
                  />
                  <FieldError id="address-error" message={showError("address")} />
                </div>

                <div>
                  <label htmlFor="landmark" className="mb-1.5 block text-sm font-semibold text-slate-900">
                    Landmark <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <input
                    id="landmark"
                    name="landmark"
                    value={form.landmark}
                    onChange={handleChange}
                    placeholder="Near a known place"
                    className={inputClass("landmark")}
                  />
                </div>

                <div>
                  <label htmlFor="instructions" className="mb-1.5 block text-sm font-semibold text-slate-900">
                    Delivery note <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <input
                    id="instructions"
                    name="instructions"
                    value={form.instructions}
                    onChange={handleChange}
                    placeholder="Call before arrival"
                    className={inputClass("instructions")}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <Truck size={18} />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Delivery method
                  </h2>
                  <p className="text-xs text-slate-500">
                    Choose how quickly you want the order.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {DELIVERY_OPTIONS.map((option) => {
                  const selected = form.delivery === option.id;
                  return (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                        selected
                          ? "border-brand-500 bg-brand-50 ring-4 ring-brand-100"
                          : "border-slate-200 hover:border-brand-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery"
                        value={option.id}
                        checked={selected}
                        onChange={handleChange}
                        className="mt-1 accent-brand-500"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-slate-900">
                          {option.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                          {option.text}
                        </span>
                        <span className="mt-2 block text-sm font-bold text-slate-900">
                          {formatPrice(option.fee)}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <Banknote size={18} />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Payment method
                  </h2>
                  <p className="text-xs text-slate-500">
                    Pay in cash on delivery, or transfer the total to the store account.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {PAYMENT_OPTIONS.map((option) => {
                  const selected = form.payment === option.id;
                  const Icon = option.id === "bank" ? Building2 : Banknote;
                  return (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                        selected
                          ? "border-brand-500 bg-brand-50 ring-4 ring-brand-100"
                          : "border-slate-200 hover:border-brand-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={option.id}
                        checked={selected}
                        onChange={handleChange}
                        className="mt-1 accent-brand-500"
                      />
                      <span>
                        <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                          <Icon size={16} className="text-brand-600" />
                          {option.title}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                          {option.text}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>

              {form.payment === "bank" && (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Transfer {formatPrice(total)} to this account
                  </p>
                  <dl className="mt-3 space-y-2 text-sm">
                    {[
                      ["Bank", BANK_ACCOUNT.bank, "bank"],
                      ["Account title", BANK_ACCOUNT.title, "title"],
                      ["Account number", BANK_ACCOUNT.accountNumber, "account"],
                      ["IBAN", BANK_ACCOUNT.iban, "iban"],
                    ].map(([label, value, field]) => (
                      <div key={field} className="flex items-center justify-between gap-3">
                        <div>
                          <dt className="text-xs text-slate-500">{label}</dt>
                          <dd className="font-medium text-slate-900">{value}</dd>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyBankDetail(field, value)}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-600 hover:bg-white"
                        >
                          <Copy size={13} />
                          {copiedField === field ? "Copied" : "Copy"}
                        </button>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-4">
                    <label
                      htmlFor="transactionRef"
                      className="mb-1.5 block text-sm font-semibold text-slate-900"
                    >
                      Transaction reference
                    </label>
                    <input
                      id="transactionRef"
                      name="transactionRef"
                      value={form.transactionRef}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Reference from your bank receipt"
                      aria-invalid={Boolean(showError("transactionRef"))}
                      aria-describedby={
                        showError("transactionRef") ? "transactionRef-error" : undefined
                      }
                      className={inputClass("transactionRef")}
                    />
                    <FieldError
                      id="transactionRef-error"
                      message={showError("transactionRef")}
                    />
                  </div>
                </div>
              )}
            </section>
          </form>

          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-base font-semibold text-slate-900">Order summary</h2>
            <ul className="mt-4 space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <img
                    src={item.image}
                    alt=""
                    className="size-14 shrink-0 rounded-xl border border-slate-100 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
              <div className="flex justify-between text-slate-500">
                <dt>Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-slate-500">
                <dt>Delivery</dt>
                <dd>{formatPrice(deliveryFee)}</dd>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900">
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>

            {/* <p className="mt-3 text-xs text-slate-500">
              {form.payment === "bank"
                ? "Bank transfer. Enter the transaction reference before placing the order."
                : "Cash on delivery. You pay the rider when the order arrives."}
            </p> */}

            <button
              type="submit"
              form="checkout-form"
              disabled={placing}
              className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-brand-500 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {placing ? "Placing order..." : "Place order"}
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}
