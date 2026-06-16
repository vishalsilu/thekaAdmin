import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Topbar from "../components/layout/Topbar";
import { inventoryProducts } from "../data/inventoryData";
import { useDispatch, useSelector } from "react-redux";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../Redux/Controller/Product";
import { getCollections } from "../Redux/Controller/Collection";
import { compressImagesBatch } from "../services/compressImageBatch";
import { getcategories } from "../Redux/Controller/Category";
import api from "../config/api";

const ProductEditor = () => {
  const dispatch = useDispatch()
  const products = useSelector(state => state.data.products) || [];
  const loading = useSelector(state => state.data.loading) || false;
  const navigate = useNavigate();
  const { productId } = useParams();
  const isEdit = Boolean(productId);
  const MAX_VARIANT_IMAGES = 8;

  const collections = useSelector(state => state.data.collections) || [];
  const categories = useSelector(state => state.data.categories) || [];

  const [deals, setDeals] = useState([]);
  const [fabrics, setFabrics] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [fits, setFits] = useState([]);
  const [sizeTypes, setSizeTypes] = useState([]);
  const [discountTypes, setDiscountTypes] = useState([]);
  const [attrLoading, setAttrLoading] = useState(false);

  const loadAttributes = async () => {
    try {
      setAttrLoading(true);
      const [dRes, fRes, pRes, fitRes, stRes] = await Promise.all([
        api.get(`/attributes/deal`),
        api.get(`/attributes/fabric`),
        api.get(`/attributes/pattern`),
        api.get(`/attributes/fit`),
        api.get(`/attributes/sizeType`),
      ]);
      setDeals(dRes.data.data || []);
      setFabrics(fRes.data.data || []);
      setPatterns(pRes.data.data || []);
      setFits(fitRes.data.data || []);
      setSizeTypes(stRes.data.data || []);
      // discount is a product-owned object; discount type options are not managed via attributes here
    } catch (err) {
      console.error('Failed to load attributes', err);
    } finally {
      setAttrLoading(false);
    }
  };

  const createAttributeValue = async (key, name) => {
    const response = await api.post(`/attributes/${key}`, { name });
    return response.data.data;
  };

  const updateAttributeValue = async (key, id, name) => {
    const response = await api.put(`/attributes/${key}/${id}`, { name });
    return response.data.data;
  };

  const deleteAttributeValue = async (key, id) => {
    await api.delete(`/attributes/${key}/${id}`);
  };

  const requestAttributeCreate = async (key, setter) => {
    const name = prompt(`Add new ${key}`);
    if (!name) return;
    await createAttributeValue(key, name);
    await loadAttributes();
  };

  const requestAttributeRename = async (key, item) => {
    const name = prompt(`Rename ${key} value`, item.name);
    if (!name || name === item.name) return;
    await updateAttributeValue(key, item._id, name);
    await loadAttributes();
  };

  const requestAttributeDelete = async (key, item) => {
    if (!window.confirm(`Delete ${item.name}?`)) return;
    await deleteAttributeValue(key, item._id);
    await loadAttributes();
  };

  const defaultSizesByType = {
    numeric: [
      { size: '28', stock: 0 },
      { size: '30', stock: 0 },
      { size: '32', stock: 0 },
      { size: '34', stock: 0 },
      { size: '36', stock: 0 },
    ],
    alpha: [
      { size: 'XS', stock: 0 },
      { size: 'S', stock: 0 },
      { size: 'M', stock: 0 },
      { size: 'L', stock: 0 },
      { size: 'XL', stock: 0 },
    ],
    free: [{ size: 'Free Size', stock: 0 }],
  };

  const getDefaultSizes = () => {
    const sizeTypeKey = (form.sizeType || '').toLowerCase();
    if (sizeTypeKey.includes('numeric') || sizeTypeKey.includes('number') || sizeTypeKey.includes('numeric')) return defaultSizesByType.numeric;
    if (sizeTypeKey.includes('alpha') || sizeTypeKey.includes('letter') || sizeTypeKey.includes('alpha')) return defaultSizesByType.alpha;
    if (sizeTypeKey.includes('free') || sizeTypeKey.includes('freesize') || sizeTypeKey.includes('free size')) return defaultSizesByType.free;
    return [{ size: 'M', stock: 0 }];
  };

  const changedValue = (value, existingValue) => {
    if (value === undefined) return false;
    return JSON.stringify(value) !== JSON.stringify(existingValue);
  };

  // Timeline helpers: allow adding simple timeline entries to a product
  const addTimelineEntry = () => {
    setForm(p => ({ ...p, timeline: [...(p.timeline || []), { title: '', when: new Date().toISOString(), note: '' }] }));
  };

  const updateTimelineField = (index, field, value) => {
    setForm(p => {
      const tl = Array.isArray(p.timeline) ? [...p.timeline] : [];
      tl[index] = { ...(tl[index] || {}), [field]: value };
      return { ...p, timeline: tl };
    });
  };

  const removeTimelineEntry = (index) => {
    setForm(p => ({ ...p, timeline: (p.timeline || []).filter((_, i) => i !== index) }));
  };

  const createImageItem = (source, type = "existing", file = null, token = null) => {
    const previewUrl = type === "new" ? URL.createObjectURL(file) : source;
    return {
      id: `${type}-${Math.random().toString(36).slice(2, 8)}-${Date.now()}`,
      src: type === "new" ? previewUrl : source,
      previewUrl,
      type,
      token: token || (type === "new" ? `__NEWFILE__${Math.random().toString(36).slice(2, 8)}__` : null),
      file
    };
  };

  const normalizeVariantImages = (variant) => {
    const existingImages = Array.isArray(variant?.images) ? variant.images : [];
    return existingImages.map((src) => createImageItem(src, "existing"));
  };

  const buildSaveFormData = async () => {
    const fd = new FormData();

    const append = (field, value) => {
      if (value === undefined) return;
      if (value === null) {
        fd.append(field, 'null');
        return;
      }
      if (typeof value === 'object') {
        fd.append(field, JSON.stringify(value));
      } else {
        fd.append(field, String(value));
      }
    };

    if (!isEdit) {
      const generatedId = form.id || form.sku || `prod-${Date.now()}`;
      append('id', generatedId);
    }

    const existingValues = existing || {};
    if (!isEdit || changedValue(form.name, existingValues.name)) append('name', form.name);
    if (!isEdit || changedValue(form.description, existingValues.description)) append('description', form.description);
    if (!isEdit || changedValue(form.price, existingValues.price)) append('price', form.price);
    if (!isEdit || changedValue(form.sku, existingValues.sku)) append('sku', form.sku);
    if (!isEdit || changedValue(form.stock, existingValues.stock)) append('stock', form.stock);
    if (!isEdit || changedValue(form.status, existingValues.status)) append('status', form.status);
    if (!isEdit || changedValue(form.weight, existingValues.weight)) append('weight', form.weight);
    if (!isEdit || changedValue(form.taxable, existingValues.taxable)) append('taxable', form.taxable);
    if (!isEdit || changedValue(form.isFeatured, existingValues.isFeatured)) append('isFeatured', form.isFeatured);

    if (!isEdit || changedValue(form.deal, existingValues.deal)) append('deal', form.deal);
    if (!isEdit || changedValue(form.fabric, existingValues.fabric)) append('fabric', form.fabric);
    if (!isEdit || changedValue(form.pattern, existingValues.pattern)) append('pattern', form.pattern);
    if (!isEdit || changedValue(form.fit, existingValues.fit)) append('fit', form.fit);
    if (!isEdit || changedValue(form.sizeType, existingValues.sizeType)) append('sizeType', form.sizeType);
    if (!isEdit || changedValue(form.discount, existingValues.discount)) append('discount', form.discount);
    if (!isEdit || changedValue(form.timeline, existingValues.timeline)) append('timeline', form.timeline);

    if (!isEdit || changedValue(form.isSponsored, existingValues.isSponsored)) append('isSponsored', form.isSponsored);
    if (!isEdit || changedValue(form.sponsorPriority, existingValues.sponsorPriority)) append('sponsorPriority', form.sponsorPriority);
    if (!isEdit || changedValue(form.sponsorUntil, existingValues.sponsorUntil)) append('sponsorUntil', form.sponsorUntil ? new Date(form.sponsorUntil).toISOString() : null);

    const collectionObj = collections.find(c => c.name === form.collection) || collections[0] || null;
    let categoryObj = categories.find(c => c._id === form.categoryId) || categories.find(c => c.name === form.category) || null;
    if (!categoryObj && form.categoryId) {
      categoryObj = { _id: form.categoryId, name: form.category };
    }

    const collectionInfo = collectionObj ? { id: collectionObj._id, name: collectionObj.name } : { name: form.collection };
    const categoryInfo = categoryObj ? { id: categoryObj._id, name: categoryObj.name } : { name: form.category };

    if (!isEdit || changedValue(collectionInfo, existingValues.collectionInfo)) append('collectionInfo', collectionInfo);
    if (!isEdit || changedValue(categoryInfo, existingValues.categoryInfo)) append('categoryInfo', categoryInfo);

    const variantsPayload = (form.variants || []).map((v, index) => {
      const images = (v.imageItems || []).length
        ? (v.imageItems || []).map((item) => item.type === "new" ? item.token : item.src)
        : Array.isArray(v.images)
          ? v.images
          : [];

      return {
        id: v.id ?? v._id ?? Number(`${Date.now().toString().slice(-5)}${index}`),
        color: v.color || null,
        sizes: v.sizes || [],
        isDefault: !!v.isDefault,
        images
      };
    });

    const hasVariantFiles = (form.variants || []).some((variant) =>
      (variant.imageItems || []).some((item) => item.type === "new")
    );

    const shouldAppendVariants = !isEdit || hasVariantFiles || changedValue(variantsPayload, existingValues.variants);
    if (shouldAppendVariants) append('variants', variantsPayload);

    // Compress and append new variant image files along with their variant index and token
    const filesToCompress = [];
    const fileMetadata = [];

    (form.variants || []).forEach((variant, variantIndex) => {
      (variant.imageItems || [])
        .filter((item) => item.type === "new" && item.file)
        .forEach((item) => {
          filesToCompress.push(item.file);
          fileMetadata.push({ variantIndex, token: item.token, originalFile: item.file });
        });
    });

    const compressedFiles = filesToCompress.length ? await compressImagesBatch(filesToCompress) : [];

    fileMetadata.forEach((meta, index) => {
      const compressedFile = compressedFiles[index] || meta.originalFile;
      const uploadFile = compressedFile instanceof File
        ? compressedFile
        : new File([compressedFile], meta.originalFile.name, { type: compressedFile.type || meta.originalFile.type });

      fd.append('images', uploadFile);
      fd.append('imageVariantIndex[]', String(meta.variantIndex));
      fd.append('imageToken[]', meta.token);
    });

    // if (process.env.NODE_ENV !== 'production') {
    //   console.log('FormData entries:', [...fd.entries()].map(([key, value]) => ({ key, value: value instanceof File ? value.name : value })));
    //   console.log('Variant upload metadata:', form.variants?.map((variant, index) => ({ index, color: variant.color, newFiles: (variant.imageItems || []).filter(item => item.type === 'new').length })));
    // }

    return fd;
  };

useEffect(() => {
  // 1. Create an isolated async function inside the effect
  const fetchMyProducts = async () => {
    try {
      await dispatch(getProducts());
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  // 2. Only fetch if we have a productId
  // (Removed products.length === 0 to avoid the refresh race condition)
  if (productId) {
    fetchMyProducts();
  }
  // load collections for selectors
  dispatch(getCollections());
}, [productId, dispatch]); // Removed products.length from dependencies
  
  const existing = useMemo(
    () => products.find((p) => p.id === productId),
    [productId , products]
  );

  console.log('Existing product data:', existing); // Debug log to check existing product data
  const [form, setForm] = useState({
    name: existing?.name || "HAHA",
    description: existing?.description || "Hey man ",
    category: existing?.category || "Outerwear",
    collection: existing?.collection || "Fall/Winter 2024",
    price: existing?.price || 1200,
    sku: existing?.sku || "LX-W-JKT-001",
    stock: existing?.stock ?? 0,
    status: existing?.status || "ACTIVE",
    weight: 0.8,
    taxable: false,
    isFeatured: existing?.isFeatured ?? false,
    isSponsored: existing?.isSponsored || false,
    sponsorPriority: existing?.sponsorPriority || 0,
    sponsorUntil: existing?.sponsorUntil ? new Date(existing.sponsorUntil).toISOString().slice(0,16) : '',
    deal: existing?.deal || '',
    fabric: existing?.fabric || '',
    pattern: existing?.pattern || '',
    fit: existing?.fit || '',
    sizeType: existing?.sizeType || '',
    discount: existing?.discount || { value: 0, type: 'none' },
    variants : existing?.variants || [],
    timeline: existing?.timeline || [],
    categoryId: existing?.categoryInfo?.id || ''
  });

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name || "",
        description: existing.description || "",
        category: existing.category || existing.categoryInfo?.name || "Outerwear",
        collection: existing.collection || existing.collectionInfo?.name || "Fall/Winter 2024",
        categoryId: existing.categoryInfo?.id || existing.categoryInfo?._id || '',
        price: existing.price || 0,
        sku: existing.sku || existing.id || "LX-W-JKT-001",
        stock: existing.stock ?? 0,
        status: existing.status || "ACTIVE",
        weight: existing.weight || 0.8,
        taxable: existing.taxable ?? false,
        isFeatured: existing.isFeatured ?? false,
        isSponsored: existing.isSponsored ?? false,
        sponsorPriority: existing.sponsorPriority || 0,
        sponsorUntil: existing.sponsorUntil ? new Date(existing.sponsorUntil).toISOString().slice(0,16) : '',
        deal: existing.deal || '',
        fabric: existing.fabric || '',
        pattern: existing.pattern || '',
        fit: existing.fit || '',
        sizeType: existing.sizeType || '',
        discount: existing.discount || { value: 0, type: 'none' },
        variants: existing?.variants?.map((v, index) => ({
          ...v,
          id: v.id ?? v._id ?? Number(`${Date.now().toString().slice(-5)}${index}`),
          imageItems: normalizeVariantImages(v),
          sizes: v.sizes || [],
          images: v.images || []
        })) || [],
        timeline: Array.isArray(existing.timeline) ? existing.timeline.map(t => ({ ...t })) : []
      });
    }
  }, [existing]);

  useEffect(() => {
    // When collections load or form.collection changes, ensure categories are loaded for that collection
    const coll = collections?.length > 0 ? collections?.find(c => c.name === form.collection) || collections[0] : null;
    if (coll) dispatch(getcategories(coll._id));

    loadAttributes();
  }, [collections, form.collection, dispatch]);

  const discountedPrice = useMemo(() => {
    const basePrice = Number(form.price || 0);
    const discountValue = Number(form.discount?.value || 0);
    const discountType = String(form.discount?.type || 'none').toLowerCase();

    if (discountType === 'percentage' && discountValue > 0) {
      return Number(Math.max(0, basePrice - (basePrice * discountValue) / 100)).toFixed(2);
    }

    if (discountType === 'amount' && discountValue > 0) {
      return Number(Math.max(0, basePrice - discountValue)).toFixed(2);
    }

    return Number(basePrice).toFixed(2);
  }, [form.price, form.discount]);

  const title = isEdit ? "Update Product Listing" : "New Product Listing";

  

