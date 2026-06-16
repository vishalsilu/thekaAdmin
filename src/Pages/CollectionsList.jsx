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
  const loading = useSelector((state) => state.data.loading);
  const error = useSelector((state) => state.data.error);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState({ open: false, id: null });

  useEffect(() => {
    dispatch(getCollections());
  }, [dispatch]);

  const filtered = useMemo(
    () =>
      collections.filter((row) =>
        row.name?.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [collections, query]
  );

  const featuredCount = collections?.filter((row) => row?.featured?.some((item) => item.isFeatured)).length;
  const activeRate = Math.round((featuredCount / Math.max(collections.length, 1)) * 100);

  const handleDelete = async () => {
    if (!modal.id) return;
    await dispatch(deleteCollection(modal.id));
    setModal({ open: false, id: null });
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
            className="border border-black bg-black px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-white"
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
            <p className="text-xs uppercase tracking-[0.08em] text-stone-500">Active Status</p>
            <p className="mt-2 text-5xl font-bold">{activeRate}%</p>
          </div>
        </div>

        <div className="mt-4 border border-stone-200 bg-white">
          <div className="flex items-center gap-2 border-b border-stone-200 p-3">
            <input
              className="w-full max-w-sm border border-stone-300 px-3 py-2 text-sm"
              placeholder="Search collections..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="border border-stone-300 px-3 py-2 text-xs font-semibold uppercase">Filter</button>
          </div>

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
              {filtered.map((row) => {
                const featuredList = (Array.isArray(row?.featured) ? row.featured.filter((item) => item.isFeatured) : [])
                  .map((feat) => {
                    // If the featuredCategory is populated, it will have a `name`.
                    if (feat?.featuredCategory && typeof feat.featuredCategory === 'object' && feat.featuredCategory.name) {
                      return feat.featuredCategory.name;
                    }

                    // Otherwise, attempt to find the category name from the populated `allCategories` array
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
                      {featuredList.length > 0 ? `Featured (${featuredList.join(', ')})` : 'Not Featured'}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="border border-stone-300 px-2 py-1 text-xs font-semibold uppercase"
                          onClick={() => navigate(`/collections/${row._id}/edit`)}
                        >
                          Edit
                        </button>
                        <button
                          className="border border-red-300 px-2 py-1 text-xs font-semibold uppercase text-red-700"
                          onClick={() => setModal({ open: true, id: row._id })}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex items-center justify-between border-t border-stone-200 p-3 text-sm text-stone-500">
            <p>Showing 1 to {filtered.length} of {collections.length} collections</p>
            <div className="flex gap-1">
              <button className="border border-stone-300 px-2 py-1">Prev</button>
              <button className="border border-black bg-black px-2 py-1 text-white">1</button>
              <button className="border border-stone-300 px-2 py-1">2</button>
              <button className="border border-stone-300 px-2 py-1">3</button>
              <button className="border border-stone-300 px-2 py-1">Next</button>
            </div>
          </div>
        </div>
      </section>

      <ActionModal
        open={modal.open}
        title="Delete collection?"
        description="Deleting this collection will remove it from the admin dashboard and clear related collection caches."
        confirmLabel="Delete"
        onCancel={() => setModal({ open: false, id: null })}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default CollectionsList;
