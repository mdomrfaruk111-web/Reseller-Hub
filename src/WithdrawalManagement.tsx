import React, { useState } from 'react';
import {
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  DollarSign,
  Phone,
  Mail,
  AlertCircle
} from 'lucide-react';
import { Withdrawal, StoreSettings } from '../../types';
import { updateWithdrawalStatus } from '../../services/storeService';
import { useAuth } from '../../context/AuthContext';

interface WithdrawalManagementProps {
  withdrawals: Withdrawal[];
  storeSettings: StoreSettings;
  onRefreshWithdrawals: () => void;
}

export const WithdrawalManagement: React.FC<WithdrawalManagementProps> = ({
  withdrawals,
  storeSettings,
  onRefreshWithdrawals,
}) => {
  const { currentUser } = useAuth();
  const currencySymbol = storeSettings.currencySymbol || '৳';

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);

  // Modal Action State
  const [actionType, setActionType] = useState<'completed' | 'rejected'>('completed');
  const [transactionId, setTransactionId] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const openActionModal = (w: Withdrawal, type: 'completed' | 'rejected') => {
    setSelectedWithdrawal(w);
    setActionType(type);
    setTransactionId('');
    setAdminNotes('');
    setFeedback(null);
  };

  const handleProcessWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWithdrawal) return;

    setIsProcessing(true);
    try {
      await updateWithdrawalStatus(
        selectedWithdrawal.id,
        actionType,
        transactionId,
        currentUser?.email || 'admin',
        adminNotes
      );
      setFeedback(`Withdrawal request marked as ${actionType}.`);
      onRefreshWithdrawals();
      setTimeout(() => {
        setSelectedWithdrawal(null);
      }, 1000);
    } catch (err: any) {
      setFeedback(`Error: ${err.message || 'Failed to update'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const filtered = withdrawals.filter((w) => {
    const matchesStatus = filterStatus === 'all' || w.status === filterStatus;
    const matchesSearch =
      !searchTerm ||
      w.resellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.resellerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.accountDetails.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const totalPending = withdrawals
    .filter((w) => w.status === 'pending')
    .reduce((acc, w) => acc + w.amount, 0);

  const totalCompleted = withdrawals
    .filter((w) => w.status === 'completed')
    .reduce((acc, w) => acc + w.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Reseller Payout & Withdrawal Management</h2>
          <p className="text-xs text-stone-500">
            Review, verify, and complete payout requests to bKash, Nagad, and bank accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-xl text-xs">
            <span className="text-stone-500">Pending Payouts: </span>
            <strong className="text-amber-800 font-bold">{currencySymbol}{totalPending.toLocaleString()}</strong>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-xs">
            <span className="text-stone-500">Total Disbursed: </span>
            <strong className="text-emerald-800 font-bold">{currencySymbol}{totalCompleted.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Reseller Name, Email, or Account..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'pending', 'completed', 'rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all ${
                filterStatus === st
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Request Date</th>
                <th className="py-3 px-4">Reseller Partner</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method & Account</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Transaction Reference</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">
                    No withdrawal requests found.
                  </td>
                </tr>
              ) : (
                filtered.map((w) => (
                  <tr key={w.id} className="hover:bg-stone-50/60">
                    <td className="py-3 px-4 text-stone-600">
                      {new Date(w.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-stone-900">{w.resellerName}</p>
                      <p className="text-[11px] text-stone-500">{w.resellerEmail}</p>
                    </td>
                    <td className="py-3 px-4 font-black text-stone-900 text-sm">
                      {currencySymbol}{w.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold uppercase text-stone-800">{w.paymentMethod}</span>
                      <p className="text-[11px] text-stone-600 font-mono">{w.accountDetails}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        w.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        w.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-stone-600">
                      {w.transactionId || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {w.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openActionModal(w, 'completed')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1 shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Complete</span>
                          </button>
                          <button
                            onClick={() => openActionModal(w, 'rejected')}
                            className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-lg text-xs transition-all flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-stone-400">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action / Approval Modal */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900">
                {actionType === 'completed' ? 'Complete Payout Disbursement' : 'Reject Withdrawal Request'}
              </h3>
              <button
                onClick={() => setSelectedWithdrawal(null)}
                className="p-1 rounded-full text-stone-400 hover:bg-stone-100"
              >
                ✕
              </button>
            </div>

            {feedback && (
              <div className="p-3 bg-stone-100 text-stone-800 rounded-xl text-xs">
                {feedback}
              </div>
            )}

            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Reseller:</span>
                <span className="font-bold text-stone-900">{selectedWithdrawal.resellerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Payout Amount:</span>
                <span className="font-black text-amber-700 text-sm">{currencySymbol}{selectedWithdrawal.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Account Target:</span>
                <span className="font-mono font-semibold text-stone-800">{selectedWithdrawal.accountDetails}</span>
              </div>
            </div>

            <form onSubmit={handleProcessWithdrawal} className="space-y-4 text-xs">
              {actionType === 'completed' && (
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    bKash / Nagad Transaction ID (TrxID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. BKASH_89271923"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono uppercase"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Admin Internal Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Sent via merchant dashboard / Verified by accounts..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedWithdrawal(null)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`px-5 py-2 text-white font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 ${
                    actionType === 'completed' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isProcessing ? 'Processing...' : actionType === 'completed' ? 'Disburse & Complete' : 'Confirm Reject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
