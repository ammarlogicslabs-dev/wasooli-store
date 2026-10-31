import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  Banknote,
  Building2,
  Copy,
  MapPin,
  Phone,
  ShoppingBag,
  Truck,
  ArrowLeft
} from "lucide-react";
import StoreHeader from "../components/StoreHeader";
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";
import { formatPrice } from "../data/product";
import {
  fetchPublicSettings,
  fetchSavedAddress,
  placeOrderApi,
  saveSavedAddress,
  validateCouponApi,
} from "../services/storage/adminDataService";
import { resolveMediaUrl } from "../utils/mediaUrl";
import { getUnitPrice, normalizePriceTiers, tierLabelForQty } from "../utils/priceTiers";

const PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Azad Jammu & Kashmir",
  "Gilgit-Baltistan",
];

const EMPTY_BANK = {
  bankName: "",
  accountTitle: "",
  accountNumber: "",
  iban: "",
};

function hasBankDetails(bank) {
  return Boolean(
    String(bank?.bankName || "").trim() ||
      String(bank?.accountTitle || "").trim() ||
      String(bank?.accountNumber || "").trim() ||
      String(bank?.iban || "").trim()
  );
}

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
    text: "3-5 working days",
    fee: 200,
  },
  {
    id: "express",
    title: "Express delivery",
    text: "1-2 working days",
    fee: 300,
  },
];

function deliveryChoices(shippingFee, expressShippingFee) {
  const standard = Number(shippingFee);
  const express = Number(expressShippingFee);
  const standardFee = Number.isFinite(standard) && standard >= 0 ? standard : DELIVERY_OPTIONS[0].fee;
  const expressFee = Number.isFinite(express) && express >= 0 ? express : DELIVERY_OPTIONS[1].fee;
  return DELIVERY_OPTIONS.map((option) => {
    if (option.id === "standard") return { ...option, fee: standardFee };
    if (option.id === "express") return { ...option, fee: expressFee };
    return option;
  });
}

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

const SUCCESS_BITS = [
  { x: -52, y: -10, color: "#12b76a", delay: 0.18 },
  { x: 50, y: -16, color: "#2c9aff", delay: 0.22 },
  { x: -28, y: -42, color: "#f5b942", delay: 0.16 },
  { x: 32, y: -44, color: "#12b76a", delay: 0.26 },
  { x: -54, y: 18, color: "#7c5cfc", delay: 0.2 },
  { x: 56, y: 14, color: "#f04438", delay: 0.24 },
  { x: -14, y: 46, color: "#2c9aff", delay: 0.28 },
  { x: 16, y: 48, color: "#12b76a", delay: 0.2 },
  { x: 4, y: -52, color: "#f5b942", delay: 0.3 },
  { x: -6, y: 6, color: "#12b76a", delay: 0.14 },
];

function readBuyNowItem(state) {
  const buyNow = state?.buyNow;
  const product = buyNow?.product;
  if (!product || product.id == null || !product.title) return null;

  const basePrice = Number(product.price);
  if (!Number.isFinite(basePrice)) return null;

  const stock = Number.isFinite(Number(product.stock)) ? Number(product.stock) : null;
  const requested = Math.max(1, Number(buyNow.quantity) || 1);
  const quantity = stock === null ? requested : Math.min(stock, requested);
  if (quantity <= 0) return null;

  const priceTiers = normalizePriceTiers(product.priceTiers);
  const unitPrice = getUnitPrice({ price: basePrice, priceTiers }, quantity);

  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    image: product.image,
    price: unitPrice,
    basePrice,
    priceTiers,
    stock,
    quantity,
  };
}

function resolveOrderLine(item, catalog) {
  const live = catalog.find((product) => Number(product.id) === Number(item.id));
  const source = {
    price: live?.price ?? item.basePrice ?? item.price,
    priceTiers: live?.priceTiers ?? item.priceTiers,
  };
  const unitPrice = getUnitPrice(source, item.quantity);
  return {
    ...item,
    price: unitPrice,
    basePrice: Number(source.price) || 0,
    priceTiers: normalizePriceTiers(source.priceTiers),
    tierLabel: tierLabelForQty(source, item.quantity),
  };
}

function riseMotion(delay, reduce) {
  if (reduce) return {};
  return {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: "easeOut" },
  };
}

