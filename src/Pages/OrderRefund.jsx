import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Topbar from "../components/layout/Topbar";
import adminApi from "../config/api";

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);

const OrderRefund = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [selected, setSelected] = useState({});
  const [adjustment, setAdjustment] = useState(0);
  const [note, setNote] = useState('');
  const [restockMap, setRestockMap] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await adminApi.get(`orders/admin/${orderId}`);
        setOrder(res.data.order);
        // initialize selections
        const sel = {};
        (res.data.order.items || []).forEach((it, idx) => sel[it.productId] = 0);
        setSelected(sel);
      } catch (err) {
        alert('Failed to load order: ' + (err.response?.data?.error || err.message));
        navigate('/orders');
      }
    };
    fetchOrder();
  }, [orderId]);

  return (
    <>
      <Topbar variant="inventory" searchPlaceholder="Search orders, customers..." />
      <section className="mt-6 grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-stone-500">Orders › #{order?.orderId} › Refund Process</p>
              <h1 className="text-5xl font-bold">Process Refund</h1>
              <p className="mt-1 text-stone-600">Order #{order?.orderId} · Customer: {order?.shippingAddress?.firstName || order?.userId}</p>
            </div>
            <div className="flex gap-2">
              <button className="border border-stone-300 bg-white px-4 py-2 text-xs font-bold uppercase" onClick={() => navigate(`/orders/${order?.orderId}`)}>Cancel</button>
              <button disabled={loading} className="border border-black bg-black px-4 py-2 text-xs font-bold uppercase text-white" onClick={async () => {
                // build refund payload
                const itemsPayload = Object.keys(selected).map(pid => ({ productId: pid, quantity: selected[pid], restock: !!restockMap[pid] })).filter(i => i.quantity > 0);
                if (!itemsPayload.length && Number(adjustment) === 0) return alert('Please select items or adjustment to refund');
                try {
                  setLoading(true);
                  const resp = await adminApi.post(`orders/admin/${order.orderId}/refund`, { items: itemsPayload, adjustment: Number(adjustment), note });
                  setLoading(false);
                  navigate(`/orders/${order.orderId}/refund/success`);
                } catch (err) {
                  setLoading(false);
                  alert('Refund failed: ' + (err.response?.data?.error || err.message));
                }
              }}>Process Refund</button>
            </div>
          </div>

          <div className="border border-stone-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-3xl font-semibold">Select Items</h2>
              <label className="text-xs uppercase tracking-[0.08em] text-stone-500"><input type="checkbox" className="mr-1" />Select all</label>
            </div>
            {(order?.items || []).map((item) => (
              <div key={item.productId} className="flex items-center gap-3 border-t border-stone-100 py-3">
                <input type="checkbox" checked={(selected[item.productId] || 0) > 0} onChange={(e) => {
                  setSelected(s => ({ ...s, [item.productId]: e.target.checked ? 1 : 0 }));
                }} />
                <img src={item.thumbnail || item.images?.[0]} className="h-20 w-20 object-cover" />
                <div className="flex-1">
                  <p className="text-2xl font-semibold">{item.name}</p>
                  <p className="text-stone-500">{item.variant ? `${item.variant} • ` : ""}{item.size || ""}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs uppercase text-stone-500">Qty to refund</span>
                    <div className="flex border border-stone-300 items-center">
                      <button className="px-2" onClick={() => setSelected(s => ({ ...s, [item.productId]: Math.max(0, (s[item.productId] || 0) - 1) }))}>-</button>
                      <span className="px-3">{selected[item.productId] || 0}</span>
                      <button className="px-2" onClick={() => setSelected(s => ({ ...s, [item.productId]: Math.min(item.quantity || 0, (s[item.productId] || 0) + 1) }))}>+</button>
                    </div>
                    <label className="ml-2 text-sm"><input type="checkbox" className="mr-1" checked={!!restockMap[item.productId]} onChange={(e) => setRestockMap(r => ({ ...r, [item.productId]: e.target.checked }))} /> restock item</label>
                  </div>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(item.price)}</p>
              </div>
            ))}
          </div>

          <div className="border border-stone-200 bg-white p-4">
            <h2 className="text-3xl font-semibold">Refund Details</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-500">Refund Reason<select className="mt-1 w-full border border-stone-300 px-3 py-2 text-sm"><option>Customer Return</option></select></label>
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-500">Manual Adjustment<input value={adjustment} onChange={(e) => setAdjustment(e.target.value)} className="mt-1 w-full border border-stone-300 px-3 py-2 text-sm" /></label>
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-500 md:col-span-2">Internal Note<textarea value={note} onChange={(e) => setNote(e.target.value)} className="mt-1 h-24 w-full border border-stone-300 p-2 text-sm" placeholder="Explain the reason for this refund..." /></label>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="border border-stone-200 bg-white p-4">
            <h3 className="text-3xl font-semibold">Refund Summary</h3>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between"><span>Items Subtotal</span><span>{formatCurrency(Object.keys(selected).reduce((s, pid) => {
                const qty = Number(selected[pid] || 0);
                const it = (order?.items || []).find(i => i.productId === pid);
                return s + (it ? (it.price || 0) * qty : 0);
              }, 0))}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(0)}</span></div>
              <div className="flex justify-between"><span>Shipping refund</span><span>{formatCurrency(0)}</span></div>
              <div className="flex justify-between text-red-600"><span>Adjustment</span><span>{formatCurrency(Number(adjustment) || 0)}</span></div>
            </div>
            <div className="mt-4 border-t border-stone-200 pt-3">
              <p className="text-xs uppercase tracking-[0.08em] text-stone-500">Total Refundable Amount</p>
              <p className="text-5xl font-bold">{formatCurrency(Object.keys(selected).reduce((s, pid) => {
                const qty = Number(selected[pid] || 0);
                const it = (order?.items || []).find(i => i.productId === pid);
                return s + (it ? (it.price || 0) * qty : 0);
              }, 0) + Number(adjustment || 0))}</p>
              <p className="mt-2 text-sm text-stone-600">Refund will be processed to {order?.paymentMethod || 'original payment method'}</p>
              <button disabled={loading} className="mt-3 w-full border border-black bg-black px-3 py-2 text-xs font-bold uppercase text-white" onClick={async () => {
                const itemsPayload = Object.keys(selected).map(pid => ({ productId: pid, quantity: selected[pid], restock: !!restockMap[pid] })).filter(i => i.quantity > 0);
                if (!itemsPayload.length && Number(adjustment) === 0) return alert('Please select items or adjustment to refund');
                try {
                  setLoading(true);
                  const resp = await adminApi.post(`orders/admin/${order.orderId}/refund`, { items: itemsPayload, adjustment: Number(adjustment), note });
                  setLoading(false);
                  navigate(`/orders/${order.orderId}/refund/success`);
                } catch (err) {
                  setLoading(false);
                  alert('Refund failed: ' + (err.response?.data?.error || err.message));
                }
              }}>Process Refund</button>
            </div>
          </div>
        </aside>
      </section>
    </>
  );
};

export default OrderRefund;
