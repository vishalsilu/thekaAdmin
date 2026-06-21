const stockClass = (level) => {
  if (level === "high") return "text-sm font-semibold text-green-700";
  if (level === "low") return "text-sm font-semibold text-red-700";
  return "text-sm font-semibold text-stone-500";
};

const ProductRow = ({ product, onEdit, onDelete, onToggleStatus }) => {
  return (
    <tr className="hover:bg-stone-50 transition-colors">
      <td className="border-t border-stone-100 px-3 py-3">
        <div className="h-12 w-12 rounded-md overflow-hidden border border-stone-200 bg-stone-100">
          <img 
            src={product.thumbnail || "https://placehold.co/100x100?text=No+Image"} 
            alt={product.name} 
            className="h-full w-full object-cover" 
            width={48} 
            height={48} 
          />
        </div>
      </td>
      <td className="border-t border-stone-100 px-3 py-3">
        <div>
          <strong className="block text-sm text-stone-900">{product.name}</strong>
          <span className="mt-0.5 block text-xs text-stone-500 truncate max-w-[200px]">
            {product.description || "No description"}
          </span>
        </div>
      </td>
      <td className="border-t border-stone-100 px-3 py-3 font-mono text-xs text-stone-600">
        {product.id}
      </td>
      <td className="border-t border-stone-100 px-3 py-3 text-sm text-stone-700">
        {product.category || "Uncategorized"}
      </td>
      <td className="border-t border-stone-100 px-3 py-3">
        <span className={stockClass(product.level)}>
          {product.inStock ? 'In Stock' : 'Sold Out'}
        </span>
      </td>
      <td className="border-t border-stone-100 px-3 py-3 font-bold text-sm text-stone-900">
        ₹{product.salePrice?.toLocaleString('en-IN') || "0"}
      </td>
      
      {/* --- NEW: Interactive Status Toggle Column --- */}
      <td className="border-t border-stone-100 px-3 py-3 whitespace-nowrap">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation(); // Prevent row click events
            onToggleStatus?.(product);
          }}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border transition-all active:scale-95 ${
            product.status === 'ACTIVE'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-stone-100 text-stone-600 border-stone-300 hover:bg-stone-200'
          }`}
          title="Click to toggle status"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${product.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-stone-400'}`}></span>
          {product.status === 'ACTIVE' ? 'Active' : 'Draft'}
        </button>
      </td>
      
      <td className="border-t border-stone-100 px-3 py-3">
        <div className="flex gap-2">
          <button 
            type="button" 
            className="cursor-pointer rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.06em] text-stone-700 hover:bg-stone-50 transition-colors" 
            title="Edit" 
            onClick={() => onEdit?.(product)}
          >
            Edit
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ProductRow;