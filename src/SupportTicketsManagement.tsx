import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  X,
  Mail,
  Phone,
  User,
  ShieldCheck
} from 'lucide-react';
import { SupportTicket } from '../../types';
import { replySupportTicket } from '../../services/storeService';
import { useAuth } from '../../context/AuthContext';

interface SupportTicketsManagementProps {
  tickets: SupportTicket[];
  onRefresh: () => void;
}

export const SupportTicketsManagement: React.FC<SupportTicketsManagementProps> = ({
  tickets,
  onRefresh,
}) => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [newStatus, setNewStatus] = useState<'open' | 'in_progress' | 'resolved'>('resolved');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleOpenReply = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setReplyText(ticket.reply || '');
    setNewStatus(ticket.status === 'open' ? 'resolved' : ticket.status);
    setFeedback(null);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    setIsSubmitting(true);
    try {
      await replySupportTicket(
        selectedTicket.id,
        replyText.trim(),
        newStatus,
        currentUser?.email || 'admin'
      );
      setFeedback('Reply sent and ticket status updated successfully!');
      setTimeout(() => {
        setSelectedTicket(null);
        onRefresh();
      }, 1000);
    } catch (err: any) {
      setFeedback(err.message || 'Failed to update ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      !searchTerm ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openTicketsCount = tickets.filter((t) => t.status === 'open').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span>Customer & Reseller Support Center</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Resolve incoming support inquiries, questions, and transaction support tickets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold">
            {openTicketsCount} Open Tickets
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tickets by subject, name, email or message..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg py-2 pl-10 pr-4 text-xs text-slate-900"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-900 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open (Unresolved)</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
            No support tickets match the selected filter.
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      ticket.status === 'open'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : ticket.status === 'in_progress'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-semibold capitalize">
                    {ticket.userType}
                  </span>
                  <span className="text-xs text-slate-400">• {new Date(ticket.createdAt).toLocaleString()}</span>
                </div>

                <button
                  onClick={() => handleOpenReply(ticket)}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs transition-colors self-start sm:self-auto flex items-center gap-1.5"
                >
                  <Send className="w-3 h-3" />
                  <span>{ticket.reply ? 'Update Reply' : 'Reply & Resolve'}</span>
                </button>
              </div>

              <h3 className="text-sm font-bold text-slate-900">{ticket.subject}</h3>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {ticket.message}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-800">{ticket.userName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{ticket.userEmail}</span>
                </div>
                {ticket.userPhone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ticket.userPhone}</span>
                  </div>
                )}
              </div>

              {ticket.reply && (
                <div className="mt-2 p-3 bg-blue-50/60 border border-blue-100 rounded-lg text-xs space-y-1">
                  <div className="flex items-center gap-1 text-blue-900 font-bold text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Official Administrator Resolution:</span>
                  </div>
                  <p className="text-slate-700">{ticket.reply}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Reply to Support Ticket</h3>
                <p className="text-[11px] text-slate-500">{selectedTicket.subject}</p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {feedback && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{feedback}</span>
              </div>
            )}

            <form onSubmit={handleSendReply} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block">
                  Original User Inquiry
                </label>
                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 max-h-32 overflow-y-auto">
                  {selectedTicket.message}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block">
                  Administrator Response *
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  required
                  placeholder="Type your official answer, resolution details, or instructions..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg p-2.5 text-xs text-slate-900 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block">
                  Ticket Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg p-2.5 text-xs text-slate-900 font-semibold"
                >
                  <option value="resolved">Resolved (Close ticket)</option>
                  <option value="in_progress">In Progress (Under investigation)</option>
                  <option value="open">Open</option>
                </select>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  {isSubmitting ? 'Submitting...' : 'Save Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
