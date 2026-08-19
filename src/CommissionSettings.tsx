import React, { useState } from 'react';
import {
  Percent,
  Save,
  CheckCircle2,
  AlertCircle,
  Award,
  Wallet,
  ShieldAlert,
  Info
} from 'lucide-react';
import { StoreSettings } from '../../types';
import { updateStoreSettings } from '../../services/storeService';
import { useAuth } from '../../context/AuthContext';

interface CommissionSettingsProps {
  storeSettings: StoreSettings;
  onRefreshSettings: () => void;
}

export const CommissionSettings: React.FC<CommissionSettingsProps> = ({
  storeSettings,
  onRefreshSettings,
}) => {
  const { currentUser } = useAuth();
  const currencySymbol = storeSettings.currencySymbol || '৳';

  const [formData, setFormData] = useState({
    defaultResellerMargin: String(storeSettings.defaultResellerMargin || 15),
    minWithdrawalLimit: String(storeSettings.minWithdrawalLimit || 500),
  });

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      await updateStoreSettings(
        {
          defaultResellerMargin: Number(formData.defaultResellerMargin) || 15,
          minWithdrawalLimit: Number(formData.minWithdrawalLimit) || 500,
        },
        currentUser?.email || 'admin'
      );
      setFeedback({ type: 'success', message: 'Commission and payout settings successfully updated.' });
      onRefreshSettings();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Commission & Wallet Rules</h2>
        <p className="text-xs text-stone-500">
          Configure default profit margins, payout constraints, and reseller reward tiers.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-800">
              Default Reseller Profit Margin (%)
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min={1}
                max={90}
                value={formData.defaultResellerMargin}
                onChange={(e) => setFormData({ ...formData, defaultResellerMargin: e.target.value })}
                className="w-full pl-3 pr-8 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900"
              />
              <Percent className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[11px] text-stone-500">
              Suggested baseline discount off retail price when creating new catalog products.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-800">
              Minimum Cashout Threshold ({currencySymbol})
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min={50}
                max={50000}
                value={formData.minWithdrawalLimit}
                onChange={(e) => setFormData({ ...formData, minWithdrawalLimit: e.target.value })}
                className="w-full pl-3 pr-8 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900"
              />
              <Wallet className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[11px] text-stone-500">
              Minimum wallet balance a reseller must accumulate before requesting bKash/Nagad cashout.
            </p>
          </div>
        </div>

        {/* Reseller Performance Tiers Reference */}
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Reseller Partner Commission Tiers</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-stone-200">
              <span className="font-bold text-stone-800">Standard Tier</span>
              <p className="text-[11px] text-amber-700 font-extrabold mt-1">15% Margin</p>
              <p className="text-[10px] text-stone-400 mt-0.5">0 - 10 orders</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-stone-200">
              <span className="font-bold text-stone-800">Silver Partner</span>
              <p className="text-[11px] text-sky-700 font-extrabold mt-1">20% Margin</p>
              <p className="text-[10px] text-stone-400 mt-0.5">11 - 50 orders</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-stone-200">
              <span className="font-bold text-stone-800">Gold Partner</span>
              <p className="text-[11px] text-amber-600 font-extrabold mt-1">25% Margin</p>
              <p className="text-[10px] text-stone-400 mt-0.5">51 - 200 orders</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-stone-200">
              <span className="font-bold text-stone-800">Platinum VIP</span>
              <p className="text-[11px] text-purple-700 font-extrabold mt-1">30% Margin</p>
              <p className="text-[10px] text-stone-400 mt-0.5">200+ orders</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Rules...' : 'Save Commission Settings'}</span>
        </button>
      </form>
    </div>
  );
};
