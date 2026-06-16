import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Topbar from "../components/layout/Topbar";
import ActionModal from "../components/ui/ActionModal";
import {
  getAllCategories,
  createCategory,
  updateCategory
} from "../Redux/Controller/Category";
import { getCollections } from "../Redux/Controller/Collection";

const wearTypes = [
  "TopWear",
  "FootWear",
  "Accessories",
  "BottomWear",
  "Outerwear",
  "Underwear",
  "Activewear",
  "Sleepwear",
  "Swimwear"
];

const CategoriesEditor = () => {
  const { categoryId } = useParams();
  const isEdit = Boolean(categoryId);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const categories = useSelector((state) => state.data.allCategories) || [];
  const collections = useSelector((state) => state.data.collections) || [];
  const category = isEdit ? categories.find((cat) => cat._id === categoryId) : null;

  const [form, setForm] = useState({
    name: "",
    path: name,
    description: "",
    metaTitle: "",
    isActive: true,
    parentCollection: "",
    wearType: "TopWear"
  });
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    dispatch(getAllCategories());
    dispatch(getCollections());
  }, [dispatch]);

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name || "",
        path: category.path || "",
        description: category.description || "",
        metaTitle: category.metaTitle || "",
        isActive: category.isActive ?? true,
        parentCollection: category.parentCollection?._id || "",
        wearType: category.wearType || "TopWear"
      });
      setImagePreview(category.image || "");
      setSelectedImageFile(null);
    }
  }, [category]);

  useEffect(() => {
  if (!form.name) {
    setForm(prev => ({ ...prev, path: "" }));
    return;
  }

  // Find the text name of the selected collection
  const selectedCol = collections.find(c => c._id === form.parentCollection);
  const collectionSlug = selectedCol 
    ? selectedCol.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    : "uncategorized";

  // Clean the category name for the URL
  const categorySlug = form.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // replace spaces & special chars with hyphens
    .replace(/(^-|-$)/g, "");     // trim hanging hyphens

  setForm(prev => ({
    ...prev,
    path: `/${collectionSlug}/${categorySlug}`
  }));
}, [form.name, form.parentCollection, collections]);

  const buildCategoryFormData = () => {
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("path", form.path);
    fd.append("isActive", String(form.isActive));
    fd.append("parentCollection", form.parentCollection);
    fd.append("wearType", form.wearType);

    if (form.description) fd.append("description", form.description);
    if (form.metaTitle) fd.append("metaTitle", form.metaTitle);
    if (selectedImageFile) fd.append("image", selectedImageFile);

    return fd;
  };

  const handleSave = async () => {
    setError("");

    if (!form.name.trim() || !form.path.trim() || !form.parentCollection) {
      setError("Name, slug, and parent collection are required.");
      setModalOpen(false);
      return;
    }

    if (!isEdit && !selectedImageFile) {
      setError("Please upload a category image.");
      setModalOpen(false);
      return;
    }

    const formData = buildCategoryFormData();

    try {
      if (isEdit) {
        await dispatch(updateCategory({ id: categoryId, categoryData: formData })).unwrap();
        setNotice("Category updated successfully.");
      } else {
        await dispatch(createCategory(formData)).unwrap();
        setNotice("Category created successfully.");
      }
      navigate("/categories");
    } catch (saveError) {
      setError(saveError?.message || saveError || "Unable to save category.");
    } finally {
      setModalOpen(false);
    }
  };

  return (
    <>
      <Topbar variant="inventory" searchPlaceholder="Quick search..." />

      <section className="mt-6">
        <p className="text-[11px] uppercase tracking-[0.1em] text-stone-500">
          Categories › {isEdit ? "Edit Category" : "Create Category"}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-5xl font-bold uppercase">{isEdit ? form.name || "Edit Category" : "Create Category"}</h1>
          <div className="flex gap-2">
            <button
              type="button"
              className="border border-stone-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.08em]"
              onClick={() => {
                setForm({
                  name: "",
                  path: "",
                  description: "",
                  metaTitle: "",
                  isActive: true,
                  parentCollection: "",
                  image: "",
                  wearType: "TopWear"
                });
                setNotice("");
                setError("");
              }}
            >
              Reset
            </button>
            <button
              type="button"
              className="border border-black bg-black px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white"
              onClick={() => setModalOpen(true)}
            >
              Save Changes
            </button>
          </div>
        </div>
        {notice ? <p className="mt-2 text-sm text-emerald-700">{notice}</p> : null}
        {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}

        <div className="mt-5 grid gap-4 xl:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <div className="border border-stone-200 bg-white p-4">
              <h2 className="text-3xl font-semibold uppercase">General Information</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">
                  Category Name *
                  <input
                    className="mt-1 w-full border border-stone-300 px-3 py-2 text-sm"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </label>
                <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">
                  URL Path / Slug *
                  <input
                    className="mt-1 w-full border border-stone-300 px-3 py-2 text-sm"
                    value={form.path}
                    onChange={(e) => setForm((prev) => ({ ...prev, path: e.target.value }))}
                  />
                </label>
              </div>
              <label className="mt-3 block text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">
                Description
                <textarea
                  className="mt-1 h-28 w-full border border-stone-300 px-3 py-2 text-sm"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </label>
            </div>

            <div className="border border-stone-200 bg-white p-4">
              <h2 className="text-3xl font-semibold uppercase">Search Engine Optimization</h2>
              <label className="mt-3 block text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">
                Meta Title
                <input
                  className="mt-1 w-full border border-stone-300 px-3 py-2 text-sm"
                  value={form.metaTitle}
                  onChange={(e) => setForm((prev) => ({ ...prev, metaTitle: e.target.value }))}
                />
              </label>
              <p className="mt-1 text-xs text-stone-500">
                Recommended: 50-60 characters · current {form.metaTitle.length}
              </p>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="border border-stone-200 bg-white p-4">
              <h3 className="text-3xl font-semibold uppercase">Organization</h3>
              <label className="mt-4 flex items-center justify-between text-sm">
                <span>
                  <span className="block text-[11px] uppercase tracking-[0.08em] text-stone-500">Is Active</span>
                  <span className="text-stone-600">Visible in main navigation</span>
                </span>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                />
              </label>
              <label className="mt-4 block text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">
                Parent Collection *
                <select
                  className="mt-1 w-full border border-stone-300 px-3 py-2 text-sm"
                  value={form.parentCollection}
                  onChange={(e) => setForm((prev) => ({ ...prev, parentCollection: e.target.value }))}
                >
                  <option value="">Select collection</option>
                  {collections.map((collection) => (
                    <option key={collection._id} value={collection._id}>
                      {collection.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mt-4 block text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">
                Wear Type *
                <select
                  className="mt-1 w-full border border-stone-300 px-3 py-2 text-sm"
                  value={form.wearType}
                  onChange={(e) => setForm((prev) => ({ ...prev, wearType: e.target.value }))}
                >
                  {wearTypes.map((wear) => (
                    <option key={wear} value={wear}>
                      {wear}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="border border-stone-200 bg-white p-4">
              <h3 className="text-3xl font-semibold uppercase">Category Image</h3>
              <label className="mt-3 block text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  className="mt-1 w-full border border-stone-300 px-3 py-2 text-sm"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
              <div className="mt-4 h-72 overflow-hidden rounded border border-stone-200 bg-stone-100">
                <img
                  src={imagePreview || "https://via.placeholder.com/900x300?text=Category+Image"}
                  alt="category preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mt-2 text-xs uppercase tracking-[0.1em] text-stone-500">
                Recommended: 2400 x 300px · upload a new image or leave blank to keep the existing one.
              </p>
            </div>

            <div className="border border-stone-200 bg-white p-4">
              <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-stone-500">Summary</h4>
              <div className="mt-2 space-y-1 text-sm">
                <p className="flex justify-between">
                  <span>Linked Products</span> <span className="font-semibold">42 items</span>
                </p>
                <p className="flex justify-between">
                  <span>Last Modified</span> <span className="font-semibold">2h ago</span>
                </p>
                <p className="flex justify-between">
                  <span>Active Promotions</span> <span className="font-semibold text-red-700">None</span>
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <ActionModal
        open={modalOpen}
        title="Save category changes?"
        description="This saves the category to the backend database."
        confirmLabel="Save"
        onCancel={() => setModalOpen(false)}
        onConfirm={handleSave}
      />
    </>
  );
};

export default CategoriesEditor;
