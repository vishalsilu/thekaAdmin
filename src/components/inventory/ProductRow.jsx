import Badge from "../ui/Badge";

const stockClass = (level) => {
  if (level === "high") return "text-sm font-semibold text-green-700";
  if (level === "low") return "text-sm font-semibold text-red-700";
  return "text-sm font-semibold text-stone-500";
};

const ProductRow = ({ product, onEdit, onDelete }) => {
  const statusVariant = product.status === "DRAFT" ? "draft" : "active";
  

  return (
    <tr className="hover:bg-stone-50">
      <td className="border-t border-stone-100 px-3 py-3">
        <img src={product.thumbnail} alt="" className="h-12 w-12 border border-stone-200 object-cover" width={48} height={48} />
      </td>
      <td className="border-t border-stone-100 px-3 py-3">
        <div>
          <strong className="block">{product.name}</strong>
          <span className="mt-1 block text-xs text-stone-500">{product.description}</span>
        </div>
      </td>
      <td className="border-t border-stone-100 px-3 py-3 font-mono text-sm">{product.id}</td>
      <td className="border-t border-stone-100 px-3 py-3">{product.category}</td>
      <td className="border-t border-stone-100 px-3 py-3">
        <span className={stockClass(product.level)}>
          {product.inStock ? 'In Stock' : 'Sold Out'}
        </span>
      </td>
      <td className="border-t border-stone-100 px-3 py-3 font-bold">₹{product.salePrice.toFixed(2)}</td>
      <td className="border-t border-stone-100 px-3 py-3">
        {/* <Badge variant={statusVariant}>{product.status}</Badge> */}
      </td>
      <td className="border-t border-stone-100 px-3 py-3">
        <div className="flex gap-2">
          <button type="button" className="cursor-pointer border border-stone-200 bg-white px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-stone-700" title="Edit" onClick={() => onEdit?.(product)}>
            Edit
          </button>
          <button type="button" className="cursor-pointer border border-red-200 bg-white px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-red-700" title="Delete" onClick={() => onDelete?.(product)}>
            Del
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ProductRow;
