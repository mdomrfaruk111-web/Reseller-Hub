import React from 'react';
import { ShoppingBag, Eye, Star, TrendingUp, Sparkles, AlertTriangle } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onOrderForCustomer?: (product: Product) => void;
  currencySymbol?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onOrderForCustomer,
  currencySymbol = '৳',
}) => {
  const { addToCart } = useCart();
  const { isReseller } = useAuth();

  const profitMargin = product.price - product.resellerPrice;
  const marginPercent = Math.round((profitMargin / product.price) * 100);
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group bg-white rounded-3xl border border-stone-200/80 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
      {/* Product Image Box */}
      <div className="relative aspect-square bg-stone-100 overflow-hidden cursor-pointer" onClick={() => onSelectProduct(product)}>
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.featured && (
            <span className="px-2.5 py-1 bg-amber-500 text-stone-950 text-[10px] font-extrabold rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Featured</span>
            </span>
          )}
          {isReseller && (
            <span className="px-2.5 py-1 bg-stone-900 text-amber-400 text-[10px] font-extrabold rounded-full tracking-wider shadow-xs flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-amber-400" />
              <span>{marginPercent}% Profit</span>
            </span>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center">
            <span className="px-3 py-1.5 bg-red-600 text-white font-bold text-xs rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick View Button on Hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectProduct(product);
          }}
          className="absolute bottom-3 right-3 w-9 h-9 rounded-xl bg-white/90 backdrop-blur-md text-stone-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-stone-900 hover:text-white"
          title="Quick View"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span className="font-medium text-stone-500">{product.category}</span>
            {product.rating && (
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>{product.rating}</span>
              </div>
            )}
          </div>

          <h3
            onClick={() => onSelectProduct(product)}
            className="text-sm font-bold text-stone-900 line-clamp-2 hover:text-amber-700 cursor-pointer transition-colors"
          >
            {product.name}
          </h3>

          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Actions Box */}
        <div className="pt-2 border-t border-stone-100 space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-base sm:text-lg font-black text-stone-900">
                {currencySymbol}{product.price.toLocaleString()}
              </span>
              {isReseller && (
                <div className="text-[11px] text-stone-500">
                  Wholesale: <strong className="text-emerald-700">{currencySymbol}{product.resellerPrice.toLocaleString()}</strong>
                </div>
              )}
            </div>

            {isReseller ? (
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Your Margin</span>
                <span className="text-xs font-extrabold text-emerald-600">
                  +{currencySymbol}{profitMargin.toLocaleString()}
                </span>
              </div>
            ) : (
              <span className="text-[11px] text-stone-400 font-medium">
                {product.stock > 0 ? `${product.stock} in stock` : 'Sold out'}
              </span>
            )}
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => addToCart(product, 1)}
              disabled={isOutOfStock}
              className="py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add Cart</span>
            </button>

            {isReseller && onOrderForCustomer ? (
              <button
                onClick={() => onOrderForCustomer(product)}
                disabled={isOutOfStock}
                className="py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>For Customer</span>
              </button>
            ) : (
              <button
                onClick={() => onSelectProduct(product)}
                className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-all text-center"
              >
                Details
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
