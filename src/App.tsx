import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { CartProvider, useCart } from './CartContext';
import { Product, StoreSettings, Order } from './types';
import { fetchProducts, fetchStoreSettings } from './services/storeService';
import { DEFAULT_STORE_SETTINGS, SUPER_ADMIN_EMAIL } from './data/initialData';
import {
  ShoppingBag,
  ShieldCheck,
  Briefcase,
  Lock,
  Sparkles,
  ArrowRight,
  Eye,
  Sliders,
  CheckCircle2,
  HelpCircle,
  Phone,
  Layers
} from 'lucide-react';

// Layout & Pages
import { Header } from './Header';
import { Footer } from './Footer';
import { ProductCatalog } from './ProductCatalog';
import { ResellerPortal } from './ResellerPortal';
import { CustomerSupport } from './CustomerSupport';
import { ResellerSupport } from './ResellerSupport';
import { ContactPage } from './ContactPage';
import { AdminDashboard } from './admin/AdminDashboard';
import { AdminLoginPage } from './admin/AdminLoginPage';

// Modals
import { ProductDetailModal } from './ProductDetailModal';
import { CartDrawer } from './CartDrawer';
import { CheckoutModal } from './CheckoutModal';
import { OrderSuccessModal } from './OrderSuccessModal';
import { OrderTrackingModal } from './OrderTrackingModal';
import { AuthModal } from './AuthModal';

