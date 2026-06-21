import React, { useEffect, useState, useMemo } from 'react';
import adminApi from '../config/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const formatDateTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const Subscribers = () => {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [filterConfirmed, setFilterConfirmed] = useState('all');
  const [filterSource, setFilterSource] = useState('all');

  // Selection State
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const fetchSubs = async () => {
      setLoading(true);
      try {
        const { data } = await adminApi.get('/subscribers/admin');
        if (data?.success) setSubs(data.subscribers || []);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to load subscribers');
      } finally { 
        setLoading(false); 
      }
    };
    fetchSubs();
  }, []);

  // Derive unique sources for the filter dropdown
  const uniqueSources = useMemo(() => {
    const sources = subs.map(s => s.source).filter(Boolean);
    return [...new Set(sources)];
  }, [subs]);

  // Process data based on filters and sorting
  const processedSubs = useMemo(() => {
    let result = subs.filter(s => 
      s.email.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );

    if (filterConfirmed !== 'all') {
      const isConf = filterConfirmed === 'yes';
      result = result.filter(s => !!s.confirmed === isConf);
    }

    if (filterSource !== 'all') {
      result = result.filter(s => s.source === filterSource);
    }

    result.sort((a, b) => {
      const tA = new Date(a.subscribedAt || a.createdAt).getTime();
      const tB = new Date(b.subscribedAt || b.createdAt).getTime();
      return sortOption === 'newest' ? tB - tA : tA - tB;
    });

    return result;
  }, [subs, searchQuery, filterConfirmed, filterSource, sortOption]);

  // Selection Handlers
  const handleSelectAll = () => {
    if (selectedIds.length === processedSubs.length && processedSubs.length > 0) {
      setSelectedIds([]); // Deselect all
    } else {
      setSelectedIds(processedSubs.map(s => s._id)); // Select all currently filtered
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Action Handlers
  const handleSendSelected = () => {
    if (selectedIds.length === 0) return;
    const selectedEmails = subs.filter(s => selectedIds.includes(s._id)).map(s => s.email);
    // Passing the selected emails to the offers page via React Router state
    navigate('/offers', { state: { targetEmails: selectedEmails } });
  };

  const handleSendAll = () => {
    navigate('/offers', { state: { sendToAll: true } });
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Are you sure you want to remove this subscriber?')) return;
    try {
      await adminApi.delete(`/subscribers/admin/${id}`);
      setSubs(prev => prev.filter(x => x._id !== id));
      setSelectedIds(prev => prev.filter(x => x !== id));
      toast.success('Subscriber removed');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to remove subscriber');
    }
  };

  const isAllSelected = processedSubs.length > 0 && selectedIds.length === processedSubs.length;

  return (
    <div className="p-6">
      {/* HEADER SECTION */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.1em] text-stone-500">Admin / Marketing</p>
          <h1 className="text-4xl font-bold mt-1 tracking-tight">Subscribers</h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-500">
            Manage your newsletter audience, filter by engagement, and dispatch targeted promotional offers.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleSendSelected} 
            disabled={selectedIds.length === 0}
            className="border border-black bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-black hover:bg-stone-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Offer to Selected ({selectedIds.length})
          </button>
          <button 
            onClick={handleSendAll} 
            className="border border-black bg-black px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-stone-800 transition-colors"
          >
            Offer to All
          </button>
        </div>
      </div>

      <div className="border border-stone-200 bg-white">
        
        {/* TOOLBAR: SEARCH, FILTER, SORT */}
        <div className="flex flex-wrap items-center gap-3 border-b border-stone-200 p-4 bg-stone-50">
          <input
            type="text"
            placeholder="Search email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:flex-1 border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
          />
          
          <select
            value={filterConfirmed}
            onChange={(e) => setFilterConfirmed(e.target.value)}
            className="border border-stone-300 bg-white px-3 py-2 text-xs font-semibold uppercase focus:outline-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="yes">Confirmed</option>
            <option value="no">Unconfirmed</option>
          </select>

          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="border border-stone-300 bg-white px-3 py-2 text-xs font-semibold uppercase focus:outline-none cursor-pointer"
          >
            <option value="all">All Sources</option>
            {uniqueSources.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="border border-stone-300 bg-white px-3 py-2 text-xs font-semibold uppercase focus:outline-none cursor-pointer"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
          </select>
        </div>

        {/* DATA TABLE */}
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="p-10 text-center text-xs font-bold uppercase tracking-[0.1em] text-stone-500">
              Loading subscribers...
            </div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 bg-stone-50 shadow-sm z-10">
                <tr className="text-[10px] font-bold uppercase tracking-[0.1em] text-stone-500">
                  <th className="border-b border-stone-200 px-4 py-4 w-10 text-center">
                    <input 
                      type="checkbox" 
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className="cursor-pointer accent-black w-4 h-4"
                    />
                  </th>
                  <th className="border-b border-stone-200 px-4 py-4">Email Address</th>
                  <th className="border-b border-stone-200 px-4 py-4">Subscribed At</th>
                  <th className="border-b border-stone-200 px-4 py-4">Source</th>
                  <th className="border-b border-stone-200 px-4 py-4">Confirmed</th>
                  <th className="border-b border-stone-200 px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {processedSubs.map((s) => (
                  <tr key={s._id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(s._id)}
                        onChange={() => handleSelectOne(s._id)}
                        className="cursor-pointer accent-black w-4 h-4"
                      />
                    </td>
                    <td className="px-4 py-4 font-semibold text-sm text-stone-900">{s.email}</td>
                    <td className="px-4 py-4 text-xs text-stone-500">{formatDateTime(s.subscribedAt || s.createdAt)}</td>
                    <td className="px-4 py-4">
                      <span className="bg-stone-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-stone-600">
                        {s.source || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {s.confirmed ? (
                         <span className="text-emerald-600 text-xs font-bold uppercase tracking-[0.05em]">Yes</span>
                      ) : (
                         <span className="text-stone-400 text-xs font-bold uppercase tracking-[0.05em]">No</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button 
                        onClick={() => handleRemove(s._id)} 
                        className="text-[10px] font-bold uppercase tracking-[0.1em] text-red-600 hover:text-red-800 transition-colors"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {processedSubs.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-sm text-stone-500">
                      No subscribers match your current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* FOOTER */}
        {!loading && (
          <div className="border-t border-stone-200 p-4 bg-stone-50 text-xs font-semibold uppercase tracking-[0.1em] text-stone-500 flex justify-between">
            <span>Showing {processedSubs.length} records</span>
            <span>{selectedIds.length} Selected</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscribers;