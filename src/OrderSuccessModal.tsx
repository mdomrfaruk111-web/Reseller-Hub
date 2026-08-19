import React from 'react';
import {
  CheckCircle2,
  Phone,
  Mail,
  Printer,
  PackageCheck,
  Truck,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Order, StoreSettings } from '../types';
import { BUSINESS_INFO } from '../data/initialData';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  storeSettings: StoreSettings;
  onTrackOrder: (orderNumber: string) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  storeSettings,
  onTrackOrder,
}) => {
  if (!order) return null;

  const phone = storeSettings.contactPhone || BUSINESS_INFO.phone;
  const email = storeSettings.contactEmail || BUSINESS_INFO.email;
  const currencySymbol = storeSettings.currencySymbol || '৳';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 p-6 sm:p-8 space-y-6 text-center">
        {/* Success Icon Header */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-stone-900">Order Confirmed!</h2>
          <p className="text-xs text-stone-500">
            Thank you for your order. We are preparing it for delivery.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-left space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
            <span className="text-stone-500">Order Number:</span>
            <span className="font-mono font-bold text-stone-900 bg-stone-200/70 px-2 py-0.5 rounded">
              {order.orderNumber}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-500">Recipient:</span>
            <span className="font-semibold text-stone-900">{order.customerName} ({order.customerPhone})</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-500">Delivery Address:</span>
            <span className="font-medium text-stone-900 text-right max-w-[200px] truncate">{order.shippingAddress}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-500">Payment:</span>
            <span className="font-bold text-amber-700 uppercase">{order.paymentMethod} ({order.paymentStatus})</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-stone-200 text-sm font-black text-stone-900">
            <span>Total Payable:</span>
            <span className="text-amber-700">{currencySymbol}{order.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Support Information Box */}
        <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-left space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>Official Order & Support Help</span>
          </div>
          <p className="text-stone-600 text-[11px]">
            For changes, cancellation or instant delivery updates, reach our official desk:
          </p>
          <div className="flex flex-wrap items-center justify-between pt-1 gap-2 text-[11px] font-semibold text-stone-800">
            <a href={`tel:${phone}`} className="flex items-center gap-1 hover:text-amber-700">
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              <span>{phone}</span>
            </a>
            <a href={`mailto:${email}`} className="flex items-center gap-1 hover:text-amber-700">
              <Mail className="w-3.5 h-3.5 text-amber-600" />
              <span>{email}</span>
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => {
              onClose();
              onTrackOrder(order.orderNumber);
            }}
            className="py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
          >
            <PackageCheck className="w-4 h-4" />
            <span>Track Order</span>
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs transition-all shadow-xs"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};
