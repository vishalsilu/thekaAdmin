import { useNavigate } from "react-router-dom";
import Topbar from "../components/layout/Topbar";

const OrderCreate = () => {
  const navigate = useNavigate();
  return (
    <>
      <Topbar variant="inventory" searchPlaceholder="Global search..." />
      <section className="mt-6 grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-stone-500">Management</p>
              <h1 className="text-5xl font-bold">Create New Order</h1>
              <p className="text-stone-600">Configure details for a new luxury acquisition.</p>
            </div>
            <div className="flex gap-2">
              <button className="border border-stone-300 bg-white px-4 py-2 text-xs font-bold uppercase" onClick={() => navigate("/orders")}>Cancel</button>
              <button className="border border-black bg-black px-4 py-2 text-xs font-bold uppercase text-white">Create Order</button>
            </div>
          </div>

          <div className="border border-stone-200 bg-white p-4">
            <h2 className="text-3xl font-semibold">Search or Add Customer</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <input className="border border-stone-300 px-3 py-2" placeholder="e.g. Julianne Moore" />
              <input className="border border-stone-300 px-3 py-2" placeholder="julianne@example.com" />
              <input className="border border-stone-300 px-3 py-2 md:col-span-2" placeholder="+1 (555) 000-0000" />
            </div>
          </div>
          <div className="border border-stone-200 bg-white p-4">
            <h2 className="text-3xl font-semibold">Order Items</h2>
            <div className="mt-3 space-y-3">
              {[1, 2].map((n) => (
                <div key={n} className="flex items-center justify-between border border-stone-200 p-3">
                  <div className="flex items-center gap-3"><div className="h-16 w-16 bg-stone-200" /><div><p className="text-xl font-semibold">{n === 1 ? "Midnight Silk Evening Gown" : "Tailored Wool Overcoat"}</p><p className="text-stone-500">Size: {n === 1 ? "M" : "L"} | {n === 1 ? "Black" : "Camel"}</p></div></div>
                  <div className="text-right"><p className="text-2xl font-bold">{n === 1 ? "$1,250.00" : "$890.00"}</p><div className="mt-1 inline-flex border border-stone-300"><button className="px-2">-</button><span className="px-3">1</span><button className="px-2">+</button></div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <aside className="space-y-4">
          <div className="border border-stone-200 bg-white p-4">
            <h3 className="text-3xl font-semibold">Order Summary</h3>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between"><span>Subtotal</span><span>$2,140.00</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>$45.00</span></div>
              <div className="flex justify-between"><span>Estimated taxes</span><span>$171.20</span></div>
            </div>
            <div className="mt-3 border-t border-stone-200 pt-3"><p className="text-xs uppercase tracking-[0.08em] text-stone-500">Total Amount</p><p className="text-5xl font-bold">$2,356.20</p></div>
            <button className="mt-3 w-full border border-black bg-black px-3 py-2 text-xs font-bold uppercase text-white">Finalize & Checkout</button>
          </div>
        </aside>
      </section>
    </>
  );
};

export default OrderCreate;
