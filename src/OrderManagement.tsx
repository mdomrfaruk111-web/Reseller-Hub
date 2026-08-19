import React, { useState } from 'react';
import {
  Package,
  Search,
  Filter,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Edit,
  Phone,
  Mail,
  User,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { Order, OrderStatus, StoreSettings } from '../../types';
import { updateOrderStatus, fetchOrders } from '../../services/storeService';
import { useAuth } from '../../context/AuthContext';

interface OrderManagementProps {
  orders: Order[];
  storeSettings: StoreSettings;
  onRefreshOrders: () => void;
}

export const OrderManagement: React.FC<OrderManagementProps> = ({
  orders,
  storeSettings,
  onRefreshOrders,
}) => {
  const { currentUser } = useAuth();
  const currencySymbol = storeSettings.currencySymbol || '৳';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Status updating state
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  const [courierName, setCourierName] = useState('Steadfast');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState<string | null>(null);

  const openStatusModal = (o: Order) => {
    setSelectedOrder(o);
    setNewStatus(o.orderStatus);
    setCourierName(o.courierName || 'Steadfast');
    setTrackingNumber(o.trackingNumber || '');
    setUpdateFeedback(null);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsUpdating(true);
    try {
      await updateOrderStatus(
        selectedOrder.id,
        newStatus,
        trackingNumber,
        courierName,
        currentUser?.email || 'admin'
      );
      setUpdateFeedback('Order status successfully updated.');
      onRefreshOrders();
      setTimeout(() => {
        setSelectedOrder(null);
      }, 1000);
    } catch (err: any) {
      setUpdateFeedback(`Error: ${err.message || 'Failed to update'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.orderStatus === statusFilter;
    const matchesSearch =
      !searchTerm ||
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerPhone.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Order Fulfillment & Management</h2>
          <p className="text-xs text-stone-500">
            Process orders, assign courier tracking IDs, and manage customer deliveries.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order #, Customer Name, Phone..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Reseller Margin</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-stone-50/60">
                    <td className="py-3 px-4">
                      <p className="font-mono font-bold text-stone-900">{o.orderNumber}</p>
                      <p className="text-[10px] text-stone-400">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-stone-900">{o.customerName}</p>
                      <p className="text-[11px] text-stone-600">{o.customerPhone}</p>
                      <p className="text-[10px] text-stone-400 line-clamp-1">{o.shippingAddress}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-stone-700">
                        {o.items?.length || 0} item(s)
                      </span>
                    </td>
                    <td className="py-3 px-4 font-black text-stone-900">
                      {currencySymbol}{o.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold uppercase text-stone-700 block">
                        {o.paymentMethod}
                      </span>
                      <span className={`text-[10px] uppercase font-bold ${
                        o.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        o.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                        o.orderStatus === 'shipped' ? 'bg-sky-100 text-sky-800' :
                        o.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {o.orderStatus}
                      </span>
                      {o.trackingNumber && (
                        <p className="text-[10px] font-mono text-stone-400 mt-0.5">
                          {o.courierName}: {o.trackingNumber}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {o.resellerId ? (
                        <div>
                          <span className="font-bold text-emerald-700">+{currencySymbol}{o.resellerCommission?.toLocaleString() || 0}</span>
                          <p className="text-[10px] text-stone-400">Reseller Order</p>
                        </div>
                      ) : (
                        <span className="text-stone-400 text-[11px]">Direct Retail</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openStatusModal(o)}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-lg transition-all"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage / Update Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900">Manage Order: {selectedOrder.orderNumber}</h3>
                <p className="text-xs text-stone-500">Recipient: {selectedOrder.customerName} ({selectedOrder.customerPhone})</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-full text-stone-400 hover:bg-stone-100"
              >
                ✕
              </button>
            </div>

            {updateFeedback && (
              <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs">
                {updateFeedback}
              </div>
            )}

            {/* Items Summary in Modal */}
            <div className="p-3 bg-stone-50 rounded-xl space-y-2 border border-stone-200 text-xs">
              <span className="font-bold text-stone-800">Order Items:</span>
              <ul className="divide-y divide-stone-200/60">
                {selectedOrder.items?.map((item, i) => (
                  <li key={i} className="py-1.5 flex justify-between">
                    <span className="text-stone-700">{item.productName} (x{item.quantity})</span>
                    <span className="font-bold text-stone-900">{currencySymbol}{(item.price * item.quantity).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-2 border-t border-stone-200 flex justify-between font-black text-stone-900">
                <span>Total Amount:</span>
                <span>{currencySymbol}{selectedOrder.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Update Status *</label>
                <select
                  value={newStatus}
                  onChange={(e: any) => setNewStatus(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold uppercase"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered (Credits Reseller Wallet)</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Courier Service</label>
                  <select
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    <option value="Steadfast">Steadfast Courier</option>
                    <option value="Pathao">Pathao Courier</option>
                    <option value="RedX">RedX Delivery</option>
                    <option value="Paperfly">Paperfly</option>
                    <option value="Sundarban">Sundarban Courier</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tracking ID</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. STF-892182"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono uppercase"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
