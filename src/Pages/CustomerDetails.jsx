import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Topbar from "../components/layout/Topbar";
import adminApi from "../config/api";
import ActionModal from "../components/ui/ActionModal";

const statusClass = (value) => {
  const map = {
    Placed: "bg-yellow-50 text-amber-700",
    Packed: "bg-sky-50 text-sky-700",
    Shipped: "bg-blue-50 text-blue-700",
    Delivered: "bg-emerald-50 text-emerald-700",
    Cancelled: "bg-red-50 text-red-700"
  };
  return map[value] || "bg-stone-100 text-stone-700";
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount || 0);
};

const CustomerDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Customer");
  const [modal,setModal] = useState({open:false , id : null , name:null , action : null})
  
  useEffect(() => {
    const fetchCustomer = async () => {
      if (!userId) return;
      setLoading(true);
      setError("");
      try {
        const response = await adminApi.get(`users/${userId}`);
        const { user, orders, cart } = response.data;
        setCustomer(user);
        setOrders(orders || []);
        setCart(cart || []);
        setFirstName(user.firstName || "");
        setLastName(user.lastName || "");
        setEmail(user.email || "");
        setPhone(user.phone || "");
        setRole(user.role || "Customer");
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Failed to load customer details");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [userId]);
  
  const handleSave = async () => {
    setError("");
    setSuccess("");
    try {
      const response = await adminApi.patch(`users/${userId}`, {
        firstName,
        lastName,
        phone,
        role,
        email
      });
      const updatedUser = response.data.user;
      setCustomer(updatedUser);
      setSuccess("Customer updated successfully.");
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Unable to update customer");
    }
    setModal({id:null , open:false , action : null , name : null})
  };
  
  
  const handleDelete = async(userId) => {
    try {
      
      await adminApi.delete(`users/${userId}`);
      
      navigate("/customers");
      
    } catch (err) {
      
      setError(err.response?.data?.error || err.message || "Unable to delete customer");
    }
    setModal({id:null , open:false , action : null , name : null})
  }
  return (
    <>
      <Topbar variant="inventory" searchPlaceholder="Search customers, orders or cart" />
      <section className="mt-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Customer Details</h1>
            <p className="text-sm text-stone-500">Manage the customer’s account, cart contents, and order history.</p>
          </div>
          <button className="rounded bg-black px-4 py-2 text-sm font-semibold text-white" onClick={() => navigate('/customers')}>Back to customers</button>
        </div>

        {error && <div className="mb-4 rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {success && <div className="mb-4 rounded border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <div className="rounded border border-stone-200 bg-white p-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Profile</h2>
                  <p className="text-sm text-stone-500">Customer identity and account settings.</p>
                </div>
                {customer?.createdAt && <div className="text-xs text-stone-500">Joined {formatDate(customer.createdAt)}</div>}
              </div>

              {loading && <div className="text-sm text-stone-500">Loading profile…</div>}

              {!loading && customer && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold uppercase text-stone-500">First Name</label>
                    <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-2 w-full rounded border border-stone-200 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-stone-500">Last Name</label>
                    <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-2 w-full rounded border border-stone-200 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-stone-500">Email</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded border border-stone-200 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-stone-500">Phone</label>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2 w-full rounded border border-stone-200 px-3 py-2 text-sm" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold uppercase text-stone-500">Role</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)} className="mt-2 w-full rounded border border-stone-200 px-3 py-2 text-sm">
                      <option value="Customer">Customer</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <button className="rounded bg-black px-4 py-2 text-sm font-semibold text-white" onClick={()=>setModal({open:true,id:userId,name:email , action : "confirm"})}>Save Changes</button>
                <button className="rounded border border-red-300 px-4 py-2 text-sm text-red-700" onClick={()=>setModal({open:true,id:userId,name:email , action : "Delete"})}>Delete Customer</button>
              </div>
            </div>

            <div className="rounded border border-stone-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold">Addresses</h2>
              <div className="grid gap-4">
                {customer?.addresses?.length ? (
                  customer.addresses.map((address) => (
                    <div key={address._id} className="rounded border border-stone-200 bg-stone-50 p-4">
                      <div className="text-sm font-semibold">{address.type} address</div>
                      <div className="mt-2 text-sm text-stone-600">{address.firstName} {address.lastName}</div>
                      <div className="text-sm text-stone-600">{address.address}, {address.city}, {address.state} {address.zip}</div>
                      <div className="text-sm text-stone-600">{address.country}</div>
                      <div className="text-sm text-stone-600">{address.mobile}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-stone-500">No addresses saved yet.</div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded border border-stone-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold">Cart Summary</h2>
              {cart.length ? (
                <div className="space-y-3">
                  {cart.map((item, index) => (
                    <div key={`${item.productId}-${index}`} className="flex items-center justify-between gap-4 rounded border border-stone-200 p-3">
                      <div>
                        <div className="text-sm font-semibold">{item.name || item.productId}</div>
                        <div className="text-xs text-stone-500">{item.variant || item.size} • Qty {item.quantity}</div>
                      </div>
                      <div className="text-sm text-stone-600">{item.price ? formatCurrency(item.price * (item.quantity || 1)) : "-"}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-stone-500">No items in the cart.</div>
              )}
            </div>

            <div className="rounded border border-stone-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold">Recent Orders</h2>
              {orders.length ? (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <button key={order.orderId} className="w-full text-left rounded border border-stone-200 p-3 transition hover:border-black" onClick={() => navigate(`/orders/${order.orderId}`)}>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold">Order {order.orderId}</div>
                          <div className="text-xs text-stone-500">{formatDate(order.createdAt)} • {formatCurrency(order.total)}</div>
                        </div>
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusClass(order.status)}`}>{order.status}</span>
                      </div>
                    </button>
                  ))}
                  {orders.length > 5 && <div className="text-sm text-stone-500">Showing latest 5 orders.</div>}
                </div>
              ) : (
                <div className="text-sm text-stone-500">No orders found for this customer.</div>
              )}
            </div>
          </div>
        </div>

          <ActionModal
        open={modal.open}
        title={`${modal.action === "Delete" ? "Delete Customer?" : "Save Changes?"}`}
        description={`Are you sure you want to ${modal.action === "Delete" ? "Delete Customer?" : "Save Changes? in"}  ${modal?.name}`}
        confirmText={`Type ${modal?.name} to confirm your action`}
        confirmLabel={modal.action}
        name={modal?.name}
        onCancel={() => setModal({ open: false, id: null , name:null , action:null })}
        onConfirm={() => {
          modal.action === "Delete" ? handleDelete(modal?.id) : handleSave()
        }}
      />
      </section>
    </>
  );
};

export default CustomerDetails;
