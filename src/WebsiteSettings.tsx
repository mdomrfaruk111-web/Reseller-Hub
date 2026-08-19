import React, { useState } from 'react';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Truck,
  Store,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { StoreSettings } from '../../types';
import { updateStoreSettings } from '../../services/storeService';
import { useAuth } from '../../context/AuthContext';
import { BUSINESS_INFO } from '../../data/initialData';

interface WebsiteSettingsProps {
  storeSettings: StoreSettings;
  onRefreshSettings: () => void;
}

export const WebsiteSettings: React.FC<WebsiteSettingsProps> = ({
  storeSettings,
  onRefreshSettings,
}) => {
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    storeName: storeSettings.storeName || 'NexShop',
    contactPhone: storeSettings.contactPhone || BUSINESS_INFO.phone,
    contactEmail: storeSettings.contactEmail || BUSINESS_INFO.email,
    address: storeSettings.address || BUSINESS_INFO.address,
    businessHours: storeSettings.businessHours || BUSINESS_INFO.supportHours,
    deliveryFeeInside: String(storeSettings.deliveryFeeInside || 70),
    deliveryFeeOutside: String(storeSettings.deliveryFeeOutside || 130),
    heroHeadline: storeSettings.heroHeadline || 'Premium Quality Products at Wholesale Margins',
    heroSubheadline: storeSettings.heroSubheadline || 'Shop high-demand consumer electronics, gadgets, and apparel with fast nationwide delivery.',
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
          storeName: formData.storeName,
          contactPhone: formData.contactPhone,
          contactEmail: formData.contactEmail,
          address: formData.address,
          businessHours: formData.businessHours,
          deliveryFeeInside: Number(formData.deliveryFeeInside) || 70,
          deliveryFeeOutside: Number(formData.deliveryFeeOutside) || 130,
          heroHeadline: formData.heroHeadline,
          heroSubheadline: formData.heroSubheadline,
        },
        currentUser?.email || 'admin'
      );

      setFeedback({ type: 'success', message: 'Website configuration saved successfully.' });
      onRefreshSettings();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Website & Official Business Settings</h2>
        <p className="text-xs text-stone-500">
          Manage public business contacts, delivery fees, and storefront banners.
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

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6 text-xs">
        {/* Official Contact Info Box */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-stone-900 text-sm">Official Business Contact Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Official Business Phone Hotline *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="01331993380"
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900"
                />
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] text-stone-400 mt-1">Displayed across Contact page, Footer, and Support.</p>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Official Business Email *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="mdomrfaruk111@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] text-stone-400 mt-1">Official inquiry and reseller partnership inbox.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Office & Warehouse Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Dhanmondi, Dhaka, Bangladesh"
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900"
                />
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Business & Support Operating Hours
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.businessHours}
                  onChange={(e) => setFormData({ ...formData, businessHours: e.target.value })}
                  placeholder="Sat - Thu: 9:00 AM - 10:00 PM"
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900"
                />
                <Clock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>
        </div>

        {/* Storefront & Delivery Settings */}
        <div className="space-y-4 pt-4 border-t border-stone-100">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
            <Truck className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-stone-900 text-sm">Delivery & Shipping Fees (BDT)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Inside Dhaka Delivery Charge (৳)
              </label>
              <input
                type="number"
                value={formData.deliveryFeeInside}
                onChange={(e) => setFormData({ ...formData, deliveryFeeInside: e.target.value })}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Outside Dhaka Delivery Charge (৳)
              </label>
              <input
                type="number"
                value={formData.deliveryFeeOutside}
                onChange={(e) => setFormData({ ...formData, deliveryFeeOutside: e.target.value })}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
              />
            </div>
          </div>
        </div>

        {/* Hero Banner Section */}
        <div className="space-y-4 pt-4 border-t border-stone-100">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-stone-900 text-sm">Homepage Hero Copy</h3>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Main Headline</label>
            <input
              type="text"
              value={formData.heroHeadline}
              onChange={(e) => setFormData({ ...formData, heroHeadline: e.target.value })}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Subheadline Description</label>
            <textarea
              rows={2}
              value={formData.heroSubheadline}
              onChange={(e) => setFormData({ ...formData, heroSubheadline: e.target.value })}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Settings...' : 'Save Website Settings'}</span>
        </button>
      </form>
    </div>
  );
};
