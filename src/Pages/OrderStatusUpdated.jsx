import { useNavigate } from "react-router-dom";
import Topbar from "../components/layout/Topbar";

const OrderStatusUpdated = () => {
  const navigate = useNavigate();
  return (
    <>
      <Topbar variant="inventory" searchPlaceholder="Search orders..." />
      <section className="mx-auto mt-10 max-w-5xl space-y-4">
        <div className="grid h-14 w-14 place-items-center rounded-xl bg-black text-2xl text-white">✓</div>
        <div>
          <h1 className="text-3xl font-semibold">Order Update Confirmed</h1>
          <p className="text-stone-600">Order #ORD-9042 successfully updated</p>
        </div>
        <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
          <div className="border border-stone-200 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.1em] text-stone-500">Current Status</p>
            <p className="mt-2 text-2xl font-semibold">Shipped 🚚</p>
            <p className="mt-5 text-stone-600">The order has been processed and is currently in transit to the customer's delivery address.</p>
          </div>
          <div className="border border-stone-200 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.1em] text-stone-500">Carrier</p>
            <p className="text-xl font-semibold">FedEx</p>
            <p className="mt-3 text-xs uppercase tracking-[0.1em] text-stone-500">Tracking Number</p>
            <p className="font-semibold">FEDEX78239162</p>
          </div>
        </div>
        <button className="w-full border border-black bg-black px-4 py-3 text-xs font-bold uppercase tracking-[0.1em] text-white" onClick={() => navigate("/orders/ORD-9042/email")}>Send confirmation email to customer</button>
        <div className="grid gap-3 md:grid-cols-2">
          <button className="border border-stone-300 bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.1em]" onClick={() => navigate("/orders")}>← Go back to orders list</button>
          <button className="border border-stone-300 bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.1em]" onClick={() => navigate("/orders/ORD-9042")}>View order details</button>
        </div>
      </section>
    </>
  );
};

export default OrderStatusUpdated;
