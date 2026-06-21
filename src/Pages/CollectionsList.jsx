import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Topbar from "../components/layout/Topbar";
import ActionModal from "../components/ui/ActionModal";
import { getCollections, deleteCollection } from "../Redux/Controller/Collection";

const CollectionsList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const collections = useSelector((state) => state.data.collections || []);
  
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState({ open: false, id: null, name:null });

  // New States for Sorting, Filtering, and Pagination
  const [sortOption, setSortOption] = useState("name-asc");
  const [filterOption, setFilterOption] = useState("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    dispatch(getCollections());
  }, [dispatch]);

  // Reset page to 1 when search or filters change
  useEffect(() => {
    setPage(1);
  }, [query, filterOption, sortOption]);

  const processedData = useMemo(() => {
    // 1. Search
    let result = collections.filter((row) =>
      row.name?.toLowerCase().includes(query.trim().toLowerCase())
    );

    // 2. Filter Status (Check if any items inside 'featured' array are actually featured)
    if (filterOption === "featured") {
      result = result.filter(row => row?.featured?.some((item) => item.isFeatured));
    } else if (filterOption === "not-featured") {
      result = result.filter(row => !row?.featured?.some((item) => item.isFeatured));
    }

    // 3. Sort
    result.sort((a, b) => {
      if (sortOption === "name-asc") return a.name?.localeCompare(b.name);
      if (sortOption === "name-desc") return b.name?.localeCompare(a.name);
      return 0;
    });

    return result;
  }, [collections, query, filterOption, sortOption]);

  // 4. Pagination Setup
  const totalPages = Math.max(1, Math.ceil(processedData.length / itemsPerPage));
  const safePage = Math.min(page, totalPages);
  const paginatedData = processedData.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  };

  // Stats Logic
  const featuredCount = collections?.filter((row) => row?.featured?.some((item) => item.isFeatured)).length;
  const activeRate = Math.round((featuredCount / Math.max(collections.length, 1)) * 100);

  const handleDelete = async () => {
    if (!modal.id) return;
    await dispatch(deleteCollection(modal.id));
    setModal({ open: false, id: null, name:null });
  };

  return (
    <>
      <Topbar variant="inventory" searchPlaceholder="Search collections..." />
      <section className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-6xl font-bold uppercase tracking-tight">Collections</h1>
            <p className="mt-1 text-stone-600">Curate and manage your seasonal product line-ups.</p>
          </div>
          <button
            type="button"
            className="border border-black bg-black px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-stone-800"
            onClick={() => navigate("/collections/new")}
          >
            + Create New Collection
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="border border-stone-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-stone-500">Total Collections</p>
            <p className="mt-2 text-5xl font-bold">{collections.length}</p>
          </div>
          <div className="border border-stone-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-stone-500">Featured Items</p>
            <p className="mt-2 text-5xl font-bold">{String(featuredCount).padStart(2, "0")}</p>
          </div>
          <div className="border border-stone-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-stone-500">Featured Rate</p>
            <p className="mt-2 text-5xl font-bold">{activeRate}%</p>
          </div>
        </div>

        <div className="mt-4 border border-stone-200 bg-white">
          <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 p-3 justify-between">
            <div className="flex flex-wrap gap-2">
              <input
                className="w-full max-w-sm border border-stone-300 px-3 py-2 text-sm focus:outline-none"
                placeholder="Search collections..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              
              <select 
                className="border border-stone-300 bg-transparent px-3 py-2 text-xs font-semibold uppercase focus:outline-none cursor-pointer"
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="featured">Featured Only</option>
                <option value="not-featured">Not Featured</option>
              </select>
              
              <select 
                className="border border-stone-300 bg-transparent px-3 py-2 text-xs font-semibold uppercase focus:outline-none cursor-pointer"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="name-asc">Sort: A-Z</option>
                <option value="name-desc">Sort: Z-A</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.08em] text-stone-500">
                  <th className="px-3 py-3">Image</th>
                  <th className="px-3 py-3">Name</th>
                  <th className="px-3 py-3">Categories</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? paginatedData.map((row) => {
                  const featuredList = (Array.isArray(row?.featured) ? row.featured.filter((item) => item.isFeatured) : [])
                    .map((feat) => {
                      if (feat?.featuredCategory && typeof feat.featuredCategory === 'object' && feat.featuredCategory.name) {
                        return feat.featuredCategory.name;
                      }
                      const catId = feat?.featuredCategory;
                      if (catId && Array.isArray(row?.allCategories)) {
                        const match = row.allCategories.find((c) => String(c._id) === String(catId) || String(c.id) === String(catId));
                        return match?.name;
                      }
                      return null;
                    })
                    .filter(Boolean);
                    
                  const linkedCategories = Array.isArray(row.allCategories) ? row.allCategories : [];
                  
                  return (
                    <tr key={row._id || row.id} className="border-t border-stone-100">
                      <td className="px-3 py-3">
                        <img src={row.image || "https://via.placeholder.com/90x90?text=No+Image"} alt={row.name} className="h-16 w-16 object-cover" />
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-semibold">{row.name}</p>
                        <p className="text-sm text-stone-500">{linkedCategories.length} linked categories</p>
                      </td>
                      <td className="px-3 py-3">
                        {linkedCategories.slice(0, 3).map((cat) => cat.name).join(', ') || 'No categories'}
                      </td>
                      <td className="px-3 py-3">
                        {featuredList.length > 0 ? (
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-1 text-xs font-semibold uppercase">Featured ({featuredList.length})</span>
                        ) : (
                          <span className="bg-stone-100 text-stone-500 px-2 py-1 text-xs font-semibold uppercase">Not Featured</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="border border-stone-300 px-2 py-1 text-xs font-semibold uppercase hover:bg-stone-50"
                            onClick={() => navigate(`/collections/${row._id}/edit`)}
                          >
                            Edit
                          </button>
                          <button
                            className="border border-red-300 px-2 py-1 text-xs font-semibold uppercase text-red-700 hover:bg-red-50"
                            onClick={() => setModal({ open: true, id: row._id, name:row.name })}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr className="border-t border-stone-100"><td colSpan="5" className="p-6 text-center text-stone-500">No collections found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Functional Pagination */}
          <div className="flex items-center justify-between border-t border-stone-200 p-3 text-sm text-stone-500">
            <p>Showing {(safePage - 1) * itemsPerPage + 1} to {Math.min(safePage * itemsPerPage, processedData.length)} of {processedData.length} entries</p>
            <div className="flex gap-1">
              <button 
                className={`border border-stone-300 px-3 py-1 font-semibold uppercase text-xs ${safePage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-stone-50'}`}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
              >
                Prev
              </button>
              
              {getPageNumbers().map(num => (
                <button 
                  key={num} 
                  className={`border px-3 py-1 font-semibold text-xs ${safePage === num ? 'border-black bg-black text-white' : 'border-stone-300 hover:bg-stone-50 text-stone-600'}`}
                  onClick={() => setPage(num)}
                >
                  {num}
                </button>
              ))}
              
              <button 
                className={`border border-stone-300 px-3 py-1 font-semibold uppercase text-xs ${safePage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-stone-50'}`}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>

      <ActionModal
        open={modal.open}
        title="Delete collection?"
        description={`Are you sure you want to drop collection ${modal?.name}`}
        confirmText={`Type ${modal?.name} to confirm your action`}
        confirmLabel="Delete"
        action="delete"
        name = {modal?.name}
        onCancel={() => setModal({ open: false, id: null })}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default CollectionsList;