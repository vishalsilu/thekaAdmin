import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/layout/Topbar";
import InventoryToolbar from "../components/inventory/InventoryToolbar";
import ProductsTable from "../components/inventory/ProductsTable";
import InventoryPagination from "../components/inventory/InventoryPagination";
import { useDispatch, useSelector } from "react-redux";
import { getProducts } from "../Redux/Controller/Product";
import { getCollections } from "../Redux/Controller/Collection";
import api from "../config/api"; 

const Inventory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const products = useSelector(state => state.data.products) || [];
  const collections = useSelector(state => state.data.collections) || [];
  
  const [collectionFilter, setCollectionFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOption, setSortOption] = useState("none");
  const [page, setPage] = useState(1);

  const [optimisticStatuses, setOptimisticStatuses] = useState({});

  // UPDATED: Correctly parses nested variants -> sizes -> stock
  const getTotalStock = (product) => {
    if (!product) return 0;
    
    if (Array.isArray(product.variants)) {
      return product.variants.reduce((totalVariantStock, variant) => {
        const sizeStock = Array.isArray(variant.sizes) 
          ? variant.sizes.reduce((sum, sizeObj) => sum + (Number(sizeObj.stock) || 0), 0)
          : 0;
        return totalVariantStock + sizeStock;
      }, 0);
    }

    // Fallback just in case some legacy products have stock directly on the root
    if (typeof product.stock === 'number') return product.stock;
    
    return 0;
  };

  const handleToggleStatus = async (product) => {
    const currentStatus = optimisticStatuses[product.id] || product.status;
    const newStatus = currentStatus === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';

    setOptimisticStatuses((prev) => ({ ...prev, [product.id]: newStatus }));

    try {
      await api.put(`/product/${product.id}/status`);
      dispatch(getProducts());
    } catch (err) {
      setOptimisticStatuses((prev) => ({ ...prev, [product.id]: currentStatus }));
      console.error("Toggle failed", err);
      alert("Failed to toggle product status.");
    }
  };

  const filtered = useMemo(() => {
    let out = products.map(p => ({
        ...p,
        status: optimisticStatuses[p.id] || p.status
    })).filter((p) => {
      if (categoryFilter !== "all" && p.category?.toLowerCase() !== categoryFilter.toLowerCase()) return false;
      if (collectionFilter !== "all" && p.collection?.toLowerCase() !== collectionFilter.toLowerCase()) return false;
      return true;
    });

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
        sortOption={sortOption}
        onSortChange={(v) => {
          setSortOption(v);
          setPage(1);
        }}
        onExport={handleExport}
      />

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