import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getProduct, saveProduct } from "../../services/storage/adminDataService";
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
  imagesText: "",
  shortDescription: "",
  description: "",
  featuresText: "",
  specificationsText: "",
};

function toForm(product) {
  if (!product) return EMPTY;
  return {
    ...EMPTY,
    ...product,
    price: String(product.price ?? ""),
    oldPrice: product.oldPrice ?? "",
    stock: String(product.stock ?? 0),
    imagesText: (product.images || []).join("\n"),
    featuresText: (product.features || []).join("\n"),
    specificationsText: (product.specifications || []).map((item) => `${item.label} | ${item.value}`).join("\n"),
  };
}

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { categories, products } = useAdminData();
  const existing = id ? products.find((item) => Number(item.id) === Number(id)) || getProduct(id) : null;
  const [form, setForm] = useState(() => toForm(existing));
  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    setForm(toForm(id ? getProduct(id) : null));
    setErrors({});
    setPreviewUrl("");
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

  function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    toast.info("Local files are preview-only. Paste an image URL to save it.");
  }

  function handleSubmit(event) {
    event.preventDefault();
    const result = saveProduct({ ...form, id: existing?.id, imagesText: form.imagesText });
    if (!result.ok) {
      setErrors(result.errors || {});
      toast.error("Check the highlighted fields.");
      return;
    }
    toast.success(existing ? "Product updated." : "Product added.");
    navigate("/admin/products");
  }

  const preview = previewUrl || form.image;
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
        detail="Draft products stay hidden on the shop until you mark them active."
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
        <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Images</p>
          {preview ? <img src={preview} alt="" className="aspect-square w-full rounded-2xl border border-slate-100 object-cover" /> : <div className="grid aspect-square place-items-center rounded-2xl bg-slate-50 text-sm text-slate-400">No preview</div>}
          <label className="block text-sm font-semibold text-slate-900">
            Main image URL
            <input value={form.image} onChange={(event) => update("image", event.target.value)} className={`${inputClass} mt-1.5`} placeholder="https://..." />
            {errors.image ? <span className="mt-1 block text-xs font-medium text-red-600">{errors.image}</span> : null}
          </label>
          <label className="block text-sm font-semibold text-slate-900">
            More image URLs
            <textarea value={form.imagesText} onChange={(event) => update("imagesText", event.target.value)} rows={4} className={`${inputClass} mt-1.5`} placeholder="One URL per line" />
          </label>
          <label className="block text-xs font-medium text-slate-500">
            Local preview only
            <input type="file" accept="image/*" onChange={handleFile} className="mt-1.5 block w-full text-xs" />
          </label>
          <div className="flex flex-col gap-2">
            <button type="submit" className={buttonClass}>Save product</button>
            <Link to="/admin/products" className={quietButtonClass}>Cancel</Link>
          </div>
        </aside>
      </div>
    </form>
  );
}
