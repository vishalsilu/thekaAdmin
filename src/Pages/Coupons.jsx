import { useEffect, useState } from 'react';
import Topbar from '../components/layout/Topbar';
import adminApi from '../config/api';

const defaultCoupon = {
  code: '',
  title: '',
  description: '',
  type: 'amount',
  value: 0,
  maxDiscount: '',
  minOrderValue: 0,
  usageLimit: '',
  perUserLimit: '',
  startAt: '',
  endAt: '',
  isActive: true,
};

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [formData, setFormData] = useState(defaultCoupon);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadCoupons = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminApi.get('coupons/admin');
      setCoupons(response.data?.coupons || []);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Failed to load coupons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setFormData(defaultCoupon);
    setError('');
    setSuccess('');
  };

  const handleEdit = (coupon) => {
    setEditingId(coupon._id);
    setFormData({
      code: coupon.code || '',
      title: coupon.title || '',
      description: coupon.description || '',
      type: coupon.type || 'amount',
      value: coupon.value ?? 0,
      maxDiscount: coupon.maxDiscount ?? '',
      minOrderValue: coupon.minOrderValue ?? 0,
      usageLimit: coupon.usageLimit ?? '',
      perUserLimit: coupon.perUserLimit ?? '',
      startAt: coupon.startAt ? coupon.startAt.split('T')[0] : '',
      endAt: coupon.endAt ? coupon.endAt.split('T')[0] : '',
      isActive: coupon.isActive ?? true,
    });
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (couponId) => {
    if (!window.confirm('Delete this coupon permanently?')) return;
    setSaving(true);
    setError('');
    try {
      await adminApi.delete(`coupons/admin/${couponId}`);
      await loadCoupons();
      if (editingId === couponId) resetForm();
      setSuccess('Coupon deleted successfully.');
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Failed to delete coupon.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    const payload = {
      code: formData.code.trim().toUpperCase(),
      title: formData.title,
      description: formData.description,
      type: formData.type,
      value: Number(formData.value || 0),
      maxDiscount: formData.maxDiscount === '' ? null : Number(formData.maxDiscount),
      minOrderValue: Number(formData.minOrderValue || 0),
      usageLimit: formData.usageLimit === '' ? null : Number(formData.usageLimit),
      perUserLimit: formData.perUserLimit === '' ? null : Number(formData.perUserLimit),
      startAt: formData.startAt || null,
      endAt: formData.endAt || null,
      isActive: formData.isActive,
    };

    try {
      if (editingId) {
        await adminApi.patch(`coupons/admin/${editingId}`, payload);
        setSuccess('Coupon updated successfully.');
      } else {
        await adminApi.post('coupons/admin', payload);
        setSuccess('Coupon created successfully.');
      }
      await loadCoupons();
      resetForm();
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Failed to save coupon.');
    } finally {
      setSaving(false);
    }
  };

  const activeCount = coupons.filter((coupon) => coupon.isActive).length;
  const expiringSoonCount = coupons.filter((coupon) => coupon.endAt && new Date(coupon.endAt) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length;
  
  const formatCouponValue = (coupon) => {
    if (coupon.type === 'percentage') return `${coupon.value}%`;
    if (coupon.type === 'shipping') return 'Free Shipping';
    return `₹${coupon.value}`;
  };

  const formatTypeLabel = (type) => {
    if (type === 'percentage') return 'Percentage';
    if (type === 'shipping') return 'Shipping';
    return 'Amount';
  };

  const formatDate = (value) => {
    if (!value) return 'Never';
    return String(value).split('T')[0];
  };

  return (
    <>
      <Topbar variant="dashboard" searchPlaceholder="Search coupons..." />
      <div className="p-6">
        
        {/* HEADER SECTION */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.1em] text-stone-500">Admin / Commerce</p>
            <h1 className="text-4xl font-bold mt-1 tracking-tight uppercase">Coupons</h1>
            <p className="mt-2 max-w-2xl text-sm text-stone-500">
              Manage promotional codes, expiry rules, and dynamic checkout discounts.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={resetForm}
              className="border border-stone-300 bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Clear Form
            </button>
            <button 
              onClick={loadCoupons}
              className="border border-black bg-black px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-stone-800 transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="mb-6 grid gap-3 md:grid-cols-3">
          <div className="border border-stone-200 bg-white p-4">
            <p className="text-[10px] uppercase tracking-[0.1em] text-stone-500 font-bold">Total Offers</p>
            <p className="mt-2 text-4xl font-bold text-black">{coupons.length}</p>
          </div>
          <div className="border border-stone-200 bg-white p-4">
            <p className="text-[10px] uppercase tracking-[0.1em] text-stone-500 font-bold">Live Coupons</p>
            <p className="mt-2 text-4xl font-bold text-emerald-600">{activeCount}</p>
          </div>
          <div className="border border-stone-200 bg-white p-4">
            <p className="text-[10px] uppercase tracking-[0.1em] text-stone-500 font-bold">Expiring Soon (&lt; 7 Days)</p>
            <p className="mt-2 text-4xl font-bold text-rose-600">{expiringSoonCount}</p>
          </div>
        </div>

        {/* WORKSPACE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 items-start">
          
          {/* LEFT: COUPON LIBRARY TABLE */}
          <div className="border border-stone-200 bg-white">
            <div className="border-b border-stone-200 p-4 bg-stone-50 flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-stone-800">
                Coupon Library
              </h3>
            </div>
            
            <div className="overflow-x-auto max-h-[800px] overflow-y-auto">
              {loading ? (
                <div className="p-10 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-stone-500">
                  Loading coupons...
                </div>
              ) : coupons.length === 0 ? (
                <div className="p-10 text-center text-sm text-stone-500">
                  No coupons found. Create one using the builder.
                </div>
              ) : (
                <table className="w-full border-collapse text-left">
                  <thead className="sticky top-0 bg-white shadow-sm z-10">
                    <tr className="text-[10px] font-bold uppercase tracking-[0.1em] text-stone-500 border-b border-stone-200">
                      <th className="px-4 py-4">Code / Offer</th>
                      <th className="px-4 py-4">Conditions</th>
                      <th className="px-4 py-4">Validity</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((coupon) => (
                      <tr key={coupon._id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="font-bold text-stone-900 tracking-wider text-sm">{coupon.code}</div>
                          <div className="mt-1 text-[10px] uppercase tracking-[0.1em] text-stone-500">
                            {formatTypeLabel(coupon.type)}: {formatCouponValue(coupon)}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs text-stone-600">
                          {coupon.minOrderValue ? `Min ₹${coupon.minOrderValue}` : 'No Min'} <br/>
                          {coupon.maxDiscount ? `Max ₹${coupon.maxDiscount}` : 'No Max'}
                        </td>
                        <td className="px-4 py-4 text-xs text-stone-600">
                          {formatDate(coupon.endAt)}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${coupon.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                            {coupon.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right space-x-3">
                          <button 
                            onClick={() => handleEdit(coupon)}
                            className="text-[10px] font-bold uppercase tracking-[0.1em] text-stone-500 hover:text-black transition-colors"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(coupon._id)}
                            className="text-[10px] font-bold uppercase tracking-[0.1em] text-rose-500 hover:text-rose-700 transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* RIGHT: COUPON BUILDER */}
          <div className="border border-stone-200 bg-white p-6 sticky top-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-5">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-stone-800">
                Coupon Builder
              </h3>
              <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${editingId ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-500'}`}>
                {editingId ? 'Editing' : 'New Offer'}
              </span>
            </div>

            {error && <div className="mb-5 border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 uppercase tracking-wide">{error}</div>}
            {success && <div className="mb-5 border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700 uppercase tracking-wide">{success}</div>}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-stone-500 mb-2">Coupon Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className="w-full border border-stone-300 bg-white px-3 py-3 text-sm focus:outline-none focus:border-black font-mono tracking-wider"
                    placeholder="e.g. SUMMER20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-stone-500 mb-2">Discount Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                    className="w-full border border-stone-300 bg-white px-3 py-3 text-sm focus:outline-none focus:border-black cursor-pointer"
                  >
                    <option value="amount">Fixed Amount (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                    <option value="shipping">Free Shipping</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-stone-500 mb-2">Public Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-stone-300 bg-white px-3 py-3 text-sm focus:outline-none focus:border-black"
                  placeholder="Spring Launch Discount"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-stone-500 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-stone-300 bg-white p-3 text-sm focus:outline-none focus:border-black resize-none"
                  rows={2}
                  placeholder="Internal notes or public terms..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-stone-500 mb-2">Discount Value</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    disabled={formData.type === 'shipping'}
                    value={formData.value}
                    onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
                    className="w-full border border-stone-300 bg-white px-3 py-3 text-sm focus:outline-none focus:border-black disabled:bg-stone-100 disabled:text-stone-400"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-stone-500 mb-2">Max Discount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    disabled={formData.type !== 'percentage'}
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, maxDiscount: e.target.value }))}
                    className="w-full border border-stone-300 bg-white px-3 py-3 text-sm focus:outline-none focus:border-black disabled:bg-stone-100 disabled:text-stone-400"
                    placeholder="Optional cap"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-stone-500 mb-2">Min Order Val (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData((prev) => ({ ...prev, minOrderValue: e.target.value }))}
                    className="w-full border border-stone-300 bg-white px-3 py-3 text-sm focus:outline-none focus:border-black"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-stone-500 mb-2">Per User Limit</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.perUserLimit}
                    onChange={(e) => setFormData((prev) => ({ ...prev, perUserLimit: e.target.value }))}
                    className="w-full border border-stone-300 bg-white px-3 py-3 text-sm focus:outline-none focus:border-black"
                    placeholder="Uses per person"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-stone-500 mb-2">Valid From</label>
                  <input
                    type="date"
                    value={formData.startAt}
                    onChange={(e) => setFormData((prev) => ({ ...prev, startAt: e.target.value }))}
                    className="w-full border border-stone-300 bg-white px-3 py-3 text-sm focus:outline-none focus:border-black cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-stone-500 mb-2">Valid Until</label>
                  <input
                    type="date"
                    value={formData.endAt}
                    onChange={(e) => setFormData((prev) => ({ ...prev, endAt: e.target.value }))}
                    className="w-full border border-stone-300 bg-white px-3 py-3 text-sm focus:outline-none focus:border-black cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 bg-stone-50 border border-stone-200 p-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 accent-black cursor-pointer border-stone-300"
                  />
                  <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-stone-800">Coupon is Active</span>
                </label>
              </div>

              {/* LIVE PREVIEW BADGE */}
              <div className="mt-4 border border-dashed border-stone-300 bg-stone-50 p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-stone-500 font-bold mb-1">Preview</p>
                  <p className="font-mono text-lg font-bold text-black">{formData.code || 'YOURCODE'}</p>
                </div>
                <div className="text-right">
                  <span className="bg-black text-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em]">
                    {formData.type === 'shipping' ? 'Free Shipping' : formData.type === 'percentage' ? `${formData.value}% Off` : `₹${formData.value} Off`}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !formData.code}
                  className={`w-full py-4 px-4 font-bold uppercase tracking-[0.1em] text-xs text-white transition-colors ${
                    saving || !formData.code ? 'bg-stone-400 cursor-not-allowed' : 'bg-black hover:bg-stone-800'
                  }`}
                >
                  {saving ? 'Saving...' : editingId ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Coupons;