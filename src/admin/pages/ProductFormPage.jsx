import { useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FileSpreadsheet, X } from "lucide-react";
import BulkProductModal from "../components/BulkProductModal";
import {
  buildDefaultInstructions,
  EMPTY_BOT_INSTRUCTIONS,
  normalizeBotInstructions,
} from "../../data/productInstructions";
import { getProduct, saveProduct, uploadImage } from "../../services/storage/adminDataService";
import { resolveMediaUrl } from "../../utils/mediaUrl";
import BotInstructionsEditor from "../components/BotInstructionsEditor";
import ImagePicker from "../components/ImagePicker";
import PageHeader from "../components/PageHeader";
import PriceTiersEditor from "../components/PriceTiersEditor";
import { buttonClass, inputClass, quietButtonClass } from "../components/formStyles";
import { useAdminData } from "../hooks/useAdminData";
import { normalizePriceTiers } from "../../utils/priceTiers";
import {
  CANONICAL_CATEGORIES,
  CATEGORY_SUBCATEGORIES,
  normalizeCategory,
} from "../../data/categories";
import { getProductPolicy } from "../../utils/productPolicy";

const CATEGORY_PORT_SUGGESTIONS = {
  "Routing": ["Gigabit RJ45", "10G SFP+ / RJ45", "Cellular 4G/5G SIM", "Console RJ45"],
  "Switching": ["10/100/1000M RJ45", "1G SFP", "10G SFP+", "PoE+ RJ45", "PoE++ RJ45"],
  "Wireless": ["Wi-Fi 6 / RJ45", "Wi-Fi 7 / 2.5GbE", "RP-SMA Antenna", "PoE PD RJ45"],
  "Network Security": ["Gigabit WAN/LAN", "10G SFP+ Interfaces", "Dedicated Management RJ45"],
  "Optical & Fiber": ["LC Duplex", "SC Simplex", "SFP 1.25G", "SFP+ 10G", "QSFP+ 40G"],
  "Cabling & Connectivity": ["Snagless RJ45", "Cat6 RJ45 8P8C", "Keystone Jack", "Patch Panel 24-Port"],
  "PoE": ["802.3af/at RJ45", "Passive 24V RJ45", "802.3bt 90W RJ45", "Gigabit PoE Injector"],
  "Adapters & NICs": ["PCIe x4 / RJ45", "PCIe x8 / SFP+", "USB 3.0 to RJ45", "M.2 Key-E Wi-Fi"],
  "Power & Racks": ["C13 / C14 Sockets", "Universal AC Outlets", "19-inch 1U Rackmount", "19-inch 42U Enclosure"],
  "Tools & Accessories": ["RJ45 / RJ11 8P8C", "Optical VFL 2.5mm", "Digital LCD Tester", "Punchdown 110/Krone"],
};

const CATEGORY_DEFAULT_SPECS = {
  "Routing": "Port Interface | Gigabit RJ45\nRouting Protocols | Static, RIP, OSPF, BGP\nVPN Security | IPsec, OpenVPN, WireGuard\nPower Supply | 12V DC Adapter",
  "Switching": "Port Interface | 10/100/1000 Mbps RJ45\nSwitching Fabric | Gigabit Non-blocking\nPoE Capability | 802.3af/at Auto-sensing\nMounting | Desktop & 19-inch Rackmount",
  "Wireless": "Wi-Fi Standard | Wi-Fi 6 (802.11ax)\nFrequency Bands | 2.4 GHz & 5 GHz Dual-Band\nMax Data Rate | Up to 1800-3000 Mbps\nAntenna Gain | High-Gain Omnidirectional",
  "Network Security": "Form Factor | Desktop / 1U Rackmount\nFirewall Throughput | Enterprise Multi-Gbps\nThreat Protection | IPS, Antivirus, SSL Inspection\nInterfaces | Multiple Routed WAN/LAN Ports",
  "Optical & Fiber": "Connector Type | LC Duplex\nWavelength | 1310nm / 850nm\nFiber Type | Single-Mode (SMF) / Multi-Mode (MMF)\nMax Link Distance | Up to 10km / 20km",
  "Cabling & Connectivity": "Cable Category | Cat6 UTP 23AWG\nConductor Material | 100% Pure Bare Copper\nBandwidth Capacity | 250 MHz / 10 Gbps\nConnector Type | Gold-plated RJ45 8P8C",
  "PoE": "PoE Standard | IEEE 802.3af / 802.3at\nPower Output | Up to 30W / 60W Output\nData Passthrough | 10/100/1000 Mbps Gigabit\nInput Voltage | 100-240V AC 50/60Hz",
  "Adapters & NICs": "Host Bus Interface | PCI Express 2.0 / 3.0 x4\nNetwork Interface | 1000M RJ45 / 10G SFP+\nBrackets Included | Full-height & Low-profile\nOS Support | Windows, Linux, VMware ESXi",
  "Power & Racks": "Rack Standard | 19-inch Standard Enclosure\nConstruction | Heavy-duty Cold Rolled Steel\nPower Outlets | C13 / Universal Outlets\nProtection | Surge & Overload Circuit Breaker",
  "Tools & Accessories": "Tool Compatibility | RJ45 Cat5e/Cat6 & RJ11 8P8C/6P\nBlade Material | High-Carbon Hardened Steel\nHandle Grip | Ergonomic Non-slip Rubber\nTester Functions | Pin-by-pin LED Continuity Test",
};

