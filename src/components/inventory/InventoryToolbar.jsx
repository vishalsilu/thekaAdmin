import { useState } from "react";
import { getcategories } from "../../Redux/Controller/Category";
import { useSelector , useDispatch } from "react-redux";

const InventoryToolbar = ({
  collections,
  onCollectionChange,
  onCategoryChange,
  sortOption,
  onSortChange,
  onExport
}) => {
    const categories = useSelector(state => state.data.categories)
    const dispatch = useDispatch();
    
    const [selectedCollection, setSelectedCollection] = useState("All Collections");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border border-stone-200 bg-white p-4">
      
      {/* LEFT SIDE: Filters */}
      <div className="flex flex-wrap gap-2.5">
        <div className="flex items-center gap-1 cursor-pointer border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-semibold">
           <h1>Collection:</h1>
           <select
              className="focus:outline-none bg-transparent"
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
              aria-label="Filter by collection"
            >
              <option value="all">All Collections</option>
              {collections?.length > 0 && collections?.map((collection) => (
                <option key={collection._id} value={collection._id}>
                  {collection.name}
                </option>
              ))}
            </select>
        </div>

        <div className="flex items-center gap-1 cursor-pointer border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-semibold">
          <h1>Category:</h1>
          <select
            className="focus:outline-none bg-transparent"
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
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* RIGHT SIDE: Sort & Export */}
      <div className="flex flex-wrap gap-2.5">
        <div className="flex items-center gap-1 cursor-pointer border border-stone-300 bg-stone-50 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.08em]">
          <span className="text-xs opacity-60">⇅</span>
          <h1>Sort:</h1>
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value)}
            className="focus:outline-none bg-transparent cursor-pointer font-semibold uppercase"
          >
            <option value="none">None</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="stock-asc">Stock: Low → High</option>
            <option value="stock-desc">Stock: High → Low</option>
            <option value="name-asc">Name: A → Z</option>
            <option value="name-desc">Name: Z → A</option>
          </select>
        </div>
      </div>

    </div>
  );
};

export default InventoryToolbar;