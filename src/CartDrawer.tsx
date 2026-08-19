import React from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Truck,
  Tag,
  ShieldCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { StoreSettings } from '../types';
import { DEFAULT_STORE_SETTINGS } from '../data/initialData';

interface CartDrawerProps {
  onOpenCheckout: () => void;
  storeSettings: StoreSettings;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenCheckout, storeSettings }) => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal,
    deliveryLocation,
    setDeliveryLocation,
    shippingFee,
    discount,
    totalAmount,
    applyCoupon,
    couponCode,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const [inputCoupon, setInputCoupon] = React.useState('');
  const [couponError, setCouponError] = React.useState('');
  const [couponSuccess, setCouponSuccess] = React.useState(false);

  if (!isCartOpen) return null;

  const currencySymbol = storeSettings.currencySymbol || '৳';

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess(false);
    const success = applyCoupon(inputCoupon);
    if (success) {
      setCouponSuccess(true);
    } else {
      setCouponError('Invalid code or minimum order amount not met (Try "NEX100" for ৳1000+ orders)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
      <div
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Top Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-stone-900">Your Shopping Cart</h2>
              <span className="bg-stone-100 text-stone-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-800">Your cart is empty</h3>
                  <p className="text-xs text-stone-500 mt-1">Explore our product catalog and add items!</p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-3.5 p-3 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-all"
                  >
                    <img
                      src={item.productImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
                      alt={item.productName}
                      className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0 bg-white"
                    />

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-stone-900 truncate">{item.productName}</h4>
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="text-stone-400 hover:text-red-600 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs font-bold text-amber-700 mt-0.5">
                          {currencySymbol}{item.price.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="px-2 py-1 text-xs text-stone-600 hover:bg-stone-100 font-bold"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 py-0.5 text-xs font-bold text-stone-900 min-w-[24px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="px-2 py-1 text-xs text-stone-600 hover:bg-stone-100 font-bold disabled:opacity-40"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-extrabold text-stone-900">
                          {currencySymbol}{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Delivery Location Selector */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Select Delivery Location</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryLocation('inside_dhaka')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        deliveryLocation === 'inside_dhaka'
                          ? 'border-amber-500 bg-amber-50 font-bold text-amber-950'
                          : 'border-stone-200 bg-white text-stone-600'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>Inside Dhaka</span>
                        <span>{currencySymbol}{storeSettings.deliveryFeeInside || 70}</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryLocation('outside_dhaka')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        deliveryLocation === 'outside_dhaka'
                          ? 'border-amber-500 bg-amber-50 font-bold text-amber-950'
                          : 'border-stone-200 bg-white text-stone-600'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>Outside Dhaka</span>
                        <span>{currencySymbol}{storeSettings.deliveryFeeOutside || 130}</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Coupon Code Section */}
                <form onSubmit={handleApplyCoupon} className="pt-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-600" />
                    <span>Promo Coupon</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value)}
                      placeholder="e.g. NEX100"
                      className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs uppercase"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-red-600 mt-1">{couponError}</p>}
                  {couponSuccess && (
                    <p className="text-[11px] text-emerald-600 font-bold mt-1">
                      Coupon "{couponCode}" applied! ৳{discount} saved.
                    </p>
                  )}
                </form>
              </>
            )}
          </div>

          {/* Bottom Summary & Checkout Button */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">{currencySymbol}{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
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

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onOpenCheckout();
                }}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cash on Delivery & Mobile Banking Supported</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
