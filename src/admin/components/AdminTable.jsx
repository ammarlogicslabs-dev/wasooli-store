export default function AdminTable({ columns, rows, rowKey, onRowClick, empty = "Nothing to show yet." }) {
  // Drop empty/null entries so rowKey and render callbacks never read a property of null.
  const safeRows = (rows || []).filter(Boolean);

  return (
    <div className="overflow-x-auto">
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
          ) : safeRows.map((row, index) => (
            <tr
              key={(rowKey ? rowKey(row) : undefined) ?? index}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`border-t border-slate-100 ${onRowClick ? "cursor-pointer hover:bg-brand-50/40" : ""}`}
            >
              {columns.map((column) => (
                <td key={column.key} className="px-3 py-3 align-middle text-slate-700">
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}