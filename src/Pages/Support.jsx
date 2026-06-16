import React, { useEffect, useMemo, useState } from 'react';
import adminApi from '../config/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.1em] text-stone-500">Admin › Support</p>
          <h1 className="text-4xl font-bold">Support Tickets</h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-500">View incoming contact emails, update ticket status, and reply directly from the admin panel.</p>
        </div>
        <button onClick={fetchTickets} className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-stone-800">Refresh Tickets</button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.5fr_1fr]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-stone-200 bg-white p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Filters</h2>
                <p className="text-sm text-stone-500">Search tickets by ID, name, email or subject.</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tickets..."
                className="rounded border border-stone-200 px-3 py-2 text-sm"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded border border-stone-200 px-3 py-2 text-sm"
              >
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {STATUS_OPTIONS.map((status) => (
                <div key={status} className="rounded-3xl border border-stone-200 bg-stone-50 p-4 text-sm">
                  <div className="font-semibold text-stone-900">{status.charAt(0).toUpperCase() + status.slice(1)}</div>
                  <div className="mt-2 text-3xl font-bold text-black">{ticketCounts[status] ?? 0}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Ticket list</h2>
                <p className="text-sm text-stone-500">Click any ticket to view details.</p>
              </div>
              <button onClick={() => navigate('/orders')} className="rounded-full border border-stone-200 px-4 py-2 text-sm">Back to Orders</button>
            </div>
            {loading ? (
              <div className="text-sm text-stone-500">Loading tickets…</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border-separate border-spacing-0 text-left">
                  <thead>
                    <tr className="bg-stone-100">
                      <th className="p-3">Ticket</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => (
                      <tr key={ticket.ticketId} className="border-t border-stone-200 hover:bg-stone-50 cursor-pointer" onClick={() => handleSelectTicket(ticket)}>
                        <td className="p-3 font-semibold">{ticket.ticketId.slice(0, 8)}</td>
                        <td className="p-3">{ticket.name} · {ticket.email}</td>
                        <td className="p-3 max-w-[220px] truncate">{ticket.subject}</td>
                        <td className="p-3">{ticket.status}</td>
                        <td className="p-3">{formatDateTime(ticket.createdAt)}</td>
                      </tr>
                    ))}
                    {!tickets.length && (
                      <tr>
                        <td colSpan="5" className="p-6 text-center text-sm text-stone-500">No tickets found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 min-h-[400px]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Ticket details</h2>
              {selectedTicket ? (
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-stone-600">{selectedTicket.status}</span>
              ) : null}
            </div>

            {!selectedTicket ? (
              <div className="text-sm text-stone-500">Select a ticket from the table to view and respond.</div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl bg-stone-50 p-4">
                    <div className="text-xs uppercase tracking-[0.12em] text-stone-500">Requester</div>
                    <div className="mt-2 font-semibold text-stone-900">{selectedTicket.name}</div>
                    <div className="text-sm text-stone-600">{selectedTicket.email}</div>
                  </div>
                  <div className="rounded-3xl bg-stone-50 p-4">
                    <div className="text-xs uppercase tracking-[0.12em] text-stone-500">Created</div>
                    <div className="mt-2 font-semibold text-stone-900">{formatDateTime(selectedTicket.createdAt)}</div>
                    <div className="text-sm text-stone-500">Ticket ID: {selectedTicket.ticketId}</div>
                  </div>
                </div>

                <div className="rounded-3xl border border-stone-200 bg-white p-4">
                  <div className="text-sm font-semibold text-stone-700">Subject</div>
                  <div className="mt-2 text-base text-stone-900">{selectedTicket.subject}</div>
                </div>

                <div className="rounded-3xl border border-stone-200 bg-white p-4">
                  <div className="text-sm font-semibold text-stone-700">Message</div>
                  <p className="mt-3 text-sm leading-7 text-stone-700 whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-stone-700">Status</label>
                    <select
                      className="mt-2 w-full rounded border border-stone-200 bg-white px-3 py-2 text-sm"
                      value={selectedTicket.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={savingStatus}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-stone-700">Assigned To</label>
                    <input value={selectedTicket.assignedTo || ''} disabled className="mt-2 w-full rounded border border-stone-200 bg-stone-50 px-3 py-2 text-sm" />
                  </div>
                </div>

                <div className="rounded-3xl border border-stone-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-stone-900">Reply to customer</h3>
                      <p className="text-sm text-stone-500">This will send an email to the requester's address.</p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.12em] text-stone-500">Replies: {selectedTicket.replies?.length || 0}</span>
                  </div>
                  <textarea
                    rows={6}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="mt-4 w-full rounded border border-stone-200 px-3 py-3 text-sm text-stone-700 outline-none"
                    placeholder="Write your response here..."
                  />
                  <button
                    type="button"
                    disabled={sendingReply}
                    onClick={handleSendReply}
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sendingReply ? 'Sending…' : 'Send Reply'}
                  </button>
                </div>

                <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                  <h3 className="text-base font-semibold text-stone-900">Conversation history</h3>
                  <div className="mt-4 space-y-4">
                    {selectedTicket.replies?.length ? (
                      selectedTicket.replies.map((reply, index) => (
                        <div key={index} className="rounded-3xl border border-stone-200 bg-white p-4">
                          <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.12em] text-stone-500">
                            <span>{reply.from === 'admin' ? 'Admin reply' : 'User message'}</span>
                            <span>{formatDateTime(reply.sentAt)}</span>
                          </div>
                          <p className="mt-3 text-sm text-stone-700 whitespace-pre-wrap">{reply.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-3xl border border-dashed border-stone-200 bg-white p-4 text-sm text-stone-500">No replies have been sent yet.</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Support;
