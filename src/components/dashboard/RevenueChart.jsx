const RevenueChart = ({ data = [] }) => {
  return (
    <section className="border border-stone-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="m-0 text-4xl font-bold tracking-tight">Revenue Growth</h3>
        <div className="flex gap-3 text-[11px] uppercase">
          <span className="inline-flex items-center"><i className="mr-1.5 inline-block h-2.5 w-2.5 bg-zinc-800" /> Gross Sales</span>
          <span className="inline-flex items-center"><i className="mr-1.5 inline-block h-2.5 w-2.5 bg-stone-300" /> Net Profit</span>
        </div>
      </div>

      <div className="mt-5 grid h-60 grid-cols-7 gap-2">
        {(data.length ? data : Array.from({ length: 7 }).map((_, i) => ({ day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i%7], amount: Math.floor(Math.random()*120000)+20000 }))).map((bar, index, arr) => {
          const highest = Math.max(...arr.map((item) => item.amount || 0), 1);
          const gross = Math.round(((bar.amount || 0) / highest) * 100);
          const profit = Math.round(gross * 0.65);
          return (
            <div key={`${bar.day}-${index}`} className="flex flex-col items-center justify-end">
              <div className="flex h-52 w-full items-end gap-0.5">
                <div className="w-full bg-stone-300" style={{ height: `${gross}%` }} />
                <div className="w-full bg-stone-100" style={{ height: `${profit}%` }} />
              </div>
              <small className="mt-2 text-stone-500">{bar.day}</small>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RevenueChart;
