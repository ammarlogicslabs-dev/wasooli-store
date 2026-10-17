import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminPagination({ page, pages, total, onPage }) {
  if (total === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-3 py-3 text-sm text-slate-500">
      <p>{total} records · page {page} of {pages}</p>
      <div className="flex items-center gap-2">
        <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} className="grid size-9 cursor-pointer place-items-center rounded-xl border border-slate-200 disabled:cursor-not-allowed disabled:opacity-40">
          <ChevronLeft size={16} />
        </button>
        <button type="button" disabled={page >= pages} onClick={() => onPage(page + 1)} className="grid size-9 cursor-pointer place-items-center rounded-xl border border-slate-200 disabled:cursor-not-allowed disabled:opacity-40">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
