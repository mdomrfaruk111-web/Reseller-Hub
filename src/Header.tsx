import React from 'react';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { ShoppingCart, User, LogOut, Shield } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const { cart, setIsCartOpen } = useCart();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xl font-bold text-gray-900">Reseller Hub</span>
          {isAdmin && (
            <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded flex items-center gap-1">
              <Shield className="w-3 h-3" /> Admin
            </span>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <ShoppingCart className="w-6 h-6" />
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>

          {currentUser ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">{currentUser.name}</span>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-500 hover:text-red-600 focus:outline-none"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
