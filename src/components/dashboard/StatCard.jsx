const StatCard = ({ label, value, trend, trendUp }) => {
  return (
    <article className="border border-stone-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="stat-icon">◫</span>
        <span className={`text-xs font-bold ${trendUp ? "text-green-600" : "text-red-600"}`}>{trend}</span>
      </div>
      <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-[0.08em] text-stone-500">{label}</p>
      <h3 className="m-0 text-4xl font-bold tracking-tight">{value}</h3>
    </article>
  );
};

export default StatCard;
