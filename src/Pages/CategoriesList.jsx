import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/layout/Topbar";
import ActionModal from "../components/ui/ActionModal";
import { useDispatch, useSelector } from "react-redux";
import { getAllCategories, deleteCategory, updateCategory } from "../Redux/Controller/Category";

const CategoriesList = () => {
  const dispatch = useDispatch();
  const categories = useSelector(state => state.data.allCategories) || [];
  const navigate = useNavigate();
  
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState({ open: false, id: null , name:null });
  
  // New States for Sorting, Filtering, and Pagination
  const [sortOption, setSortOption] = useState("name-asc");
  const [filterOption, setFilterOption] = useState("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  // Reset page to 1 when search or filters change
  useEffect(() => {
    setPage(1);
  }, [query, filterOption, sortOption]);

  const processedData = useMemo(() => {
    // 1. Search
    let result = categories.filter((row) =>
      row.name?.toLowerCase().includes(query.trim().toLowerCase())
    );

    // 2. Filter Status
    if (filterOption === "active") {
      result = result.filter(row => row.isActive);
    } else if (filterOption === "inactive") {
      result = result.filter(row => !row.isActive);
    }

    // 3. Sort
    result.sort((a, b) => {
      if (sortOption === "name-asc") return a.name?.localeCompare(b.name);
      if (sortOption === "name-desc") return b.name?.localeCompare(a.name);
      return 0;
    });

    return result;
  }, [categories, query, filterOption, sortOption]);

  // 4. Pagination Setup
  const totalPages = Math.max(1, Math.ceil(processedData.length / itemsPerPage));
  const safePage = Math.min(page, totalPages);
  const paginatedData = processedData.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  };

  return (
    <>
      <Topbar variant="inventory" searchPlaceholder="Search categories..." />
      <section className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.1em] text-stone-500">Catalog / Categories</p>
            <h1 className="text-6xl font-bold tracking-tight">Categories</h1>
            <p className="mt-1 max-w-2xl text-stone-600">Manage your product taxonomy. Organize items into logical groups to enhance customer navigation and filtering experiences.</p>
          </div>
          <button className="border border-black bg-black px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-white" onClick={() => navigate("/categories/new")}>+ Create New Category</button>
        </div>

        <div className="mt-4 border border-stone-200 bg-white">
          <div className="flex flex-wrap items-center justify-between border-b border-stone-200 p-3 gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <select 
                className="border border-stone-300 bg-transparent px-3 py-2 text-xs font-semibold uppercase focus:outline-none cursor-pointer"
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
              
              <select 
                className="border border-stone-300 bg-transparent px-3 py-2 text-xs font-semibold uppercase focus:outline-none cursor-pointer"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="name-asc">Sort: A-Z</option>
                <option value="name-desc">Sort: Z-A</option>
              </select>

              <input 
                className="ml-1 w-64 border border-stone-300 px-3 py-2 text-sm focus:outline-none" 
                placeholder="Search category..." 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
              />
            </div>
            <p className="text-sm text-stone-500">Showing {paginatedData.length} of {processedData.length} results</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.08em] text-stone-500">
                  <th className="px-3 py-3">Image</th><th className="px-3 py-3">Name</th><th className="px-3 py-3">Parent Collection</th><th className="px-3 py-3">URL Slug</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? paginatedData.map((row) => (
                  <tr key={row._id || row.id} className="border-t border-stone-100">
                    <td className="px-3 py-3"><img src={row.image || "https://via.placeholder.com/64?text=No+Image"} className="h-16 w-16 object-cover" alt={row.name} /></td>
                    <td className="px-3 py-3"><p className="font-semibold">{row?.name}</p><p className="text-xs text-stone-500">ID: {row?._id?.toString().toUpperCase()}</p></td>
                    <td className="px-3 py-3">{row.parentCollection?.name || "None"}</td>
                    <td className="px-3 py-3"><span className="bg-stone-100 px-2 py-1 text-sm">{row.path || "N/A"}</span></td>
                    <td className="px-3 py-3"><span className={`px-2 py-1 text-xs font-semibold uppercase ${row.isActive ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>{row.isActive ? "Active" : "Inactive"}</span></td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <button className="border border-stone-300 px-2 py-1 text-xs font-semibold uppercase hover:bg-stone-50" onClick={() => navigate(`/categories/${row._id}/edit`)}>Edit</button>
                        <button className="border border-stone-300 px-2 py-1 text-xs font-semibold uppercase hover:bg-stone-50" onClick={() => dispatch(updateCategory({ id: row._id, categoryData: { isActive: !row.isActive } }))}>{row.isActive ? "Disable" : "Enable"}</button>
                        <button className="border border-red-300 px-2 py-1 text-xs font-semibold uppercase text-red-700 hover:bg-red-50" onClick={() => setModal({ open: true, id: row._id , name:row?.name })}>Delete</button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr className="border-t border-stone-100"><td colSpan="6" className="p-6 text-center text-stone-500">No categories found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Functional Pagination */}
          <div className="flex items-center justify-between border-t border-stone-200 p-3 text-sm text-stone-500">
            <button 
              className={`uppercase font-semibold ${safePage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:text-black'}`}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
            >
              ← Previous
            </button>
            <div className="flex gap-1">
              {getPageNumbers().map(num => (
                <button 
                  key={num} 
                  className={`px-3 py-1 font-semibold ${safePage === num ? 'bg-black text-white' : 'text-stone-500 hover:bg-stone-100'}`}
                  onClick={() => setPage(num)}
                >
                  {num}
                </button>
              ))}
            </div>
            <button 
              className={`uppercase font-semibold ${safePage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:text-black'}`}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
            >
              Next →
            </button>
          </div>
        </div>

        {/* Info Cards... */}
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {[
            { t: "SEO Best Practices", d: "Ensure URL slugs are descriptive and contain keywords relevant to category for better search visibility." },
            { t: "Visual Cohesion", d: "Use high-resolution, neutral-background imagery for thumbnails to maintain the editorial shop aesthetic." },
            { t: "Status Logic", d: "Deactivating a category will hide all associated products from front-end navigation and search results." }
          ].map((card) => (
            <article key={card.t} className="border border-stone-200 bg-stone-50 p-4">
              <h3 className="text-sm font-bold uppercase tracking-[0.08em]">{card.t}</h3>
              <p className="mt-2 text-stone-600">{card.d}</p>
            </article>
          ))}
        </div>
      </section>

      <ActionModal
        open={modal.open}
        title="Delete category?"
        description={`Are you sure you want to drop category ${modal?.name}`}
        confirmText={`Type ${modal?.name} to confirm your action`}
        confirmLabel="Delete"
        name={modal?.name}
        onCancel={() => setModal({ open: false, id: null , name:null })}
        onConfirm={() => {
          if (modal.id) dispatch(deleteCategory(modal.id));
          setModal({ open: false, id: null , name:null });
        }}
      />
    </>
  );
};

export default CategoriesList;