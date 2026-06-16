import ProductRow from "./ProductRow";

const ProductsTable = ({ products, onEdit, onDelete }) => {
  return (
    <div className="mt-4 overflow-x-auto border border-stone-200 bg-white">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border-b border-stone-200 px-3 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-stone-500">Image</th>
            <th className="border-b border-stone-200 px-3 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-stone-500">Product Name</th>
            <th className="border-b border-stone-200 px-3 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-stone-500">SKU</th>
            <th className="border-b border-stone-200 px-3 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-stone-500">Category</th>
            <th className="border-b border-stone-200 px-3 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-stone-500">Stock</th>
            <th className="border-b border-stone-200 px-3 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-stone-500">Price</th>
            <th className="border-b border-stone-200 px-3 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-stone-500">Status</th>
            <th className="border-b border-stone-200 px-3 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-stone-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <ProductRow key={p.id} product={p} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsTable;
