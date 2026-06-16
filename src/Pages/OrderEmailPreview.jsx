import { useNavigate } from "react-router-dom";
import Topbar from "../components/layout/Topbar";

const OrderEmailPreview = () => {
  const navigate = useNavigate();
  return (
    <>
      <Topbar variant="inventory" searchPlaceholder="Search orders, customers..." />
      <section className="mt-6 grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-stone-500">Orders › #ORD-9042 › Email Confirmation</p>
              <h1 className="text-4xl font-bold">Review Update Email</h1>
              <p className="text-stone-500">Preview the shipping update notification before sending to the customer.</p>
            </div>
            <div className="flex gap-2">
              <button className="border border-stone-300 bg-white px-4 py-2 text-xs font-bold uppercase" onClick={() => navigate("/orders/ORD-9042")}>Cancel</button>
              <button className="border border-black bg-black px-4 py-2 text-xs font-bold uppercase text-white">Send Email</button>
            </div>
          </div>
          <div className="mt-4 border border-stone-200 bg-white p-4">
            <div className="grid gap-2 text-sm">
              <p><span className="text-stone-500">TO:</span> alexander.vance@example.com</p>
              <p><span className="text-stone-500">FROM:</span> orders@luxe-apparel.com</p>
              <p><span className="text-stone-500">SUBJECT:</span> Your Order #ORD-9042 is on its way!</p>
            </div>
          </div>
          <div className="mt-4 border border-stone-200 bg-white p-6 text-center">
            <h3 className="text-3xl font-bold">LUXE</h3>
            <p className="mt-4 text-2xl">Great news! Your order is officially on its way to you.</p>
            <div className="mx-auto mt-6 max-w-md border border-stone-200 p-4 text-left">
              <p className="text-xs uppercase tracking-[0.1em] text-stone-500">Order Number</p>
              <p className="text-3xl font-bold">#ORD-9042</p>
              <button className="mt-4 w-full border border-stone-300 px-3 py-2 text-xs font-semibold uppercase">Track Package</button>
            </div>
          </div>
        </div>
        <aside className="space-y-4">
          <div className="border border-stone-200 bg-white p-4">
            <h3 className="text-xl font-semibold">Recipient Profile</h3>
            <p className="mt-2 font-semibold">Alexander Vance</p>
            <p className="text-stone-600">Tier: Platinum Member</p>
          </div>
          <div className="border border-stone-200 bg-white p-4">
            <h3 className="text-xl font-semibold">Email Settings</h3>
            <label className="mt-2 block text-sm"><input type="checkbox" defaultChecked className="mr-2" />Email (Primary)</label>
            <label className="block text-sm"><input type="checkbox" className="mr-2" />SMS Notification</label>
          </div>
          <div className="border border-stone-200 bg-white p-4">
            <h3 className="text-xl font-semibold">Activity Log</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-stone-600">
              <li>Status changed to 'Shipped'</li>
              <li>Order packed and packed</li>
            </ul>
          </div>
        </aside>
      </section>
    </>
  );
};

export default OrderEmailPreview;
