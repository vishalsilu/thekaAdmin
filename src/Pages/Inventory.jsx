import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/layout/Topbar";
import InventoryToolbar from "../components/inventory/InventoryToolbar";
import ProductsTable from "../components/inventory/ProductsTable";
import InventoryPagination from "../components/inventory/InventoryPagination";
import { useDispatch, useSelector } from "react-redux";
import { getProducts } from "../Redux/Controller/Product";
import { getCollections } from "../Redux/Controller/Collection";
import api from "../config/api"; // Added API import for the toggle

const Inventory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const products = useSelector(state => state.data.products) || [];
  const collections = useSelector(state => state.data.collections) || [];
  
  const [collectionFilter, setCollectionFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [sortOption, setSortOption] = useState("none");
  const [page, setPage] = useState(1);

  // --- NEW: Optimistic State for instant toggling ---
  const [optimisticStatuses, setOptimisticStatuses] = useState({});

  const getTotalStock = (product) => {
    if (!product) return 0;
    if (typeof product.stock === 'number') return product.stock;
    if (Array.isArray(product.variants)) {
      return product.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    }
    return 0;
  };

  // --- NEW: Smooth Toggle Function ---
  const handleToggleStatus = async (product) => {
    // 1. Calculate the new status
    const currentStatus = optimisticStatuses[product.id] || product.status;
    const newStatus = currentStatus === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';

    // 2. Instantly update the UI locally
    setOptimisticStatuses((prev) => ({ ...prev, [product.id]: newStatus }));

    try {
      // 3. Update the database
      // Make sure this route matches your backend (e.g., /product/:id/status or /products/:id/toggle-status)
      await api.put(`/product/${product.id}/status`);
      
      // 4. Silently refresh Redux in the background
      dispatch(getProducts());
    } catch (err) {
      // 5. Revert the UI if the API call fails
      setOptimisticStatuses((prev) => ({ ...prev, [product.id]: currentStatus }));
      console.error("Toggle failed", err);
      alert("Failed to toggle product status.");
    }
  };

  const filtered = useMemo(() => {
    // Inject the optimistic status into the product list before filtering/sorting
    let out = products.map(p => ({
        ...p,
        status: optimisticStatuses[p.id] || p.status
    })).filter((p) => {
      if (categoryFilter !== "all" && p.category?.toLowerCase() !== categoryFilter.toLowerCase()) return false;
      if (collectionFilter !== "all" && p.collection?.toLowerCase() !== collectionFilter.toLowerCase()) return false;
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
  }, [products, categoryFilter, collectionFilter, sortOption, optimisticStatuses]);

  const total = filtered.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / 6);

  useEffect(() => {
    dispatch(getProducts());
    dispatch(getCollections());
  }, [dispatch]);

  const safePage = totalPages === 0 ? 1 : Math.min(page, totalPages);
  
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

      {/* Passed handleToggleStatus down to the table */}
      <ProductsTable 
        products={pageSlice} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
        onToggleStatus={handleToggleStatus} 
      />

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