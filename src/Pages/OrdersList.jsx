import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/layout/Topbar";
import adminApi from "../config/api";

const statusClass = (value) => {
  const map = {
    "Pending Payment": "bg-stone-100 text-stone-600 border border-stone-200", // Style for drafts
    Placed: "bg-yellow-50 text-amber-700",
    Packed: "bg-sky-50 text-sky-700",
    Shipped: "bg-blue-50 text-blue-700",
    Delivered: "bg-emerald-50 text-emerald-700",
    Cancelled: "bg-red-50 text-red-700"
  };
  return map[value] || "bg-stone-100 text-stone-700";
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
};

const OrdersList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("createdAt_desc");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const [field, order] = sortBy.split("_");
        const response = await adminApi.get("orders/admin/all", {
          params: {
            status: statusFilter !== "All" ? statusFilter : undefined,
            q: searchQuery || undefined,
            sortBy: field,
            sortOrder: order
          }
        });

        setOrders(response.data.orders || []);
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Unable to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter, searchQuery, sortBy]);

  const handleDelete = async (orderIdToDelete) => {
    if (!window.confirm("Delete this order permanently?")) return;
    try {
      await adminApi.delete(`orders/admin/${orderIdToDelete}`);
      setOrders((current) => current.filter((order) => order.orderId !== orderIdToDelete));
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Unable to delete order");
    }
  };

  const stats = useMemo(() => {
    const total = orders.length;
    // Count drafts (abandoned checkouts)
    const drafts = orders.filter((order) => order.isDraft || order.status === "Pending Payment").length;
    const placed = orders.filter((order) => order.status === "Placed").length;
    const delivered = orders.filter((order) => order.status === "Delivered").length;
    
    // IMPORTANT: Exclude drafts and cancelled orders from actual revenue
    const revenue = orders
      .filter((order) => !order.isDraft && order.status !== "Pending Payment" && order.status !== "Cancelled")
      .reduce((sum, order) => sum + Number(order.total || 0), 0);

    return [
      { label: "Total Orders", value: total.toString() },
      { label: "Drafts (Unpaid)", value: drafts.toString() },
      { label: "Placed (Paid)", value: placed.toString() },
      { label: "Revenue", value: formatCurrency(revenue) }
    ];
  }, [orders]);

  return (
    <>
      <Topbar variant="inventory" searchPlaceholder="Search orders, customers, or items..." />
      <section className="mt-6">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Left panel: filters & quick stats */}
          <aside className="space-y-4">
            <div className="rounded border border-stone-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-stone-600">Filters</h3>
              <div className="mt-3 space-y-3">
                <div className="flex flex-col">
                  <label className="text-xs text-stone-500">Status</label>
                  <select className="mt-1 rounded border border-stone-200 px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="All">All Orders</option>
                    <option value="Pending Payment">Draft / Pending Payment</option>
                    <option value="Placed">Placed</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-stone-500">Search</label>
                  <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Order ID, customer or item" className="mt-1 w-full rounded border border-stone-200 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-stone-500">Sort</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="mt-1 w-full rounded border border-stone-200 px-3 py-2 text-sm">
                    <option value="createdAt_desc">Newest</option>
                    <option value="createdAt_asc">Oldest</option>
                    <option value="total_desc">Highest Total</option>
                    <option value="total_asc">Lowest Total</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded border border-stone-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-stone-600">Quick Stats</h3>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {stats.map(s => (
                  <div key={s.label} className="rounded bg-stone-50 p-3 text-center">
                    <div className="text-xs text-stone-500">{s.label}</div>
                    <div className="mt-1 text-lg font-bold">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Right panel: orders list */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">Orders</h1>
                <p className="text-sm text-stone-500">Manage and process customer orders efficiently.</p>
              </div>
            </div> 

            <div className="space-y-3">
              {loading && <div className="text-sm text-stone-500">Loading orders…</div>}
              {error && <div className="text-sm text-red-600">{error}</div>}

              <div className="grid gap-3">
                {orders.map((o) => (
                  <article key={o.orderId} className={`flex items-center justify-between gap-4 rounded border p-4 transition-shadow hover:shadow-sm ${o.isDraft ? 'border-dashed border-stone-300 bg-stone-50/50' : 'border-stone-200 bg-white'}`}>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="rounded bg-stone-100 px-3 py-2 text-sm font-semibold">#{o.orderId}</div>
                        {/* Show a red 'DRAFT' tag if the order is incomplete */}
                        {o.isDraft && (
                          <span className="text-[10px] font-bold tracking-wider text-stone-400">DRAFT</span>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{(o.shippingAddress?.firstName || o.userId) + (o.shippingAddress?.lastName ? ' ' + o.shippingAddress.lastName : '')}</div>
                        <div className="text-xs text-stone-500">{new Date(o.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div><span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusClass(o.status)}`}>{o.status}</span></div>
                      
                      {/* Grey out the total if it's an unpaid draft */}
                      <div className={`text-sm font-semibold ${o.isDraft ? 'text-stone-400' : 'text-stone-900'}`}>
                        {formatCurrency(o.total)}
                      </div>
                      
                      <div className="flex gap-2">
                        <button className="rounded border border-stone-300 px-3 py-1 text-xs hover:bg-stone-50" onClick={() => navigate(`/orders/${o.orderId}`)}>View</button>
                        <button className="rounded border border-stone-300 px-3 py-1 text-xs hover:bg-stone-50" onClick={() => navigate(`/orders/${o.orderId}/edit`)}>Edit</button>
                        <button className="rounded border border-red-200 bg-red-50 px-3 py-1 text-xs text-red-600 hover:bg-red-100 hover:border-red-300" onClick={() => handleDelete(o.orderId)}>Delete</button>
                      </div>
                    </div>
                  </article>
                ))}
                {!orders.length && !loading && (
                  <div className="rounded border border-dashed border-stone-300 p-8 text-center text-stone-500">
                    No orders match your current filters.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default OrdersList;