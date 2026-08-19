import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Wallet,
  ArrowUpRight,
  TrendingUp,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Copy,
  Plus,
  ArrowRight,
  DollarSign,
  ShieldCheck,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Product, StoreSettings, Wallet as WalletType, Withdrawal, Order } from '../types';
import {
  fetchWallet,
  fetchUserWithdrawals,
  createWithdrawalRequest,
  fetchOrders,
} from '../services/storeService';
import { BUSINESS_INFO } from '../data/initialData';

interface ResellerPortalProps {
  products: Product[];
  storeSettings: StoreSettings;
  onSelectProduct: (product: Product) => void;
  onOrderForCustomer?: (product: Product) => void;
  onOpenAuth: (mode?: 'login' | 'register', role?: 'customer' | 'reseller') => void;
  setActiveTab?: (tab: string) => void;
}

export const ResellerPortal: React.FC<ResellerPortalProps> = ({
  products,
  storeSettings,
  onSelectProduct,
  onOrderForCustomer,
  onOpenAuth,
  setActiveTab,
}) => {
  const { currentUser, userProfile, isReseller } = useAuth();
  const phone = storeSettings.contactPhone || BUSINESS_INFO.phone;
  const email = storeSettings.contactEmail || BUSINESS_INFO.email;
  const currencySymbol = storeSettings.currencySymbol || '৳';

  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [resellerOrders, setResellerOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Withdrawal form state
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'bank'>('bkash');
  const [withdrawAccount, setWithdrawAccount] = useState(userProfile?.phone || '');
  const [withdrawNotes, setWithdrawNotes] = useState('');
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);
  const [withdrawalMessage, setWithdrawalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [copiedCode, setCopiedCode] = useState(false);

  const loadResellerData = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const [userWallet, userWithdrawals, allOrders] = await Promise.all([
        fetchWallet(currentUser.uid),
        fetchUserWithdrawals(currentUser.uid),
        fetchOrders(),
      ]);

      setWallet(userWallet);
      setWithdrawals(userWithdrawals);
      setResellerOrders(allOrders.filter((o) => o.resellerId === currentUser.uid));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && isReseller) {
      loadResellerData();
    }
  }, [currentUser, isReseller]);

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const amount = Number(withdrawAmount);
    if (!amount || amount < (storeSettings.minWithdrawalLimit || 500)) {
      setWithdrawalMessage({
        type: 'error',
        text: `Minimum withdrawal amount is ${currencySymbol}${storeSettings.minWithdrawalLimit || 500}`,
      });
      return;
    }

    if (!wallet || amount > wallet.balance) {
      setWithdrawalMessage({
        type: 'error',
        text: 'Insufficient available wallet balance.',
      });
      return;
    }

    if (!withdrawAccount) {
      setWithdrawalMessage({
        type: 'error',
        text: 'Please provide your account / mobile number for payout.',
      });
      return;
    }

    setIsSubmittingWithdrawal(true);
    setWithdrawalMessage(null);

    try {
      await createWithdrawalRequest({
        userId: currentUser.uid,
        resellerName: userProfile?.displayName || 'Reseller Partner',
        amount,
        paymentMethod: (withdrawMethod === 'bkash' ? 'bKash' : withdrawMethod === 'nagad' ? 'Nagad' : withdrawMethod === 'rocket' ? 'Rocket' : 'Bank'),
        accountDetails: `${withdrawMethod.toUpperCase()}: ${withdrawAccount} ${withdrawNotes ? `(${withdrawNotes})` : ''}`,
      });

      setWithdrawalMessage({
        type: 'success',
        text: 'Withdrawal request submitted successfully! Admin will process your payout.',
      });
      setWithdrawAmount('');
      setWithdrawNotes('');
      await loadResellerData();
    } catch (err: any) {
      setWithdrawalMessage({
        type: 'error',
        text: err.message || 'Failed to submit withdrawal request.',
      });
    } finally {
      setIsSubmittingWithdrawal(false);
    }
  };

  // If not logged in as reseller, show promotional & registration screen
  if (!currentUser || !isReseller) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-12 border border-stone-800 relative overflow-hidden">
          <div className="max-w-2xl space-y-6 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Zero Investment Reselling Platform</span>
            </span>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Start Your Online Business Without Inventory
            </h1>

            <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
              Access hundreds of high-demand consumer electronics at wholesale prices. Sell to your customers at retail, and pocket the difference directly in your bKash/Nagad wallet. We handle all stock packaging and nationwide shipping.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onOpenAuth('register', 'reseller')}
                className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Register as Reseller Partner</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenAuth('login')}
                className="px-6 py-3.5 bg-stone-800 hover:bg-stone-700 text-white font-bold text-sm rounded-xl border border-stone-700 transition-all cursor-pointer"
              >
                Sign In to Existing Portal
              </button>
            </div>
          </div>
        </div>

        {/* Reseller Perks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900">Guaranteed Wholesale Margins</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Earn 15% - 35% commission on every order. Set your custom retail price or use recommended pricing.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900">Swift bKash & Nagad Cashouts</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Withdraw your accumulated sales commissions with a minimum threshold of just ৳500.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900">Direct Customer Fulfillment</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Place orders directly with your customer's shipping address. We deliver in neutral white-label boxes.
            </p>
          </div>
        </div>

        {/* Reseller Support Strip */}
        <div className="p-6 bg-stone-100 rounded-3xl border border-stone-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div>
            <span className="font-bold text-stone-900">Have questions regarding reseller onboarding?</span>
            <p className="text-stone-500">Contact our dedicated partner desk directly.</p>
          </div>
          <div className="flex items-center gap-3">
            <a href={`tel:${phone}`} className="font-bold text-amber-700 hover:underline">
              Call: {phone}
            </a>
            <span>•</span>
            <a href={`mailto:${email}`} className="font-semibold text-stone-700 hover:underline">
              {email}
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Reseller is Logged In - Full Portal View
  const referralCode = userProfile?.resellerCode || `RES-${currentUser.uid.slice(0, 6).toUpperCase()}`;
  const totalCommissionEarned = wallet?.totalEarned || 0;
  const availableBalance = wallet?.balance || 0;
  const pendingWithdrawalSum = withdrawals
    .filter((w) => w.status === 'pending')
    .reduce((acc, w) => acc + w.amount, 0);

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Reseller Header Strip */}
      <div className="bg-stone-950 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-amber-500 text-stone-950 rounded-full text-[10px] font-black uppercase">
              Partner Portal
            </span>
            <span className="text-xs text-stone-400">Reseller Code: <strong>{referralCode}</strong></span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome, {userProfile?.displayName || 'Reseller Partner'}
          </h1>
          <p className="text-xs text-stone-400">
            Track your order commissions, manage customer drop-shipping, and withdraw earnings.
          </p>
        </div>

        {/* Reseller Referral / Attribution Box */}
        <div className="bg-stone-900 p-3.5 rounded-2xl border border-stone-800 flex items-center gap-3">
          <div>
            <p className="text-[10px] font-bold text-amber-400 uppercase">Your Partner Code</p>
            <p className="text-sm font-mono font-black text-white">{referralCode}</p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(referralCode);
              setCopiedCode(true);
              setTimeout(() => setCopiedCode(false), 2000);
            }}
            className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs transition-all"
            title="Copy Code"
          >
            {copiedCode ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase">Available Balance</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-emerald-700">
            {currencySymbol}{availableBalance.toLocaleString()}
          </h3>
          <p className="text-[11px] text-stone-400">Ready for instant cashout</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase">Lifetime Earnings</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-stone-900">
            {currencySymbol}{totalCommissionEarned.toLocaleString()}
          </h3>
          <p className="text-[11px] text-stone-400">Cumulative sales profit</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase">Pending Cashout</span>
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-sky-700">
            {currencySymbol}{pendingWithdrawalSum.toLocaleString()}
          </h3>
          <p className="text-[11px] text-stone-400">Processing by accounts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase">Total Orders Placed</span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-stone-900">
            {resellerOrders.length}
          </h3>
          <p className="text-[11px] text-stone-400">Attributed customer orders</p>
        </div>
      </div>

      {/* Main Reseller Actions: Withdrawal & Product Dropship Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Request Withdrawal Box */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-xs space-y-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-stone-900">Request Cashout</h2>
            </div>
            <p className="text-xs text-stone-500">
              Transfer your profits to your personal mobile financial account. Minimum {currencySymbol}{storeSettings.minWithdrawalLimit || 500}.
            </p>
          </div>

          {withdrawalMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                withdrawalMessage.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {withdrawalMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{withdrawalMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleRequestWithdrawal} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Withdrawal Amount ({currencySymbol}) *
              </label>
              <input
                type="number"
                required
                min={storeSettings.minWithdrawalLimit || 500}
                max={availableBalance}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder={`Min ${storeSettings.minWithdrawalLimit || 500}`}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Payout Method *</label>
              <div className="grid grid-cols-3 gap-2">
                {(['bkash', 'nagad', 'rocket'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setWithdrawMethod(m)}
                    className={`py-2 rounded-xl font-bold uppercase text-[11px] border transition-all ${
                      withdrawMethod === m
                        ? 'border-amber-500 bg-amber-50 text-amber-950'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Account Number ({withdrawMethod.toUpperCase()}) *
              </label>
              <input
                type="tel"
                required
                value={withdrawAccount}
                onChange={(e) => setWithdrawAccount(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Notes (Optional)</label>
              <input
                type="text"
                value={withdrawNotes}
                onChange={(e) => setWithdrawNotes(e.target.value)}
                placeholder="Personal / Merchant account"
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingWithdrawal || availableBalance < (storeSettings.minWithdrawalLimit || 500)}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <span>{isSubmittingWithdrawal ? 'Submitting...' : 'Submit Cashout Request'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </form>

          {/* Official Reseller Help strip */}
          <div className="pt-4 border-t border-stone-100 text-[11px] text-stone-500 space-y-1">
            <p>For payout disputes or urgent approvals, contact accounts:</p>
            <div className="flex items-center justify-between font-bold text-stone-800">
              <a href={`tel:${phone}`} className="hover:text-amber-700">Phone: {phone}</a>
              <a href={`mailto:${email}`} className="hover:text-amber-700">{email}</a>
            </div>
          </div>
        </div>

        {/* Right Column: Withdrawal History & Recent Orders */}
        <div className="lg:col-span-7 space-y-6">
          {/* Withdrawal History Card */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Withdrawal Request History</span>
            </h3>

            {withdrawals.length === 0 ? (
              <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-100 text-xs text-stone-500">
                No withdrawal requests found yet. Earn commissions and submit above.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Reference / TrxID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-stone-50/60">
                        <td className="py-3 px-3 text-stone-600">
                          {new Date(w.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 font-bold text-stone-900">
                          {currencySymbol}{w.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 uppercase text-stone-700 font-semibold">
                          {w.paymentMethod}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            w.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                            w.status === 'approved' ? 'bg-sky-100 text-sky-800' :
                            w.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {w.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-stone-500">
                          {w.transactionId || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Reseller Customer Dropshipping Callout */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-base font-black">Browse Products at Wholesale Price</h4>
              <p className="text-xs text-stone-900/80">
                Pick any item and click "Order for Customer" to ship with direct commission crediting.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('shop')}
              className="px-5 py-2.5 bg-stone-950 hover:bg-stone-900 text-white font-bold text-xs rounded-xl transition-all shrink-0 cursor-pointer shadow-md"
            >
              Browse Catalog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
