import React, { useState } from 'react';
import {
  Wallet,
  DollarSign,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Edit,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  History
} from 'lucide-react';
import { UserProfile, Withdrawal, StoreSettings } from '../../types';
import { updateWalletBalance } from '../../services/storeService';
import { useAuth } from '../../context/AuthContext';

interface WalletsManagementProps {
  users: UserProfile[];
  withdrawals: Withdrawal[];
  storeSettings: StoreSettings;
  onRefresh: () => void;
}

export const WalletsManagement: React.FC<WalletsManagementProps> = ({
  users,
  withdrawals,
  storeSettings,
  onRefresh,
}) => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const resellers = users.filter((u) => u.role === 'reseller');
  const currencySymbol = storeSettings.currencySymbol || '৳';

  const handleOpenAdjust = (user: UserProfile) => {
    setSelectedUser(user);
    setAdjustAmount('');
    setAdjustType('credit');
    setAdjustReason('');
    setFeedback(null);
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !adjustAmount || Number(adjustAmount) <= 0) return;

    setIsSubmitting(true);
    setFeedback(null);

    const delta = adjustType === 'credit' ? Number(adjustAmount) : -Number(adjustAmount);

    try {
      await updateWalletBalance(
        selectedUser.uid,
        delta,
        0,
        currentUser?.email || 'admin',
        `Admin manual balance adjustment (${adjustType}): ${adjustReason || 'Manual credit/debit'}`
      );
      setFeedback({ type: 'success', message: `Wallet successfully updated for ${selectedUser.displayName || selectedUser.email}.` });
      setTimeout(() => {
        setSelectedUser(null);
        onRefresh();
      }, 1000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to adjust wallet.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredResellers = resellers.filter(
    (r) =>
      r.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            <span>Reseller Partner Wallets & Balances</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Monitor reseller ledger balances, pending commission escrow, and execute manual credit or debit adjustments.
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-100">
          Total Reseller Wallets: {resellers.length}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reseller by name or email..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg py-2 pl-10 pr-4 text-xs text-slate-900"
          />
        </div>
      </div>

      {/* Wallets Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Reseller Partner</th>
                <th className="py-3.5 px-4">Commission Tier</th>
                <th className="py-3.5 px-4">Total Paid Out</th>
                <th className="py-3.5 px-4">Pending Escrow</th>
                <th className="py-3.5 px-4">Available Balance</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredResellers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No reseller wallets found.
                  </td>
                </tr>
              ) : (
                filteredResellers.map((reseller) => {
                  const userWithdrawals = withdrawals.filter((w) => w.userId === reseller.uid);
                  const totalPaid = userWithdrawals
                    .filter((w) => w.status === 'approved')
                    .reduce((sum, w) => sum + w.amount, 0);
                  const totalPending = userWithdrawals
                    .filter((w) => w.status === 'pending')
                    .reduce((sum, w) => sum + w.amount, 0);

                  return (
                    <tr key={reseller.uid} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-xs">
                            {(reseller.displayName || reseller.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{reseller.displayName || 'Reseller'}</div>
                            <div className="text-[10px] text-slate-400">{reseller.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-semibold text-[10px]">
                          {reseller.commissionTier || 'Gold'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {currencySymbol}{totalPaid.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-amber-600 font-medium">
                        {currencySymbol}{totalPending.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 text-sm">
                        {currencySymbol}{(reseller.walletBalance || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenAdjust(reseller)}
                          className="px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-semibold rounded-md transition-colors text-xs inline-flex items-center gap-1.5"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Adjust Balance</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Adjust Wallet Balance</h3>
                <p className="text-[11px] text-slate-500">{selectedUser.displayName || selectedUser.email}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSaveAdjustment} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block">
                  Action Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAdjustType('credit')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      adjustType === 'credit'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Credit (+)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('debit')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      adjustType === 'debit'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>Debit (-)</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block">
                  Adjustment Amount ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="e.g. 500"
                  required
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg p-2.5 text-xs text-slate-900 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block">
                  Adjustment Reason / Audit Note *
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Bonus incentive / Manual compensation"
                  required
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg p-2.5 text-xs text-slate-900"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  {isSubmitting ? 'Updating...' : 'Confirm Balance Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