const EMPTY = {
  title: "",
  sku: "",
  slug: "",
  category: "",
  subcategory: "",
  brand: "Wasooli",
  portType: "",
  condition: "New Product",
  price: "",
  oldPrice: "",
  stock: "0",
  status: "draft",
  image: "",
  extraImages: [],
  shortDescription: "",
  description: "",
  featuresText: "",
  specificationsText: "",
  priceTiers: [],
  botInstructions: { ...EMPTY_BOT_INSTRUCTIONS },
};

const MAX_EXTRA = 4;

function instructionsForForm(product) {
  if (!product) return { ...EMPTY_BOT_INSTRUCTIONS };
  if (product.botInstructions) return normalizeBotInstructions(product.botInstructions);
  return buildDefaultInstructions(product);
}

function tiersToForm(tiers) {
  return normalizePriceTiers(tiers).map((tier) => ({
    minQty: String(tier.minQty),
    maxQty: tier.maxQty == null ? "" : String(tier.maxQty),
    price: String(tier.price),
  }));
}

function toForm(product) {
  if (!product) return { ...EMPTY, botInstructions: { ...EMPTY_BOT_INSTRUCTIONS } };
  const extras = (product.images || []).filter((src) => src && src !== product.image);
  return {
    ...EMPTY,
    ...product,
    subcategory: product.subcategory || "",
    condition: product.condition || "New Product",
    price: String(product.price ?? ""),
    oldPrice: product.oldPrice ?? "",
    stock: String(product.stock ?? 0),
    extraImages: extras,
    featuresText: (product.features || []).join("\n"),
    specificationsText: (product.specifications || []).map((item) => `${item.label} | ${item.value}`).join("\n"),
    priceTiers: tiersToForm(product.priceTiers),
    botInstructions: instructionsForForm(product),
  };
}

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { categories, products, loading } = useAdminData();
  const existing = id ? products.find((item) => Number(item.id) === Number(id)) || getProduct(id) : null;
  const [form, setForm] = useState(() => toForm(existing));
  const [errors, setErrors] = useState({});
  const [reading, setReading] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const extraInputRef = useRef(null);
  const skipSync = Boolean(id && loading);
  const syncKey = skipSync ? null : `${id ?? "new"}:${existing?.id ?? "none"}`;
  const [syncedKey, setSyncedKey] = useState(syncKey);

  if (!skipSync && syncKey !== syncedKey) {
    setSyncedKey(syncKey);
    setForm(toForm(existing));
    setErrors({});
  }

  if (id && loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
        <p className="font-semibold text-slate-900">Loading product...</p>
      </div>
    );
  }

  if (id && !existing) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
        <p className="font-semibold text-slate-900">Product not found.</p>
        <Link to="/admin/products" className="mt-3 inline-flex text-sm font-semibold text-brand-600">Back to products</Link>
      </div>
    );
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  function loadCategoryTemplate() {
    const template = buildDefaultInstructions({
      title: form.title || form.subcategory || form.category || "Product",
      category: form.category,
      brand: form.brand,
      portType: form.portType,
      condition: form.condition,
      specifications: (form.specificationsText || "")
        .split("\n")
        .map((line) => {
          const [label, ...rest] = line.split("|");
          return { label: label?.trim(), value: rest.join("|").trim() };
        })
        .filter((item) => item.label && item.value),
    });
    update("botInstructions", template);

    // Prefill specs if empty
    if (!form.specificationsText?.trim() && form.category) {
      const defaultSpecs =
        CATEGORY_DEFAULT_SPECS[form.category] ||
        CATEGORY_DEFAULT_SPECS[normalizeCategory(form.category)];
      if (defaultSpecs) update("specificationsText", defaultSpecs);
    }

    // Prefill default port type if empty
    if (!form.portType?.trim() && form.category) {
      const defaultPort = (
        CATEGORY_PORT_SUGGESTIONS[form.category] ||
        CATEGORY_PORT_SUGGESTIONS[normalizeCategory(form.category)] ||
        []
      )[0];
      if (defaultPort) update("portType", defaultPort);
    }

    toast.success(`${form.category || "Category"} template & FAQs loaded.`);
  }

  async function handleExtraFiles(event) {
    const files = [...(event.target.files || [])];
    event.target.value = "";
    if (files.length === 0) return;
    setReading(true);
    try {
      const remaining = MAX_EXTRA - form.extraImages.length;
      if (remaining <= 0) {
        toast.error(`You can add up to ${MAX_EXTRA} extra images.`);
        return;
      }
      const selected = files.slice(0, remaining);
      const urls = [];
      for (const file of selected) {
        const uploaded = await uploadImage(file, "product");
        urls.push(uploaded.url);
      }
      setForm((current) => ({ ...current, extraImages: [...current.extraImages, ...urls] }));
      toast.success(urls.length === 1 ? "Extra image added." : `${urls.length} extra images added.`);
    } catch (error) {
      toast.error(error.message || "Could not use that image.");
    } finally {
      setReading(false);
    }
  }

  function removeExtra(index) {
    setForm((current) => ({
      ...current,
      extraImages: current.extraImages.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const extras = (form.extraImages || []).filter(Boolean);
    const result = await saveProduct({
      ...form,
      id: existing?.id,
      images: form.image ? [form.image, ...extras] : extras,
      botInstructions: form.botInstructions,
    });
    if (!result.ok) {
      setErrors(result.errors || {});
      toast.error(result.message || "Check the highlighted fields.");
      return;
    }
    toast.success(existing ? "Product updated." : "Product added.");
    navigate("/admin/products");
  }

  const field = (name, label, props = {}) => (
    <label className="block text-sm font-semibold text-slate-900">
      {label}
      <input {...props} value={form[name]} onChange={(event) => update(name, event.target.value)} className={`${inputClass} mt-1.5`} />
      {errors[name] ? <span className="mt-1 block text-xs font-medium text-red-600">{errors[name]}</span> : null}
    </label>
  );

  const availableSubcategories = form.category
    ? CATEGORY_SUBCATEGORIES[form.category] ||
      CATEGORY_SUBCATEGORIES[normalizeCategory(form.category)] ||
      []
    : [];

  const portSuggestions = form.category
    ? CATEGORY_PORT_SUGGESTIONS[form.category] ||
      CATEGORY_PORT_SUGGESTIONS[normalizeCategory(form.category)] ||
      []
    : [];

  const policy = getProductPolicy({
    category: form.category,
    condition: form.condition,
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PageHeader
        crumbs={[{ label: "Products", to: "/admin/products" }, { label: existing ? "Edit" : "Add" }]}
        title={existing ? "Edit product" : "Add product"}
        detail="Draft products stay hidden on the shop until you mark them active. Bot instructions power the product assistant."
        actions={
          !existing ? (
            <button
              type="button"
              onClick={() => setBulkOpen(true)}
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-brand-300 hover:bg-brand-50/70 hover:text-brand-700 sm:text-sm"
            >
              <FileSpreadsheet size={16} className="text-emerald-600" />
              <span>Bulk Import (CSV/Excel)</span>
            </button>
          ) : null
        }
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            {field("title", "Name", { placeholder: "e.g. Cat6 High-Speed Network Cable 305m" })}
            {field("sku", "SKU", { placeholder: "e.g. WAS-CAT6-305" })}
            {field("slug", "Link slug", { placeholder: "Optional, generated from the name" })}
            <label className="block text-sm font-semibold text-slate-900">
              Category <span className="text-red-500">*</span>
              <select
                value={form.category}
                onChange={(event) => {
                  const nextCategory = event.target.value;
                  update("category", nextCategory);
                  const nextSubs = nextCategory
                    ? CATEGORY_SUBCATEGORIES[nextCategory] ||
                      CATEGORY_SUBCATEGORIES[normalizeCategory(nextCategory)] ||
                      []
                    : [];
                  if (!nextSubs.includes(form.subcategory)) {
                    update("subcategory", "");
                  }
                  if (!form.portType) {
                    const defaultPort = (
                      CATEGORY_PORT_SUGGESTIONS[nextCategory] ||
                      CATEGORY_PORT_SUGGESTIONS[normalizeCategory(nextCategory)] ||
                      []
                    )[0];
                    if (defaultPort) update("portType", defaultPort);
                  }
                }}
                className={`${inputClass} mt-1.5`}
              >
                <option value="">Select category</option>
                {CANONICAL_CATEGORIES.map((catName) => (
                  <option key={catName} value={catName}>
                    {catName}
                  </option>
                ))}
              </select>
              {errors.category ? (
                <span className="mt-1 block text-xs font-medium text-red-600">
                  {errors.category}
                </span>
              ) : null}
            </label>

            <label className="block text-sm font-semibold text-slate-900">
              <span className="flex items-center justify-between">
                <span>
                  Subcategory <span className="text-red-500">*</span>
                </span>
                {/* {availableSubcategories.length > 0 && (
                  <span className="text-xs font-normal text-slate-500">
                    {availableSubcategories.length} available
                  </span>
                )} */}
              </span>
              <select
                value={form.subcategory || ""}
                disabled={!form.category}
                onChange={(event) => update("subcategory", event.target.value)}
                className={`${inputClass} mt-1.5 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed`}
              >
                <option value="">
                  {form.category
                    ? "Select subcategory"
                    : "— First select a category —"}
                </option>
                {availableSubcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
                {form.subcategory && !availableSubcategories.includes(form.subcategory) && (
                  <option value={form.subcategory}>{form.subcategory}</option>
                )}
              </select>
              {errors.subcategory ? (
                <span className="mt-1 block text-xs font-medium text-red-600">
                  {errors.subcategory}
                </span>
              ) : null}
            </label>

            {/* Dynamic Category & Condition Policy Banner */}
            {/* {form.category ? (
              <div className="sm:col-span-2 rounded-2xl border border-brand-200/90 bg-gradient-to-br from-brand-50/70 via-white to-brand-50/40 p-3.5 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      Category Context:
                    </span>
                    <span className="rounded-md bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-800">
                      {form.category}
                    </span>
                    {form.subcategory ? (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {form.subcategory}
                      </span>
                    ) : null}
                  </div>
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                      form.condition === "Used Product"
                        ? "bg-amber-100 text-amber-900"
                        : "bg-emerald-100 text-emerald-900"
                    }`}
                  >
                    {policy.badge}
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                  <strong className="text-slate-800">{policy.warrantyType} ({policy.warrantyPeriod}):</strong> {policy.shortSummary}
                </p>
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-brand-100/80 pt-2 text-xs">
                  <span className="text-slate-500">
                    Policy and bot instructions automatically adjust for this product.
                  </span>
                  <button
                    type="button"
                    onClick={loadCategoryTemplate}
                    className="cursor-pointer font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                  >
                    Auto-fill category specs & bot template →
                  </button>
                </div>
              </div>
            ) : null} */}

            {field("brand", "Brand", { placeholder: "e.g. Cisco, TP-Link, Ubiquiti, Wasooli" })}

            <label className="block text-sm font-semibold text-slate-900">
              Port type
              <input
                value={form.portType}
                onChange={(event) => update("portType", event.target.value)}
                placeholder="e.g. Gigabit RJ45, 10G SFP+, LC Duplex"
                className={`${inputClass} mt-1.5`}
              />
              {portSuggestions.length > 0 && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1">
                  <span className="text-[11px] font-medium text-slate-400">Suggestions:</span>
                  {portSuggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => update("portType", sug)}
                      className={`cursor-pointer rounded-md px-2 py-0.5 text-[11px] font-medium transition ${
                        form.portType === sug
                          ? "bg-brand-500 text-white font-semibold"
                          : "bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-700"
                      }`}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}
            </label>

            {field("price", "Price", { inputMode: "decimal", placeholder: "e.g. 4500" })}
            {field("oldPrice", "Compare-at price", { inputMode: "decimal", placeholder: "e.g. 5200" })}
            {field("stock", "Stock", { inputMode: "numeric", placeholder: "e.g. 50" })}
            <label className="block text-sm font-semibold text-slate-900">
              Visibility
              <select value={form.status} onChange={(event) => update("status", event.target.value)} className={`${inputClass} mt-1.5`}>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-900">
              Condition
              <select
                value={form.condition || "New Product"}
                onChange={(event) => update("condition", event.target.value)}
                className={`${inputClass} mt-1.5`}
              >
                <option value="New Product">New Product</option>
                <option value="Used Product">Used Product</option>
              </select>
            </label>
          </div>
          {field("shortDescription", "Short description", { placeholder: "Brief single-sentence summary of the product..." })}
          <label className="block text-sm font-semibold text-slate-900">
            Description
            <textarea
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="Detailed product overview, applications, and build quality..."
              rows={4}
              className={`${inputClass} mt-1.5`}
            />
          </label>
          <label className="block text-sm font-semibold text-slate-900">
            Features, one per line
            <textarea
              value={form.featuresText}
              onChange={(event) => update("featuresText", event.target.value)}
              placeholder={"Pure copper conductors\n250 MHz bandwidth\nGold-plated RJ45 connectors"}
              rows={4}
              className={`${inputClass} mt-1.5`}
            />
          </label>
          <label className="block text-sm font-semibold text-slate-900">
            Specifications, one per line as Label | Value
            <textarea
              value={form.specificationsText}
              onChange={(event) => update("specificationsText", event.target.value)}
              placeholder={"Cable Length | 305 Meters\nConnector Type | RJ45\nStandard | TIA/EIA 568-C.2"}
              rows={4}
              className={`${inputClass} mt-1.5`}
            />
          </label>
        </section>
        <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-4 lg:self-start">
          <p className="text-sm font-semibold text-slate-900">Images</p>
          <input ref={extraInputRef} type="file" accept="image/*" multiple className="sr-only" onChange={handleExtraFiles} />
          <ImagePicker
            value={form.image}
            onChange={(image) => update("image", image)}
            label="Select product image"
          />
          {errors.image ? <p className="text-xs font-medium text-red-600">{errors.image}</p> : null}

          {form.extraImages.length > 0 ? (
            <ul className="grid grid-cols-4 gap-2">
              {form.extraImages.map((src, index) => (
                <li key={`${src.slice(0, 24)}-${index}`} className="relative">
                  <img src={resolveMediaUrl(src)} alt="" className="aspect-square w-full rounded-xl object-cover" />
                  <button
                    type="button"
                    aria-label="Remove extra image"
                    onClick={() => removeExtra(index)}
                    className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-slate-900 text-white"
                  >
                    <X size={10} />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <button
            type="button"
            onClick={() => extraInputRef.current?.click()}
            disabled={reading || form.extraImages.length >= MAX_EXTRA}
            className={quietButtonClass}
          >
            Add extra images
          </button>
          <div className="flex flex-col gap-2">
            <button type="submit" className={buttonClass} disabled={reading}>Save product</button>
            <Link to="/admin/products" className={quietButtonClass}>Cancel</Link>
          </div>
        </aside>
      </div>

      <PriceTiersEditor
        value={form.priceTiers}
        onChange={(priceTiers) => update("priceTiers", priceTiers)}
        basePrice={form.price}
        error={errors.priceTiers}
      />

      <BotInstructionsEditor
        value={form.botInstructions}
        onChange={(botInstructions) => update("botInstructions", botInstructions)}
        onLoadTemplate={loadCategoryTemplate}
      />

      <BulkProductModal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
      />
    </form>
  );
}
