import { useEffect, useMemo, useState  } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/layout/Topbar";
import InventoryToolbar from "../components/inventory/InventoryToolbar";
import ProductsTable from "../components/inventory/ProductsTable";
import InventoryPagination from "../components/inventory/InventoryPagination";
import { inventoryProducts, pageSize } from "../data/inventoryData";
import { useDispatch, useSelector } from "react-redux";
import { getProducts } from "../Redux/Controller/Product";
import { getCollections } from "../Redux/Controller/Collection";

const Inventory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Added safety fallback || [] so it never crashes while fetching from your database
  const products = useSelector(state => state.data.products) || [];
  const collections = useSelector(state => state.data.collections) || [];
  
  const [collectionFilter, setCollectionFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [sortOption, setSortOption] = useState("none");
  const [page, setPage] = useState(1);

  // Helper to compute overall stock for a product (variants fallback)
  const getTotalStock = (product) => {
    if (!product) return 0;
    if (typeof product.stock === 'number') return product.stock;
    if (Array.isArray(product.variants)) {
      return product.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    }
    return 0;
  };

  // FIXED: Added 'products' to the dependency matrix array below
  const filtered = useMemo(() => {
    let out = products.filter((p) => {
      if (categoryFilter !== "all" && p.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
      if (collectionFilter !== "all" && p.collection.toLowerCase() !== collectionFilter.toLowerCase()) return false;
      return true;
    });

    // Apply sorting
    if (sortOption && sortOption !== "none") {
      out = [...out].sort((a, b) => {
        switch (sortOption) {
          case "newest": {
            const ta = new Date(a.createdAt || a.updatedAt || 0).getTime();
            const tb = new Date(b.createdAt || b.updatedAt || 0).getTime();
            return tb - ta;
          }
          case "oldest": {
            const ta = new Date(a.createdAt || a.updatedAt || 0).getTime();
            const tb = new Date(b.createdAt || b.updatedAt || 0).getTime();
            return ta - tb;
          }
          case "price-asc":
            return (a.price || 0) - (b.price || 0);
          case "price-desc":
            return (b.price || 0) - (a.price || 0);
          case "stock-asc":
            return getTotalStock(a) - getTotalStock(b);
          case "stock-desc":
            return getTotalStock(b) - getTotalStock(a);
          case "name-asc":
            return (a.name || "").localeCompare(b.name || "");
          case "name-desc":
            return (b.name || "").localeCompare(a.name || "");
          default:
            return 0;
        }
      });
    }

    return out;
  }, [products, categoryFilter, collectionFilter, sortOption]);

  const total = filtered.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / 6);

  useEffect(() => {
    dispatch(getProducts());
    dispatch(getCollections());
  }, [dispatch]);

  const safePage = totalPages === 0 ? 1 : Math.min(page, totalPages);
  
  // Wrapped page slicing inside a useMemo to prevent unnecessary array splicing on random clicks
  const pageSlice = useMemo(() => {
    return filtered.slice((safePage - 1) * 6, safePage * 6);
  }, [filtered, safePage]);

  const handleEdit = (product) => {
    navigate(`/inventory/${product.id}/edit`);
  };

  const handleDelete = (product) => {
    console.info("Delete product", product.id);
  };

  const handleMoreFilters = () => {
    setShowMoreFilters((s) => !s);
  };

  const handleExport = () => {
    console.info("Export inventory");
  };

  

  return (
    <>
      <Topbar variant="inventory" searchPlaceholder="Search resources..." />

      <header className="mt-7 flex flex-col items-start justify-between gap-4 xl:flex-row xl:items-start">
        <div>
          <h1 className="m-0 text-5xl font-bold tracking-tight">Products</h1>
          <p className="mt-2 max-w-xl text-base leading-relaxed text-stone-500">
            Manage your inventory, monitor stock levels, and curate your digital showroom with surgical precision.
          </p>
        </div>
        <button type="button" className="shrink-0 whitespace-nowrap border border-black bg-black px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-white" onClick={() => navigate("/inventory/new")}>
          + Add New Product
        </button>
      </header>

      <InventoryToolbar
        collections={collections}
        onCategoryChange={(v) => {
          setCategoryFilter(v || "all");
          setPage(1);
        }}
        onCollectionChange={(v) => {
          setCollectionFilter(v || "all");
          setPage(1);
        }}
        onMoreFilters={handleMoreFilters}
        onExport={handleExport}
      />

      {showMoreFilters && (
        <div className="mt-4 mb-4 p-4 bg-white border border-stone-200">
          <h3 className="text-sm font-bold mb-2">More Filters</h3>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold">Sort:</label>
              <select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value);
                  setPage(1);
                }}
                className="border border-stone-300 px-2 py-1 text-sm"
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
      )}

      <ProductsTable products={pageSlice} onEdit={handleEdit} onDelete={handleDelete} />

      <InventoryPagination
        page={safePage}
        pageSize={6}
        total={total}
        onPageChange={setPage}
      />
    </>
  );
};

export default Inventory;