function MainAppContent() {
  const { currentUser, isAdmin, isReseller } = useAuth();
  const { isCartOpen, setIsCartOpen } = useCart();

  // State: Default to 'admin-login' on preview as explicitly requested
  const [activeTab, setActiveTab] = useState<string>('admin-login');
  const [products, setProducts] = useState<Product[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [authInitialRole, setAuthInitialRole] = useState<'customer' | 'reseller'>('customer');
  const [isTrackingOpen, setIsTrackingOpen] = useState<boolean>(false);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);

  // Load initial data
  const loadData = async () => {
    try {
      const [prods, settings] = await Promise.all([
        fetchProducts(),
        fetchStoreSettings(),
      ]);
      setProducts(prods);
      setStoreSettings(settings);
    } catch (e) {
      console.error('Error loading initial store data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Check URL path or hash for routing
    if (window.location.hash === '#admin' || window.location.pathname.endsWith('/admin')) {
      setActiveTab('admin');
    } else if (window.location.hash === '#login' || window.location.hash === '#admin-login') {
      setActiveTab('admin-login');
    } else if (window.location.hash === '#reseller') {
      setActiveTab('reseller');
    }

    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setActiveTab('admin');
      } else if (window.location.hash === '#login' || window.location.hash === '#admin-login') {
        setActiveTab('admin-login');
      } else if (window.location.hash === '#reseller') {
        setActiveTab('reseller');
      } else if (window.location.hash === '#shop' || window.location.hash === '') {
        setActiveTab('shop');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register' = 'login', role: 'customer' | 'reseller' = 'customer') => {
    setAuthInitialMode(mode);
    setAuthInitialRole(role);
    setIsAuthOpen(true);
  };

  const handleOrderComplete = (order: Order) => {
    setLatestOrder(order);
    setIsCheckoutOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Switch View Quick Navigation Bar */}
      <div className="sticky top-0 z-50 bg-slate-950 text-white border-b border-slate-800 shadow-md py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-lg text-xs font-bold tracking-wide">
              <Layers className="w-3.5 h-3.5" />
              <span>Switch View:</span>
            </span>
            <span className="hidden md:inline text-xs text-slate-400">
              Easily toggle between views to test all workflows:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {/* View 1: Storefront */}
            <button
              onClick={() => setActiveTab('shop')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'shop'
                  ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Storefront</span>
            </button>

            {/* View 2: Admin Login / Setup */}
            <button
              onClick={() => setActiveTab('admin-login')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'admin-login'
                  ? 'bg-amber-500 text-slate-950 shadow-sm ring-1 ring-amber-300 font-bold'
                  : 'bg-slate-900 text-amber-300 hover:bg-slate-800 hover:text-amber-200 border border-slate-800'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Login Page</span>
            </button>

            {/* View 3: Admin Dashboard */}
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-red-600 text-white shadow-sm ring-1 ring-red-400'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Dashboard {isAdmin ? '(Unlocked)' : '(Protected)'}</span>
            </button>

            {/* View 4: Reseller Hub */}
            <button
              onClick={() => setActiveTab('reseller')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'reseller'
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Reseller Hub</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Body Routing */}
      {activeTab === 'admin-login' && (
        <div className="flex-1 bg-[#090d16] py-4">
          <AdminLoginPage
            onSuccess={() => {
              setActiveTab('admin');
            }}
            onExit={() => setActiveTab('shop')}
          />
        </div>
      )}

      {activeTab === 'admin' && (
        <div className="flex-1">
          <AdminDashboard
            onOpenAuth={handleOpenAuth}
            onExitAdmin={() => setActiveTab('shop')}
          />
        </div>
      )}

      {activeTab !== 'admin' && activeTab !== 'admin-login' && (
        <>
          {/* Header */}
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenAuth={handleOpenAuth}
            onOpenTracking={() => setIsTrackingOpen(true)}
            storeSettings={storeSettings}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === 'shop' && (
              <ProductCatalog
                products={products}
                storeSettings={storeSettings}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSelectProduct={(p) => setSelectedProduct(p)}
                onOpenAuth={handleOpenAuth}
              />
            )}

            {activeTab === 'reseller' && (
              <ResellerPortal
                products={products}
                storeSettings={storeSettings}
                onOpenAuth={handleOpenAuth}
                onSelectProduct={(p) => setSelectedProduct(p)}
              />
            )}

            {activeTab === 'customer-support' && (
              <CustomerSupport
                storeSettings={storeSettings}
                onOpenTracking={() => setIsTrackingOpen(true)}
              />
            )}

            {activeTab === 'reseller-support' && (
              <ResellerSupport
                storeSettings={storeSettings}
                onOpenAuth={handleOpenAuth}
              />
            )}

            {activeTab === 'contact' && (
              <ContactPage storeSettings={storeSettings} />
            )}
          </main>

          {/* Footer */}
          <Footer
            storeSettings={storeSettings}
            setActiveTab={setActiveTab}
            onOpenTracking={() => setIsTrackingOpen(true)}
            onOpenAuth={handleOpenAuth}
          />
        </>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          storeSettings={storeSettings}
          onClose={() => setSelectedProduct(null)}
          onBuyNow={() => {
            setSelectedProduct(null);
            setIsCheckoutOpen(true);
          }}
          onOpenAuth={handleOpenAuth}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        storeSettings={storeSettings}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        onOpenAuth={handleOpenAuth}
      />

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          storeSettings={storeSettings}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderSuccess={handleOrderComplete}
        />
      )}

      {/* Order Success Confirmation Modal */}
      {latestOrder && (
        <OrderSuccessModal
          order={latestOrder}
          storeSettings={storeSettings}
          onClose={() => setLatestOrder(null)}
          onTrackOrder={() => {
            setLatestOrder(null);
            setIsTrackingOpen(true);
          }}
        />
      )}

      {/* Order Tracking Modal */}
      {isTrackingOpen && (
        <OrderTrackingModal
          storeSettings={storeSettings}
          onClose={() => setIsTrackingOpen(false)}
        />
      )}

      {/* Authentication Modal (Login / Register / Forgot Password) */}
      {isAuthOpen && (
        <AuthModal
          initialMode={authInitialMode}
          initialRole={authInitialRole}
          onClose={() => setIsAuthOpen(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainAppContent />
      </CartProvider>
    </AuthProvider>
  );
}
