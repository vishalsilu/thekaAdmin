import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Topbar from "../components/layout/Topbar";
import adminApi from "../config/api";

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

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount || 0);
};

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newStatus, setNewStatus] = useState('');
  const [newLocation, setNewLocation] = useState('');

  // Fetch order helper (call after changes)
  const fetchOrder = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await adminApi.get(`orders/admin/${orderId}`, { params: { fresh: true } });
      setOrder(response.data.order);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Unable to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [orderId]);

  const billingTotal = useMemo(() => order ? formatCurrency(order.total) : "", [order]);
  const subtotal = useMemo(() => order ? formatCurrency(order.subtotal) : "", [order]);
  const shipping = useMemo(() => order ? formatCurrency(order.shipping) : "", [order]);
  const tax = useMemo(() => order ? formatCurrency(order.tax) : "", [order]);

  if (loading) {
    return <div className="p-6">Loading order details…</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  if (!order) {
    return <div className="p-6 text-stone-600">Order not found.</div>;
  }

  const customerName = `${order.shippingAddress?.firstName || ""} ${order.shippingAddress?.lastName || ""}`.trim();
  const addressLines = [
    order.shippingAddress?.address,
    order.shippingAddress?.apartment,
    `${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""} ${order.shippingAddress?.zip || ""}`.trim(),
    order.shippingAddress?.country,
    `Mobile: ${order.shippingAddress?.mobile || "N/A"}`
  ].filter(Boolean).join("\n");

  return (
    <>
      <Topbar variant="inventory" searchPlaceholder="Search orders..." />
      <section className="mt-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <main>
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-sm uppercase tracking-[0.08em] text-stone-500">Orders</p>
                <h1 className="text-3xl font-bold">Order #{order.orderId}</h1>
                <p className="text-sm text-stone-500 mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
                <div className="mt-3"><span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusClass(order.status)}`}>{order.status}</span></div>
              </div>
              <div className="flex gap-2">
                <button className="rounded border border-stone-300 px-3 py-2 text-sm" onClick={() => navigate(`/orders/${order.orderId}/invoice`)}>Print Invoice</button>
                <button className="rounded border border-stone-300 px-3 py-2 text-sm" onClick={() => navigate(`/orders/${order.orderId}/edit`)}>Edit</button>
                <button className="rounded border border-red-300 px-3 py-2 text-sm text-red-700" onClick={() => navigate(`/orders/${order.orderId}/refund`)}>Refund</button>
              </div>
            </div>

            <div className="rounded border border-stone-200 bg-white p-6 mb-6">
              <h2 className="text-lg font-semibold">Items ({order.items.length})</h2>
              <div className="mt-4 space-y-4">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 overflow-hidden rounded bg-stone-100"><img src={item.thumbnail} className="h-full w-full object-cover" alt="" /></div>
                      <div>
                        <div className="text-sm font-semibold">{item.name}</div>
                        <div className="text-xs text-stone-500">{item.variant || ''}{item.size ? ` • ${item.size}` : ''}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-stone-500">Qty: {item.quantity}</div>
                      <div className="text-lg font-bold">{formatCurrency(item.price)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded border border-stone-200 bg-white p-6">
              <h2 className="text-lg font-semibold">Order Timeline</h2>
              <div className="mt-4 space-y-4">
                {order.tracking?.map((event, idx) => (
                  <div key={`${event.status}-${idx}`} className="flex gap-3 items-start">
                    <div className="mt-1 h-3 w-3 rounded-full bg-black" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{event.status}</div>
                        <div className="text-xs text-stone-500">{event.date}{event.location ? ` · ${event.location}` : ''}</div>
                      </div>
                      {event.note ? <div className="mt-1 text-sm text-stone-600">{event.note}</div> : null}
                    </div>
                  </div>
                ))}

                {!order.tracking?.length && <div className="text-sm text-stone-500">No tracking events yet</div>}

                <div className="mt-4 border-t border-stone-100 pt-4">
                  <div className="text-sm font-semibold text-stone-600">Add status update</div>
                  <div className="mt-3 flex gap-2">
                    <select className="rounded border border-stone-200 px-3 py-2 text-sm" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                      <option value="">Select status</option>
                      <option value="Placed">Placed</option>
                      <option value="Booked">Booked</option>
                      <option value="Packed">Packed</option>
                      <option value="Reached">Reached</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <input className="flex-1 rounded border border-stone-200 px-3 py-2 text-sm" placeholder="Location (optional)" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} />
                    <button className="rounded bg-black px-3 py-2 text-sm font-semibold text-white" disabled={!newStatus} onClick={async () => {
                      try {
                        await adminApi.patch(`orders/admin/${order.orderId}/status`, { status: newStatus, location: newLocation });
                        setNewStatus(''); setNewLocation('');
                        await fetchOrder();
                      } catch (err) {
                        alert(err.response?.data?.error || err.message || 'Failed to add status');
                      }
                    }}>Add</button>
                  </div>
                </div>
              </div>
            </div>
          </main>

          <aside className="space-y-4">
            <div className="rounded border border-stone-200 bg-white p-4">
              <h3 className="text-sm font-semibold">Customer</h3>
              <div className="mt-2">
                <div className="text-lg font-semibold">{customerName || order.userId}</div>
                <div className="text-sm text-stone-500">{order.paymentMethod?.toUpperCase() || 'COD'}</div>
                <div className="text-sm text-stone-500 mt-1">{order.shippingAddress?.mobile || 'No mobile'}</div>
              </div>
            </div>

            {order.paymentDetails?.razorpayPaymentId || order.paymentDetails?.razorpayOrderId ? (
              <div className="rounded border border-stone-200 bg-white p-4">
                <h3 className="text-sm font-semibold">Payment Details</h3>
                <div className="mt-2 space-y-2 text-sm text-stone-700">
                  {order.paymentDetails?.razorpayPaymentId && (
                    <div>
                      <span className="font-semibold">Payment ID:</span> {order.paymentDetails.razorpayPaymentId}
                    </div>
                  )}
                  {order.paymentDetails?.razorpayOrderId && (
                    <div>
                      <span className="font-semibold">Razorpay Order ID:</span> {order.paymentDetails.razorpayOrderId}
                    </div>
                  )}
                  {order.paymentDetails?.verifiedAt && (
                    <div>
                      <span className="font-semibold">Verified:</span> {new Date(order.paymentDetails.verifiedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            <div className="rounded border border-stone-200 bg-white p-4">
              <h3 className="text-sm font-semibold">Shipping Address</h3>
              <pre className="mt-2 whitespace-pre-wrap  text-sm text-stone-700">{addressLines}</pre>
            </div>

            <div className="rounded border border-stone-200 bg-white p-4">
              <h3 className="text-sm font-semibold">Billing</h3>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>{subtotal}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>{shipping}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>{tax}</span></div>
                <div className="mt-2 border-t border-stone-100 pt-2 flex justify-between text-lg font-bold"><span>Total</span><span>{billingTotal}</span></div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
};

export default OrderDetails;
