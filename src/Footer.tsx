import React from 'react';
import { DEFAULT_STORE_SETTINGS } from './initialData';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} {DEFAULT_STORE_SETTINGS.storeName}. All rights reserved.</p>
      </div>
    </footer>
  );
};
