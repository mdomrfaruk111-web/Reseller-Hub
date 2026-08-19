import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Briefcase,
  ShieldCheck,
  Headphones,
  CheckCircle2,
  Lock,
  Truck
} from 'lucide-react';
import { StoreSettings } from '../types';
import { BUSINESS_INFO } from '../data/initialData';

interface FooterProps {
  storeSettings: StoreSettings;
  setActiveTab: (tab: string) => void;
  onOpenTracking: () => void;
  onOpenAuth: (mode?: 'login' | 'register', role?: 'customer' | 'reseller') => void;
}

export const Footer: React.FC<FooterProps> = ({
  storeSettings,
  setActiveTab,
  onOpenTracking,
  onOpenAuth,
}) => {
  const phone = storeSettings.contactPhone || BUSINESS_INFO.phone;
  const email = storeSettings.contactEmail || BUSINESS_INFO.email;

  const navigateTo = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Trust Badges Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-stone-800/80">
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-stone-900/60 border border-stone-800">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Fast Nationwide Delivery</h4>
              <p className="text-xs text-stone-400">Inside Dhaka ৳70, Outside ৳130</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-stone-900/60 border border-stone-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Zero Investment Reselling</h4>
              <p className="text-xs text-stone-400">High wholesale profit margins</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-stone-900/60 border border-stone-800">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Dedicated Support</h4>
              <p className="text-xs text-stone-400">Call {phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-stone-900/60 border border-stone-800">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Secure Payments</h4>
              <p className="text-xs text-stone-400">bKash, Nagad, Cash On Delivery</p>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12">
          {/* Brand & Official Contact Box */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                {storeSettings.storeName || 'NexShop'}
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              Bangladesh’s premier e-commerce retail and wholesale reseller network. Direct factory sourcing, prompt payouts, and dedicated partner support.
            </p>

            {/* Official Contact Info Card */}
            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Official Business Contact
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2.5 text-stone-200">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-stone-400">Hotline:</span>
                  <a href={`tel:${phone}`} className="font-semibold text-white hover:text-amber-400 transition-colors">
                    {phone}
                  </a>
                </div>
                <div className="flex items-center gap-2.5 text-stone-200">
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-stone-400">Email:</span>
                  <a href={`mailto:${email}`} className="font-semibold text-white hover:text-amber-400 transition-colors">
                    {email}
                  </a>
                </div>
                <div className="flex items-start gap-2.5 text-stone-300 pt-1">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-stone-400">{storeSettings.address || BUSINESS_INFO.address}</span>
                </div>
                <div className="flex items-center gap-2.5 text-stone-300 pt-1">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-[11px] text-stone-400">{storeSettings.businessHours || BUSINESS_INFO.supportHours}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-100">Customer Support</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button onClick={() => navigateTo('customer-support')} className="hover:text-amber-400 transition-colors">
                  Help Center & FAQs
                </button>
              </li>
              <li>
                <button onClick={onOpenTracking} className="hover:text-amber-400 transition-colors">
                  Track Your Order
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('contact')} className="hover:text-amber-400 transition-colors">
                  Contact Customer Care
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('customer-support')} className="hover:text-amber-400 transition-colors">
                  Submit Support Ticket
                </button>
              </li>
              <li>
                <a href={`tel:${phone}`} className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  <span>Call {phone}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Reseller Hub */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Reseller Hub</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button onClick={() => navigateTo('reseller')} className="hover:text-amber-400 transition-colors">
                  Reseller Portal
                </button>
              </li>
              <li>
                <button onClick={() => onOpenAuth('register', 'reseller')} className="hover:text-amber-400 transition-colors font-medium text-amber-300">
                  Register as Reseller
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('reseller-support')} className="hover:text-amber-400 transition-colors">
                  Reseller Guidelines & FAQs
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('reseller')} className="hover:text-amber-400 transition-colors">
                  Wallet & Payouts (bKash/Nagad)
                </button>
              </li>
              <li>
                <a href={`mailto:${email}`} className="hover:text-amber-400 transition-colors">
                  Reseller Support Email
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-100">Quick Links</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button onClick={() => navigateTo('shop')} className="hover:text-amber-400 transition-colors">
                  Product Catalog
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('contact')} className="hover:text-amber-400 transition-colors">
                  Official Contact Page
                </button>
              </li>
              <li>
                <button onClick={() => onOpenAuth('login')} className="hover:text-amber-400 transition-colors">
                  Account Sign In
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('admin')} className="hover:text-red-400 transition-colors flex items-center gap-1.5 text-stone-400">
                  <Lock className="w-3 h-3 text-red-500" />
                  <span>Admin Console</span>
                </button>
              </li>
              <li className="pt-2 text-[11px] text-stone-500">
                <span>Direct Hotline:</span>
                <p className="text-amber-400 font-semibold text-xs">{phone}</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods & Bottom Bar */}
        <div className="pt-8 border-t border-stone-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-stone-400">Accepted Payment Methods:</span>
            <span className="px-2 py-0.5 rounded bg-pink-950/60 text-pink-300 font-bold border border-pink-800 text-[10px]">
              bKash
            </span>
            <span className="px-2 py-0.5 rounded bg-orange-950/60 text-orange-300 font-bold border border-orange-800 text-[10px]">
              Nagad
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 font-bold border border-purple-800 text-[10px]">
              Rocket
            </span>
            <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 font-medium border border-stone-700 text-[10px]">
              Cash on Delivery (COD)
            </span>
          </div>

          <div className="text-center md:text-right">
            <p>© {new Date().getFullYear()} {storeSettings.storeName || 'NexShop'}. All Rights Reserved.</p>
            <p className="text-[10px] text-stone-600">
              Official Helpline: {phone} • {email}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