function OrderSuccessMark() {
  const reduce = useReducedMotion();

  return (
    <div className="relative mx-auto size-26 lg:mx-0" aria-hidden="true">
      {[0.15, 0.4].map((delay) => (
        <motion.span
          key={delay}
          className="absolute inset-[1.15rem] rounded-full border-[3px] border-[#12b76a]"
          initial={reduce ? false : { scale: 0.8, opacity: 0.65 }}
          animate={{ scale: reduce ? 1 : 1.9, opacity: reduce ? 0 : 0 }}
          transition={{ duration: reduce ? 0 : 0.95, delay, ease: "easeOut" }}
        />
      ))}
      {SUCCESS_BITS.map((bit) => (
        <motion.span
          key={`${bit.x}-${bit.y}`}
          className="absolute top-1/2 left-1/2 size-2 rounded-full"
          style={{ background: bit.color, margin: "-4px" }}
          initial={reduce ? false : { x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{
            x: bit.x,
            y: bit.y,
            scale: 0.25,
            opacity: 0,
          }}
          transition={{
            duration: reduce ? 0 : 0.75,
            delay: reduce ? 0 : bit.delay,
            ease: "easeOut",
          }}
        />
      ))}
      <motion.span
        className="absolute inset-[1.15rem] grid place-items-center rounded-full bg-[#12b76a] shadow-[0_12px_30px_rgb(18_183_106/0.35)]"
        initial={reduce ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={
          reduce
            ? { duration: 0 }
            : { type: "spring", stiffness: 280, damping: 16 }
        }
      >
        <svg viewBox="0 0 52 52" className="size-12" aria-hidden="true">
          <motion.path
            d="M14 27.5l8 8 16.5-17"
            fill="none"
            stroke="#fff"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: reduce ? 0 : 0.4,
              delay: reduce ? 0 : 0.35,
              ease: "easeOut",
            }}
          />
        </svg>
      </motion.span>
    </div>
  );
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
  const location = useLocation();
  const { products, items, clearCart, deductStock } = useCart();
  const [shippingFee, setShippingFee] = useState(DELIVERY_OPTIONS[0].fee);
  const [expressShippingFee, setExpressShippingFee] = useState(DELIVERY_OPTIONS[1].fee);
  const [bankDetails, setBankDetails] = useState(EMPTY_BANK);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponApplying, setCouponApplying] = useState(false);

  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    fullName: user?.name || "",
  }));
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [order, setOrder] = useState(null);
  const [copiedField, setCopiedField] = useState("");
  const confirmButtonRef = useRef(null);

  useEffect(() => {
    fetchPublicSettings()
      .then((settings) => {
        const fee = Number(settings.shippingFee);
        const express = Number(settings.expressShippingFee);
        if (Number.isFinite(fee) && fee >= 0) setShippingFee(fee);
        if (Number.isFinite(express) && express >= 0) setExpressShippingFee(express);
        setBankDetails({
          bankName: String(settings.bankName || "").trim(),
          accountTitle: String(settings.accountTitle || "").trim(),
          accountNumber: String(settings.accountNumber || "").trim(),
          iban: String(settings.iban || "").trim(),
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchSavedAddress()
      .then((saved) => {
        if (cancelled || !saved) return;
        setForm((current) => ({
          ...current,
          fullName: saved.fullName || current.fullName,
          phone: saved.phone || "",
          province: saved.province || "",
          city: saved.city || "",
          address: saved.address || "",
          landmark: saved.landmark || "",
          instructions: saved.instructions || "",
          delivery: saved.preferredDeliveryMethod || saved.delivery || current.delivery,
        }));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const rawBuyNowItem = readBuyNowItem(location.state);
  const buyNowItem = (() => {
    if (!rawBuyNowItem) return null;
    const liveProduct = products.find((item) => item.id === rawBuyNowItem.id);
    const liveStock = Number.isFinite(liveProduct?.stock)
      ? liveProduct.stock
      : rawBuyNowItem.stock;
    if (liveStock !== null && liveStock <= 0) return null;
    const quantity =
      liveStock === null
        ? rawBuyNowItem.quantity
        : Math.min(liveStock, rawBuyNowItem.quantity);
    return resolveOrderLine({ ...rawBuyNowItem, stock: liveStock, quantity }, products);
  })();
  const orderItems = (buyNowItem ? [buyNowItem] : items).map((item) =>
    resolveOrderLine(item, products)
  );

  useEffect(() => {
    document.title = order
      ? "Order placed | Wasooli Store"
      : "Checkout | Wasooli Store";
  }, [order]);

  useEffect(() => {
    if (!confirmOpen) return undefined;
    confirmButtonRef.current?.focus();

    function onKeyDown(event) {
      if (event.key === "Escape") setConfirmOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [confirmOpen]);

  const errors = validate(form);
  const showError = (name) =>
    (touched[name] || submitAttempted) && errors[name];

  const subtotal = orderItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const choices = deliveryChoices(shippingFee, expressShippingFee);
  const deliveryOption =
    choices.find((option) => option.id === form.delivery) || choices[0];
  const deliveryFee = orderItems.length ? deliveryOption.fee : 0;
  const total = Math.max(0, subtotal + deliveryFee - couponDiscount);

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


    if(name === "phone" && !/^\d{0,11}$/.test(value)) {
      return;
    }  
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
    if (Object.keys(errors).length > 0 || orderItems.length === 0 || placing) {
      const firstInvalid = Object.keys(errors)[0];
      if (firstInvalid) {
        document.getElementById(firstInvalid)?.focus();
      }
      return;
    }

    setConfirmOpen(true);
  }

  async function applyCoupon() {
    const code = couponCode.trim().toUpperCase();
    if (!code || couponApplying) return;
    setCouponApplying(true);
    setCouponMessage("");
    try {
      const result = await validateCouponApi(code, subtotal);
      setCouponCode(result.code || code);
      setCouponDiscount(Number(result.discount) || 0);
      setCouponMessage(`Coupon applied (−${formatPrice(result.discount)}).`);
    } catch (error) {
      setCouponDiscount(0);
      setCouponMessage(error.message || "Invalid coupon.");
    } finally {
      setCouponApplying(false);
    }
  }

  async function placeOrder() {
    if (placing || orderItems.length === 0) return;

    setPlacing(true);
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

    try {
      await saveSavedAddress(addressToSave).catch(() => {});
      const placed = await placeOrderApi({
        items: orderItems.map((item) => ({
          productId: Number(item.id),
          quantity: Number(item.quantity) || 1,
        })),
        delivery: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          province: form.province,
          city: form.city.trim(),
          address: form.address.trim(),
          landmark: form.landmark.trim(),
          instructions: form.instructions.trim(),
          method: deliveryOption.id,
        },
        paymentMethod: form.payment,
        bankReference: form.payment === "bank" ? form.transactionRef.trim() : null,
        couponCode: couponCode.trim() || null,
      });
      await deductStock();
      setOrder(placed);
      if (!buyNowItem) clearCart();
      setConfirmOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      toast.error(error.message || "Could not place order.");
    } finally {
      setPlacing(false);
    }
  }

  const inputClass = (name) =>
    `w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
      showError(name)
        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
        : "border-slate-200 focus:border-brand-500 focus:ring-brand-100"
    }`;

  const reduceMotion = useReducedMotion();

  if (order) {
    return (
      <div className="flex h-dvh flex-col overflow-hidden bg-slate-50">
        <StoreHeader />
        <main className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 items-center px-4 py-3 sm:px-6">
          <div className="grid w-full items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-4 text-center shadow-sm sm:px-6 sm:py-5 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:text-left">
            <div>
              <OrderSuccessMark />
              <motion.p
                className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600 sm:text-xs"
                {...riseMotion(0.45, reduceMotion)}
              >
                Order confirmed
              </motion.p>
              <motion.h1
                className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl"
                {...riseMotion(0.55, reduceMotion)}
              >
                Thank you, {order.delivery.fullName.split(" ")[0]}.
              </motion.h1>
              <motion.p
                className="mt-1 text-2xl font-bold text-slate-900"
                {...riseMotion(0.65, reduceMotion)}
              >
                {formatPrice(order.total)}
              </motion.p>
              <motion.p
                className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500 sm:text-sm lg:mx-0"
                {...riseMotion(0.75, reduceMotion)}
              >
                Your order  is confirmed.{" "}
                {order.payment.method === "bank"
                  ? `Bank transfer reference ${order.payment.reference} is saved. The order ships after the payment is confirmed.`
                  : "Pay this amount in cash when it arrives."}
              </motion.p>
              <motion.div className="mt-3" {...riseMotion(1.05, reduceMotion)}>
                <Link
                  to="/shop"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  Continue shopping
                </Link>
              </motion.div>
            </div>

            <motion.div
              className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-left sm:p-4"
              {...riseMotion(0.9, reduceMotion)}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                Delivering to
              </p>
              <p className="mt-1.5 text-sm font-semibold text-slate-900">
                {order.delivery.fullName}
              </p>
              <p className="mt-1 text-sm leading-5 text-slate-600">
                {order.delivery.address}
                {order.delivery.landmark ? `, ${order.delivery.landmark}` : ""}
                <br />
                {order.delivery.city}, {order.delivery.province}
                <br />
                {order.delivery.phone}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {order.delivery.method.title} · {order.delivery.method.text}
              </p>
              <p className="mt-0.5 text-sm font-medium text-slate-900">
                Payment: {order.payment.label}
              </p>
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  if (orderItems.length === 0) {
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
      <main className="page-offset mx-auto max-w-8xl px-4 pb-6 sm:px-6 lg:px-8 lg:pb-10">
        <nav aria-label="Breadcrumb" className="page-crumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to="/shop">Shop</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Checkout</span>
        </nav>
        <Link
          to="/shop"
          className="mt-5 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-brand-600"
        >
          <ArrowLeft size={17} />
          Back to shopping
        </Link>

        <h1 className="mt-4 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
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
                  {/* <datalist id="checkout-cities">
                    {citySuggestions.map((city) => (
                      <option key={city} value={city} />
                    ))}
                  </datalist> */}
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
                {choices.map((option) => {
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
                  {hasBankDetails(bankDetails) ? (
                    <>
                      <p className="text-sm font-semibold text-slate-900">
                        Transfer {formatPrice(total)} to this account
                      </p>
                      <dl className="mt-3 space-y-2 text-sm">
                        {[
                          ["Bank", bankDetails.bankName, "bank", false],
                          ["Account title", bankDetails.accountTitle, "title", false],
                          ["Account number", bankDetails.accountNumber, "account", true],
                          ["IBAN", bankDetails.iban, "iban", true],
                        ]
                          .filter(([, value]) => String(value || "").trim())
                          .map(([label, value, field, canCopy]) => (
                            <div key={field} className="flex items-center justify-between gap-3">
                              <div>
                                <dt className="text-xs text-slate-500">{label}</dt>
                                <dd className="font-medium text-slate-900">{value}</dd>
                              </div>
                              {canCopy && (
                                <button
                                  type="button"
                                  onClick={() => copyBankDetail(field, value)}
                                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-600 hover:bg-white"
                                >
                                  <Copy size={13} />
                                  {copiedField === field ? "Copied" : "Copy"}
                                </button>
                              )}
                            </div>
                          ))}
                      </dl>
                    </>
                  ) : (
                    <p className="text-sm font-medium text-slate-700">
                      Bank transfer details are not published yet. Please contact the store for account information, then enter your transaction reference below.
                    </p>
                  )}

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
              {orderItems.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <img
                    src={resolveMediaUrl(item.image)}
                    alt=""
                    className="size-14 shrink-0 rounded-xl border border-slate-100 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Qty {item.quantity} × {formatPrice(item.price)}
                      {item.tierLabel ? ` · ${item.tierLabel}` : ""}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <label htmlFor="couponCode" className="mb-1.5 block text-sm font-semibold text-slate-900">
                Coupon code <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="couponCode"
                  value={couponCode}
                  onChange={(event) => {
                    setCouponCode(event.target.value.toUpperCase());
                    setCouponDiscount(0);
                    setCouponMessage("");
                  }}
                  placeholder="Enter coupon code"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={couponApplying || !couponCode.trim()}
                  className="shrink-0 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  {couponApplying ? "…" : "Apply"}
                </button>
              </div>
              {couponMessage ? (
                <p className={`mt-1.5 text-xs font-medium ${couponDiscount > 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {couponMessage}
                </p>
              ) : null}
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-500">
                <dt>Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-slate-500">
                <dt>Delivery</dt>
                <dd>{formatPrice(deliveryFee)}</dd>
              </div>
              {couponDiscount > 0 ? (
                <div className="flex justify-between text-emerald-600">
                  <dt>Discount</dt>
                  <dd>−{formatPrice(couponDiscount)}</dd>
                </div>
              ) : null}
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

      {confirmOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Cancel order confirmation"
            onClick={() => setConfirmOpen(false)}
            className="absolute inset-0 cursor-default bg-slate-900/50"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-order-title"
            className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
          >
            <h2 id="confirm-order-title" className="text-lg font-semibold text-slate-900">
              Place this order?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Total {formatPrice(total)}. Are you sure you want to place this order?
            </p>
            <div className="mt-5 flex gap-3">
              <button
                ref={confirmButtonRef}
                type="button"
                onClick={placeOrder}
                disabled={placing}
                className="flex h-11 flex-1 cursor-pointer items-center justify-center rounded-xl bg-brand-500 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {placing ? "Placing order..." : "Yes"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={placing}
                className="flex h-11 flex-1 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
