import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  SlidersHorizontal,
  Briefcase,
  Phone,
  Mail,
  ShieldCheck,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { CATEGORIES, BUSINESS_INFO } from '../data/initialData';
import { ProductCard } from './ProductCard';
import { useAuth } from '../context/AuthContext';

interface ProductCatalogProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onOrderForCustomer?: (product: Product) => void;
  storeSettings: StoreSettings;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenAuth: (mode?: 'login' | 'register', role?: 'customer' | 'reseller') => void;
  setActiveTab: (tab: string) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  onSelectProduct,
  onOrderForCustomer,
  storeSettings,
  searchQuery,
  setSearchQuery,
  onOpenAuth,
  setActiveTab,
}) => {
  const { isReseller, currentUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'newest'>('featured');

  const phone = storeSettings.contactPhone || BUSINESS_INFO.phone;
  const email = storeSettings.contactEmail || BUSINESS_INFO.email;
  const currencySymbol = storeSettings.currencySymbol || '৳';

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory = selectedCategory === 'All Categories' || p.category === selectedCategory;
        const matchesSearch =
          !searchQuery ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = p.status === 'active' || !p.status;
        return matchesCategory && matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'price_low') return a.price - b.price;
        if (sortBy === 'price_high') return b.price - a.price;
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      <div className="relative bg-stone-950 text-white rounded-3xl overflow-hidden shadow-xl border border-stone-800">
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900/90 to-amber-950/40 z-10" />
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80"
          alt="Banner"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />

        <div className="relative z-20 max-w-4xl px-6 py-12 sm:px-12 sm:py-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Direct Wholesale & Retail Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {storeSettings.heroHeadline || 'Premium Quality Products at Wholesale Margins'}
          </h1>

          <p className="text-sm sm:text-base text-stone-300 max-w-2xl leading-relaxed">
            {storeSettings.heroSubheadline ||
              'Shop high-demand consumer electronics, gadgets, and apparel with fast nationwide delivery. Start your reseller dropshipping journey with zero upfront investment.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {!isReseller && (
              <button
                onClick={() => onOpenAuth('register', 'reseller')}
                className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Briefcase className="w-4 h-4" />
                <span>Join Reseller Program</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setActiveTab('contact')}
              className="px-5 py-3 bg-stone-800 hover:bg-stone-700 text-white font-semibold text-xs sm:text-sm rounded-xl border border-stone-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4 text-amber-400" />
              <span>Contact Desk: {phone}</span>
            </button>
          </div>

          {/* Quick Reseller Perk Callout */}
          <div className="pt-4 border-t border-stone-800/80 flex flex-wrap items-center gap-6 text-xs text-stone-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Genuine Products</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Earn ৳300 - ৳1,000 Margin Per Order</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-sky-400" />
              <span>Official Support: {email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Categories Ribbon */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Categories Horizontal Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <SlidersHorizontal className="w-4 h-4 text-stone-400" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="featured">Featured First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>

        {/* Search Results Notice */}
        {searchQuery && (
          <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
            <span>
              Showing results for "<strong>{searchQuery}</strong>" ({filteredProducts.length} items found)
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="font-bold underline hover:text-amber-950"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
              onOrderForCustomer={onOrderForCustomer}
              currencySymbol={currencySymbol}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
          <p className="text-stone-400 text-sm">No products found matching your filters.</p>
          <button
            onClick={() => {
              setSelectedCategory('All Categories');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Official Business Hotline Callout Banner */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-full">
            Official Hotline & Support
          </span>
          <h3 className="text-xl font-bold text-stone-900">
            Need Bulk Wholesale Orders or Reseller Assistance?
          </h3>
          <p className="text-xs text-stone-600 max-w-xl">
            Our corporate team is available to help with high-volume shipments, price quotes, and drop-shipping logistics.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href={`tel:${phone}`}
            className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all"
          >
            <Phone className="w-4 h-4 text-amber-400" />
            <span>Call {phone}</span>
          </a>
          <a
            href={`mailto:${email}`}
            className="px-4 py-2.5 bg-white hover:bg-stone-100 text-stone-900 font-bold text-xs rounded-xl border border-stone-300 transition-all flex items-center gap-2"
          >
            <Mail className="w-4 h-4 text-stone-700" />
            <span>Email Inquiries</span>
          </a>
        </div>
      </div>
    </div>
  );
};
