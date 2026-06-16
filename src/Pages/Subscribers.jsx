import React, { useEffect, useState } from 'react';
import adminApi from '../config/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Subscribers = () => {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await adminApi.get('/subscribers/admin');
        if (data?.success) setSubs(data.subscribers || []);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to load subscribers');
      } finally { setLoading(false); }
    };
    fetch();
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Subscribers</h2>
        <div>
          <button onClick={() => navigate('/offers')} className="px-3 py-2 bg-black text-white rounded">Send Offer</button>
        </div>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-stone-100">
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Subscribed At</th>
                <th className="p-2 text-left">Source</th>
                <th className="p-2 text-left">Confirmed</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s._id} className="border-t">
                  <td className="p-2">{s.email}</td>
                  <td className="p-2">{new Date(s.subscribedAt || s.createdAt).toLocaleString()}</td>
                  <td className="p-2">{s.source}</td>
                  <td className="p-2">{s.confirmed ? 'Yes' : 'No'}</td>
                  <td className="p-2">
                    <button onClick={async () => {
                      if (!window.confirm('Remove subscriber?')) return;
                      try {
                        await adminApi.delete(`/subscribers/admin/${s._id}`);
                        setSubs(prev => prev.filter(x => x._id !== s._id));
                        toast.success('Subscriber removed');
                      } catch (err) {
                        toast.error(err.response?.data?.error || 'Failed to remove');
                      }
                    }} className="px-2 py-1 bg-red-600 text-white rounded text-sm">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Subscribers;
