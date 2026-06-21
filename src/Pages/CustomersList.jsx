import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/layout/Topbar";
import adminApi from "../config/api";

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
};

const CustomersList = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [sortBy, setSortBy] = useState("createdAt_desc");

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError("");
      try {
        const [field, order] = sortBy.split("_");
        const response = await adminApi.get("users/all", {
          params: {
            q: searchQuery || undefined,
            role: roleFilter !== "All" ? roleFilter : undefined,
            sortBy: field,
            sortOrder: order
          }
        });

        setCustomers(response.data.users || []);
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Unable to load customers");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [searchQuery, roleFilter, sortBy]);

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this customer permanently?")) return;

    try {
      await adminApi.delete(`users/${userId}`);
      setCustomers((current) => current.filter((customer) => customer.id !== userId));
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Unable to delete customer");
    }
  };

  const stats = useMemo(() => {
    const total = customers.length;
    const withCart = customers.filter((customer) => Array.isArray(customer.cart) && customer.cart.length > 0).length;
    const admins = customers.filter((customer) => customer.role === "Admin").length;
    const customersCount = total - admins;

    return [
      { label: "Total Customers", value: total.toString() },
      { label: "Active Carts", value: withCart.toString() },
      { label: "Admins", value: admins.toString() },
      { label: "Shoppers", value: customersCount.toString() }
    ];
  }, [customers]);

  return (
    <>
      <Topbar variant="inventory" searchPlaceholder="Search customers, email or phone" />
      <section className="mt-6">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-4">
            <div className="rounded border border-stone-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-stone-600">Filters</h3>
              <div className="mt-3 space-y-3">
                <div className="flex flex-col">
                  <label className="text-xs text-stone-500">Role</label>
                  <select className="mt-1 rounded border border-stone-200 px-3 py-2 text-sm" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                    <option>All</option>
                    <option value="Customer">Customer</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-stone-500">Search</label>
                  <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name, email, phone" className="mt-1 w-full rounded border border-stone-200 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-stone-500">Sort</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="mt-1 w-full rounded border border-stone-200 px-3 py-2 text-sm">
                    <option value="createdAt_desc">Newest</option>
                    <option value="createdAt_asc">Oldest</option>
                    <option value="email_asc">Email A → Z</option>
                    <option value="email_desc">Email Z → A</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded border border-stone-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-stone-600">Quick Stats</h3>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded bg-stone-50 p-3 text-center">
                    <div className="text-xs text-stone-500">{stat.label}</div>
                    <div className="mt-1 text-lg font-bold">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">Customers</h1>
                <p className="text-sm text-stone-500">View and manage customer accounts, carts, and order history.</p>
              </div>
            </div>

            <div className="space-y-3">
              {loading && <div className="text-sm text-stone-500">Loading customers…</div>}
              {error && <div className="text-sm text-red-600">{error}</div>}

              <div className="grid gap-3">
                {customers.map((customer) => (
                  <article key={customer.id} className="flex flex-col gap-4 rounded border border-stone-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="grid gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="rounded bg-stone-100 px-2 py-1 text-xs font-semibold">{customer.id}</div>
                        <div className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{customer.role || "Customer"}</div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{customer.fullName || `${customer.firstName || ""} ${customer.lastName || ""}`.trim()}</div>
                        <div className="text-xs text-stone-500">{customer.email} · {customer.phone}</div>
                      </div>
                      <div className="text-xs text-stone-500">Joined {formatDate(customer.createdAt)}</div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="text-sm text-stone-600">Cart items: <span className="font-semibold">{customer.cart?.length || 0}</span></div>
                      <div className="flex flex-wrap gap-2">
                        <button className="rounded border border-stone-300 px-3 py-1 text-xs" onClick={() => navigate(`/customers/${customer.id}`)}>View</button>
                        <button className="rounded border border-red-300 px-3 py-1 text-xs text-red-700" onClick={() => handleDelete(customer.id)}>Delete</button>
                      </div>
                    </div>
                  </article>
                ))}
                {!customers.length && !loading && <div className="text-center text-stone-500 py-8">No customers found.</div>}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CustomersList;
