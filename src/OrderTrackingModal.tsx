import React, { useState } from 'react';
import {
  X,
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  ArrowRight
} from 'lucide-react';
import { Order, StoreSettings } from '../types';
import { fetchOrders } from '../services/storeService';
import { BUSINESS_INFO } from '../data/initialData';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderNumber?: string;
  storeSettings: StoreSettings;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  initialOrderNumber = '',
  storeSettings,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialOrderNumber);
  const [isLoading, setIsLoading] = useState(false);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  if (!isOpen) return null;

  const phone = storeSettings.contactPhone || BUSINESS_INFO.phone;
  const email = storeSettings.contactEmail || BUSINESS_INFO.email;
  const currencySymbol = storeSettings.currencySymbol || '৳';

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setNotFound(false);
    setSearchedOrder(null);

    try {
      const allOrders = await fetchOrders();
      const match = allOrders.find(
        (o) =>
          o.orderNumber.toLowerCase() === searchTerm.trim().toLowerCase() ||
          o.customerPhone.includes(searchTerm.trim()) ||
          o.id === searchTerm.trim()
      );

      if (match) {
        setSearchedOrder(match);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error(err);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'pending': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      case 'cancelled': return 0;
      default: return 1;
    }
  };

  const currentStep = searchedOrder ? getStepIndex(searchedOrder.orderStatus) : 1;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-200 relative p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Track Your Order</h2>
            <p className="text-xs text-stone-500">
              Enter your Order ID (e.g. NEX-123456) or customer phone number.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              required
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g. NEX-123456 or 017XXXXXXXX"
              className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 uppercase"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50"
          >
            {isLoading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {/* Not Found Alert */}
        {notFound && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Order Not Found</p>
              <p className="mt-0.5 text-stone-600">
                Please check the order number or contact our helpline at <strong>{phone}</strong> for immediate manual tracking.
              </p>
            </div>
          </div>
        )}

        {/* Order Tracking Progress View */}
        {searchedOrder && (
          <div className="space-y-6 pt-2">
            {/* Order Quick Info */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Order:</span>
                <span className="font-mono font-bold text-stone-900">{searchedOrder.orderNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                  searchedOrder.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                  searchedOrder.orderStatus === 'shipped' ? 'bg-sky-100 text-sky-800' :
                  searchedOrder.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {searchedOrder.orderStatus}
                </span>
              </div>
              {searchedOrder.trackingNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Courier Tracking:</span>
                  <span className="font-bold text-amber-700">{searchedOrder.courierName || 'Steadfast/Pathao'} - {searchedOrder.trackingNumber}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Total Amount:</span>
                <span className="font-bold text-stone-900">{currencySymbol}{searchedOrder.totalAmount.toLocaleString()} ({searchedOrder.paymentMethod.toUpperCase()})</span>
              </div>
            </div>

            {/* Stepper Timeline */}
            {searchedOrder.orderStatus !== 'cancelled' ? (
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className={`space-y-1.5 ${currentStep >= 1 ? 'text-amber-600' : 'text-stone-300'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${
                    currentStep >= 1 ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-100 text-stone-400'
                  }`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-[10px] block">Pending</span>
                </div>

                <div className={`space-y-1.5 ${currentStep >= 2 ? 'text-amber-600' : 'text-stone-300'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${
                    currentStep >= 2 ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-100 text-stone-400'
                  }`}>
                    <Package className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-[10px] block">Processing</span>
                </div>

                <div className={`space-y-1.5 ${currentStep >= 3 ? 'text-amber-600' : 'text-stone-300'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${
                    currentStep >= 3 ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-100 text-stone-400'
                  }`}>
                    <Truck className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-[10px] block">Shipped</span>
                </div>

                <div className={`space-y-1.5 ${currentStep >= 4 ? 'text-emerald-600' : 'text-stone-300'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${
                    currentStep >= 4 ? 'bg-emerald-500 text-white font-bold' : 'bg-stone-100 text-stone-400'
                  }`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-[10px] block">Delivered</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs text-center font-semibold">
                This order has been marked as Cancelled.
              </div>
            )}

            {/* Support Information */}
            <div className="p-3 bg-stone-100 rounded-xl text-center text-xs text-stone-600 space-y-1">
              <p>Need updates on delivery time? Call official support:</p>
              <a href={`tel:${phone}`} className="font-bold text-stone-900 block hover:text-amber-700">
                {phone}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
