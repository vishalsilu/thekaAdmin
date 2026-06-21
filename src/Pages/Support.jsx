import React, { useEffect, useMemo, useState } from 'react';
import adminApi from '../config/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Topbar from "../components/layout/Topbar";

const STATUS_OPTIONS = ['new', 'open', 'pending', 'resolved', 'closed'];

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

const Support = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.q = searchQuery;
      if (statusFilter) params.status = statusFilter;

      const { data } = await adminApi.get('/support/admin', { params });
      if (data?.success) {
        setTickets(data.tickets || []);
        if (selectedTicket) {
          const refreshed = data.tickets.find((ticket) => ticket.ticketId === selectedTicket.ticketId);
          if (refreshed) setSelectedTicket(refreshed);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Unable to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [searchQuery, statusFilter]);

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
    setReplyText('');
  };

  const handleStatusChange = async (status) => {
    if (!selectedTicket) return;
    setSavingStatus(true);
    try {
      const { data } = await adminApi.patch(`/support/admin/${selectedTicket.ticketId}`, { status });
      if (data?.success) {
        setSelectedTicket(data.ticket);
        setTickets((prev) => prev.map((ticket) => (ticket.ticketId === data.ticket.ticketId ? data.ticket : ticket)));
        toast.success('Ticket status updated');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket) return;
    if (!replyText.trim()) {
      toast.error('Please enter a reply message.');
      return;
    }
    setSendingReply(true);
    try {
      const { data } = await adminApi.post(`/support/admin/${selectedTicket.ticketId}/reply`, {
        message: replyText.trim(),
        status: 'pending'
      });
      if (data?.success) {
        setSelectedTicket(data.ticket);
        setTickets((prev) => prev.map((ticket) => (ticket.ticketId === data.ticket.ticketId ? data.ticket : ticket)));
        setReplyText('');
        toast.success('Reply sent to customer');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const ticketCounts = useMemo(() => {
    return STATUS_OPTIONS.reduce((acc, status) => {
      acc[status] = tickets.filter((ticket) => ticket.status === status).length;
      return acc;
    }, {});
  }, [tickets]);

  return (
    <>
      <Topbar variant="inventory" searchPlaceholder="Search tickets..." />
      
      <section className="mt-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.1em] text-stone-500">Admin / Support</p>
            <h1 className="text-6xl font-bold tracking-tight uppercase mt-1">Tickets</h1>
            <p className="mt-2 max-w-2xl text-stone-600">View incoming contact emails, update ticket status, and reply directly from the admin panel.</p>
          </div>
          <button 
            onClick={fetchTickets} 
            className="border border-black bg-black px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-stone-800 transition-colors"
          >
            Refresh Tickets
          </button>
        </div>

        {/* Master-Detail Layout */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.5fr] items-start">
          
          {/* LEFT COLUMN: Filters & Ticket List */}
          <div className="space-y-4">
            
            {/* Filter & Search Toolbar */}
            <div className="border border-stone-200 bg-white">
              <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 p-3 bg-stone-50">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tickets..."
                  className="w-full sm:flex-1 border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-auto border border-stone-300 bg-white px-3 py-2 text-xs font-semibold uppercase focus:outline-none cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Status Counters */}
              <div className="grid grid-cols-5 divide-x divide-stone-200 bg-white border-b border-stone-200">
                {STATUS_OPTIONS.map((status) => (
                  <div key={status} className="p-3 text-center">
                    <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-stone-500">{status}</div>
                    <div className="mt-1 text-xl font-bold text-black">{ticketCounts[status] ?? 0}</div>
                  </div>
                ))}
              </div>

              {/* Ticket Table */}
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-center text-sm font-semibold uppercase tracking-[0.1em] text-stone-500">Loading tickets…</div>
                ) : (
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-white shadow-sm">
                      <tr className="text-left text-[11px] uppercase tracking-[0.08em] text-stone-500 bg-stone-50">
                        <th className="border-b border-stone-200 px-3 py-3">ID</th>
                        <th className="border-b border-stone-200 px-3 py-3">Customer</th>
                        <th className="border-b border-stone-200 px-3 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((ticket) => (
                        <tr 
                          key={ticket.ticketId} 
                          onClick={() => handleSelectTicket(ticket)}
                          className={`border-b border-stone-100 cursor-pointer transition-colors ${selectedTicket?.ticketId === ticket.ticketId ? 'bg-stone-100' : 'hover:bg-stone-50'}`}
                        >
                          <td className="px-3 py-4 text-xs font-semibold">{ticket.ticketId.slice(0, 8).toUpperCase()}</td>
                          <td className="px-3 py-4">
                            <p className="font-semibold text-sm">{ticket.name}</p>
                            <p className="text-xs text-stone-500 truncate max-w-[150px]">{ticket.subject}</p>
                          </td>
                          <td className="px-3 py-4">
                            <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${ticket.status === 'open' || ticket.status === 'new' ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-200 text-stone-700'}`}>
                              {ticket.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {!tickets.length && (
                        <tr>
                          <td colSpan="3" className="p-6 text-center text-sm text-stone-500">No tickets found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Ticket Details */}
          <div className="border border-stone-200 bg-white min-h-[600px] flex flex-col">
            {!selectedTicket ? (
              <div className="flex-1 flex items-center justify-center p-6 text-sm font-semibold uppercase tracking-[0.1em] text-stone-400">
                Select a ticket to view details
              </div>
            ) : (
              <div className="flex flex-col h-full">
                
                {/* Detail Header */}
                <div className="border-b border-stone-200 p-5 bg-stone-50 flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{selectedTicket.subject}</h2>
                    <p className="mt-1 text-xs uppercase tracking-[0.1em] text-stone-500">
                      Ticket ID: {selectedTicket.ticketId.toUpperCase()} • {formatDateTime(selectedTicket.createdAt)}
                    </p>
                  </div>
                  <select
                    className="border border-stone-300 bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.05em] focus:outline-none cursor-pointer"
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={savingStatus}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-5 overflow-y-auto space-y-6">
                  
                  {/* Customer Info Box */}
                  <div className="border border-stone-200 p-4 flex items-center justify-between bg-white">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.1em] text-stone-500 font-bold">Requester</div>
                      <div className="mt-1 font-bold">{selectedTicket.name}</div>
                      <div className="text-sm text-stone-600">{selectedTicket.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-[0.1em] text-stone-500 font-bold">Assigned To</div>
                      <div className="mt-1 text-sm font-semibold">{selectedTicket.assignedTo || 'Unassigned'}</div>
                    </div>
                  </div>

                  {/* Original Message */}
                  <div className="border border-stone-200 bg-stone-50 p-5">
                    <div className="text-[10px] uppercase tracking-[0.1em] text-stone-500 font-bold mb-3 border-b border-stone-200 pb-2">Original Message</div>
                    <p className="text-sm leading-relaxed text-stone-800 whitespace-pre-wrap">{selectedTicket.message}</p>
                  </div>

                  {/* Conversation History */}
                  {selectedTicket.replies?.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-[0.1em] border-b border-stone-200 pb-2">Conversation History</h3>
                      {selectedTicket.replies.map((reply, index) => (
                        <div key={index} className={`p-4 border ${reply.from === 'admin' ? 'border-stone-300 bg-white ml-8' : 'border-stone-200 bg-stone-50 mr-8'}`}>
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.1em] text-stone-500 mb-2">
                            
                            {/* UPDATED: Conditionally render the admin email if available */}
                            <span className={reply.from === 'admin' ? 'text-black' : ''}>
                              {reply.from === 'admin' 
                                ? (reply.adminEmail ? `Admin Reply • ${reply.adminEmail}` : 'Admin Reply') 
                                : 'Customer Message'}
                            </span>
                            
                            <span>{formatDateTime(reply.sentAt)}</span>
                          </div>
                          <p className="text-sm leading-relaxed text-stone-800 whitespace-pre-wrap">{reply.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reply Box */}
                <div className="border-t border-stone-200 p-5 bg-stone-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-[0.1em]">Reply to Customer</h3>
                    <span className="text-[10px] uppercase tracking-[0.1em] text-stone-500 font-bold">{selectedTicket.replies?.length || 0} Replies</span>
                  </div>
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full border border-stone-300 p-3 text-sm focus:outline-none focus:border-black transition-colors resize-none"
                    placeholder="Type your response here. This will be emailed to the customer..."
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      disabled={sendingReply}
                      onClick={handleSendReply}
                      className="border border-black bg-black px-6 py-3 text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                    >
                      {sendingReply ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Support;