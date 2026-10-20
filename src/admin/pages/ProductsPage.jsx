import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { formatPrice } from "../../data/product";
import { activateProduct, archiveProduct, deleteProduct } from "../../services/storage/adminDataService";
import AdminPagination from "../components/AdminPagination";
import AdminTable from "../components/AdminTable";
import ConfirmDialog from "../components/ConfirmDialog";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { buttonClass, inputClass } from "../components/formStyles";
import { paginate, useAdminData } from "../hooks/useAdminData";

const PAGE_SIZE = 8;

// One place for everything that depends on the action, so mode names can never drift apart.
const ACTIONS = {
  delete: {
    run: deleteProduct,
    title: "Delete product?",
    message: "The product will leave the storefront. Past orders keep their saved item names.",
    confirmLabel: "Delete",
    success: "Product deleted.",
  },
  activate: {
    run: activateProduct,
    title: "Activate product?",
    message: "The product will be visible in the shop again.",
    confirmLabel: "Activate",
    success: "Product activated.",
  },
  archive: {
    run: archiveProduct,
    title: "Archive product?",
    message: "Archived products stay in admin but are hidden from the shop.",
    confirmLabel: "Archive",
    success: "Product archived.",
  },
};

export default function ProductsPage() {
  const { products, categories } = useAdminData();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const result = (products || []).filter(Boolean).filter((product) => {
      const searchable = [product.title, product.sku, product.category, product.brand]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesQuery = !needle || searchable.includes(needle);
      const matchesCategory = category === "all" || product.category === category;
      const matchesStatus = status === "all" || product.status === status;
      return matchesQuery && matchesCategory && matchesStatus;
    });
    result.sort((a, b) => {
      if (sort === "price-asc") return (a.price || 0) - (b.price || 0);
      if (sort === "price-desc") return (b.price || 0) - (a.price || 0);
      if (sort === "stock") return (a.stock || 0) - (b.stock || 0);
      return String(a.title || "").localeCompare(String(b.title || ""));
    });
    return result;
  }, [products, query, category, status, sort]);

  const view = paginate(filtered, page, PAGE_SIZE);

  const action = pending ? ACTIONS[pending.mode] : null;

  async function confirmAction() {
    if (!pending || !action || busy) return;
    setBusy(true);
    try {
      const result = await action.run(pending.product.id);
      if (result?.ok === false) toast.error(result.message || "Could not update the product.");
      else toast.success(action.success);
    } catch {
      toast.error("Could not update the product.");
    } finally {
      setBusy(false);
      setPending(null);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        crumbs={[{ label: "Products" }]}
        title="Products"
        detail="Search, filter, and manage the same catalog the storefront uses."
        actions={<Link to="/admin/products/new" className={buttonClass}>Add product</Link>}
      />
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search name or SKU" className={inputClass} />
          <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} className={inputClass}>
            <option value="all">All categories</option>
            {(categories || []).filter(Boolean).map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
          </select>
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className={inputClass}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} className={inputClass}>
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
                    <img src={product.image} alt="" className="size-12 rounded-xl border border-slate-100 object-cover" />
                    <span>
                      <span className="block font-semibold text-slate-900">{product.title}</span>
                      <span className="text-xs text-slate-500">{product.sku}</span>
                    </span>
                  </span>
                ),
              },
              { key: "category", label: "Category" },
              { key: "price", label: "Price", render: (product) => formatPrice(product.price) },
              { key: "stock", label: "Stock" },
              { key: "status", label: "Status", render: (product) => <StatusBadge status={product.status} /> },
              {
                key: "actions",
                label: "",
                render: (product) => {
                  const isArchived = product.status === "archived";
                  return (
                    <span className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setPending({ product, mode: isArchived ? "activate" : "archive" });
                        }}
                        className={`cursor-pointer text-xs font-semibold ${isArchived ? "text-brand-600 hover:text-brand-700" : "text-slate-500 hover:text-brand-600"}`}
                      >
                        {isArchived ? "Activate" : "Archive"}
                      </button>
                      <button type="button" onClick={(event) => { event.stopPropagation(); setPending({ product, mode: "delete" }); }} className="cursor-pointer text-xs font-semibold text-red-600">Delete</button>
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
        title={action?.title ?? ""}
        message={action?.message ?? ""}
        confirmLabel={action?.confirmLabel ?? "Confirm"}
        onClose={() => setPending(null)}
        onConfirm={confirmAction}
      />
    </div>
  );
}