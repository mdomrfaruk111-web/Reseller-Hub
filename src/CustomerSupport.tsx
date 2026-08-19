import React, { useState } from 'react';
import {
  HelpCircle,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  PackageCheck,
  Headphones,
  ShieldCheck,
  Send,
  CheckCircle2,
  Clock,
  Truck
} from 'lucide-react';
import { StoreSettings } from '../types';
import { BUSINESS_INFO, FAQS } from '../data/initialData';
import { createSupportTicket } from '../services/storeService';
import { useAuth } from '../context/AuthContext';

interface CustomerSupportProps {
  storeSettings: StoreSettings;
  onOpenTracking: () => void;
}

export const CustomerSupport: React.FC<CustomerSupportProps> = ({ storeSettings, onOpenTracking }) => {
  const { currentUser, userProfile } = useAuth();
  const phone = storeSettings.contactPhone || BUSINESS_INFO.phone;
  const email = storeSettings.contactEmail || BUSINESS_INFO.email;

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [formData, setFormData] = useState({
    name: userProfile?.displayName || '',
    email: currentUser?.email || '',
    phone: userProfile?.phone || '',
    subject: '',
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
        userId: currentUser?.uid || 'guest',
        userName: formData.name,
        userEmail: formData.email,
        userPhone: formData.phone,
        userType: 'customer',
        subject: formData.subject || 'Customer Support Request',
        message: formData.message,
      });
      setSubmittedTicketId(ticketId);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-stone-50 py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Support Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-100 border border-amber-300 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wider">
            <Headphones className="w-3.5 h-3.5" />
            <span>Customer Care Desk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Customer Support Center
          </h1>
          <p className="text-sm text-stone-600">
            Need help with your order, product specifications, or delivery? Reach our support team using the official channels below.
          </p>
        </div>

        {/* Quick Contact & Action Ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-stone-500 uppercase">Official Support Phone</p>
              <a href={`tel:${phone}`} className="text-base font-bold text-stone-900 hover:text-amber-600 transition-colors">
                {phone}
              </a>
              <p className="text-[11px] text-stone-400">Available 9:00 AM - 10:00 PM</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-stone-500 uppercase">Support Email</p>
              <a href={`mailto:${email}`} className="text-sm font-bold text-stone-900 hover:text-amber-600 transition-colors break-all">
                {email}
              </a>
              <p className="text-[11px] text-stone-400">Response within 2 hours</p>
            </div>
          </div>

          <div className="bg-amber-500 text-stone-950 p-5 rounded-2xl shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide opacity-80">Track Existing Order</p>
              <h4 className="text-base font-black">Where is my package?</h4>
            </div>
            <button
              onClick={onOpenTracking}
              className="px-3.5 py-2 bg-stone-950 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-all shrink-0 flex items-center gap-1.5"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Track Now</span>
            </button>
          </div>
        </div>

        {/* FAQs and Support Ticket Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* FAQ Section */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-5 h-5 text-amber-600" />
              <h2 className="text-xl font-bold text-stone-900">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-3">
              {FAQS.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-stone-900 text-sm hover:bg-stone-50"
                  >
                    <span>{faq.question}</span>
                    {openFaqIndex === idx ? (
                      <ChevronUp className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                    )}
                  </button>
                  {openFaqIndex === idx && (
                    <div className="px-5 pb-4 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Create Ticket Box */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
            <h3 className="text-lg font-bold text-stone-900 mb-1">Submit Customer Ticket</h3>
            <p className="text-xs text-stone-500 mb-4">
              Need direct help from a representative? Send a message and we will respond via email/SMS.
            </p>

            {submittedTicketId ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900">Support Ticket Created</h4>
                <p className="text-xs text-emerald-700">Reference: <strong>{submittedTicketId}</strong></p>
                <button
                  onClick={() => setSubmittedTicketId(null)}
                  className="text-xs font-bold text-emerald-800 underline mt-2 inline-block"
                >
                  Submit Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                    placeholder="01XXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Issue / Question *</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl resize-none"
                    placeholder="Describe your issue or order inquiry..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
