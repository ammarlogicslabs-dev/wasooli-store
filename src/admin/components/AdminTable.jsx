export default function AdminTable({ columns, rows, rowKey, onRowClick, rowClassName, empty = "Nothing to show yet." }) {
  // Drop empty/null entries so rowKey and render callbacks never read a property of null.
  const safeRows = (rows || []).filter(Boolean);

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="text-[11px] uppercase tracking-wide text-slate-400">
            {columns.map((column) => (
              <th key={column.key} className="px-3 py-2 font-semibold">{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeRows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-12 text-center text-sm text-slate-500">{empty}</td>
            </tr>
          ) : safeRows.map((row, index) => {
            const customClass = typeof rowClassName === "function" ? rowClassName(row) : (rowClassName || "");
            const isClickable = Boolean(onRowClick);
            const cursorClass = isClickable ? "cursor-pointer" : "";
            const hoverClass = customClass ? "" : (isClickable ? "hover:bg-brand-50/40" : "");

            return (
              <tr
                key={(rowKey ? rowKey(row) : undefined) ?? index}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-t border-slate-100 transition-colors ${cursorClass} ${customClass} ${hoverClass}`.trim()}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-3 py-3 align-middle text-slate-700">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}