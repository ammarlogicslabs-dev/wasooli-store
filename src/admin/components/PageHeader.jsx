import { Link } from "react-router-dom";

export default function PageHeader({ crumbs = [], title, detail, actions }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400">
          <Link to="/admin" className="hover:text-brand-600">Admin</Link>
          {crumbs.map((crumb) => (
            <span key={crumb.label} className="flex items-center gap-2">
              <span>/</span>
              {crumb.to ? <Link to={crumb.to} className="hover:text-brand-600">{crumb.label}</Link> : <span className="text-slate-700">{crumb.label}</span>}
            </span>
          ))}
        </nav>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {detail ? <p className="mt-1 text-sm text-slate-500">{detail}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
