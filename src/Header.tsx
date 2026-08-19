import React, { useState } from 'react';
import {
  ShoppingBag,
  User,
  Search,
  Phone,
  Mail,
  ShieldCheck,
  Briefcase,
  HelpCircle,
  Menu,
  X,
  LogOut,
  ChevronDown,
  PackageCheck,
  Headphones,
  Sliders
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { BUSINESS_INFO, DEFAULT_STORE_SETTINGS } from '../data/initialData';
import { StoreSettings } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: (mode?: 'login' | 'register', role?: 'customer' | 'reseller') => void;
  onOpenTracking: () => void;
  storeSettings: StoreSettings;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenTracking,
  storeSettings,
  searchQuery,
  setSearchQuery,
}) => {
  const { currentUser, userProfile, isAdmin, isReseller, logout } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      {/* Top Announcement & Official Contact Bar */}
      <div className="bg-stone-900 text-stone-200 text-xs py-2 px-4 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate text-center md:text-left">
            <span className="bg-amber-500 text-stone-950 font-semibold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
              Official Hub
            </span>
            <span className="truncate">{storeSettings.announcementBanner || DEFAULT_STORE_SETTINGS.announcementBanner}</span>
          </div>
          <div className="flex items-center gap-4 shrink-0 text-stone-300 text-xs">
            <a
              href={`tel:${storeSettings.contactPhone || BUSINESS_INFO.phone}`}
              className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
              title="Official Hotline"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium tracking-wide">{storeSettings.contactPhone || BUSINESS_INFO.phone}</span>
            </a>
            <span className="text-stone-600">|</span>
            <a
              href={`mailto:${storeSettings.contactEmail || BUSINESS_INFO.email}`}
              className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
              title="Official Email"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline font-medium">{storeSettings.contactEmail || BUSINESS_INFO.email}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleTabClick('shop')}
              className="text-left focus:outline-hidden group flex items-center gap-2.5"
            >
              <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center text-amber-400 shadow-md group-hover:bg-stone-800 transition-all">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-stone-900 block leading-tight">
                  {storeSettings.storeName || 'NexShop'}
                </span>
                <span className="text-[11px] font-medium tracking-wide uppercase text-amber-600 block">
                  E-Commerce & Reseller Hub
                </span>
              </div>
            </button>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, gadgets, fashion..."
                className="w-full pl-10 pr-4 py-2 bg-stone-100 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-stone-400 hover:text-stone-600 absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => handleTabClick('shop')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'shop'
                  ? 'bg-stone-100 text-stone-950 font-semibold'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-stone-50'
              }`}
            >
              Storefront
            </button>
            <button
              onClick={() => handleTabClick('reseller')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'reseller'
                  ? 'bg-amber-50 text-amber-900 border border-amber-200/60 font-semibold'
                  : 'text-stone-600 hover:text-amber-800 hover:bg-amber-50/50'
              }`}
            >
              <Briefcase className="w-4 h-4 text-amber-600" />
              <span>Reseller Hub</span>
            </button>
            <button
              onClick={() => handleTabClick('customer-support')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'customer-support'
                  ? 'bg-stone-100 text-stone-950 font-semibold'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-stone-50'
              }`}
            >
              Customer Support
            </button>
            <button
              onClick={() => handleTabClick('reseller-support')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'reseller-support'
                  ? 'bg-stone-100 text-stone-950 font-semibold'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-stone-50'
              }`}
            >
              Reseller Support
            </button>
            <button
              onClick={() => handleTabClick('contact')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'contact'
                  ? 'bg-stone-100 text-stone-950 font-semibold'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-stone-50'
              }`}
            >
              Contact Us
            </button>
            {isAdmin && (
              <button
                onClick={() => handleTabClick('admin')}
                className={`px-3 py-1.5 ml-1 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-red-700 text-white shadow-sm'
                    : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                <span>Admin Portal</span>
              </button>
            )}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Track Order Quick Button */}
            <button
              onClick={onOpenTracking}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all"
              title="Track your order status"
            >
              <PackageCheck className="w-4 h-4 text-stone-600" />
              <span>Track Order</span>
            </button>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-xl transition-all"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Account / Auth Dropdown */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl text-xs font-medium transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-semibold">
                    {userProfile?.displayName?.[0]?.toUpperCase() || currentUser.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[100px] truncate hidden sm:inline text-stone-800">
                    {userProfile?.displayName || currentUser.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-stone-100">
                      <p className="text-xs font-bold text-stone-900 truncate">
                        {userProfile?.displayName || 'Authorized User'}
                      </p>
                      <p className="text-[11px] text-stone-500 truncate">{currentUser.email}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isAdmin
                              ? 'bg-red-100 text-red-800'
                              : isReseller
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isAdmin ? 'Primary Admin' : isReseller ? 'Reseller Partner' : 'Customer'}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      {isAdmin && (
                        <button
                          onClick={() => {
                            handleTabClick('admin');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 flex items-center gap-2"
                        >
                          <ShieldCheck className="w-4 h-4 text-red-600" />
                          <span>Admin Dashboard</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          handleTabClick('reseller');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                      >
                        <Briefcase className="w-4 h-4 text-amber-600" />
                        <span>Reseller Hub & Wallet</span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenTracking();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                      >
                        <PackageCheck className="w-4 h-4 text-stone-500" />
                        <span>My Orders / Tracking</span>
                      </button>

                      <button
                        onClick={() => {
                          handleTabClick('customer-support');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                      >
                        <Headphones className="w-4 h-4 text-stone-500" />
                        <span>Support Center</span>
                      </button>
                    </div>

                    <div className="border-t border-stone-100 pt-1">
                      <button
                        onClick={async () => {
                          await logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 rounded-xl transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('register', 'reseller')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl shadow-xs transition-all"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Become Reseller</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-700 hover:bg-stone-100 rounded-xl"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <div className="lg:hidden mt-3">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, gadgets, fashion..."
              className="w-full pl-10 pr-4 py-2 bg-stone-100 border border-stone-200 rounded-xl text-sm focus:outline-hidden"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-4 pt-2 pb-6 space-y-2">
          <button
            onClick={() => handleTabClick('shop')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium ${
              activeTab === 'shop' ? 'bg-stone-900 text-white font-semibold' : 'text-stone-700 hover:bg-stone-50'
            }`}
          >
            Storefront Catalog
          </button>
          <button
            onClick={() => handleTabClick('reseller')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between ${
              activeTab === 'reseller' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-amber-800 bg-amber-50/70'
            }`}
          >
            <span className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              <span>Reseller Hub & Wholesale</span>
            </span>
            <span className="text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded-full font-bold">Earn 15-25%</span>
          </button>
          <button
            onClick={() => handleTabClick('customer-support')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium ${
              activeTab === 'customer-support' ? 'bg-stone-900 text-white font-semibold' : 'text-stone-700 hover:bg-stone-50'
            }`}
          >
            Customer Support
          </button>
          <button
            onClick={() => handleTabClick('reseller-support')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium ${
              activeTab === 'reseller-support' ? 'bg-stone-900 text-white font-semibold' : 'text-stone-700 hover:bg-stone-50'
            }`}
          >
            Reseller Support & Helpline
          </button>
          <button
            onClick={() => handleTabClick('contact')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium ${
              activeTab === 'contact' ? 'bg-stone-900 text-white font-semibold' : 'text-stone-700 hover:bg-stone-50'
            }`}
          >
            Contact Information
          </button>
          {isAdmin && (
            <button
              onClick={() => handleTabClick('admin')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 ${
                activeTab === 'admin' ? 'bg-red-700 text-white' : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-red-600" />
              <span>Admin Management Dashboard</span>
            </button>
          )}

          <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-stone-600 px-1 py-1">
              <span>Hotline: <strong className="text-stone-900">{storeSettings.contactPhone || BUSINESS_INFO.phone}</strong></span>
              <span><strong className="text-stone-900">{storeSettings.contactEmail || BUSINESS_INFO.email}</strong></span>
            </div>
            {!currentUser && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    onOpenAuth('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-center text-xs font-semibold border border-stone-300 rounded-xl"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    onOpenAuth('register', 'reseller');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-center text-xs font-bold bg-amber-500 text-stone-950 rounded-xl"
                >
                  Join Reseller
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
