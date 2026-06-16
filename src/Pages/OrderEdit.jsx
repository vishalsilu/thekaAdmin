import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Topbar from "../components/layout/Topbar";
import adminApi from "../config/api";

const statusOptions = ["Placed", "Packed", "Shipped", "Delivered", "Cancelled"];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
};

const OrderEdit = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [formState, setFormState] = useState({ status: "Placed", paymentMethod: "cod", shippingAddress: {} });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await adminApi.get(`orders/admin/${orderId}`, { params: { fresh: true } });
        setOrder(response.data.order);
        setFormState({
          status: response.data.order.status || "Placed",
          paymentMethod: response.data.order.paymentMethod || "cod",
          shippingAddress: response.data.order.shippingAddress || {}
        });
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Unable to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleAddressChange = (field, value) => {
    setFormState((current) => ({
      ...current,
      shippingAddress: { ...current.shippingAddress, [field]: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await adminApi.patch(`orders/admin/${orderId}`, {
        status: formState.status,
        paymentMethod: formState.paymentMethod,
        shippingAddress: formState.shippingAddress
      });
      navigate(`/orders/${orderId}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Unable to save order");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading order…</div>;
  }

  if (error && !order) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  if (!order) {
    return <div className="p-6 text-stone-600">Order not found.</div>;
  }

  const subtotalAmount = order.subtotal || order.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

  return (
    <>
      <Topbar variant="inventory" searchPlaceholder="Search orders..." />
      <section className="mt-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.08em] text-stone-500">Order Management</p>
                <h1 className="text-3xl font-bold">Edit Order #{order.orderId}</h1>
                <p className="mt-1 text-sm text-stone-500">Placed on {new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <button className="rounded border border-stone-300 px-3 py-2 text-sm" onClick={() => navigate(`/orders/${order.orderId}`)}>Cancel</button>
                <button className="rounded bg-black px-3 py-2 text-sm font-semibold text-white" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
              </div>
            </div>

            <div className="rounded border border-stone-200 bg-white p-6">
              <h2 className="text-lg font-semibold">Shipping & Contact</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <input placeholder="First name" value={formState.shippingAddress.firstName || ''} onChange={(e) => handleAddressChange('firstName', e.target.value)} className="w-full rounded border border-stone-200 px-3 py-2 text-sm" />
                <input placeholder="Last name" value={formState.shippingAddress.lastName || ''} onChange={(e) => handleAddressChange('lastName', e.target.value)} className="w-full rounded border border-stone-200 px-3 py-2 text-sm" />
                <input placeholder="Street address" value={formState.shippingAddress.address || ''} onChange={(e) => handleAddressChange('address', e.target.value)} className="md:col-span-2 w-full rounded border border-stone-200 px-3 py-2 text-sm" />
                <input placeholder="Apartment" value={formState.shippingAddress.apartment || ''} onChange={(e) => handleAddressChange('apartment', e.target.value)} className="w-full rounded border border-stone-200 px-3 py-2 text-sm" />
                <input placeholder="City" value={formState.shippingAddress.city || ''} onChange={(e) => handleAddressChange('city', e.target.value)} className="w-full rounded border border-stone-200 px-3 py-2 text-sm" />
                <input placeholder="State" value={formState.shippingAddress.state || ''} onChange={(e) => handleAddressChange('state', e.target.value)} className="w-full rounded border border-stone-200 px-3 py-2 text-sm" />
                <input placeholder="Zip" value={formState.shippingAddress.zip || ''} onChange={(e) => handleAddressChange('zip', e.target.value)} className="w-full rounded border border-stone-200 px-3 py-2 text-sm" />
                <input placeholder="Country" value={formState.shippingAddress.country || ''} onChange={(e) => handleAddressChange('country', e.target.value)} className="w-full rounded border border-stone-200 px-3 py-2 text-sm" />
                <input placeholder="Mobile" value={formState.shippingAddress.mobile || ''} onChange={(e) => handleAddressChange('mobile', e.target.value)} className="w-full rounded border border-stone-200 px-3 py-2 text-sm" />
                <select value={formState.status} onChange={(e) => setFormState((c) => ({ ...c, status: e.target.value }))} className="w-full rounded border border-stone-200 px-3 py-2 text-sm">
                  {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={formState.paymentMethod} onChange={(e) => setFormState((c) => ({ ...c, paymentMethod: e.target.value }))} className="w-full rounded border border-stone-200 px-3 py-2 text-sm">
                  <option value="cod">Cash on Delivery</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                </select>
              </div>
            </div>

            <div className="rounded border border-stone-200 bg-white p-6">
              <h2 className="text-lg font-semibold">Order Items</h2>
              <div className="mt-4 space-y-4">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 overflow-hidden rounded bg-stone-100"><img src={item.thumbnail} className="h-full w-full object-cover" alt="" /></div>
                      <div>
                        <div className="text-sm font-semibold">{item.name}</div>
                        <div className="text-xs text-stone-500">{item.variant || ''} {item.size ? `• ${item.size}` : ''}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-stone-500">Qty: {item.quantity}</div>
                      <div className="text-lg font-bold">{formatCurrency(item.price)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-end gap-4 border-t border-stone-100 pt-4">
                <div className="text-sm text-stone-500">Subtotal</div>
                <div className="text-xl font-bold">{formatCurrency(subtotalAmount)}</div>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            {error && <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
            <div className="rounded border border-stone-200 bg-white p-4">
              <h3 className="text-sm font-semibold">Admin Actions</h3>
              <div className="mt-3 flex flex-col gap-2">
                <button className="w-full rounded border border-red-300 px-3 py-2 text-sm text-red-700" onClick={() => navigate(`/orders/${order.orderId}/refund`)}>Issue Refund</button>
                <button className="w-full rounded border border-stone-300 px-3 py-2 text-sm" onClick={() => navigate(`/orders/${order.orderId}/invoice`)}>View Invoice</button>
              </div>
            </div>

            <div className="rounded border border-stone-200 bg-white p-4">
              <h3 className="text-sm font-semibold">Activity</h3>
              <div className="mt-2 text-sm text-stone-600">
                <div>Last updated: {new Date(order.updatedAt).toLocaleString()}</div>
                <div className="mt-1">Status: <strong>{order.status}</strong></div>
                <div>Payment: <strong>{order.paymentMethod?.toUpperCase() || 'COD'}</strong></div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
};

export default OrderEdit;
