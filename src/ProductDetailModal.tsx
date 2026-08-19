import React, { useState } from 'react';
import {
  X,
  Star,
  ShoppingBag,
  Truck,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Package,
  Layers,
  Phone
} from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { BUSINESS_INFO } from '../data/initialData';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  storeSettings: StoreSettings;
  onBuyNow?: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  storeSettings,
  onBuyNow,
}) => {
  const { addToCart } = useCart();
  const { isReseller } = useAuth();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  if (!product) return null;

  const phone = storeSettings.contactPhone || BUSINESS_INFO.phone;
  const currencySymbol = storeSettings.currencySymbol || '৳';
  const profitMargin = product.price - product.resellerPrice;
  const marginPercent = Math.round((profitMargin / product.price) * 100);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    onClose();
    if (onBuyNow) {
      onBuyNow(product, quantity);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-stone-200 relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Gallery Section */}
          <div className="space-y-4">
            <div className="aspect-square bg-stone-100 rounded-2xl overflow-hidden border border-stone-200 relative">
              <img
                src={product.images?.[selectedImageIndex] || product.images?.[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {isReseller && (
                <div className="absolute top-3 left-3 bg-stone-950 text-amber-400 font-black text-xs px-2.5 py-1 rounded-full shadow-md">
                  Reseller Margin: {currencySymbol}{profitMargin} ({marginPercent}%)
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImageIndex === idx ? 'border-amber-500 shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Support Callout */}
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-600" />
                <span className="text-stone-600">Have questions before buying?</span>
              </div>
              <a href={`tel:${phone}`} className="font-bold text-stone-900 hover:text-amber-600">
                Call {phone}
              </a>
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2.5 py-1 bg-stone-100 text-stone-700 rounded-lg">
                  {product.category}
                </span>
                <span className="text-xs font-mono text-stone-400">SKU: {product.sku}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 leading-tight">
                {product.name}
              </h2>

              {/* Price Box */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-black text-stone-950">
                    {currencySymbol}{product.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-stone-500">Retail Price</span>
                </div>

                {isReseller && (
                  <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between text-xs">
                    <span className="text-stone-600">
                      Wholesale Cost: <strong className="text-emerald-700 font-bold">{currencySymbol}{product.resellerPrice.toLocaleString()}</strong>
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                      Your Margin: +{currencySymbol}{profitMargin.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Product Overview</h4>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-h-40 overflow-y-auto">
                  {product.description}
                </p>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 text-xs">
                <span className={`w-2.5 h-2.5 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span className="font-semibold text-stone-800">
                  {product.stock > 0 ? `In Stock (${product.stock} units available)` : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4 pt-4 border-t border-stone-200">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-stone-700">Quantity:</span>
                <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isOutOfStock || quantity <= 1}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-sm font-bold disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold text-stone-900 min-w-[36px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={isOutOfStock || quantity >= product.stock}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-sm font-bold disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              {addedNotice && (
                <div className="p-2.5 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Added {quantity} item(s) to Cart!</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="py-3 px-4 bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold text-xs rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  Buy Now
                </button>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-500 pt-2">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Inside Dhaka ৳70, Outside ৳130</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>7 Days Return Policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
