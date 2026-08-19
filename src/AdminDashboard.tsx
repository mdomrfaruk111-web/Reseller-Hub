import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Briefcase,
  Percent,
  Wallet,
  Settings,
  Users,
  BarChart3,
  FileText,
  ShieldCheck,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  LogOut,
  RefreshCw,
  Bell,
  Network,
  MessageSquare,
  CreditCard,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  Product,
  Order,
  Withdrawal,
  StoreSettings,
  UserProfile,
  AuditLog,
  Category,
  SupportTicket,
  StoreNotification,
} from '../../types';
import {
  fetchProducts,
  fetchOrders,
  fetchWithdrawals,
  fetchStoreSettings,
  fetchUsers,
  fetchAuditLogs,
  fetchCategories,
  fetchSupportTickets,
  fetchNotifications,
} from '../../services/storeService';
import { SUPER_ADMIN_EMAIL, BUSINESS_INFO } from '../../data/initialData';

// Sub-components
import { AdminLoginPage } from './AdminLoginPage';
import { ProductManagement } from './ProductManagement';
import { CategoriesManagement } from './CategoriesManagement';
import { OrderManagement } from './OrderManagement';
import { CustomerManagement } from './CustomerManagement';
import { ResellerManagement } from './ResellerManagement';
import { FiveTierReferralSystem } from './FiveTierReferralSystem';
import { WithdrawalManagement } from './WithdrawalManagement';
import { WalletsManagement } from './WalletsManagement';
import { CommissionSettings } from './CommissionSettings';
import { SupportTicketsManagement } from './SupportTicketsManagement';
import { NotificationsManagement } from './NotificationsManagement';
import { WebsiteSettings } from './WebsiteSettings';
import { UserManagement } from './UserManagement';
import { ReportsAnalytics } from './ReportsAnalytics';
import { AuditLogsView } from './AuditLogsView';

interface AdminDashboardProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onExitAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenAuth, onExitAdmin }) => {
  const { currentUser, userProfile, isAdmin, sendResetEmail, logOut } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('reports');
  const [isLoading, setIsLoading] = useState(true);

