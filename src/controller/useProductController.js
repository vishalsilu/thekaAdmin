import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../Redux/Controller/Product";
import { getCollections } from "../Redux/Controller/Collection";
import { getcategories } from "../Redux/Controller/Category";
import { compressImagesBatch } from "../services/compressImageBatch";
import api from "../config/api";

export const useProductController = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productId } = useParams();
  const isEdit = Boolean(productId);
  const MAX_VARIANT_IMAGES = 8;

  const products = useSelector((state) => state.data.products) || [];
  const loading = useSelector((state) => state.data.loading) || false;
  const collections = useSelector((state) => state.data.collections) || [];
  const categories = useSelector((state) => state.data.categories) || [];

  const [deals, setDeals] = useState([]);
  const [fabrics, setFabrics] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [fits, setFits] = useState([]);
  const [sizeTypes, setSizeTypes] = useState([]);
  const [discountTypes, setDiscountTypes] = useState([]);
  const [attrLoading, setAttrLoading] = useState(false);
  
  // FIX: Prevent form from constantly resetting when Redux updates in background
  const [isInitialized, setIsInitialized] = useState(false);

  const existing = useMemo(() => products.find((p) => p.id === productId), [productId, products]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Outerwear",
    collection: "Fall/Winter 2024",
    price: 0,
    sku: "",
    stock: 0,
    status: "ACTIVE",
    weight: 0.8,
    taxable: false,
    isFeatured: false,
    isSponsored: false,
    sponsorPriority: 0,
    sponsorUntil: "",
    deal: "",
    fabric: "",
    pattern: "",
    fit: "",
    sizeType: "",
    discount: { value: 0, type: "none" },
    variants: [],
    timeline: [],
    categoryId: ""
  });

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
    } catch (err) {
      console.error("Failed to load attributes", err);
    } finally {
      setAttrLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      dispatch(getProducts());
    }
    dispatch(getCollections());
  }, [productId, dispatch]);

  // Reset initialization if URL changes
  useEffect(() => {
    setIsInitialized(false);
  }, [productId]);

  useEffect(() => {
    // FIX: Only seed the form ONCE when the component mounts with valid existing data.
    if (existing && !isInitialized) {
      setForm({
        name: existing.name || "",
        description: existing.description || "",
        category: existing.category || existing.categoryInfo?.name || "Outerwear",
        collection: existing.collection || existing.collectionInfo?.name || "Fall/Winter 2024",
        categoryId: existing.categoryInfo?.id || existing.categoryInfo?._id || "",
        price: existing.price || 0,
        sku: existing.sku || existing.id || "",
        stock: existing.stock ?? 0,
        status: existing.status || "ACTIVE",
        weight: existing.weight || 0.8,
        taxable: existing.taxable ?? false,
        isFeatured: existing.isFeatured ?? false,
        isSponsored: existing.isSponsored ?? false,
        sponsorPriority: existing.sponsorPriority || 0,
        sponsorUntil: existing.sponsorUntil ? new Date(existing.sponsorUntil).toISOString().slice(0, 16) : "",
        deal: existing.deal || "",
        fabric: existing.fabric || "",
        pattern: existing.pattern || "",
        fit: existing.fit || "",
        sizeType: existing.sizeType || "",
        discount: existing.discount || { value: 0, type: "none" },
        variants: existing?.variants?.map((v, index) => ({
          ...v,
          id: v.id ?? v._id ?? Number(`${Date.now().toString().slice(-5)}${index}`),
          imageItems: normalizeVariantImages(v),
          sizes: v.sizes || [],
          images: v.images || []
        })) || [],
        timeline: Array.isArray(existing.timeline) ? existing.timeline.map((t) => ({ ...t })) : []
      });
      setIsInitialized(true); // Lock it down
    }
  }, [existing, isInitialized]);

  useEffect(() => {
    const coll = collections?.length > 0 ? collections?.find((c) => c.name === form.collection) || collections[0] : null;
    if (coll) dispatch(getcategories(coll._id));
    loadAttributes();
  }, [collections, form.collection, dispatch]);

  useEffect(() => {
    if (categories.length === 0) return;
    if (!form.category && !form.categoryId) return;
    const selectedCategory = categories.find((c) => c._id === form.categoryId);
    if (selectedCategory) return;
    const defaultCat = categories.find((c) => c.name === form.category);
    if (!defaultCat) return;
    setForm((p) => ({ ...p, category: defaultCat.name, categoryId: defaultCat._id }));
  }, [categories, form.category, form.categoryId]);

  const normalizeVariantImages = (variant) => {
    const existingImages = Array.isArray(variant?.images) ? variant.images : [];
    return existingImages.map((src) => createImageItem(src, "existing"));
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

  const changedValue = (value, existingValue) => {
    if (value === undefined) return false;
    return JSON.stringify(value) !== JSON.stringify(existingValue);
  };

  const buildSaveFormData = async () => {
    const fd = new FormData();
    const append = (field, value) => {
      if (value === undefined) return;
      if (value === null) return fd.append(field, "null");
      if (typeof value === "object") return fd.append(field, JSON.stringify(value));
      fd.append(field, String(value));
    };

    if (!isEdit) {
      const generatedId = form.id || form.sku || `prod-${Date.now()}`;
      append("id", generatedId);
    }

    const existingValues = existing || {};
    const simpleFields = ["name", "description", "price", "sku", "stock", "status", "weight", "taxable", "isFeatured", "deal", "fabric", "pattern", "fit", "sizeType", "discount", "timeline", "isSponsored", "sponsorPriority"];
    
    simpleFields.forEach(field => {
        if (!isEdit || changedValue(form[field], existingValues[field])) {
            append(field, form[field]);
        }
    });

    if (!isEdit || changedValue(form.sponsorUntil, existingValues.sponsorUntil)) {
        if (form.sponsorUntil && form.sponsorUntil.trim() !== "") {
            const parsedDate = new Date(form.sponsorUntil);
            if (!isNaN(parsedDate)) {
                append("sponsorUntil", parsedDate.toISOString());
            } else {
                append("sponsorUntil", null);
            }
        } else {
            append("sponsorUntil", null);
        }
    }

    const collectionObj = collections.find((c) => c.name === form.collection) || collections[0] || null;
    let categoryObj = categories.find((c) => c._id === form.categoryId) || categories.find((c) => c.name === form.category) || null;
    if (!categoryObj && form.categoryId) categoryObj = { _id: form.categoryId, name: form.category };

    const collectionInfo = collectionObj ? { id: collectionObj._id, name: collectionObj.name } : { name: form.collection };
    const categoryInfo = categoryObj ? { id: categoryObj._id, name: categoryObj.name } : { name: form.category };

    if (!isEdit || changedValue(collectionInfo, existingValues.collectionInfo)) append("collectionInfo", collectionInfo);
    if (!isEdit || changedValue(categoryInfo, existingValues.categoryInfo)) append("categoryInfo", categoryInfo);

    const variantsPayload = (form.variants || []).map((v, index) => ({
      id: v.id ?? v._id ?? Number(`${Date.now().toString().slice(-5)}${index}`),
      color: v.color || null,
      sizes: v.sizes || [],
      isDefault: !!v.isDefault,
      images: (v.imageItems || []).length ? (v.imageItems || []).map((item) => (item.type === "new" ? item.token : item.src)) : Array.isArray(v.images) ? v.images : []
    }));

    const hasVariantFiles = (form.variants || []).some((v) => (v.imageItems || []).some((item) => item.type === "new"));
    if (!isEdit || hasVariantFiles || changedValue(variantsPayload, existingValues.variants)) append("variants", variantsPayload);

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
      const uploadFile = compressedFile instanceof File ? compressedFile : new File([compressedFile], meta.originalFile.name, { type: compressedFile.type || meta.originalFile.type });
      fd.append("images", uploadFile);
      fd.append("imageVariantIndex[]", String(meta.variantIndex));
      fd.append("imageToken[]", meta.token);
    });

    return fd;
  };

  const handleSave = async () => {
    try {
      const fd = await buildSaveFormData();
      if (isEdit) {
        await dispatch(updateProduct({ id: productId, data: fd })).unwrap();
      } else {
        await dispatch(createProduct(fd)).unwrap();
      }
      await dispatch(getProducts());
      navigate("/inventory");
    } catch (err) {
      const errorText = err?.response?.data?.message || err?.response?.data?.error || err?.message || String(err);
      alert("Save failed: " + errorText);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this product permanently?")) return;
    try {
      await dispatch(deleteProduct(productId)).unwrap();
      await dispatch(getProducts());
      navigate("/inventory");
    } catch (err) {
      alert("Delete failed: " + (err?.message || "Unknown error"));
    }
  };

  // FIX: Optimistic Toggle Status
  const handleToggleStatus = async () => {
    if (!isEdit) return; 
    
    // 1. Instantly flip local state for a smooth UI experience
    const optimisticStatus = form.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
    setForm((prev) => ({ ...prev, status: optimisticStatus }));

    try {
      // 2. Perform API Call
      const res = await api.put(`/product/${productId}/status`);
      
      // 3. Confirm exact status with backend response
      setForm((prev) => ({ ...prev, status: res.data.status }));
      
      // 4. Update Redux in the background
      dispatch(getProducts()); 
    } catch (err) {
      // Revert if failed
      setForm((prev) => ({ ...prev, status: form.status }));
      const errorText = err?.response?.data?.message || err?.response?.data?.error || err?.message || String(err);
      alert("Failed to toggle status: " + errorText);
    }
  };

  const discountedPrice = useMemo(() => {
    const base = Number(form.price || 0);
    const val = Number(form.discount?.value || 0);
    const type = String(form.discount?.type || "none").toLowerCase();
    if (type === "percentage" && val > 0) return Number(Math.max(0, base - (base * val) / 100)).toFixed(2);
    if (type === "amount" && val > 0) return Number(Math.max(0, base - val)).toFixed(2);
    return Number(base).toFixed(2);
  }, [form.price, form.discount]);

  const defaultSizesByType = {
    numeric: [{ size: "28", stock: 0 }, { size: "30", stock: 0 }, { size: "32", stock: 0 }, { size: "34", stock: 0 }, { size: "36", stock: 0 }],
    alpha: [{ size: "XS", stock: 0 }, { size: "S", stock: 0 }, { size: "M", stock: 0 }, { size: "L", stock: 0 }, { size: "XL", stock: 0 }],
    free: [{ size: "Free Size", stock: 0 }]
  };

  const getDefaultSizes = () => {
    const st = (form.sizeType || "").toLowerCase();
    if (st.includes("numeric") || st.includes("number")) return defaultSizesByType.numeric;
    if (st.includes("alpha") || st.includes("letter")) return defaultSizesByType.alpha;
    if (st.includes("free")) return defaultSizesByType.free;
    return [{ size: "M", stock: 0 }];
  };

  return {
    form, setForm,
    loading, attrLoading, isEdit,
    title: isEdit ? "Update Product Listing" : "New Product Listing",
    discountedPrice,
    collections, categories, deals, fabrics, patterns, fits, sizeTypes, discountTypes,
    MAX_VARIANT_IMAGES,
    getDefaultSizes, createImageItem,
    handleSave, handleDelete, handleToggleStatus, navigate,
    requestAttributeCreate: async (key) => {
        const name = prompt(`Add new ${key}`);
        if (!name) return;
        await api.post(`/attributes/${key}`, { name });
        await loadAttributes();
    },
    requestAttributeRename: async (key, item) => {
        const name = prompt(`Rename ${key} value`, item.name);
        if (!name || name === item.name) return;
        await api.put(`/attributes/${key}/${item._id}`, { name });
        await loadAttributes();
    },
    requestAttributeDelete: async (key, item) => {
        if (!window.confirm(`Delete ${item.name}?`)) return;
        await api.delete(`/attributes/${key}/${item._id}`);
        await loadAttributes();
    }
  };
};