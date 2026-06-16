import { useNavigate } from 'react-router-dom';

const badgeClass = (status) => {
  if (status === "Completed") return "border border-green-200 bg-green-50 text-green-700";
  if (status === "Processing") return "border border-amber-200 bg-amber-50 text-amber-700";
  if (status === "Shipped") return "border border-stone-200 bg-stone-100 text-stone-600";
  return "border border-red-200 bg-red-50 text-red-700";
};

const OrdersTable = ({ recentOrders = [] }) => {
  const navigate = useNavigate();
  return (
    <section className="mt-4 border border-stone-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="m-0 text-4xl font-bold tracking-tight">Recent Orders</h3>
        <button className="border border-stone-300 bg-white px-3 py-2 text-xs uppercase text-stone-500">Last 7 Days ▾</button>
      </div>

      <table className="mt-4 w-full border-collapse">
        <thead>
          <tr>
            <th className="border-t border-stone-200 px-3 py-3 text-left text-[11px] uppercase tracking-[0.08em] text-stone-500">Order ID</th>
            <th className="border-t border-stone-200 px-3 py-3 text-left text-[11px] uppercase tracking-[0.08em] text-stone-500">Customer</th>
            <th className="border-t border-stone-200 px-3 py-3 text-left text-[11px] uppercase tracking-[0.08em] text-stone-500">Date</th>
            <th className="border-t border-stone-200 px-3 py-3 text-left text-[11px] uppercase tracking-[0.08em] text-stone-500">Total</th>
            <th className="border-t border-stone-200 px-3 py-3 text-left text-[11px] uppercase tracking-[0.08em] text-stone-500">Status</th>
            <th className="border-t border-stone-200 px-3 py-3 text-left text-[11px] uppercase tracking-[0.08em] text-stone-500">View</th>
          </tr>
        </thead>
        <tbody>
          {recentOrders.map((order) => (
            <tr key={order.orderId || order._id}>
              <td  className="border-t border-stone-100 px-3 py-3">{order.orderId || order._id}</td>
              <td className="border-t border-stone-100 px-3 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-7 w-7 place-items-center border border-stone-200 text-[11px] uppercase">{(order.shippingAddress?.firstName || 'U').slice(0,1)}</span>
                  <div>
                    <strong className="block">{`${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim()}</strong>
                    <small className="text-stone-500">{order.userId || ''}</small>
                  </div>
                </div>
              </td>
              <td className="border-t border-stone-100 px-3 py-3">{new Date(order.createdAt).toLocaleString()}</td>
              <td className="border-t border-stone-100 px-3 py-3">₹{(order.total||0).toLocaleString('en-IN')}</td>
              <td className="border-t border-stone-100 px-3 py-3"><span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${badgeClass(order.status)}`}>{order.status}</span></td>
              <td className="border-t border-stone-100 px-3 py-3"><button className="text-blue-500 underline" onClick={() => navigate(`/orders/${order.orderId || order._id}`)}>View</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        className="mt-3 w-full bg-transparent text-xs font-bold uppercase tracking-[0.08em] text-stone-500"
        onClick={() => navigate('/orders')}
      >
        View All Orders
      </button>
    </section>
  );
};

export default OrdersTable;
