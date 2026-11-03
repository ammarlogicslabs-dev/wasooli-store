import { useMemo, useState } from "react";
import { Archive, ArchiveRestore, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import { deleteCategory, saveCategory } from "../../services/storage/adminDataService";
import { resolveMediaUrl } from "../../utils/mediaUrl";
import AdminModal from "../components/AdminModal";
import AdminTable from "../components/AdminTable";
import ConfirmDialog from "../components/ConfirmDialog";
import ImagePicker from "../components/ImagePicker";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { buttonClass, inputClass } from "../components/formStyles";
import { useAdminData } from "../hooks/useAdminData";

const EMPTY = { name: "", description: "", image: "", status: "active" };

export default function CategoriesPage() {
  const { categories } = useAdminData();
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Ignore any empty/null entries so rowKey and the table never read `.id` of null.
  const rows = (categories || []).filter(Boolean);

  const filteredRows = useMemo(() => {
    return rows.filter((category) => {
      if (statusFilter !== "all" && category.status !== statusFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const name = String(category.name || "").toLowerCase();
        if (!name.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [rows, search, statusFilter]);

  function openCreate() {
    setError("");
    setForm(EMPTY);
  }

  async function handleSave(event) {
    event.preventDefault();
    if (!form) return;
    const result = await saveCategory(form);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    toast.success("Category saved.");
    setForm(null);
  }

  async function handleDelete() {
    // The dialog can call this while nothing is selected, so guard against null.
    if (!pendingDelete) return;
    const result = await deleteCategory(pendingDelete);
    if (!result.ok) toast.error(result.message);
    else toast.success("Category deleted.");
    setPendingDelete(null);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        crumbs={[{ label: "Categories" }]}
        title="Categories"
        detail="Linked products are kept when a category is archived."
        actions={
          <button type="button" onClick={openCreate} className={buttonClass}>
            <Plus size={16} />
            <span>Add category</span>
          </button>
        }
      />
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by category name"
              className={`${inputClass} pl-10 pr-9`}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={15} />
              </button>
            )}
          </div>
          <div className="w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={inputClass}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <AdminTable
          rows={filteredRows}
          rowKey={(category) => category.id}
          empty={search || statusFilter !== "all" ? "No categories match your search." : "No categories yet."}
          columns={[
            {
              key: "name",
              label: "Category",
              render: (category) => (
                <span className="flex items-center gap-3">
                  {category.image ? <img src={resolveMediaUrl(category.image)} alt="" className="size-12 rounded-xl object-cover" /> : <span className="grid size-12 place-items-center rounded-xl bg-slate-100 text-xs text-slate-400">None</span>}
                  <span>
                    <span className="block font-semibold text-slate-900">{category.name}</span>
                    {/* <span className="text-xs text-slate-500">{category.slug}</span> */}
                  </span>
                  </span>
                ),
              },
            { key: "productCount", label: "Products" },
            { key: "status", label: "Status", render: (category) => <StatusBadge status={category.status} /> },
            {
              key: "actions",
              label: "Actions",
              render: (category) => (
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setForm(category);
                    }}
                    title="Edit category"
                    aria-label="Edit category"
                    className="grid size-8 cursor-pointer place-items-center rounded-lg border border-brand-500/50 bg-brand-50/50 text-brand-600 shadow-2xs transition hover:border-brand-500 hover:bg-brand-200/50 hover:text-brand-600"
                  >
                    <Pencil size={14} />
                  </button>
                  <button type="button" onClick={async () => {
                    const result = await saveCategory({ ...category, status: category.status === "archived" ? "active" : "archived" });
                    if (!result.ok) toast.error(result.message);
                    else toast.success("Category updated.");
                  }}
                    title={category.status === "archived" ? "Restore category" : "Archive category"}
                    aria-label={category.status === "archived" ? "Restore category" : "Archive category"}
                    className={`grid size-8 cursor-pointer place-items-center rounded-lg border border-amber-200 bg-amber-50/50 shadow-2xs transition ${
                      category.status === "archived"
                        ? "text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50"
                        : "text-amber-400 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-600"
                    }`}
                  >
                    {category.status === "archived" ? (
                      <ArchiveRestore size={14} />
                    ) : (
                      <Archive size={14} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(category)}
                    title="Delete category"
                    aria-label="Delete category"
                    className="grid size-8 cursor-pointer place-items-center rounded-lg border border-red-200/50 bg-red-100/50 text-red-400 shadow-2xs transition hover:border-red-400 hover:bg-red-200/50 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ),
            },
          ]}
        />
      </section>
      <AdminModal open={Boolean(form)} title={form?.id ? "Edit category" : "Add category"} onClose={() => setForm(null)}>
        {form && (
          <form onSubmit={handleSave} className="space-y-3">
            <label className="block text-sm font-semibold text-slate-900">
              Name
              <input value={form.name ?? ""} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Wireless & Wi-Fi Gear" className={`${inputClass} mt-1.5`} />
            </label>
            <label className="block text-sm font-semibold text-slate-900">
              Description
              <textarea value={form.description ?? ""} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Brief description of products in this category..." className={`${inputClass} mt-1.5`} rows={3} />
            </label>
            <div>
              <p className="mb-1.5 text-sm font-semibold text-slate-900">Image</p>
              <ImagePicker
                value={form.image}
                onChange={(image) => setForm({ ...form, image })}
                label="Select category image"
                previewClassName="h-48 w-full object-cover"
                emptyClassName="h-48"
              />
            </div>
            {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
            <button type="submit" className={buttonClass}>Save category</button>
          </form>
        )}
      </AdminModal>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete category?"
        message="This only works when no products are still assigned to it. Products are never deleted from here."
        confirmLabel="Delete"
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}