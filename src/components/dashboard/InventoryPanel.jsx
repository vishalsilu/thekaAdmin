import { useNavigate } from 'react-router-dom';

const InventoryPanel = ({ lowStock = [], topProducts = [] }) => {
  const navigate = useNavigate();
  return (
    <section className="border border-stone-200 bg-white p-5">
      <h3 className="m-0 text-2xl font-bold tracking-tight">Inventory Snapshot</h3>
      <p className="mt-2 text-stone-500">Low-stock items and top sellers.</p>

      <div className="mt-4 space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-stone-700">Low Stock</h4>
          {lowStock.length ? (
            <ul className="mt-2 space-y-2">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span>{p.name}</span>
                  <span className="text-amber-700">Check</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-stone-500">No low stock items</p>}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-stone-700">Top Products</h4>
          {topProducts.length ? (
            <ul className="mt-2 space-y-2">
              {topProducts.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span>{p.name}</span>
                  <span className="text-stone-600">Sold: {p.salesCount || 0}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-stone-500">No top products</p>}
        </div>
      </div>

      <button
        className="mt-6 w-full border border-stone-300 bg-white px-3 py-3 text-xs font-bold uppercase tracking-[0.08em]"
        onClick={() => navigate('/inventory')}
      >
        View Inventory
      </button>
    </section>
  );
};

export default InventoryPanel;
