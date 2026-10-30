import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  Edit2,
  Loader2,
  Plus,
  Search,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import AdminModal from "../components/AdminModal";
import AdminTable from "../components/AdminTable";
import ConfirmDialog from "../components/ConfirmDialog";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { buttonClass, inputClass, quietButtonClass } from "../components/formStyles";
import { useAdminData } from "../hooks/useAdminData";
import {
  deleteFaq,
  FAQ_CATEGORIES,
  saveFaq,
  toggleFaqStatus,
} from "../../services/storage/faqService";

const EMPTY_FAQ = {
  question: "",
  answer: "",
  category: "General",
  status: "published",
  order: 10,
};

export default function FaqsPage() {
  const { faqs = [] } = useAdminData();
  const [form, setForm] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Summary stats
  const stats = useMemo(() => {
    const total = faqs.length;
    const published = faqs.filter((f) => f.status === "published").length;
    const drafts = faqs.filter((f) => f.status === "draft").length;
    const pinned = faqs.filter((f) => f.pinned).length;
    return { total, published, drafts, pinned };
  }, [faqs]);

  // Filtered rows
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      if (selectedCategory !== "All" && faq.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      if (selectedStatus !== "all" && faq.status !== selectedStatus) {
        return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return (
          faq.question?.toLowerCase().includes(q) ||
          faq.answer?.toLowerCase().includes(q) ||
          faq.category?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [faqs, selectedCategory, selectedStatus, search]);

  async function handleSave(event) {
    event.preventDefault();
    if (!form || saving) return;
    setSaving(true);
    const result = await saveFaq(form);
    setSaving(false);
    if (!result.ok) {
      toast.error(result.message || "Could not save FAQ.");
      return;
    }
    toast.success(form.id ? "FAQ updated successfully." : "New FAQ created.");
    setForm(null);
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    const result = await deleteFaq(pendingDelete.id);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success("FAQ deleted.");
    setPendingDelete(null);
  }

  async function handleToggleStatus(faq) {
    const result = await toggleFaqStatus(faq.id);
    if (result.ok) {
      toast.success(result.status === "published" ? "FAQ published." : "FAQ moved to draft.");
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        crumbs={[{ label: "Support & FAQs" }]}
        title="Manage FAQs"
        detail="Add, edit, and organize frequently asked questions shown on the customer care FAQs page."
        actions={
          <button
            type="button"
            onClick={() => setForm({ ...EMPTY_FAQ, order: faqs.length + 1 })}
            className={buttonClass}
          >
            <Plus size={16} />
            <span>Add FAQ</span>
          </button>
        }
      />

      {/* Quick Summary Stat Badges */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500">Total Questions</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500">Published</p>
          <p className="mt-1 text-2xl font-black text-emerald-600">{stats.published}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500">Drafts</p>
          <p className="mt-1 text-2xl font-black text-amber-600">{stats.drafts}</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions or keywords..."
            className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-xs font-medium text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-brand-500"
          >
            {FAQ_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Categories" : cat}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-brand-500"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* FAQs Admin Table */}
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <AdminTable
          rows={filteredFaqs}
          rowKey={(faq) => faq.id}
          empty="No FAQs match your search or filters."
          columns={[
            {
              key: "question",
              label: "Question & Answer Preview",
              render: (faq) => (
                <div className="max-w-md py-1">
                  <span className="font-bold text-slate-900 line-clamp-1">{faq.question}</span>
                  <p className="mt-0.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ),
            },
            {
              key: "category",
              label: "Category",
              render: (faq) => (
                <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {faq.category || "General"}
                </span>
              ),
            },
            {
              key: "order",
              label: "Order",
              render: (faq) => <span className="font-mono text-xs text-slate-500">{faq.order ?? "—"}</span>,
            },
            {
              key: "status",
              label: "Status",
              render: (faq) => (
                <StatusBadge
                  status={faq.status === "published" ? "active" : "draft"}
                  label={faq.status === "published" ? "Published" : "Draft"}
                />
              ),
            },
            {
              key: "actions",
              label: "Actions",
              render: (faq) => (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(faq)}
                    title={faq.status === "published" ? "Set to draft" : "Publish on website"}
                    className="grid size-8 cursor-pointer place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-brand-500 hover:text-brand-600"
                  >
                    {faq.status === "published" ? <Eye size={14} className="text-emerald-600" /> : <EyeOff size={14} className="text-amber-600" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...faq })}
                    title="Edit FAQ"
                    className="grid size-8 cursor-pointer place-items-center rounded-lg border border-slate-200 text-slate-600 hover:border-brand-500 hover:text-brand-600"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(faq)}
                    title="Delete FAQ"
                    className="grid size-8 cursor-pointer place-items-center rounded-lg border border-slate-200 text-slate-400 hover:border-red-500 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ),
            },
          ]}
        />
      </section>

      {/* Add / Edit FAQ Modal */}
      <AdminModal
        open={Boolean(form)}
        title={form?.id ? "Edit FAQ" : "Add FAQ Question"}
        onClose={() => setForm(null)}
        wide
      >
        {form && (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800">
                Question <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder="e.g. Do you deliver Cat6 cables nationwide in Pakistan?"
                className={`${inputClass} mt-1`}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-slate-800">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={`${inputClass} mt-1`}
                >
                  {FAQ_CATEGORIES.filter((c) => c !== "All").map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className={`${inputClass} mt-1`}
                >
                  <option value="published">Published (Visible on site)</option>
                  <option value="draft">Draft (Hidden)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800">
                  Display Order
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) || 1 })}
                  className={`${inputClass} mt-1`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800">
                Detailed Answer <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                placeholder="Write clear, comprehensive guidance for customers..."
                className={`${inputClass} mt-1`}
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setForm(null)}
                className={quietButtonClass}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className={buttonClass}
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save FAQ</span>
                )}
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete FAQ"
        message={`Are you sure you want to delete "${pendingDelete?.question}"? This will remove it from the customer care FAQs page.`}
        confirmLabel="Delete FAQ"
        tone="danger"
        onConfirm={handleDelete}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
