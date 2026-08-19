import React, { useState } from 'react';
import {
  Briefcase,
  Phone,
  Mail,
  DollarSign,
  Wallet,
  CheckCircle2,
  ShieldCheck,
  Send,
  HelpCircle,
  TrendingUp,
  Zap,
  Clock
} from 'lucide-react';
import { StoreSettings } from '../types';
import { BUSINESS_INFO } from '../data/initialData';
import { createSupportTicket } from '../services/storeService';
import { useAuth } from '../context/AuthContext';

interface ResellerSupportProps {
  storeSettings: StoreSettings;
  onOpenAuth: (mode?: 'login' | 'register', role?: 'customer' | 'reseller') => void;
  setActiveTab: (tab: string) => void;
}

export const ResellerSupport: React.FC<ResellerSupportProps> = ({
  storeSettings,
  onOpenAuth,
  setActiveTab,
}) => {
  const { currentUser, userProfile, isReseller } = useAuth();
  const phone = storeSettings.contactPhone || BUSINESS_INFO.phone;
  const email = storeSettings.contactEmail || BUSINESS_INFO.email;

  const [formData, setFormData] = useState({
    name: userProfile?.displayName || '',
    email: currentUser?.email || '',
    phone: userProfile?.phone || '',
    subject: 'Reseller Partnership / Payout Assistance',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setIsSubmitting(true);
    try {
      const ticketId = await createSupportTicket({
        userId: currentUser?.uid || 'guest_reseller',
        userName: formData.name,
        userEmail: formData.email,
        userPhone: formData.phone,
        userType: 'reseller',
        subject: `[RESELLER VIP] ${formData.subject}`,
        message: formData.message,
      });
      setSubmittedTicketId(ticketId);
      setFormData({ ...formData, message: '' });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-stone-900 text-stone-100 py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-bold uppercase tracking-wider">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Dedicated Reseller Desk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Reseller Partner Support & Guidance
          </h1>
          <p className="text-sm text-stone-400">
            Direct priority support for our dropshipping and reseller network partners. Get instant help with product stock, custom wholesale pricing, or bKash/Nagad payouts.
          </p>
        </div>

        {/* Priority Hotline & Email Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-stone-800/80 p-6 rounded-3xl border border-stone-700 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Reseller Priority Hotline</span>
              <h3 className="text-xl font-bold text-white mt-1">{phone}</h3>
              <p className="text-xs text-stone-400 mt-1">
                Direct phone assistance for active sellers, delivery disputes, and emergency payout inquiries.
              </p>
            </div>
            <a
              href={`tel:${phone}`}
              className="block text-center py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs transition-all shadow-xs"
            >
              Call Reseller Desk
            </a>
          </div>

          <div className="bg-stone-800/80 p-6 rounded-3xl border border-stone-700 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-stone-700 text-amber-400 flex items-center justify-center font-bold">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Reseller Management Email</span>
              <h3 className="text-base font-bold text-white mt-1 break-all">{email}</h3>
              <p className="text-xs text-stone-400 mt-1">
                For partner contracts, VIP commission tier upgrades, and bulk stocking agreements.
              </p>
            </div>
            <a
              href={`mailto:${email}?subject=Reseller%20Partner%20Inquiry`}
              className="block text-center py-2.5 bg-stone-700 hover:bg-stone-600 text-white font-bold rounded-xl text-xs transition-all"
            >
              Email Reseller Team
            </a>
          </div>

          <div className="bg-gradient-to-br from-amber-900/60 to-stone-800 p-6 rounded-3xl border border-amber-600/30 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Fast Reseller Payouts</span>
                <h3 className="text-lg font-bold text-white mt-0.5">Withdraw Anytime</h3>
                <p className="text-xs text-stone-300 mt-1">
                  Withdraw to bKash, Nagad, Rocket, or direct Bank Transfer. Low minimum withdrawal limit of ৳500.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (isReseller) {
                  setActiveTab('reseller');
                } else {
                  onOpenAuth('register', 'reseller');
                }
              }}
              className="mt-4 w-full py-2.5 bg-amber-500 text-stone-950 font-bold rounded-xl text-xs hover:bg-amber-400 transition-all text-center"
            >
              {isReseller ? 'Open My Reseller Wallet' : 'Join Reseller Program'}
            </button>
          </div>
        </div>

        {/* Reseller Workflow & Priority Ticket Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Guide & Rules */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <span>How the Reseller Program Works</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700/80 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs">1</span>
                  <span>Browse Wholesale Rates</span>
                </div>
                <p className="text-stone-400">
                  Every product displays the wholesale cost and recommended retail price. You can sell at retail or your own price.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700/80 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs">2</span>
                  <span>Place Customer Orders</span>
                </div>
                <p className="text-stone-400">
                  Use the "Order for Customer" button to input your customer’s delivery address. We deliver in neutral packaging.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700/80 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs">3</span>
                  <span>Margin in Your Wallet</span>
                </div>
                <p className="text-stone-400">
                  The profit difference between your sale price and wholesale price is credited directly to your Reseller Wallet.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700/80 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs">4</span>
                  <span>Instant bKash/Nagad Cashout</span>
                </div>
                <p className="text-stone-400">
                  Request a withdrawal to your personal mobile financial account anytime. Payouts are handled swiftly.
                </p>
              </div>
            </div>
          </div>

          {/* Priority Support Ticket Box */}
          <div className="lg:col-span-5 bg-stone-800 p-6 rounded-3xl border border-stone-700">
            <h3 className="text-lg font-bold text-white mb-1">Priority Reseller Inquiry</h3>
            <p className="text-xs text-stone-400 mb-4">
              Need custom volume pricing or immediate payout verification? Submit below for expedited review.
            </p>

            {submittedTicketId ? (
              <div className="p-5 bg-amber-950/40 border border-amber-700/60 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-amber-400 mx-auto" />
                <h4 className="text-sm font-bold text-amber-300">Reseller Ticket Dispatched</h4>
                <p className="text-xs text-stone-300">Ticket ID: <strong className="font-mono">{submittedTicketId}</strong></p>
                <p className="text-[11px] text-stone-400">Our partner manager will connect with you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-300 mb-1">Reseller / Business Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-stone-900 border border-stone-700 rounded-xl text-white focus:border-amber-500"
                    placeholder="e.g. Dhaka Tech Mart / Tanvir"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 bg-stone-900 border border-stone-700 rounded-xl text-white focus:border-amber-500"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-300 mb-1">bKash/Nagad Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-stone-900 border border-stone-700 rounded-xl text-white focus:border-amber-500"
                    placeholder="01XXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-300 mb-1">Message / Inquiry Details *</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-2.5 bg-stone-900 border border-stone-700 rounded-xl text-white focus:border-amber-500 resize-none"
                    placeholder="E.g. Inquiring about bulk discount on ANC Headphones or checking payout status..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting to Partner Desk...' : 'Send Priority Inquiry'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