  // Loaded Data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    storeName: 'NexShop',
    contactPhone: '01331993380',
    contactEmail: 'mdomrfaruk111@gmail.com',
    deliveryFeeInside: 70,
    deliveryFeeOutside: 130,
  });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [notifications, setNotifications] = useState<StoreNotification[]>([]);

  // Password reset message in admin
  const [passwordResetNotice, setPasswordResetNotice] = useState<string | null>(null);

  const loadAllAdminData = async () => {
    setIsLoading(true);
    try {
      const [pData, cData, oData, wData, sData, uData, lData, tData, nData] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchOrders(),
        fetchWithdrawals(),
        fetchStoreSettings(),
        fetchUsers(),
        fetchAuditLogs(),
        fetchSupportTickets(),
        fetchNotifications(),
      ]);

      setProducts(pData);
      setCategories(cData);
      setOrders(oData);
      setWithdrawals(wData);
      setStoreSettings(sData);
      setUsers(uData);
      setAuditLogs(lData);
      setTickets(tData);
      setNotifications(nData);
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllAdminData();
    } else {
      setIsLoading(false);
    }
  }, [isAdmin]);

  const handleAdminPasswordReset = async () => {
    if (!currentUser?.email) return;
    try {
      await sendResetEmail(currentUser.email);
      setPasswordResetNotice(`Secure password reset link has been dispatched to ${currentUser.email}. Follow the instructions in the email to update your administrator credentials.`);
    } catch (e: any) {
      setPasswordResetNotice(`Failed: ${e.message}`);
    }
  };

  // If user is not authenticated as Admin, render the secure Admin Login Page
  if (!isAdmin) {
    return (
      <AdminLoginPage
        onSuccess={() => {
          loadAllAdminData();
        }}
        onExit={onExitAdmin}
      />
    );
  }

  const pendingWithdrawalsCount = withdrawals.filter((w) => w.status === 'pending').length;
  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'pending').length;
  const openTicketsCount = tickets.filter((t) => t.status === 'open').length;

  const navItems = [
    { id: 'reports', label: 'Dashboard Overview', icon: BarChart3 },
    { id: 'products', label: 'Product Management', icon: Package, badge: products.length },
    { id: 'categories', label: 'Category Directory', icon: FolderTree, badge: categories.length },
    { id: 'orders', label: 'Order Processing', icon: ShoppingBag, badge: pendingOrdersCount ? `${pendingOrdersCount} new` : undefined, badgeColor: 'bg-emerald-500 text-white' },
    { id: 'customers', label: 'Customer Accounts', icon: UserCheck, badge: users.filter((u) => u.role === 'customer').length },
    { id: 'resellers', label: 'Reseller Partners', icon: Briefcase, badge: users.filter((u) => u.role === 'reseller').length },
    { id: 'referrals', label: '5-Generation Matrix', icon: Network },
    { id: 'withdrawals', label: 'Payout Requests', icon: Wallet, badge: pendingWithdrawalsCount ? `${pendingWithdrawalsCount} pending` : undefined, badgeColor: 'bg-amber-500 text-slate-950' },
    { id: 'wallets', label: 'Reseller Wallets', icon: CreditCard },
    { id: 'commissions', label: 'Commission Settings', icon: Percent },
    { id: 'tickets', label: 'Support Center', icon: MessageSquare, badge: openTicketsCount ? `${openTicketsCount} open` : undefined, badgeColor: 'bg-red-500 text-white' },
    { id: 'notifications', label: 'Broadcast Alerts', icon: Bell, badge: notifications.length },
    { id: 'website', label: 'Website Settings', icon: Settings },
    { id: 'users', label: 'User Role Admin', icon: Users, badge: users.length },
    { id: 'audit', label: 'Audit Trail & Logs', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 flex flex-col md:flex-row">
      {/* Sleek Interface Sidebar */}
      <aside className="w-full md:w-64 bg-[#0f172a] text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div className="p-5 space-y-5">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
                B
              </div>
              <div>
                <span className="text-base font-bold text-white tracking-tight">BizManager Pro</span>
                <span className="text-[10px] text-blue-400 block font-semibold">Super Administrator</span>
              </div>
            </div>
            <button
              onClick={loadAllAdminData}
              title="Refresh Data"
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-0.5 text-xs max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border-l-2 border-blue-500 font-semibold'
                      : 'hover:bg-slate-800/80 text-slate-300 opacity-80 hover:opacity-100 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate mr-1">
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                        item.badgeColor || (isActive ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card in Sidebar Bottom */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-900/40">
          <div className="flex items-center gap-2.5 bg-slate-800/60 p-2.5 rounded-xl border border-slate-750">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="overflow-hidden min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{SUPER_ADMIN_EMAIL}</p>
              <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Firebase Super Admin</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={handleAdminPasswordReset}
              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[10px] font-medium flex items-center justify-center gap-1 transition-colors"
              title="Send Password Reset Email"
            >
              <KeyRound className="w-3 h-3 text-blue-400" />
              <span>Password</span>
            </button>
            <button
              onClick={onExitAdmin}
              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[10px] font-medium flex items-center justify-center gap-1 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span>Storefront</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-slate-800">
              {navItems.find((n) => n.id === activeTab)?.label || 'Admin Dashboard Overview'}
            </h1>
            <span className="hidden sm:inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold uppercase tracking-wider border border-blue-100">
              Enterprise Hub
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('tickets')}
              className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              title="Support Tickets"
            >
              <MessageSquare className="w-4 h-4" />
              {openTicketsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              title="Pending Orders"
            >
              <ShoppingBag className="w-4 h-4" />
              {pendingOrdersCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>
              )}
            </button>
            <button
              onClick={logOut}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Scrollable Body */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-6">
          {/* Password Reset Feedback Alert */}
          {passwordResetNotice && (
            <div className="p-4 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs flex items-start justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{passwordResetNotice}</span>
              </div>
              <button
                onClick={() => setPasswordResetNotice(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Dynamic Admin Sub-views */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              {/* Quick Official Business & Security Badges on Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card 1: Official Business Contact */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-slate-900">Official Business Contact</h3>
                      <button onClick={() => setActiveTab('website')} className="text-blue-600 text-xs hover:underline font-semibold">
                        Edit Profile
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <span className="text-base">📞</span>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Contact Phone</p>
                          <p className="text-xs font-semibold text-slate-900">{storeSettings.contactPhone || BUSINESS_INFO.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <span className="text-base">📧</span>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Official Email</p>
                          <p className="text-xs font-semibold text-slate-900 break-all">{storeSettings.contactEmail || BUSINESS_INFO.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border border-slate-100 rounded-lg mt-4 bg-slate-50/50">
                    <p className="text-[10px] text-slate-500 italic mb-2">Synced automatically across customer footer, receipts, and reseller support.</p>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] rounded font-bold">Public Verified</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] rounded font-bold">Hotline Active</span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Administrator Security Status */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">Administrator Security Status</h3>
                    <div className="p-3.5 bg-slate-950 text-white rounded-xl space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Authorized Master Admin</span>
                        <span className="text-[9px] px-2 py-0.5 bg-blue-600 rounded font-bold uppercase">Super Admin</span>
                      </div>
                      <p className="text-xs font-mono font-bold text-blue-400 truncate">{SUPER_ADMIN_EMAIL}</p>
                    </div>
                  </div>
                  <div className="space-y-2 pt-3">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Firebase Authentication Role Enforced</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Zero-Trust Server-Side Firestore Rules Deployed</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Passwords securely managed via Firebase Auth reset links</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reports and Analytics charts */}
              <ReportsAnalytics
                orders={orders}
                products={products}
                users={users}
                withdrawals={withdrawals}
                storeSettings={storeSettings}
              />
            </div>
          )}

          {activeTab === 'products' && (
            <ProductManagement
              products={products}
              storeSettings={storeSettings}
              onRefreshProducts={loadAllAdminData}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesManagement
              categories={categories}
              products={products}
              onRefresh={loadAllAdminData}
            />
          )}

          {activeTab === 'orders' && (
            <OrderManagement
              orders={orders}
              storeSettings={storeSettings}
              onRefreshOrders={loadAllAdminData}
            />
          )}

          {activeTab === 'customers' && (
            <CustomerManagement
              users={users}
              orders={orders}
              storeSettings={storeSettings}
              onRefresh={loadAllAdminData}
            />
          )}

          {activeTab === 'resellers' && (
            <ResellerManagement
              users={users}
              storeSettings={storeSettings}
              onRefreshUsers={loadAllAdminData}
            />
          )}

          {activeTab === 'referrals' && (
            <FiveTierReferralSystem
              users={users}
              storeSettings={storeSettings}
            />
          )}

          {activeTab === 'withdrawals' && (
            <WithdrawalManagement
              withdrawals={withdrawals}
              storeSettings={storeSettings}
              onRefreshWithdrawals={loadAllAdminData}
            />
          )}

          {activeTab === 'wallets' && (
            <WalletsManagement
              users={users}
              withdrawals={withdrawals}
              storeSettings={storeSettings}
              onRefresh={loadAllAdminData}
            />
          )}

          {activeTab === 'commissions' && (
            <CommissionSettings
              storeSettings={storeSettings}
              onRefreshSettings={loadAllAdminData}
            />
          )}

          {activeTab === 'tickets' && (
            <SupportTicketsManagement
              tickets={tickets}
              onRefresh={loadAllAdminData}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsManagement
              notifications={notifications}
              onRefresh={loadAllAdminData}
            />
          )}

          {activeTab === 'website' && (
            <WebsiteSettings
              storeSettings={storeSettings}
              onRefreshSettings={loadAllAdminData}
            />
          )}

          {activeTab === 'users' && (
            <UserManagement
              users={users}
              onRefreshUsers={loadAllAdminData}
            />
          )}

          {activeTab === 'audit' && (
            <AuditLogsView
              logs={auditLogs}
              onRefreshLogs={loadAllAdminData}
            />
          )}
        </div>

        {/* Sleek Footer */}
        <footer className="h-12 bg-white border-t border-slate-200 px-6 sm:px-8 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div>NexShop • Business Contact: {storeSettings.contactPhone || BUSINESS_INFO.phone}</div>
          <div className="flex gap-4">
            <span>Email: {storeSettings.contactEmail || BUSINESS_INFO.email}</span>
            <span className="font-mono text-slate-400">v2.4.0-SECURE</span>
          </div>
        </footer>
      </main>
    </div>
  );
};
