import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { formatPrice } from "../../data/product";
import { ordersForCustomer, setCustomerStatus } from "../../services/storage/adminDataService";
import { statusLabel } from "../../services/storage/orderStatus";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { quietButtonClass } from "../components/formStyles";
import { useAdminData } from "../hooks/useAdminData";

export default function CustomerDetailsPage() {
  const { key } = useParams();
  const { customers, orders: allOrders } = useAdminData();
  const customer = customers.find((item) => item.key === decodeURIComponent(key));

  if (!customer) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
        <p className="font-semibold text-slate-900">Customer not found.</p>
        <Link to="/admin/customers" className="mt-3 inline-flex text-sm font-semibold text-brand-600">Back to customers</Link>
      </div>
    );
  }

  const orders = ordersForCustomer(customer, allOrders);
  const nextStatus = customer.status === "inactive" ? "active" : "inactive";

  return (
    <div className="space-y-5">
      <PageHeader
        crumbs={[{ label: "Customers", to: "/admin/customers" }, { label: customer.name }]}
        title={customer.name}
        detail="Contact details and the orders tied to this phone number."
        actions={(
          <button
            type="button"
            className={quietButtonClass}
            onClick={async () => {
              const result = await setCustomerStatus(customer.key, nextStatus);
              if (!result.ok) toast.error(result.message || "Could not update customer.");
              else toast.success(nextStatus === "inactive" ? "Customer marked inactive." : "Customer restored.");
            }}
          >
            {nextStatus === "inactive" ? "Mark inactive" : "Mark active"}
          </button>
        )}
      />
      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Phone", customer.phone || "—"],
          ["Email", customer.email || "—"],
          ["Address", [customer.address, customer.city].filter(Boolean).join(", ") || "—"],
        ].map(([label, value]) => (
          <article key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 font-semibold text-slate-900">{value}</p>
          </article>
        ))}
      </section>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Order history</h2>
          <p className="text-sm font-semibold text-slate-900">{formatPrice(customer.spent || 0)} spent</p>
        </div>
        {orders.length === 0 ? <p className="mt-4 text-sm text-slate-500">This customer has no saved orders yet.</p> : (
          <ul className="mt-3 divide-y divide-slate-100">
            {orders.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <Link to={`/admin/orders/${encodeURIComponent(order.id)}`} className="text-sm font-semibold text-slate-900 hover:text-brand-600">{order.delivery?.city || "Order"} · {formatPrice(order.total || 0)}</Link>
                  <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString("en-PK")}</p>
                </div>
                <StatusBadge status={order.adminStatus || "pending"}>{statusLabel(order.adminStatus || "pending")}</StatusBadge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
