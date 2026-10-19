import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import {
  buildDefaultInstructions,
  EMPTY_BOT_INSTRUCTIONS,
  normalizeBotInstructions,
} from "../../data/productInstructions";
import { getProduct, saveProduct, uploadImage } from "../../services/storage/adminDataService";
import BotInstructionsEditor from "../components/BotInstructionsEditor";
import ImagePicker from "../components/ImagePicker";
import PageHeader from "../components/PageHeader";
import { buttonClass, inputClass, quietButtonClass } from "../components/formStyles";
import { useAdminData } from "../hooks/useAdminData";

const EMPTY = {
  title: "",
  sku: "",
  slug: "",
  category: "",
  brand: "Wasooli",
  portType: "",
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
  botInstructions: { ...EMPTY_BOT_INSTRUCTIONS },
};

const MAX_EXTRA = 4;

function instructionsForForm(product) {
  if (!product) return { ...EMPTY_BOT_INSTRUCTIONS };
  if (product.botInstructions) return normalizeBotInstructions(product.botInstructions);
  return buildDefaultInstructions(product);
}

function toForm(product) {
  if (!product) return { ...EMPTY, botInstructions: { ...EMPTY_BOT_INSTRUCTIONS } };
  const extras = (product.images || []).filter((src) => src && src !== product.image);
  return {
    ...EMPTY,
    ...product,
    price: String(product.price ?? ""),
    oldPrice: product.oldPrice ?? "",
    stock: String(product.stock ?? 0),
    extraImages: extras,
    featuresText: (product.features || []).join("\n"),
    specificationsText: (product.specifications || []).map((item) => `${item.label} | ${item.value}`).join("\n"),
    botInstructions: instructionsForForm(product),
  };
}

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { categories, products } = useAdminData();
  const existing = id ? products.find((item) => Number(item.id) === Number(id)) || getProduct(id) : null;
  const [form, setForm] = useState(() => toForm(existing));
  const [errors, setErrors] = useState({});
  const [reading, setReading] = useState(false);
  const extraInputRef = useRef(null);

  useEffect(() => {
    setForm(toForm(id ? getProduct(id) : null));
    setErrors({});
  }, [id]);

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
      title: form.title || "Product",
      category: form.category,
      brand: form.brand,
      portType: form.portType,
      specifications: (form.specificationsText || "")
        .split("\n")
        .map((line) => {
          const [label, ...rest] = line.split("|");
          return { label: label?.trim(), value: rest.join("|").trim() };
        })
        .filter((item) => item.label && item.value),
    });
    update("botInstructions", template);
    toast.success("Category template loaded. Edit anything before saving.");
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PageHeader
        crumbs={[{ label: "Products", to: "/admin/products" }, { label: existing ? "Edit" : "Add" }]}
        title={existing ? "Edit product" : "Add product"}
        detail="Draft products stay hidden on the shop until you mark them active. Bot instructions power the product assistant."
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            {field("title", "Name")}
            {field("sku", "SKU")}
            {field("slug", "Link slug", { placeholder: "Optional, generated from the name" })}
            <label className="block text-sm font-semibold text-slate-900">
              Category
              <input list="category-options" value={form.category} onChange={(event) => update("category", event.target.value)} className={`${inputClass} mt-1.5`} />
              <datalist id="category-options">
                {categories.map((category) => <option key={category.id} value={category.name} />)}
              </datalist>
              {errors.category ? <span className="mt-1 block text-xs font-medium text-red-600">{errors.category}</span> : null}
            </label>
            {field("brand", "Brand")}
            {field("portType", "Port type")}
            {field("price", "Price", { inputMode: "decimal" })}
            {field("oldPrice", "Compare-at price", { inputMode: "decimal" })}
            {field("stock", "Stock", { inputMode: "numeric" })}
            <label className="block text-sm font-semibold text-slate-900">
              Visibility
              <select value={form.status} onChange={(event) => update("status", event.target.value)} className={`${inputClass} mt-1.5`}>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          </div>
          {field("shortDescription", "Short description")}
          <label className="block text-sm font-semibold text-slate-900">
            Description
            <textarea value={form.description} onChange={(event) => update("description", event.target.value)} rows={4} className={`${inputClass} mt-1.5`} />
          </label>
          <label className="block text-sm font-semibold text-slate-900">
            Features, one per line
            <textarea value={form.featuresText} onChange={(event) => update("featuresText", event.target.value)} rows={4} className={`${inputClass} mt-1.5`} />
          </label>
          <label className="block text-sm font-semibold text-slate-900">
            Specifications, one per line as Label | Value
            <textarea value={form.specificationsText} onChange={(event) => update("specificationsText", event.target.value)} rows={4} className={`${inputClass} mt-1.5`} />
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
                  <img src={src} alt="" className="aspect-square w-full rounded-xl object-cover" />
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

      <BotInstructionsEditor
        value={form.botInstructions}
        onChange={(botInstructions) => update("botInstructions", botInstructions)}
        onLoadTemplate={loadCategoryTemplate}
      />
    </form>
  );
}
