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
  const [modal, setModal] = useState({ open: false, id: null });

  const filtered = useMemo(
    () =>
      categories?.filter((row) =>
        row.name.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [categories, query]
  );
  
  useEffect(() => {
    dispatch(getAllCategories());
  },[])

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
          <div className="flex items-center justify-between border-b border-stone-200 p-3">
            <div className="flex gap-2">
              <button className="border border-stone-300 px-3 py-2 text-xs font-semibold uppercase">Filter</button>
              <button className="border border-stone-300 px-3 py-2 text-xs font-semibold uppercase">Sort</button>
              <input className="ml-1 w-64 border border-stone-300 px-3 py-2 text-sm" placeholder="Search category..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <p className="text-sm text-stone-500">Showing {filtered.length} of {categories.length} categories</p>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-[0.08em] text-stone-500">
                <th className="px-3 py-3">Image</th><th className="px-3 py-3">Name</th><th className="px-3 py-3">Parent Collection</th><th className="px-3 py-3">URL Slug</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories?.length > 0 && filtered.map((row) => (
                <tr key={row.id} className="border-t border-stone-100">
                  <td className="px-3 py-3"><img src={row.image || "https://via.placeholder.com/64?text=No+Image"} className="h-16 w-16 object-cover" alt={row.name} /></td>
                  <td className="px-3 py-3"><p className="font-semibold">{row?.name}</p><p className="text-xs text-stone-500">ID: {row?._id?.toString().toUpperCase()}</p></td>
                  <td className="px-3 py-3">{row.parentCollection?.name}</td>
                  <td className="px-3 py-3"><span className="bg-stone-100 px-2 py-1 text-sm">{row.path}</span></td>
                  <td className="px-3 py-3"><span className={`px-2 py-1 text-xs font-semibold uppercase ${row.isActive ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>{row.isActive ? "Active" : "Inactive"}</span></td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <button className="border border-stone-300 px-2 py-1 text-xs font-semibold uppercase" onClick={() => navigate(`/categories/${row._id}/edit`)}>Edit</button>
                      <button className="border border-stone-300 px-2 py-1 text-xs font-semibold uppercase" onClick={() => dispatch(updateCategory({ id: row._id, categoryData: { isActive: !row.isActive } }))}>{row.isActive ? "Disable" : "Enable"}</button>
                      <button className="border border-red-300 px-2 py-1 text-xs font-semibold uppercase text-red-700" onClick={() => setModal({ open: true, id: row._id })}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between border-t border-stone-200 p-3 text-sm text-stone-500">
            <button className="uppercase">← Previous</button>
            <div className="flex gap-3"><button className="px-2 py-1">1</button><button className="px-2 py-1 text-stone-400">2</button><button className="px-2 py-1 text-stone-400">3</button></div>
            <button className="uppercase">Next →</button>
          </div>
        </div>

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
        description="This removes the category from the catalog and updates the backend."
        confirmLabel="Delete"
        onCancel={() => setModal({ open: false, id: null })}
        onConfirm={() => {
          if (modal.id) dispatch(deleteCategory(modal.id));
          setModal({ open: false, id: null });
        }}
      />
    </>
  );
};

export default CategoriesList;