useEffect(() => {
  if (categories.length === 0) return;
  if (!form.category && !form.categoryId) return;

  const selectedCategory = categories.find(c => c._id === form.categoryId);
  if (selectedCategory) return;

  const defaultCat = categories.find(c => c.name === form.category);
  if (!defaultCat) return;

  setForm((p) => ({
    ...p,
    category: defaultCat.name,
    categoryId: defaultCat._id
  }));
}, [categories, form.category, form.categoryId]);

  return (
    <>
      <Topbar variant="inventory" searchPlaceholder="Search resources..." />

      <div className="mt-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">
          Inventory <span className="mx-2">›</span> {isEdit ? "Update Product" : "Add New Product"}
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-5xl font-bold tracking-tight">{title}</h1>
          <div className="flex gap-2">
            <button
              type="button"
              className="border border-stone-300 bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.1em]"
              onClick={() => navigate("/inventory")}
            >
              Cancel
            </button>
        <button onClick={()=>handleSave()} className="border border-black bg-black px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-white">{isEdit ? loading ? 'Updating...' : 'Update Product' : loading ? 'Creating...' : 'Save Product'}</button>
      </div>
        </div>
      </div>

      <section className="mt-6 grid gap-4 2xl:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className="border border-stone-200 bg-white p-5">
            <h2 className="mb-4 text-3xl font-semibold">General Information</h2>
            <div className="space-y-3">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500">
                Product Name
                <input className="mt-1.5 w-full border border-stone-300 px-3 py-2.5 text-sm outline-none" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Cashmere Oversized Blazer" />
              </label>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500">
                Description
                <textarea className="mt-1.5 h-28 w-full border border-stone-300 px-3 py-2.5 text-sm outline-none" placeholder="Describe the product materials, fit, and origin..." value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} />
              </label>
              <div className="border-t border-stone-100 pt-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500">Timeline</p>
                  <button type="button" onClick={addTimelineEntry} className="text-sm">+ Add Entry</button>
                </div>
                <div className="mt-3 space-y-3">
                  {(form.timeline || []).map((t, idx) => (
                    <div key={idx} className="space-y-1 border rounded p-3">
                      <div className="flex gap-2">
                        <input className="flex-1 border border-stone-300 px-2 py-1 text-sm" placeholder="Title" value={t.title || ''} onChange={(e) => updateTimelineField(idx, 'title', e.target.value)} />
                        <input type="datetime-local" className="w-56 border border-stone-300 px-2 py-1 text-sm" value={t.when ? new Date(t.when).toISOString().slice(0,16) : ''} onChange={(e) => updateTimelineField(idx, 'when', new Date(e.target.value).toISOString())} />
                        <button type="button" onClick={() => removeTimelineEntry(idx)} className="text-xs text-red-600">Remove</button>
                      </div>
                      <textarea className="w-full border border-stone-300 px-2 py-1 text-sm" placeholder="Notes" value={t.note || ''} onChange={(e) => updateTimelineField(idx, 'note', e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500">
                  Category
                 <select 
  className="mt-1.5 w-full border border-stone-300 px-3 py-2.5 text-sm outline-none" 
  value={form.categoryId || ""} 
  onChange={(e) => {
    const categoryId = e.target.value;
    const selectedCategory = categories.find(c => c._id === categoryId);
    setForm((p) => ({ 
      ...p, 
      categoryId, 
      category: selectedCategory?.name || "" 
    }));
  }}
>
  {/* Always show a neutral placeholder option when no valid category is selected */}
  <option value="" disabled>Select Category</option>
  
  {categories.map(c => (
    <option key={c._id} value={c._id}>
      {c.name}
    </option>
  ))}
</select>
                </label>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500">
                  Collection
                  <select className="mt-1.5 w-full border border-stone-300 px-3 py-2.5 text-sm outline-none" value={form.collection} onChange={(e) => {
                    const collName = e.target.value;
                    setForm((p) => ({ ...p, collection: collName, categoryId: '', category: '' }));
                    const collObj = collections.find(c => c.name === collName);
                    if (collObj) dispatch(getcategories(collObj._id));
                  }}>
                    <option value="" disabled>Select Collection</option>
                    {collections?.length > 0 ? collections.map((c) => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    )) : null}
                  </select>
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-3 mt-3">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500">
                  Deal
                  <div className="flex gap-2 items-center">
                    <select className="mt-1.5 w-full border border-stone-300 px-3 py-2.5 text-sm outline-none" value={form.deal || ''} onChange={(e) => setForm(p => ({ ...p, deal: e.target.value }))}>
                      <option value="">None</option>
                      {deals.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                    </select>
                    <button type="button" onClick={async () => { const name = prompt('Add new deal value'); if (!name) return; await api.post(`/attributes/deal`, { name }); const res = await api.get('/attributes/deal'); setDeals(res.data.data || []); }} className="text-sm">Manage</button>
                  </div>
                </label>

                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500">
                  Fabric
                  <div className="flex gap-2 items-center">
                    <select className="mt-1.5 w-full border border-stone-300 px-3 py-2.5 text-sm outline-none" value={form.fabric || ''} onChange={(e) => setForm(p => ({ ...p, fabric: e.target.value }))}>
                      <option value="">Select fabric</option>
                      {fabrics.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                    </select>
                    <button type="button" onClick={async () => { const name = prompt('Add new fabric'); if (!name) return; await api.post(`/attributes/fabric`, { name }); const res = await api.get('/attributes/fabric'); setFabrics(res.data.data || []); }} className="text-sm">Manage</button>
                  </div>
                </label>

                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500">
                  Pattern
                  <div className="flex gap-2 items-center">
                    <select className="mt-1.5 w-full border border-stone-300 px-3 py-2.5 text-sm outline-none" value={form.pattern || ''} onChange={(e) => setForm(p => ({ ...p, pattern: e.target.value }))}>
                      <option value="">Select pattern</option>
                      {patterns.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                    </select>
                    <button type="button" onClick={async () => { const name = prompt('Add new pattern'); if (!name) return; await api.post(`/attributes/pattern`, { name }); const res = await api.get('/attributes/pattern'); setPatterns(res.data.data || []); }} className="text-sm">Manage</button>
                  </div>
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-2 mt-3">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500">
                  Fit
                  <div className="flex gap-2 items-center">
                    <select className="mt-1.5 w-full border border-stone-300 px-3 py-2.5 text-sm outline-none" value={form.fit || ''} onChange={(e) => setForm(p => ({ ...p, fit: e.target.value }))}>
                      <option value="">Select fit</option>
                      {fits.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                    </select>
                    <button type="button" onClick={async () => { const name = prompt('Add new fit'); if (!name) return; await api.post(`/attributes/fit`, { name }); const res = await api.get('/attributes/fit'); setFits(res.data.data || []); }} className="text-sm">Manage</button>
                  </div>
                </label>

                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500">
                  Size Type
                  <div className="flex gap-2 items-center">
                    <select className="mt-1.5 w-full border border-stone-300 px-3 py-2.5 text-sm outline-none" value={form.sizeType || ''} onChange={(e) => setForm(p => ({ ...p, sizeType: e.target.value }))}>
                      <option value="">Select size type</option>
                      {sizeTypes.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                    </select>
                    <button type="button" onClick={async () => { const name = prompt('Add new sizeType'); if (!name) return; await api.post(`/attributes/sizeType`, { name }); const res = await api.get('/attributes/sizeType'); setSizeTypes(res.data.data || []); }} className="text-sm">Manage</button>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="border border-stone-200 bg-white p-5">
            <h2 className="mb-4 text-3xl font-semibold">Manage Attribute Values</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { label: 'Deals', items: deals, key: 'deal' },
                { label: 'Fabric', items: fabrics, key: 'fabric' },
                { label: 'Pattern', items: patterns, key: 'pattern' },
                { label: 'Fit', items: fits, key: 'fit' },
                { label: 'Size Types', items: sizeTypes, key: 'sizeType' }
              ].map((group) => (
                <div key={group.key} className="border border-stone-200 p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-500">{group.label}</h3>
                    <button type="button" onClick={() => requestAttributeCreate(group.key)} className="text-xs uppercase text-slate-700">+ Add</button>
                  </div>
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {group.items.length > 0 ? group.items.map(item => (
                      <div key={item._id} className="flex items-center justify-between rounded border border-stone-200 px-2 py-2 text-sm">
                        <span>{item.name}</span>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => requestAttributeRename(group.key, item)} className="text-xs text-amber-700">Edit</button>
                          <button type="button" onClick={() => requestAttributeDelete(group.key, item)} className="text-xs text-red-700">Delete</button>
                        </div>
                      </div>
                    )) : (
                      <p className="text-xs text-stone-500">No {group.label.toLowerCase()} added yet.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-stone-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-3xl font-semibold">Product Media</h2>
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500">Up to 8 Images</span>
            </div>
            <div className="grid min-h-44 place-items-center border border-dashed border-stone-300 text-center">
              <div>
                <p className="text-lg">☁</p>
                <p className="font-semibold">Drag & drop your product imagery here</p>
                <p className="text-xs uppercase tracking-[0.08em] text-stone-500">or click to browse files</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {form.variants && form.variants.length > 0 ? (
                form.variants.map((v, i) => (
                  <div key={i} className="overflow-hidden rounded border border-stone-200 bg-stone-50 p-3">
                    <div className="grid grid-cols-4 gap-1">
                      {Array.from({ length: MAX_VARIANT_IMAGES }).map((_, thumbIndex) => {
                        const imgItem = v.imageItems?.[thumbIndex];
                        return (
                          <div key={thumbIndex} className="h-16 overflow-hidden rounded bg-white">
                            {imgItem ? (
                              <img src={imgItem.previewUrl || imgItem.src} alt={`variant-${i}-${thumbIndex}`} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center bg-stone-100 text-[10px] uppercase tracking-[0.12em] text-stone-500">empty</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-stone-600">
                      <span>{v.color || 'Variant'}</span>
                      <span>{Math.min(MAX_VARIANT_IMAGES, v.imageItems?.length || 0)} / {MAX_VARIANT_IMAGES}</span>
                    </div>
                  </div>
                ))
              ) : (
                Array.from({ length: 2 }).map((_, i) => (
                  <button key={i} type="button" className="grid h-20 w-full place-items-center rounded border border-stone-300 bg-stone-50 text-xl text-stone-500">+</button>
                ))
              )}
            </div>
          </div>

          <div className="border border-stone-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-3xl font-semibold">Product Variants</h2>
              <button type="button" onClick={() => setForm(p => ({ ...p, variants: [...(p.variants||[]), { id: Number(`${Date.now().toString().slice(-5)}${Math.floor(Math.random() * 900) + 100}`), color: '', sizes: getDefaultSizes(), images: [], imageItems: [], _new: true } ] }))} className="text-[11px] font-bold uppercase tracking-[0.1em] text-stone-600">+ Add Variant Option</button>
            </div>
            {form?.variants?.map((v, vi) => (
              <div key={vi} className="mb-3 border p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500">Variant {vi + 1}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <input placeholder="Color" value={v.color || ''} onChange={(e) => setForm(p => ({ ...p, variants: p.variants.map((vv, idx) => idx===vi ? { ...vv, color: e.target.value } : vv) }))} className="border px-2 py-1 text-sm" />
                    <label className="cursor-pointer rounded border border-stone-300 bg-stone-50 px-3 py-2 text-xs uppercase tracking-[0.08em] text-stone-700">
                      Add images
                      <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length === 0) return;
                        setForm(p => ({
                          ...p,
                          variants: p.variants.map((vv, idx) => {
                            if (idx !== vi) return vv;
                            const existingItems = vv.imageItems || normalizeVariantImages(vv);
                            const availableSlots = Math.max(0, MAX_VARIANT_IMAGES - existingItems.length);
                            const newItems = files.slice(0, availableSlots).map((file) => createImageItem(file, "new", file));
                            return { ...vv, imageItems: [...existingItems, ...newItems] };
                          })
                        }));
                      }} />
                    </label>
                    <button type="button" onClick={() => setForm(p => ({ ...p, variants: p.variants.filter((_, idx) => idx !== vi) }))} className="text-red-600">Remove</button>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {(v.imageItems || []).slice(0, MAX_VARIANT_IMAGES).map((imgItem, imgIndex) => (
                    <div key={`preview-${vi}-${imgIndex}`} className="relative overflow-hidden rounded border border-stone-200 bg-stone-50">
                      <img src={imgItem.previewUrl || imgItem.src || 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500&h=600&fit=crop'} alt={`variant-${vi}-${imgIndex}`} className="h-auto w-full object-cover" />
                      <div className="absolute inset-0 flex flex-col justify-between bg-black/25 p-2 opacity-0 transition-opacity hover:opacity-100">
                        <button type="button" onClick={() => setForm(p => ({
                          ...p,
                          variants: p.variants.map((vv, idx) => idx === vi ? { ...vv, imageItems: (vv.imageItems || []).filter((_, j) => j !== imgIndex) } : vv)
                        }))} className="rounded bg-red-600 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-white">Delete</button>
                        <label className="rounded bg-white/90 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-slate-700">
                          Replace
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                            const replacementFile = e.target.files?.[0];
                            if (!replacementFile) return;
                            setForm(p => ({
                              ...p,
                              variants: p.variants.map((vv, idx) => {
                                if (idx !== vi) return vv;
                                const items = vv.imageItems || [];
                                return {
                                  ...vv,
                                  imageItems: items.map((item, j) => {
                                    if (j !== imgIndex) return item;
                                    return createImageItem(replacementFile, "new", replacementFile, item.token);
                                  })
                                };
                              })
                            }));
                          }} />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
                {v.imageItems?.length < MAX_VARIANT_IMAGES ? (
                  <div className="mt-2 text-xs text-stone-500">You can upload up to {MAX_VARIANT_IMAGES} images for each variant.</div>
                ) : (
                  <div className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">Variant image slots full</div>
                )}
                <div className="mt-3 space-y-2">
                  {v?.sizes?.map((s, i) => (
                    <div key={`${vi}-${i}`} className="grid grid-cols-3 gap-2 rounded border border-stone-200 p-2 text-xs">
                      <div>
                        <div className="mb-1 text-[11px] uppercase tracking-[0.08em] text-stone-500">Size</div>
                        <input className="w-full border border-stone-300 px-2 py-1 text-sm" value={s?.size || ''} onChange={(e) => setForm((p) => ({ ...p, variants: p.variants.map((variant, idx) => idx === vi ? { ...variant, sizes: variant.sizes.map((size, j) => j === i ? { ...size, size: e.target.value } : size) } : variant) }))} />
                      </div>
                      <div>
                        <div className="mb-1 text-[11px] uppercase tracking-[0.08em] text-stone-500">Stock</div>
                        <input type="number" min="0" className="w-full border border-stone-300 px-2 py-1 text-sm" onChange={(e) => setForm((p) => ({ ...p, variants: p.variants.map((variant, idx) => idx === vi ? { ...variant, sizes: variant.sizes.map((size, j) => j === i ? { ...size, stock: Number(e.target.value) } : size) } : variant) }))} value={s?.stock} />
                      </div>
                      <button type="button" onClick={() => setForm((p) => ({ ...p, variants: p.variants.map((variant, idx) => idx === vi ? { ...variant, sizes: variant.sizes.filter((_, j) => j !== i) } : variant) }))} className="self-end rounded bg-red-50 px-2 py-1 text-red-700">Delete</button>
                    </div>
                  ))}
                </div>
                <div className="mt-2">
                  <button type="button" onClick={() => setForm(p => ({ ...p, variants: p.variants.map((vv, idx) => idx===vi ? { ...vv, sizes: [...(vv.sizes||[]), { size: getDefaultSizes()[vv.sizes?.length % getDefaultSizes().length]?.size || 'M', stock: 0 }] } : vv) }))} className="text-sm">+ Add Size</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="border border-stone-200 bg-white p-5">
            <h3 className="mb-4 text-3xl font-semibold">Pricing & Stock</h3>
            <div className="space-y-3">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500">Base Price (INR)
                <input type="number" className="mt-1.5 w-full border border-stone-300 px-3 py-2.5 text-sm outline-none" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))} />
              </label>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500">Discounted Price (INR)
                <input type="text" className="mt-1.5 w-full border border-stone-300 px-3 py-2.5 text-sm outline-none bg-stone-50" value={discountedPrice} disabled />
              </label>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500">Product Id
                <input className="mt-1.5 w-full border border-stone-300 px-3 py-2.5 text-sm outline-none" value={form.sku} disabled />
              </label>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500">Stock Quantity
                <input type="number" className="mt-1.5 w-full border border-stone-300 px-3 py-2.5 text-sm outline-none" value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: Number(e.target.value) }))} />
              </label>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500">Status
                <select className="mt-1.5 w-full border border-stone-300 px-3 py-2.5 text-sm outline-none" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                  <option value="ACTIVE">Active</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </label>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500">Discount Type
                <select className="mt-1.5 w-full border border-stone-300 px-3 py-2.5 text-sm outline-none" value={form.discount.type} onChange={(e) => setForm(p => ({ ...p, discount: { ...p.discount, type: e.target.value } }))}>
                  <option value="none">None</option>
                  {discountTypes.length > 0 ? discountTypes.map(d => (
                    <option key={d._id} value={d.name}>{d.name}</option>
                  )) : (
                    <>
                      <option value="percentage">Percentage</option>
                      <option value="amount">Amount</option>
                    </>
                  )}
                </select>
              </label>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500">Discount Value
                <input type="number" className="mt-1.5 w-full border border-stone-300 px-3 py-2.5 text-sm outline-none" value={form.discount.value} onChange={(e) => setForm(p => ({ ...p, discount: { ...p.discount, value: Number(e.target.value) } }))} />
              </label>
            </div>
          </div>

          <div className="border border-stone-200 bg-white p-5">
            <h3 className="mb-4 text-3xl font-semibold">Shipping Details</h3>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500">Weight (KG)
              <input type="number" step="0.1" className="mt-1.5 w-full border border-stone-300 px-3 py-2.5 text-sm outline-none" value={form.weight} onChange={(e) => setForm((p) => ({ ...p, weight: Number(e.target.value) }))} />
            </label>
            <label className="mt-4 flex items-start gap-2 text-sm text-stone-700">
              <input type="checkbox" checked={form.taxable} onChange={(e) => setForm((p) => ({ ...p, taxable: e.target.checked }))} />
              <span>Charge tax on this product</span>
            </label>
            <label className="mt-4 flex items-start gap-2 text-sm text-stone-700">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((p) => ({ ...p, isFeatured: e.target.checked }))} />
              <span>Mark as featured</span>
            </label>
            <label className="mt-3 block text-sm text-stone-700">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.isSponsored} onChange={(e) => setForm((p) => ({ ...p, isSponsored: e.target.checked }))} />
                <span>Sponsored (always shown first in category)</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input type="number" min="0" className="w-full border border-stone-300 px-3 py-2 text-sm" value={form.sponsorPriority} onChange={(e) => setForm(p => ({ ...p, sponsorPriority: Number(e.target.value) }))} placeholder="Priority" />
                <input type="datetime-local" className="w-full border border-stone-300 px-3 py-2 text-sm" value={form.sponsorUntil || ''} onChange={(e) => setForm(p => ({ ...p, sponsorUntil: e.target.value }))} />
              </div>
            </label>
          </div>

          <div className="border border-stone-200 bg-white p-4">
            <img src={existing?.thumbnail || form?.images?.[0]} alt="preview" className="h-auto w-full object-cover" />
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-500">Live Preview</p>
            <p className="text-3xl font-semibold">{form.name || "Cashmere Blazer"}</p>
            <p className="text-3xl font-bold">₹{Number(form.price || 0).toLocaleString('en-IN')}</p>
          </div>
        </aside>
      </section>
      <div className="mt-6 flex gap-2">
        {isEdit && (
          <button
            type="button"
            className="border border-red-600 bg-red-600/10 px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-red-700"
            onClick={async () => {
              if (!window.confirm('Delete this product permanently?')) return;
              try {
                await dispatch(deleteProduct(productId)).unwrap();
                await dispatch(getProducts());
                navigate('/inventory');
              } catch (deleteError) {
                alert('Delete failed: ' + (deleteError?.message || deleteError || 'Unknown error'));
              }
            }}
          >
            Delete
          </button>
        )}
        <button onClick={()=>handleSave()} className="border border-black bg-black px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-white">{isEdit ? loading ? 'Updating...' : 'Update Product' : loading ? 'Creating...' : 'Save Product'}</button>
      </div>
    </>
  );

 async function handleSave() {
  try {
    // FIX 1: Explicitly await the async form builder promise to unwrap the underlying FormData object
    const fd = await buildSaveFormData(); 
    
    // Quick local diagnostics validation

    if (isEdit) {
      // FIX 2: Pass individual structural fields cleanly down into Redux 
      // without nesting the pure FormData element inside a regular object body wrapper
      await dispatch(updateProduct({ id: productId, data: fd })).unwrap();
    } else {
      await dispatch(createProduct(fd)).unwrap();
    }

    await dispatch(getProducts());
    navigate('/inventory');
  } catch (err) {
    console.error('Save failed', err);
    
    const safeStringify = (value) => {
      const seen = new WeakSet();
      try {
        return JSON.stringify(value, (key, innerValue) => {
          if (typeof innerValue === 'function') {
            return `[function ${innerValue.name || 'anonymous'}]`;
          }
          if (typeof innerValue === 'object' && innerValue !== null) {
            if (seen.has(innerValue)) return '[Circular]';
            seen.add(innerValue);
          }
          return innerValue;
        }, 2);
      } catch (_) {
        return String(value);
      }
    };

    let errorText = 'Save failed';
    if (typeof err === 'string') {
      errorText = err;
    } else if (err?.message) {
      errorText = err.message;
    } else if (err?.response?.data?.message) {
      errorText = err.response.data.message;
    } else if (err?.response?.data?.error) {
      errorText = err.response.data.error;
    } else if (err?.response?.data) {
      errorText = safeStringify(err.response.data);
    } else if (typeof err === 'object') {
      errorText = safeStringify(err);
    } else {
      errorText = String(err);
    }
    alert('Save failed: ' + errorText);
  }
}

};

export default ProductEditor;
