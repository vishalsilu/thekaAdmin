import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Topbar from "../components/layout/Topbar";
import ActionModal from "../components/ui/ActionModal";
import { getCollections, createCollection, updateCollection } from "../Redux/Controller/Collection";
import { getAllCategories } from "../Redux/Controller/Category";

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/900x600?text=No+collection+image";

const CollectionsEditor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const previewUrlRef = useRef(null);
  const { collectionId } = useParams();
  const collections = useSelector((state) => state.data.collections || []);
  const categories = useSelector((state) => state.data.allCategories || []);
  const [form, setForm] = useState({
    name: "",
    description: "",
    path: "",
    featured: false,
    featuredCategoryIds: [],
    publicVisibility: false
  });
  const [imagePreview, setImagePreview] = useState(PLACEHOLDER_IMAGE);
  const [imageFile, setImageFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [savedAt, setSavedAt] = useState(new Date());
  const [modal, setModal] = useState({ type: null, open: false });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const collection = useMemo(
    () => collections.find((col) => col._id === collectionId || col.id === collectionId),
    [collections, collectionId]
  );

  const linkedCategories = useMemo(
    () => categories.filter((category) => {
      const parentId = category.parentCollection?._id || category.parentCollection?.id || category.parentCollection;
      return String(parentId) === String(collection?._id);
    }),
    [categories, collection]
  );

  useEffect(() => {
    dispatch(getCollections());
    dispatch(getAllCategories());
  }, [dispatch]);

  useEffect(() => {
    if (collectionId && collection) {
      const featuredCategoryIds = Array.isArray(collection.featured)
        ? collection.featured
            .filter((item) => item.isFeatured && item.featuredCategory)
            .map((item) => String(item.featuredCategory._id || item.featuredCategory))
        : [];

      setForm({
        name: collection.name || "",
        description: collection.description || "",
        path: collection.path || "",
        featured: featuredCategoryIds.length > 0,
        featuredCategoryIds,
        publicVisibility: collection.isActive ?? false
      });
      setImagePreview(collection.image || PLACEHOLDER_IMAGE);
      setImageFile(null);
      setRemoveImage(false);
    }
  }, [collectionId, collection]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const status = useMemo(
    () => (form.publicVisibility ? "Published" : "Not Published"),
    [form.publicVisibility]
  );

  const openModal = (type) => setModal({ type, open: true });
  const closeModal = () => setModal({ type: null, open: false });

  const normalizeSlug = (text) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  // Keep the `path` in sync with `name` (realtime, lowercase slug) and make it read-only
  useEffect(() => {
    const slug = normalizeSlug(form.name || "");
    setForm((prev) => ({ ...prev, path: slug ? `/${slug}` : "" }));
  }, [form.name]);

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;
    setImageFile(file);
    setImagePreview(previewUrl);
    setRemoveImage(false);
    setNotice("Image selected and ready to upload.");
  };

  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeCurrentImage = () => {
    setImageFile(null);
    setRemoveImage(true);
    setImagePreview(PLACEHOLDER_IMAGE);
    setNotice("Image removed. Save to persist deletion.");
  };

  const buildPayload = () => {
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      path: form.path.trim() || `/${normalizeSlug(form.name)}`,
      featured: form.featured
        ? form.featuredCategoryIds.map((categoryId) => ({
            isFeatured: true,
            featuredCategory: categoryId
          }))
        : [],
      isActive: form.publicVisibility
    };

    if (!payload.path.startsWith("/")) {
      payload.path = `/${payload.path}`;
    }

    if (imageFile) {
      payload.imageFile = imageFile;
    }

    if (removeImage) {
      payload.removeImage = true;
    }

    return payload;
  };

  const submitCollection = async () => {
    setError("");
    if (!form.name.trim()) {
      setError("Collection name is required.");
      return;
    }

    try {
      const payload = buildPayload();
      if (collectionId) {
        await dispatch(updateCollection({ id: collectionId, collectionData: payload })).unwrap();
        setNotice("Collection updated successfully.");
      } else {
        await dispatch(createCollection(payload)).unwrap();
        setNotice("Collection created successfully.");
      }
      navigate("/collections");
    } catch (saveError) {
      setError(saveError || "Unable to save collection.");
    }
  };

  const applyAction = () => {
    if (modal.type === "discard") {
      setForm({
        name: "",
        description: "",
        path: "",
        featured: false,
        featuredCategoryIds: [],
        publicVisibility: false
      });
      setImageFile(null);
      setRemoveImage(false);
      setImagePreview(PLACEHOLDER_IMAGE);
      setNotice("Draft discarded.");
    }

    if (modal.type === "save") {
      submitCollection();
    }

    closeModal();
  };

  return (
    <>
      <Topbar variant="inventory" searchPlaceholder="Search resources..." />

      <section className="mt-6">
        <p className="text-[11px] uppercase tracking-[0.1em] text-stone-500">
          Admin / Collections / {collectionId ? "Edit" : "New Entry"}
        </p>
        <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold uppercase">{collectionId ? "Edit Collection" : "Create Collection"}</h1>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="border border-stone-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.08em]"
              onClick={() => openModal("discard")}
            >
              Discard
            </button>
            <button
              type="button"
              className="border border-black bg-black px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white"
              onClick={() => openModal("save")}
            >
              Save Collection
            </button>
          </div>
        </div>

        {notice ? <p className="mt-2 text-sm text-emerald-700">{notice}</p> : null}
        {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}

        <div className="mt-5 grid gap-4 xl:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <div className="border border-stone-200 bg-white p-4">
              <h2 className="text-xl font-semibold">Collection Details</h2>
              <div className="mt-4 space-y-3">
                <label className="block text-sm">
                  <span className="text-stone-500">Collection Name</span>
                  <input
                    className="mt-1 w-full border border-stone-300 px-3 py-2 outline-none"
                    placeholder="e.g. Autumnal Architectural Series"
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-stone-500">URL Path / Slug</span>
                  <input
                    className="mt-1 w-full border border-stone-300 px-3 py-2 outline-none"
                    placeholder="/autumn-architectural-series"
                    value={form.path}
                    disabled={true}
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-stone-500">Description (Optional)</span>
                  <textarea
                    className="mt-1 h-28 w-full border border-stone-300 px-3 py-2 outline-none"
                    placeholder="Describe the aesthetic narrative..."
                    value={form.description}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                  />
                </label>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="border border-stone-200 bg-white p-4">
                <h3 className="text-xl font-semibold">Featured Status</h3>
                <p className="mt-2 text-stone-600">
                  Add or remove this collection from the featured editorial category.
                </p>
                <label className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        featured: e.target.checked,
                        featuredCategoryIds: e.target.checked ? prev.featuredCategoryIds : []
                      }))
                    }
                  />
                  Feature this collection
                </label>
                {form.featured && (
                  <div className="mt-4 text-sm">
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <span className="text-stone-500">Featured Categories</span>
                      <span className="text-xs uppercase tracking-[0.08em] text-stone-400">
                        {form.featuredCategoryIds.length} selected
                      </span>
                    </div>

                    {linkedCategories.length ? (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {linkedCategories.map((category) => {
                          const categoryId = String(category._id || category.id);
                          const selected = form.featuredCategoryIds.includes(categoryId);
                          return (
                            <button
                              type="button"
                              key={categoryId}
                              className={`rounded border px-3 py-2 text-left text-sm transition ${selected ? 'border-black bg-black text-white' : 'border-stone-300 bg-white text-stone-700 hover:border-stone-500'}`}
                              onClick={() => {
                                setForm((prev) => {
                                  const selectedIds = prev.featuredCategoryIds.includes(categoryId)
                                    ? prev.featuredCategoryIds.filter((id) => id !== categoryId)
                                    : [...prev.featuredCategoryIds, categoryId];
                                  return { ...prev, featuredCategoryIds: selectedIds };
                                });
                              }}
                            >
                              {category.name}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-stone-500">
                        Add linked categories to this collection first to feature them.
                      </p>
                    )}

                    {form.featuredCategoryIds.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {form.featuredCategoryIds.map((categoryId) => {
                          const category = linkedCategories.find((item) => String(item._id || item.id) === categoryId);
                          return (
                            <span key={categoryId} className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700">
                              {category?.name || categoryId}
                              <button
                                type="button"
                                className="text-stone-500 hover:text-stone-900"
                                onClick={() => {
                                  setForm((prev) => ({
                                    ...prev,
                                    featuredCategoryIds: prev.featuredCategoryIds.filter((id) => id !== categoryId)
                                  }));
                                }}
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border border-stone-200 bg-white p-4">
                <h3 className="text-xl font-semibold">Linked Categories</h3>
                <p className="mt-2 text-stone-600">
                  These categories belong to this collection and are visible in product filters.
                </p>
                <div className="mt-4 space-y-2 text-sm text-stone-700">
                  {collection?.allCategories?.length ? (
                    collection.allCategories.slice(0, 5).map((category) => (
                      <div key={category._id || category.id} className="rounded border border-stone-200 px-3 py-2">
                        {category.name}
                      </div>
                    ))
                  ) : (
                    <p className="text-stone-400">No linked categories yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="border border-stone-200 bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xl font-semibold">Cover Imagery</h3>
                <button
                  type="button"
                  className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-500"
                  onClick={openFilePicker}
                >
                  Upload
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
              <div className="grid h-52 place-items-center border border-dashed border-stone-300 bg-stone-50 text-center">
                <button
                  type="button"
                  className="text-sm text-stone-600"
                  onClick={openFilePicker}
                >
                  Upload Hero Image
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between border border-stone-200 px-3 py-2 text-sm">
                <span>{imageFile ? imageFile.name : imagePreview && imagePreview !== PLACEHOLDER_IMAGE ? imagePreview.split('/').pop() : 'collection_hero.png'}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="text-stone-500"
                    onClick={openFilePicker}
                  >
                    Replace
                  </button>
                  {(imagePreview && imagePreview !== PLACEHOLDER_IMAGE) && (
                    <button
                      type="button"
                      className="text-xs uppercase tracking-[0.08em] text-red-600"
                      onClick={removeCurrentImage}
                    >
                      Delete Image
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="border border-stone-200 bg-black p-3 text-white">
              <img
                src={imagePreview || PLACEHOLDER_IMAGE}
                alt="preview"
                className="h-auto w-full object-cover"
              />
              <p className="mt-3 text-xs uppercase tracking-[0.1em] text-stone-400">
                Preview Look
              </p>
              <p className="text-lg font-semibold">
                {form.name || "Editorial Draft"}
              </p>
              <p className="text-sm text-stone-300">Status: {status}</p>
            </div>
          </aside>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-stone-200 pt-4 text-sm text-stone-500">
          <p>Last saved: {savedAt.toLocaleTimeString()}</p>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.publicVisibility}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, publicVisibility: e.target.checked }))
              }
            />
            Public visibility
          </label>
        </div>
      </section>

      <ActionModal
        open={modal.open}
        title={modal.type === "discard" ? "Discard changes?" : "Save this collection?"}
        description={
          modal.type === "discard"
            ? "Discard all unsaved edits for this collection."
            : "Save your changes and update the collection in the admin dashboard."
        }
        confirmLabel={modal.type === "discard" ? "Discard" : "Save"}
        onCancel={closeModal}
        onConfirm={applyAction}
      />
    </>
  );
};

export default CollectionsEditor;
