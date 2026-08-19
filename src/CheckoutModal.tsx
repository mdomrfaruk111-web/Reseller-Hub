import React, { useState } from 'react';
import {
  X,
  Phone,
  MapPin,
  CreditCard,
  Truck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { StoreSettings, Order, PaymentMethod } from '../types';
import { createOrder } from '../services/storeService';
import { BUSINESS_INFO } from '../data/initialData';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeSettings: StoreSettings;
  onOrderComplete: (order: Order) => void;
  resellerCustomerOrder?: boolean;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  storeSettings,
  onOrderComplete,
  resellerCustomerOrder = false,
}) => {
  const { cart, subtotal, shippingFee, discount, totalAmount, clearCart, deliveryLocation } = useCart();
  const { currentUser, userProfile, isReseller } = useAuth();

  const [name, setName] = useState(userProfile?.displayName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [bkashTxId, setBkashTxId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || cart.length === 0) return null;

  const phoneHotline = storeSettings.contactPhone || BUSINESS_INFO.phone;
  const currencySymbol = storeSettings.currencySymbol || '৳';

  // Calculate reseller commission if reseller is ordering
  const totalResellerCost = cart.reduce((acc, item) => acc + (item.resellerPrice || item.price) * item.quantity, 0);
  const calculatedResellerCommission = (isReseller || resellerCustomerOrder)
    ? Math.max(0, subtotal - totalResellerCost)
    : 0;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      setErrorMessage('Please fill in Name, Phone, and Delivery Address.');
      return;
    }

    if (phone.length < 11) {
      setErrorMessage('Please provide a valid 11-digit Bangladeshi mobile number (e.g. 017XXXXXXXX).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const orderNumber = `NEX-${Math.floor(100000 + Math.random() * 900000)}`;

      const orderData: Omit<Order, 'id'> = {
        orderNumber,
        customerId: currentUser?.uid || '',
        customerName: name,
        customerEmail: email || `${phone}@guest.nexshop.com`,
        customerPhone: phone,
        shippingAddress: `${address}, ${district}`,
        items: cart.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          productImage: i.productImage,
          price: i.price,
          resellerPrice: i.resellerPrice,
          quantity: i.quantity,
        })),
        subtotal,
        shippingFee,
        totalAmount,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'unpaid' : 'paid',
        orderStatus: 'pending',
        resellerId: (isReseller || resellerCustomerOrder) ? currentUser?.uid : undefined,
        resellerCommission: calculatedResellerCommission,
        notes: bkashTxId ? `TrxID: ${bkashTxId}. ${notes}` : notes,
        createdAt: new Date().toISOString(),
      };

      const docId = await createOrder(orderData);
      const completedOrder: Order = { id: docId, ...orderData };

      clearCart();
      onClose();
      onOrderComplete(completedOrder);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900">
              {isReseller ? 'Place Reseller / Customer Order' : 'Checkout & Confirm Order'}
            </h2>
            <p className="text-xs text-stone-500">
              Fast delivery with full cash on delivery security.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-200 text-stone-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Form */}
        <form onSubmit={handleSubmitOrder} className="overflow-y-auto p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Reseller Margin Alert */}
          {(isReseller || resellerCustomerOrder) && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-700" />
                <span className="font-bold text-amber-900">Reseller Order Mode:</span>
              </div>
              <span className="bg-amber-500 text-stone-950 font-extrabold px-2.5 py-0.5 rounded-full">
                Your Commission: +{currencySymbol}{calculatedResellerCommission.toLocaleString()}
              </span>
            </div>
          )}

          {/* Customer Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              {isReseller ? 'Customer Delivery Information' : 'Shipping Information'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mahfuz Rahman"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Mobile Number (For Delivery Confirmation) *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  District / Area
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Dhaka / Chittagong / Sylhet"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Full Street Address / House / Road *
              </label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House #, Road #, Sector/Area, Landmark..."
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs resize-none"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Select Payment Method</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label
                className={`p-3 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-amber-500 bg-amber-50/60 font-bold text-stone-950'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs">Cash on Delivery</span>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="text-amber-600"
                  />
                </div>
                <span className="text-[11px] text-stone-500 font-normal mt-1">Pay when package arrives</span>
              </label>

              <label
                className={`p-3 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all ${
                  paymentMethod === 'bkash'
                    ? 'border-pink-500 bg-pink-50 font-bold text-pink-950'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-pink-600">bKash Payment</span>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'bkash'}
                    onChange={() => setPaymentMethod('bkash')}
                    className="text-pink-600"
                  />
                </div>
                <span className="text-[11px] text-stone-500 font-normal mt-1">Direct Mobile Banking</span>
              </label>

              <label
                className={`p-3 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all ${
                  paymentMethod === 'nagad'
                    ? 'border-orange-500 bg-orange-50 font-bold text-orange-950'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-600">Nagad Payment</span>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'nagad'}
                    onChange={() => setPaymentMethod('nagad')}
                    className="text-orange-600"
                  />
                </div>
                <span className="text-[11px] text-stone-500 font-normal mt-1">Fast Mobile Payment</span>
              </label>
            </div>

            {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2 text-xs">
                <p className="text-stone-700">
                  Send <strong>{currencySymbol}{totalAmount.toLocaleString()}</strong> to official Merchant/Personal {paymentMethod.toUpperCase()}: <strong className="text-amber-700">{phoneHotline}</strong>
                </p>
                <input
                  type="text"
                  placeholder="Enter Transaction ID (TrxID)"
                  value={bkashTxId}
                  onChange={(e) => setBkashTxId(e.target.value)}
                  className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs"
                />
              </div>
            )}
          </div>

          {/* Order Summary & Pricing Breakdown */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Items Total ({cart.length} unique items)</span>
              <span className="font-semibold text-stone-900">{currencySymbol}{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Delivery Fee ({deliveryLocation === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
              <span>{shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `${currencySymbol}${shippingFee}`}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount</span>
                <span>-{currencySymbol}{discount}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-stone-900 pt-2 border-t border-stone-200">
              <span>Total Payable</span>
              <span className="text-base text-amber-700">{currencySymbol}{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{isSubmitting ? 'Placing Order in System...' : `Confirm Order (${currencySymbol}${totalAmount.toLocaleString()})`}</span>
          </button>

          {/* Support Helpline Note */}
          <div className="text-center text-[11px] text-stone-500">
            For telephone booking or support, call: <strong className="text-stone-800">{phoneHotline}</strong>
          </div>
        </form>
      </div>
    </div>
  );
};
