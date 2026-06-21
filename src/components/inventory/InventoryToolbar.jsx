import { useState } from "react";
import { getcategories } from "../../Redux/Controller/Category";
import { useSelector , useDispatch } from "react-redux";


const InventoryToolbar = ({
  collections,
  collectionFilter,
  onCollectionChange,
  onCategoryChange,
  onMoreFilters,
  onExport
}) => {

    const categories = useSelector(state => state.data.categories)
    
    const dispatch = useDispatch();
    
    
    
    const [selectedCollection, setSelectedCollection] = useState("All Collections");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");

    

    
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border border-stone-200 bg-white p-4">
      <div className="flex flex-wrap gap-2.5">
    <div className="flex items-center gap-1 cursor-pointer border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-semibold">
       <h1>Collection:</h1>
       <select
  className="focus:outline-none bg-transparent"
  // 1. Bind the value to the stored object's ID (fall back to "all")
  value={selectedCollection?._id || "all"}
  onChange={(e) => {
 const selectedId = e.target.value;

    if (selectedId === "all") {
      setSelectedCollection(null); 
      onCollectionChange("all");
       setSelectedCategory("all");
            onCategoryChange("all");

    } else {
      const fullCollectionObject = collections?.find(c => c._id === selectedId);
      
      setSelectedCollection(fullCollectionObject);

      onCollectionChange(fullCollectionObject?.name);
      dispatch(getcategories(fullCollectionObject?._id));
      setSelectedCategory("all");
            onCategoryChange("all");
    }   
  }}
  aria-label="Filter by category"
>
  <option value="all">All Collections</option>
  {collections?.length > 0 && collections?.map((collection) => (
    // 4. Use the unique ID here as the string value
    <option key={collection._id} value={collection._id}>
      {collection.name}
    </option>
  ))}
</select>
    </div>
        <div className="flex items-center gap-1 cursor-pointer border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-semibold">
          <h1>Category:</h1>
          <select
          className=" focus:outline-none bg-transparent"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            onCategoryChange(e.target.value);
          }}
          aria-label="Filter by category"
        >
          <option value="all">All Categories</option>
          {categories?.map((category) => (
            <option className="w-48" key={category.id} value={category.id}>
              { category.name}
            </option>
          ))}
        </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <button type="button" className="inline-flex items-center gap-2 border border-stone-300 bg-white px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.08em]" onClick={onMoreFilters}>
          <span className="text-xs opacity-60">⚙</span>
          More Filters
        </button>
        <button type="button" className="inline-flex items-center gap-2 border border-stone-300 bg-white px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.08em]" onClick={onExport}>
          <span className="text-xs opacity-60">⬇</span>
          Export
        </button>
      </div>
    </div>
  );
};

export default InventoryToolbar;
