import React from "react";
import Topbar from "../components/layout/Topbar";
import { useProductController } from "../controller/useProductController.js"; 

const ProductEditor = () => {
  const {
    form, setForm,
    loading, attrLoading, isEdit, title, discountedPrice,
    collections, categories, deals, fabrics, patterns, fits, sizeTypes, discountTypes,
    MAX_VARIANT_IMAGES, getDefaultSizes, createImageItem,
    handleSave, handleDelete, handleToggleStatus, navigate, 
    requestAttributeCreate, requestAttributeRename, requestAttributeDelete
  } = useProductController();

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-20">
      <Topbar variant="inventory" searchPlaceholder="Search resources..." />

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500 mb-2">
          Inventory <span className="mx-2 text-zinc-300">›</span> {isEdit ? "Update" : "Add New"}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-4xl font-black tracking-tight text-zinc-900">{title}</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/inventory")} className="px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors">
              Cancel
            </button>
            {isEdit && (
              <button onClick={handleDelete} className="px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                Delete
              </button>
            )}
            <button onClick={handleSave} disabled={loading} className="px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 disabled:opacity-70 transition-colors">
              {loading ? "Saving..." : isEdit ? "Update Product" : "Save Product"}
            </button>
          </div>
        </div>

        <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          {/* --- LEFT COLUMN --- */}
          <div className="space-y-6">
            
            {/* General Info Card */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-black tracking-tight text-zinc-900 mb-5">General Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Product Name</label>
                  <input className="w-full px-4 py-2.5 text-sm font-medium border border-zinc-200 rounded-xl focus:border-zinc-900 focus:outline-none transition-colors bg-zinc-50 focus:bg-white" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Cashmere Oversized Blazer" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Description</label>
                  <textarea className="w-full h-28 px-4 py-3 text-sm font-medium border border-zinc-200 rounded-xl focus:border-zinc-900 focus:outline-none transition-colors bg-zinc-50 focus:bg-white resize-none" placeholder="Describe the product materials, fit, and origin..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Collection</label>
                    <select className="w-full px-4 py-2.5 text-sm font-medium border border-zinc-200 rounded-xl focus:border-zinc-900 focus:outline-none bg-zinc-50" value={form.collection} onChange={(e) => {
                      setForm({ ...form, collection: e.target.value, categoryId: '', category: '' });
                    }}>
                      <option value="" disabled>Select Collection</option>
                      {collections.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Category</label>
                    <select className="w-full px-4 py-2.5 text-sm font-medium border border-zinc-200 rounded-xl focus:border-zinc-900 focus:outline-none bg-zinc-50" value={form.categoryId || ""} onChange={(e) => {
                      const selectedCategory = categories.find(c => c._id === e.target.value);
                      setForm({ ...form, categoryId: e.target.value, category: selectedCategory?.name || "" });
                    }}>
                      <option value="" disabled>Select Category</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Variants Card */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black tracking-tight text-zinc-900">Product Variants & Media</h2>
                <button type="button" onClick={() => setForm({ ...form, variants: [...(form.variants||[]), { id: Number(`${Date.now().toString().slice(-5)}${Math.floor(Math.random() * 900) + 100}`), color: '', sizes: getDefaultSizes(), images: [], imageItems: [], _new: true } ] })} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                  + Add Variant
                </button>
              </div>

              {form?.variants?.length === 0 && (
                 <div className="text-center py-10 border border-dashed border-zinc-300 rounded-xl bg-zinc-50">
                    <p className="text-sm font-semibold text-zinc-500">No variants added yet. Add a variant to upload images and set sizes.</p>
                 </div>
              )}

              <div className="space-y-6">
                {form?.variants?.map((v, vi) => (
                  <div key={vi} className="border border-zinc-200 rounded-xl p-4 bg-zinc-50/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-zinc-200">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold">{vi + 1}</span>
                        <input placeholder="Color / Style Name" value={v.color || ''} onChange={(e) => setForm({ ...form, variants: form.variants.map((vv, idx) => idx===vi ? { ...vv, color: e.target.value } : vv) })} className="px-3 py-1.5 text-sm font-semibold border border-zinc-300 rounded-lg focus:border-zinc-900 outline-none w-48" />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-100 transition-colors">
                          Upload Images
                          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length === 0) return;
                            setForm({
                              ...form,
                              variants: form.variants.map((vv, idx) => {
                                if (idx !== vi) return vv;
                                const existingItems = vv.imageItems || normalizeVariantImages(vv);
                                const availableSlots = Math.max(0, MAX_VARIANT_IMAGES - existingItems.length);
                                const newItems = files.slice(0, availableSlots).map((file) => createImageItem(file, "new", file));
                                return { ...vv, imageItems: [...existingItems, ...newItems] };
                              })
                            });
                          }} />
                        </label>
                        <button type="button" onClick={() => setForm({ ...form, variants: form.variants.filter((_, idx) => idx !== vi) })} className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-800">Remove</button>
                      </div>
                    </div>

                    {/* Variant Images Grid */}
                    {v.imageItems?.length > 0 && (
                      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 mb-6">
                        {(v.imageItems || []).slice(0, MAX_VARIANT_IMAGES).map((imgItem, imgIndex) => (
                          <div key={`preview-${vi}-${imgIndex}`} className="group relative aspect-square rounded-lg border border-zinc-200 overflow-hidden bg-white">
                            <img src={imgItem.previewUrl || imgItem.src} alt={`var-${vi}-img-${imgIndex}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button type="button" onClick={() => setForm({ ...form, variants: form.variants.map((vv, idx) => idx === vi ? { ...vv, imageItems: (vv.imageItems || []).filter((_, j) => j !== imgIndex) } : vv) })} className="bg-red-600 text-white p-1.5 rounded-md hover:bg-red-700">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Variant Sizes Grid */}
                    <div className="space-y-2">
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Sizes & Stock</span>
                          <button type="button" onClick={() => setForm({ ...form, variants: form.variants.map((vv, idx) => idx===vi ? { ...vv, sizes: [...(vv.sizes||[]), { size: getDefaultSizes()[vv.sizes?.length % getDefaultSizes().length]?.size || 'M', stock: 0 }] } : vv) })} className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-black">
                            + Add Size
                          </button>
                       </div>
                      {v?.sizes?.map((s, i) => (
                        <div key={`${vi}-${i}`} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-zinc-200">
                          <input placeholder="Size (e.g. M, 32)" className="w-1/3 border border-zinc-200 px-3 py-1.5 text-sm font-semibold rounded-md outline-none focus:border-zinc-900 bg-zinc-50" value={s?.size || ''} onChange={(e) => setForm({ ...form, variants: form.variants.map((variant, idx) => idx === vi ? { ...variant, sizes: variant.sizes.map((size, j) => j === i ? { ...size, size: e.target.value } : size) } : variant) })} />
                          <div className="w-1/3 flex items-center border border-zinc-200 rounded-md bg-zinc-50 overflow-hidden focus-within:border-zinc-900">
                             <span className="px-2 text-zinc-400 text-xs font-semibold border-r border-zinc-200 bg-zinc-100">Qty</span>
                             <input type="number" min="0" className="w-full px-2 py-1.5 text-sm font-semibold outline-none bg-transparent" onChange={(e) => setForm({ ...form, variants: form.variants.map((variant, idx) => idx === vi ? { ...variant, sizes: variant.sizes.map((size, j) => j === i ? { ...size, stock: Number(e.target.value) } : size) } : variant) })} value={s?.stock} />
                          </div>
                          <button type="button" onClick={() => setForm({ ...form, variants: form.variants.map((variant, idx) => idx === vi ? { ...variant, sizes: variant.sizes.filter((_, j) => j !== i) } : variant) })} className="p-1.5 rounded-md text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors ml-auto">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attributes Management Card */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-black tracking-tight text-zinc-900 mb-5">Product Attributes</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                 {/* Selectors for specific properties */}
                {[
                  { label: "Deal", key: "deal", options: deals },
                  { label: "Fabric", key: "fabric", options: fabrics },
                  { label: "Pattern", key: "pattern", options: patterns },
                  { label: "Fit", key: "fit", options: fits },
                  { label: "Size Type", key: "sizeType", options: sizeTypes },
                ].map(attr => (
                  <div key={attr.key}>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">{attr.label}</label>
                    <select className="w-full px-3 py-2 text-sm font-medium border border-zinc-200 rounded-xl focus:border-zinc-900 focus:outline-none bg-zinc-50" value={form[attr.key] || ''} onChange={(e) => setForm({ ...form, [attr.key]: e.target.value })}>
                      <option value="">None</option>
                      {attr.options.map(o => <option key={o._id} value={o.name}>{o.name}</option>)}
                    </select>
                  </div>
                ))}
              </div>

               {/* Mini Attribute Managers */}
               <div className="border-t border-zinc-100 pt-5 mt-2">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Manage Attribute Dictionaries</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   {[
                    { label: 'Deals', items: deals, key: 'deal' },
                    { label: 'Fabrics', items: fabrics, key: 'fabric' },
                    { label: 'Patterns', items: patterns, key: 'pattern' },
                    { label: 'Fits', items: fits, key: 'fit' },
                  ].map((group) => (
                    <div key={group.key} className="border border-zinc-200 rounded-xl overflow-hidden flex flex-col h-32">
                      <div className="flex items-center justify-between bg-zinc-50 px-3 py-2 border-b border-zinc-200">
                         <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{group.label}</span>
                         <button onClick={() => requestAttributeCreate(group.key)} className="text-[10px] font-black uppercase text-indigo-600 hover:underline">+ Add</button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-white">
                        {group.items.length > 0 ? group.items.map(item => (
                          <div key={item._id} className="flex items-center justify-between text-xs font-medium text-zinc-700 px-2 py-1 rounded hover:bg-zinc-50">
                            <span>{item.name}</span>
                            <div className="flex gap-2">
                              <button onClick={() => requestAttributeRename(group.key, item)} className="text-zinc-400 hover:text-indigo-600">✎</button>
                              <button onClick={() => requestAttributeDelete(group.key, item)} className="text-zinc-400 hover:text-red-600">✕</button>
                            </div>
                          </div>
                        )) : <div className="text-[10px] text-zinc-400 text-center py-2">Empty</div>}
                      </div>
                    </div>
                  ))}
                 </div>
               </div>
            </div>

          </div>

          {/* --- RIGHT COLUMN --- */}
          <div className="space-y-6">
            
            {/* Pricing & Status Card */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-black tracking-tight text-zinc-900 mb-5">Pricing & Status</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Base Price (₹)</label>
                  <input type="number" className="w-full px-4 py-2.5 text-sm font-bold border border-zinc-200 rounded-xl focus:border-zinc-900 focus:outline-none bg-zinc-50" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Discount Type</label>
                    <select className="w-full px-3 py-2.5 text-sm font-medium border border-zinc-200 rounded-xl focus:border-zinc-900 outline-none bg-zinc-50" value={form.discount.type} onChange={(e) => setForm({ ...form, discount: { ...form.discount, type: e.target.value } })}>
                      <option value="none">None</option>
                      <option value="percentage">Percentage (%)</option>
                      <option value="amount">Flat Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                     <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Value</label>
                     <input type="number" disabled={form.discount.type === 'none'} className="w-full px-3 py-2.5 text-sm font-bold border border-zinc-200 rounded-xl focus:border-zinc-900 outline-none bg-zinc-50 disabled:opacity-50" value={form.discount.value} onChange={(e) => setForm({ ...form, discount: { ...form.discount, value: Number(e.target.value) } })} />
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Final Price</span>
                   <span className="text-lg font-black text-emerald-700">₹{discountedPrice}</span>
                </div>

                <div className="pt-2 border-t border-zinc-100">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">SKU ID</label>
                  <input className="w-full px-4 py-2 text-sm font-mono border border-zinc-200 rounded-xl bg-zinc-100 text-zinc-500" value={form.sku || (isEdit ? "Auto-generated" : "Will generate on save")} disabled />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Total Stock</label>
                    <input type="number" className="w-full px-4 py-2.5 text-sm font-bold border border-zinc-200 rounded-xl focus:border-zinc-900 outline-none bg-zinc-50" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Status</label>
                    {isEdit ? (
                      <button
                        type="button"
                        onClick={handleToggleStatus}
                        className={`w-full px-4 py-2.5 text-sm font-bold border rounded-xl outline-none transition-colors flex items-center justify-center gap-2 ${
                          form.status === 'ACTIVE'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-zinc-100 border-zinc-300 text-zinc-600 hover:bg-zinc-200'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${form.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-zinc-400'}`}></span>
                        {form.status === 'ACTIVE' ? 'Published' : 'Drafted'}
                      </button>
                    ) : (
                      <select className="w-full px-3 py-2.5 text-sm font-bold border border-zinc-200 rounded-xl focus:border-zinc-900 outline-none bg-zinc-50" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                        <option value="ACTIVE">● Published</option>
                        <option value="DRAFT">○ Drafted</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Visibility & Shipping Card */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-black tracking-tight text-zinc-900 mb-5">Visibility & Logistics</h2>
              
              <div className="space-y-4">
                <div>
                   <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Weight (KG)</label>
                   <input type="number" step="0.1" className="w-full px-4 py-2.5 text-sm font-medium border border-zinc-200 rounded-xl focus:border-zinc-900 outline-none bg-zinc-50" value={form.weight} onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })} />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-3 p-3 border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-50 transition-colors">
                    <input type="checkbox" className="w-4 h-4 accent-zinc-900" checked={form.taxable} onChange={(e) => setForm({ ...form, taxable: e.target.checked })} />
                    <span className="text-sm font-semibold text-zinc-700">Charge tax on product</span>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-50 transition-colors">
                    <input type="checkbox" className="w-4 h-4 accent-zinc-900" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
                    <span className="text-sm font-semibold text-zinc-700">Mark as Featured</span>
                  </label>
                </div>

                {/* Fixed Sponsor Section */}
                <div className="p-4 border border-indigo-100 bg-indigo-50/50 rounded-xl mt-4">
                   <label className="flex items-center gap-3 mb-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-indigo-600" checked={form.isSponsored} onChange={(e) => setForm({ ...form, isSponsored: e.target.checked })} />
                    <span className="text-sm font-bold text-indigo-900">Sponsored Product</span>
                  </label>
                  
                  <div className={`grid grid-cols-2 gap-2 transition-opacity ${form.isSponsored ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                     <div>
                       <label className="block text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-1">Priority</label>
                       <input type="number" min="0" className="w-full border border-indigo-200 px-3 py-2 text-sm rounded-lg focus:border-indigo-500 outline-none bg-white" value={form.sponsorPriority} onChange={(e) => setForm({ ...form, sponsorPriority: Number(e.target.value) })} placeholder="Priority" />
                     </div>
                     <div>
                       <label className="block text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-1">Until (Optional)</label>
                       <input type="datetime-local" className="w-full border border-indigo-200 px-3 py-2 text-sm rounded-lg focus:border-indigo-500 outline-none bg-white" value={form.sponsorUntil || ''} onChange={(e) => setForm({ ...form, sponsorUntil: e.target.value })} />
                     </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductEditor;