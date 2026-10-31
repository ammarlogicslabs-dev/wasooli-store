import { useState } from "react";
import { Plus } from "lucide-react";
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

  // Ignore any empty/null entries so rowKey and the table never read `.id` of null.
  const rows = (categories || []).filter(Boolean);

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
    const result = await deleteCategory(pendingDelete.id);
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
        <AdminTable
          rows={rows}
          rowKey={(category) => category.id}
          empty="No categories yet."
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
              label: "",
              render: (category) => (
                <span className="flex justify-end gap-3">
                  <button type="button" onClick={() => { setError(""); setForm(category); }} className="cursor-pointer text-xs font-semibold text-brand-600">Edit</button>
                  <button type="button" onClick={async () => {
                    const result = await saveCategory({ ...category, status: category.status === "archived" ? "active" : "archived" });
                    if (!result.ok) toast.error(result.message);
                    else toast.success("Category updated.");
                  }} className="cursor-pointer text-xs font-semibold text-slate-500">
                    {category.status === "archived" ? "Restore" : "Archive"}
                  </button>
                  <button type="button" onClick={() => setPendingDelete(category)} className="cursor-pointer text-xs font-semibold text-red-600">Delete</button>
                </span>
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