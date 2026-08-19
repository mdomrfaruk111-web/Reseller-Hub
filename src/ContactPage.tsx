import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Smartphone,
  ShieldCheck,
  Building
} from 'lucide-react';
import { StoreSettings } from '../types';
import { BUSINESS_INFO } from '../data/initialData';
import { createSupportTicket } from '../services/storeService';
import { useAuth } from '../context/AuthContext';

interface ContactPageProps {
  storeSettings: StoreSettings;
}

export const ContactPage: React.FC<ContactPageProps> = ({ storeSettings }) => {
  const { currentUser, userProfile } = useAuth();
  const phone = storeSettings.contactPhone || BUSINESS_INFO.phone;
  const email = storeSettings.contactEmail || BUSINESS_INFO.email;

  const [formData, setFormData] = useState({
    name: userProfile?.displayName || '',
    email: currentUser?.email || '',
    phone: userProfile?.phone || '',
    subject: '',
    message: '',
    inquiryType: 'general',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const ticketId = await createSupportTicket({
        userId: currentUser?.uid || 'guest',
        userName: formData.name,
        userEmail: formData.email,
        userPhone: formData.phone,
        userType: userProfile?.role || 'guest',
        subject: `[${formData.inquiryType.toUpperCase()}] ${formData.subject}`,
        message: formData.message,
      });

      setSubmittedTicketId(ticketId);
      setFormData({
        name: userProfile?.displayName || '',
        email: currentUser?.email || '',
        phone: userProfile?.phone || '',
        subject: '',
        message: '',
        inquiryType: 'general',
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit inquiry. Please try calling directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-stone-50 py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 border border-amber-300 text-amber-900 rounded-full text-xs font-bold uppercase tracking-wider">
            <Building className="w-3.5 h-3.5" />
            <span>Official Business Contact</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            We’re Here to Help You
          </h1>
          <p className="text-sm sm:text-base text-stone-600">
            Have questions regarding products, wholesale reseller pricing, bulk orders, or shipping? Reach our official management team anytime.
          </p>
        </div>

        {/* Primary Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Official Phone */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Direct Hotline</span>
                <h3 className="text-xl font-bold text-stone-900 mt-0.5">{phone}</h3>
                <p className="text-xs text-stone-500 mt-1">
                  Instant phone assistance for retail customers & active resellers.
                </p>
              </div>
            </div>
            <div className="pt-6 mt-4 border-t border-stone-100 flex items-center gap-2">
              <a
                href={`tel:${phone}`}
                className="flex-1 text-center py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Call Hotline
              </a>
              <a
                href={`https://wa.me/88${phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                WhatsApp
              </a>
            </div>
          </div>

          {/* Card 2: Official Email */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-stone-900 text-amber-400 flex items-center justify-center font-bold">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Official Email</span>
                <h3 className="text-base sm:text-lg font-bold text-stone-900 mt-0.5 break-all">{email}</h3>
                <p className="text-xs text-stone-500 mt-1">
                  For administrative inquiries, business proposals, and reseller partnership verifications.
                </p>
              </div>
            </div>
            <div className="pt-6 mt-4 border-t border-stone-100">
              <a
                href={`mailto:${email}`}
                className="block text-center w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-xl text-xs font-bold transition-all"
              >
                Send Direct Email
              </a>
            </div>
          </div>

          {/* Card 3: Physical Address & Hours */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Office & Distribution</span>
                <h3 className="text-sm font-bold text-stone-900 mt-0.5">{storeSettings.address || BUSINESS_INFO.address}</h3>
                <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-2">
                  <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>{storeSettings.businessHours || BUSINESS_INFO.supportHours}</span>
                </div>
              </div>
            </div>
            <div className="pt-6 mt-4 border-t border-stone-100">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Open Today
                </span>
                <span>Sat - Thu: 9am - 10pm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form & Additional Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Inquiry Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
            <div className="space-y-2 mb-6">
              <h2 className="text-xl font-bold text-stone-900">Send an Official Message</h2>
              <p className="text-xs sm:text-sm text-stone-500">
                Fill out the form below. Your message will be assigned a tracking ticket and answered promptly by our support desk.
              </p>
            </div>

            {submittedTicketId ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3 animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-emerald-900">Message Received Successfully!</h3>
                <p className="text-xs text-emerald-800">
                  Ticket Reference ID: <strong className="font-mono bg-emerald-100 px-2 py-0.5 rounded">{submittedTicketId}</strong>
                </p>
                <p className="text-xs text-emerald-700 max-w-md mx-auto">
                  Our representative will contact you via phone or email shortly. For emergency assistance, you can call <strong>{phone}</strong> directly.
                </p>
                <button
                  onClick={() => setSubmittedTicketId(null)}
                  className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Tanvir Ahmed"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. name@example.com"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 017XXXXXXXX"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Inquiry Nature
                    </label>
                    <select
                      value={formData.inquiryType}
                      onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    >
                      <option value="general">General Customer Support</option>
                      <option value="reseller">Reseller Partnership & Payouts</option>
                      <option value="order">Order Tracking & Delivery</option>
                      <option value="wholesale">Bulk / Wholesale Purchase</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief description of your question"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Detailed Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Write details of your inquiry, order number (if applicable), or reseller requirements..."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting to Support...' : 'Submit Inquiry'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Column: FAQ & Quick Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-stone-900 text-white p-6 sm:p-8 rounded-3xl space-y-4">
              <span className="text-[10px] font-bold tracking-wider uppercase text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-800">
                Direct Line
              </span>
              <h3 className="text-xl font-bold">Fast-Track Reseller & Customer Response</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Need urgent assistance regarding a pending withdrawal or delivery confirmation? Call our official desk directly.
              </p>
              <div className="p-4 rounded-2xl bg-stone-800/80 border border-stone-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-400">Official Phone:</span>
                  <a href={`tel:${phone}`} className="font-bold text-amber-400 hover:underline">{phone}</a>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-400">Official Email:</span>
                  <a href={`mailto:${email}`} className="font-semibold text-amber-400 hover:underline">{email}</a>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200 space-y-4">
              <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>Frequently Asked Questions</span>
              </h4>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <p className="font-semibold text-stone-900">How soon do you reply?</p>
                  <p className="text-stone-500 mt-1">Tickets are typically answered within 1-2 hours during business hours.</p>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <p className="font-semibold text-stone-900">Do you offer WhatsApp support?</p>
                  <p className="text-stone-500 mt-1">Yes! You can WhatsApp our official hotline at <strong>{phone}</strong>.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
