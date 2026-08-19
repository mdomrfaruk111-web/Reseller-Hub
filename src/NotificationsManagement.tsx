import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  Send,
  Users,
  Briefcase,
  Globe,
  AlertCircle,
  CheckCircle2,
  X,
  Radio
} from 'lucide-react';
import { StoreNotification } from '../../types';
import { createNotification, deleteNotification } from '../../services/storeService';
import { useAuth } from '../../context/AuthContext';

interface NotificationsManagementProps {
  notifications: StoreNotification[];
  onRefresh: () => void;
}

export const NotificationsManagement: React.FC<NotificationsManagementProps> = ({
  notifications,
  onRefresh,
}) => {
  const { currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'resellers' | 'customers'>('all');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setTitle('');
    setMessage('');
    setTargetType('all');
    setPriority('normal');
    setFeedback(null);
    setIsModalOpen(true);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      await createNotification(
        {
          title: title.trim(),
          message: message.trim(),
          targetType,
          priority,
          status: 'active',
        },
        currentUser?.email || 'admin'
      );
      setFeedback('Announcement broadcasted successfully!');
      setTimeout(() => {
        setIsModalOpen(false);
        onRefresh();
      }, 800);
    } catch (err: any) {
      setFeedback(err.message || 'Failed to send broadcast.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (notif: StoreNotification) => {
    if (!window.confirm(`Delete announcement "${notif.title}"?`)) return;
    try {
      await deleteNotification(notif.id, currentUser?.email || 'admin');
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <span>Broadcast Announcements & Alerts</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch announcements, flash commission alerts, and important notices to resellers and customers.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {notifications.length === 0 ? (
          <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
            No broadcast notifications currently published. Click "New Announcement" to publish one.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        notif.priority === 'urgent'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : notif.priority === 'high'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {notif.priority}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold flex items-center gap-1">
                      {notif.targetType === 'resellers' && <Briefcase className="w-3 h-3" />}
                      {notif.targetType === 'customers' && <Users className="w-3 h-3" />}
                      {notif.targetType === 'all' && <Globe className="w-3 h-3" />}
                      <span>To: {notif.targetType}</span>
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(notif)}
                    className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{notif.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                  <span>Live on platform</span>
                </span>
                <span>{new Date(notif.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Broadcast New Announcement</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {feedback && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{feedback}</span>
              </div>
            )}

            <form onSubmit={handleSendNotification} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 50% Extra Reseller Commission Weekend!"
                  required
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg p-2.5 text-xs text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block">
                  Message Content *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  required
                  placeholder="Enter the broadcast text here..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg p-2.5 text-xs text-slate-900 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block">
                    Target Audience
                  </label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg p-2.5 text-xs text-slate-900 font-medium"
                  >
                    <option value="all">Everyone (All)</option>
                    <option value="resellers">Resellers Only</option>
                    <option value="customers">Customers Only</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg p-2.5 text-xs text-slate-900 font-medium"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent Alert</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  {isSubmitting ? 'Broadcasting...' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
