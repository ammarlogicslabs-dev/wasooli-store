import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../../data/product";
import AdminPagination from "../components/AdminPagination";
import AdminTable from "../components/AdminTable";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { inputClass } from "../components/formStyles";
import { paginate, useAdminData } from "../hooks/useAdminData";

export default function CustomersPage() {
  const { customers } = useAdminData();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [ordersFilter, setOrdersFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return customers.filter((customer) => {
      const matchesQuery = !needle || [customer.name, customer.email, customer.phone, customer.city].join(" ").toLowerCase().includes(needle);
      const matchesOrders = ordersFilter === "all"
        || (ordersFilter === "with-orders" && customer.orders > 0)
        || (ordersFilter === "none" && customer.orders === 0);
      return matchesQuery && matchesOrders;
    });
  }, [customers, query, ordersFilter]);
  const view = paginate(filtered, page, 8);

  return (
    <div className="space-y-5">
      <PageHeader crumbs={[{ label: "Customers" }]} title="Customers" detail="Customers from the API. Inactive keeps the record." />
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search name, phone, or city" className={inputClass} />
          <select value={ordersFilter} onChange={(event) => { setOrdersFilter(event.target.value); setPage(1); }} className={inputClass}>
            <option value="all">Any order count</option>
            <option value="with-orders">Has orders</option>
            <option value="none">No orders</option>
          </select>
        </div>
        <div className="mt-4">
          <AdminTable
            rows={view.items}
            rowKey={(customer) => customer.key}
            onRowClick={(customer) => navigate(`/admin/customers/${encodeURIComponent(customer.key)}`)}
            empty="No customers match this search."
            columns={[
              { key: "name", label: "Customer", render: (customer) => <span className="font-semibold text-slate-900">{customer.name}<span className="mt-0.5 block text-xs font-normal text-slate-500">{customer.email || customer.phone || "No contact saved"}</span></span> },
              { key: "city", label: "City", render: (customer) => customer.city || "—" },
              { key: "orders", label: "Orders" },
              { key: "spent", label: "Spent", render: (customer) => formatPrice(customer.spent || 0) },
              { key: "status", label: "Status", render: (customer) => <StatusBadge status={customer.status === "inactive" ? "inactive" : "active"}>{customer.status}</StatusBadge> },
            ]}
          />
          <AdminPagination page={view.page} pages={view.pages} total={view.total} onPage={setPage} />
        </div>
      </section>
    </div>
  );
}
