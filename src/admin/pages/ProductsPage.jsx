import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FileSpreadsheet, Plus } from "lucide-react";
import { formatPrice } from "../../data/product";
import { activateProduct, archiveProduct, deleteProduct } from "../../services/storage/adminDataService";
import { resolveMediaUrl } from "../../utils/mediaUrl";
import AdminPagination from "../components/AdminPagination";
import AdminTable from "../components/AdminTable";
import BulkProductModal from "../components/BulkProductModal";
import ConfirmDialog from "../components/ConfirmDialog";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { buttonClass, inputClass } from "../components/formStyles";
import { paginate, useAdminData } from "../hooks/useAdminData";

const PAGE_SIZE = 8;

export default function ProductsPage() {
  const { products, categories } = useAdminData();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const result = products.filter((product) => {
      const matchesQuery = !needle || [product.title, product.sku, product.category, product.brand].join(" ").toLowerCase().includes(needle);
      const matchesCategory = category === "all" || product.category === category;
      const matchesStatus = status === "all" || product.status === status;
      return matchesQuery && matchesCategory && matchesStatus;
    });
    result.sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "stock") return a.stock - b.stock;
      return a.title.localeCompare(b.title);
    });
    return result;
  }, [products, query, category, status, sort]);

  const view = paginate(filtered, page, PAGE_SIZE);

  async function confirmAction() {
    if (!pending) return;
    let result;
    if (pending.mode === "delete") {
      result = await deleteProduct(pending.product.id);
    } else if (pending.mode === "activate") {
      result = await activateProduct(pending.product.id, pending.product);
    } else {
      result = await archiveProduct(pending.product.id);
    }

    if (!result.ok) {
      toast.error(result.message || "Could not update the product.");
    } else {
      const msg =
        pending.mode === "delete"
          ? "Product deleted."
          : pending.mode === "activate"
          ? "Product activated successfully."
          : "Product archived.";
      toast.success(msg);
    }
    setPending(null);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        crumbs={[{ label: "Products" }]}
        title="Products"
        detail="Search, filter, and manage the same catalog the storefront uses."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setBulkOpen(true)}
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-brand-300 hover:bg-brand-50/70 hover:text-brand-700 sm:text-sm"
            >
              <FileSpreadsheet size={16} className="text-emerald-600" />
              <span>Bulk Import</span>
            </button>
            <Link to="/admin/products/new" className={buttonClass}>
              <Plus size={16} />
              <span>Add product</span>
            </Link>
          </div>
        }
      />
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search name or SKU" className={inputClass} />
          <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} className={inputClass}>
            <option value="all">All categories</option>
            {categories.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
          </select>
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className={inputClass}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <select value={sort} onChange={(event) => setSort(event.target.value)} className={inputClass}>
            <option value="name">Name</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="stock">Stock</option>
          </select>
        </div>
        <div className="mt-4">
          <AdminTable
            rows={view.items}
            rowKey={(product) => product.id}
            onRowClick={(product) => navigate(`/admin/products/${product.id}/edit`)}
            empty="No products match these filters."
            columns={[
              {
                key: "image",
                label: "Product",
                render: (product) => (
                  <span className="flex items-center gap-3">
                    <img src={resolveMediaUrl(product.image)} alt="" className="size-12 rounded-xl border border-slate-100 object-cover" />
                    <span>
                      <span className="block font-semibold text-slate-900">{product.title}</span>
                      <span className="text-xs text-slate-500">{product.sku}</span>
                    </span>
                  </span>
                ),
              },
              {
                key: "category",
                label: "Category",
                render: (product) => (
                  <div>
                    <span className="block font-medium text-slate-900">{product.category}</span>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      {product.subcategory && (
                        <span className="text-xs text-slate-500">{product.subcategory}</span>
                      )}
                      {product.condition && (
                        <span
                          className={`rounded-full px-1.5 py-px text-[10px] font-semibold ${
                            product.condition === "Used Product"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {product.condition === "Used Product" ? "Used" : "New"}
                        </span>
                      )}
                    </div>
                  </div>
                ),
              },
              { key: "price", label: "Price", render: (product) => formatPrice(product.price) },
              { key: "stock", label: "Stock" },
              { key: "status", label: "Status", render: (product) => <StatusBadge status={product.status} /> },
              {
                key: "actions",
                label: "",
                render: (product) => {
                  const isArchived = product.status === "archived";
                  return (
                    <span className="flex items-center justify-end gap-3">
                      {isArchived ? (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setPending({ product, mode: "activate" });
                          }}
                          className="cursor-pointer text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                        >
                          Activate
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setPending({ product, mode: "archive" });
                          }}
                          className="cursor-pointer text-xs font-semibold text-slate-500 hover:text-brand-600"
                        >
                          Archive
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setPending({ product, mode: "delete" });
                        }}
                        className="cursor-pointer text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
                      >
                        Delete
                      </button>
                    </span>
                  );
                },
              },
            ]}
          />
          <AdminPagination page={view.page} pages={view.pages} total={view.total} onPage={setPage} />
        </div>
      </section>
      <ConfirmDialog
        open={Boolean(pending)}
        title={
          pending?.mode === "delete"
            ? "Delete product?"
            : pending?.mode === "activate"
            ? "Activate product?"
            : "Archive product?"
        }
        message={
          pending?.mode === "delete"
            ? "The product will leave the storefront. Past orders keep their saved item names."
            : pending?.mode === "activate"
            ? "The product will be restored and will be publicly active on the storefront."
            : "Archived products stay in admin but are hidden from the shop."
        }
        confirmLabel={
          pending?.mode === "delete"
            ? "Delete"
            : pending?.mode === "activate"
            ? "Activate"
            : "Archive"
        }
        onClose={() => setPending(null)}
        onConfirm={confirmAction}
      />
      <BulkProductModal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
      />
    </div>
  );
}
