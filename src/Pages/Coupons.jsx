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
      <Topbar variant="dashboard" />
      <section className="mt-10 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <div className="grid gap-5 rounded-[30px] border border-slate-200 bg-white p-8 shadow-sm md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <h1 className="text-3xl font-semibold text-slate-950">Coupons</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">Manage coupons, status, expiry, and discount rules from one dashboard.</p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <div className="rounded-full bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">{coupons.length} total</div>
              <div className="rounded-full bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{activeCount} live</div>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                New Coupon
              </button>
              <button
                type="button"
                onClick={loadCoupons}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-900"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-[28px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-[0_25px_80px_rgba(15,23,42,0.16)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Coupon metrics</p>
                  <h2 className="mt-4 text-3xl font-semibold">Current overview</h2>
                </div>
                <div className="rounded-3xl bg-slate-900/70 px-4 py-2 text-xs uppercase tracking-[0.12em] text-slate-300">Summary</div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] border border-slate-700 bg-slate-900/80 p-4">
                  <p className="text-sm text-slate-400">Active coupons</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{activeCount}</p>
                </div>
                <div className="rounded-[24px] border border-slate-700 bg-slate-900/80 p-4">
                  <p className="text-sm text-slate-400">Expiring soon</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{expiringSoonCount}</p>
                </div>
              </div>
            </div>
            <div className="rounded-[28px] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Coupon summary</p>
                  <h3 className="mt-3 text-2xl font-semibold text-slate-900">{coupons.length} active offers</h3>
                </div>
                <div className="inline-flex items-center rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                  {coupons.length > 0 ? 'Ready' : 'No coupons'}
                </div>
              </div>
              <div className="mt-6 grid gap-3 text-sm text-slate-600">
                <p>{activeCount} live coupons are available for customers.</p>
                <p>{coupons.length - activeCount} coupons are currently inactive.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Coupon library</h2>
                <p className="mt-1 max-w-2xl text-sm text-slate-500">View all coupons with expiry dates, status, and quick actions.</p>
              </div>
              <p className="text-sm text-slate-500">{coupons.length} coupon{coupons.length === 1 ? '' : 's'} loaded</p>
            </div>

            {loading ? (
              <p className="text-sm text-slate-500">Loading coupons…</p>
            ) : coupons.length === 0 ? (
              <p className="text-sm text-slate-500">No coupons found yet. Create one to get started.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[720px] divide-y divide-slate-200 text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500">
                      <th className="px-4 py-4 font-semibold uppercase tracking-[0.12em]">Code</th>
                      <th className="px-4 py-4 font-semibold uppercase tracking-[0.12em]">Offer</th>
                      <th className="px-4 py-4 font-semibold uppercase tracking-[0.12em]">Min order</th>
                      <th className="px-4 py-4 font-semibold uppercase tracking-[0.12em]">Expires</th>
                      <th className="px-4 py-4 font-semibold uppercase tracking-[0.12em]">Status</th>
                      <th className="px-4 py-4 font-semibold uppercase tracking-[0.12em]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {coupons.map((coupon) => (
                      <tr key={coupon._id} className="group transition hover:bg-slate-50">
                        <td className="px-4 py-4">
                          <div className="font-semibold text-slate-900">{coupon.code}</div>
                          <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{formatTypeLabel(coupon.type)}</div>
                        </td>
                        <td className="px-4 py-4 text-slate-700">{formatCouponValue(coupon)}{coupon.maxDiscount ? ` · cap ₹${coupon.maxDiscount}` : ''}</td>
                        <td className="px-4 py-4 text-slate-700">{coupon.minOrderValue ? `₹${coupon.minOrderValue}` : 'None'}</td>
                        <td className="px-4 py-4 text-slate-700">{formatDate(coupon.endAt)}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${coupon.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                            {coupon.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(coupon)}
                              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(coupon._id)}
                              className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-6 py-5 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Coupon Builder</h2>
                  <p className="mt-1 text-sm text-slate-300">Create and edit coupons with clear discount and validity settings.</p>
                </div>
                <span className="rounded-3xl bg-slate-900/70 px-4 py-2 text-xs uppercase tracking-[0.18em] text-slate-300">
                  {editingId ? 'Editing' : 'New'}
                </span>
              </div>
            </div>
            <div className="p-6">
              {error ? <div className="mb-4 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
              {success ? <div className="mb-4 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}

              <div className="grid gap-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-800">Code</span>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
                      placeholder="EXTRA20"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-800">Type</span>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
                    >
                      <option value="amount">Amount</option>
                      <option value="percentage">Percentage</option>
                      <option value="shipping">Shipping</option>
                    </select>
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-800">Title</span>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
                    placeholder="Spring Launch Discount"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-800">Description</span>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    className="min-h-[120px] w-full rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
                    rows={4}
                    placeholder="Example: 20% off on orders over ₹1500."
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-800">Value</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.value}
                      onChange={(e) => setFormData((prev) => ({ ...prev, value: Number(e.target.value) }))}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
                      placeholder="0"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-800">Max Discount</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData((prev) => ({ ...prev, maxDiscount: e.target.value }))}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
                      placeholder="Optional"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-800">Min Order Value</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.minOrderValue}
                      onChange={(e) => setFormData((prev) => ({ ...prev, minOrderValue: Number(e.target.value) }))}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
                      placeholder="0"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-800">Usage Limit</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData((prev) => ({ ...prev, usageLimit: e.target.value }))}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
                      placeholder="Unlimited"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-800">Per User Limit</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.perUserLimit}
                      onChange={(e) => setFormData((prev) => ({ ...prev, perUserLimit: e.target.value }))}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
                      placeholder="Optional"
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-slate-800">Start Date</span>
                      <input
                        type="date"
                        value={formData.startAt}
                        onChange={(e) => setFormData((prev) => ({ ...prev, startAt: e.target.value }))}
                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-slate-800">End Date</span>
                      <input
                        type="date"
                        value={formData.endAt}
                        onChange={(e) => setFormData((prev) => ({ ...prev, endAt: e.target.value }))}
                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
                      />
                    </label>
                  </div>
                </div>

                <label className="flex items-center gap-3 rounded-3xl bg-slate-50 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="h-5 w-5 rounded border-slate-300 text-black focus:ring-0"
                  />
                  <span className="text-sm font-semibold text-slate-800">Set coupon as active</span>
                </label>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editingId ? 'Update Coupon' : 'Create Coupon'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={saving}
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Live preview</div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Coupon code</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">{formData.code || 'YOURCODE'}</p>
                </div>
                <span className="rounded-3xl bg-slate-800 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                  {formData.type === 'percentage' ? 'Percentage' : formData.type === 'shipping' ? 'Shipping' : 'Amount'}
                </span>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <p>{formData.description || 'Coupon details appear here.'}</p>
                <div className="rounded-3xl bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Offer</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{formData.type === 'shipping' ? 'Free Shipping' : formData.type === 'percentage' ? `${formData.value}% Off` : `₹${formData.value} Off`}</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 rounded-3xl bg-white p-4 text-sm text-slate-600 sm:grid-cols-2">
                <p><span className="font-semibold text-slate-900">Start:</span> {formData.startAt || 'Immediate'}</p>
                <p><span className="font-semibold text-slate-900">End:</span> {formData.endAt || 'No expiry'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Coupons;
