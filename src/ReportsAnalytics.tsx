import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Award,
  Calendar,
  CheckCircle2,
  PieChart,
  ArrowUpRight
} from 'lucide-react';
import { Order, Product, StoreSettings, UserProfile, Withdrawal } from '../../types';

interface ReportsAnalyticsProps {
  orders: Order[];
  products: Product[];
  users: UserProfile[];
  withdrawals: Withdrawal[];
  storeSettings: StoreSettings;
}

export const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({
  orders,
  products,
  users,
  withdrawals,
  storeSettings,
}) => {
  const currencySymbol = storeSettings.currencySymbol || '৳';

  const totalGrossRevenue = orders
    .filter((o) => o.orderStatus !== 'cancelled')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const totalDeliveredRevenue = orders
    .filter((o) => o.orderStatus === 'delivered')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const totalResellerCommissions = orders
    .filter((o) => o.orderStatus !== 'cancelled')
    .reduce((acc, o) => acc + (o.resellerCommission || 0), 0);

  const totalDisbursedPayouts = withdrawals
    .filter((w) => w.status === 'completed')
    .reduce((acc, w) => acc + w.amount, 0);

  const successfulOrdersCount = orders.filter((o) => o.orderStatus === 'delivered').length;
  const averageOrderValue = orders.length > 0 ? Math.round(totalGrossRevenue / orders.length) : 0;
  const fulfillmentRate = orders.length > 0 ? Math.round((successfulOrdersCount / orders.length) * 100) : 0;

  // Category sales breakdown
  const categoryBreakdown: Record<string, number> = {};
  orders.forEach((o) => {
    o.items?.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const cat = prod?.category || 'General';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + (item.price * item.quantity);
    });
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Financial Reports & Store Analytics</h2>
        <p className="text-xs text-stone-500">
          Executive performance summary, revenue tracking, and reseller payout metrics.
        </p>
      </div>

      {/* Primary Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase">Gross Sales Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-stone-900">
            {currencySymbol}{totalGrossRevenue.toLocaleString()}
          </h3>
          <p className="text-[11px] text-stone-400">All non-cancelled customer orders</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase">Delivered Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-amber-800">
            {currencySymbol}{totalDeliveredRevenue.toLocaleString()}
          </h3>
          <p className="text-[11px] text-stone-400">Completed cash settlements</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase">Reseller Margin Distributed</span>
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-sky-700">
            {currencySymbol}{totalResellerCommissions.toLocaleString()}
          </h3>
          <p className="text-[11px] text-stone-400">{currencySymbol}{totalDisbursedPayouts.toLocaleString()} already cashed out</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase">Average Order Value</span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-stone-900">
            {currencySymbol}{averageOrderValue.toLocaleString()}
          </h3>
          <p className="text-[11px] text-stone-400">Fulfillment rate: {fulfillmentRate}%</p>
        </div>
      </div>

      {/* Category Performance & Top Products Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Category Sales */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-amber-600" />
            <span>Sales by Product Category</span>
          </h3>

          <div className="space-y-3">
            {Object.keys(categoryBreakdown).length === 0 ? (
              <p className="text-xs text-stone-400 py-4">No order items categorized yet.</p>
            ) : (
              Object.entries(categoryBreakdown).map(([cat, val]) => {
                const percent = totalGrossRevenue > 0 ? Math.round((val / totalGrossRevenue) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-semibold text-stone-800">
                      <span>{cat}</span>
                      <span>{currencySymbol}{val.toLocaleString()} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Reseller Network Health */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-600" />
            <span>Reseller Partner Network Summary</span>
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
              <span className="text-stone-500 font-semibold">Registered Resellers</span>
              <p className="text-2xl font-black text-stone-900">
                {users.filter((u) => u.role === 'reseller').length}
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
              <span className="text-stone-500 font-semibold">Total Customer Base</span>
              <p className="text-2xl font-black text-stone-900">
                {users.filter((u) => u.role === 'customer').length}
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
              <span className="text-stone-500 font-semibold">Completed Cashouts</span>
              <p className="text-2xl font-black text-emerald-700">
                {withdrawals.filter((w) => w.status === 'completed').length}
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
              <span className="text-stone-500 font-semibold">Active Catalog Items</span>
              <p className="text-2xl font-black text-stone-900">
                {products.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
