import React, { useEffect, useState } from 'react';
import adminApi from '../config/api';
import { Link } from 'react-router-dom';

const Models = () => {
  const [sponsored, setSponsored] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSponsored = async () => {
      try {
        setLoading(true);
        // Fetch admin product list and filter sponsored entries
        const res = await adminApi.get('/product');
        const products = Array.isArray(res.data) ? res.data : (res.data.data || []);
        const active = (products || []).filter(p => p.isSponsored);
        setSponsored(active);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSponsored();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Sponsored Products</h1>
      {loading && <div>Loading…</div>}
      {!loading && sponsored.length === 0 && <div>No sponsored products found.</div>}
      <div className="grid gap-3">
        {sponsored.map((p) => (
          <div key={p.id || p._id} className="rounded border p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm text-stone-500">{p.category || p.categoryInfo?.name}</div>
              </div>
              <div className="flex gap-2">
                <Link to={`/inventory/${p.id}/edit`} className="text-sm text-blue-600">Edit</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Models;
