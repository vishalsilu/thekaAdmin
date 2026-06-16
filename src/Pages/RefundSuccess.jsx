import { useNavigate } from "react-router-dom";
import Topbar from "../components/layout/Topbar";

const RefundSuccess = () => {
  const navigate = useNavigate();
  return (
    <>
      <Topbar variant="inventory" searchPlaceholder="Search..." />
      <section className="mx-auto mt-14 max-w-3xl text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-xl bg-black text-3xl text-white">✓</div>
        <h1 className="mt-5 text-3xl font-semibold">Refund Processed Successfully</h1>
        <p className="text-stone-600">Transaction reference for Order #ORD-9042</p>

        <div className="mt-8 border border-stone-200 bg-white p-5 text-left">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.1em] text-stone-500">Refund Details</p>
            <span className="bg-stone-100 px-2 py-1 text-xs font-semibold uppercase">Completed</span>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between border-b border-stone-100 pb-2"><span>Total Refunded</span><span className="font-semibold">$585.90 USD</span></div>
            <div className="flex justify-between border-b border-stone-100 pb-2"><span>Refund Method</span><span className="font-semibold">Visa ending in 4242</span></div>
            <div className="flex justify-between"><span>Refund Date</span><span className="font-semibold">October 24, 2023</span></div>
          </div>
        </div>

        <button className="mt-4 w-full border border-black bg-black px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white">Send Receipt To Customer</button>
        <button className="mt-3 w-full border border-stone-300 bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.12em]" onClick={() => navigate("/orders/ORD-9042")}>← Back To Order Details</button>
      </section>
    </>
  );
};

export default RefundSuccess;
