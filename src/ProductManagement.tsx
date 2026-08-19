import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';
import { Product, StoreSettings } from '../../types';
import { CATEGORIES } from '../../data/initialData';
import { createProduct, updateProduct, deleteProduct } from '../../services/storeService';
import { useAuth } from '../../context/AuthContext';

interface ProductManagementProps {
  products: Product[];
  storeSettings: StoreSettings;
  onRefreshProducts: () => void;
}

export const ProductManagement: React.FC<ProductManagementProps> = ({
  products,
  storeSettings,
  onRefreshProducts,
}) => {
  const { currentUser } = useAuth();
  const currencySymbol = storeSettings.currencySymbol || '৳';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    resellerPrice: '',
    stock: '',
    category: CATEGORIES[1] || 'Smartphones & Gadgets',
    sku: '',
    images: '',
    featured: false,
    status: 'active' as 'active' | 'draft' | 'archived',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      resellerPrice: '',
      stock: '50',
      category: CATEGORIES[1] || 'Smartphones & Gadgets',
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      images: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      featured: false,
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      description: p.description,
      price: String(p.price),
      resellerPrice: String(p.resellerPrice),
      stock: String(p.stock),
      category: p.category,
      sku: p.sku,
      images: p.images?.join('\n') || '',
      featured: !!p.featured,
      status: p.status || 'active',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.resellerPrice) {
      setFeedback({ type: 'error', message: 'Name, Retail Price and Reseller Price are required.' });
      return;
    }

    const priceNum = Number(formData.price);
    const resellerPriceNum = Number(formData.resellerPrice);

    if (resellerPriceNum > priceNum) {
      setFeedback({ type: 'error', message: 'Reseller Wholesale price cannot exceed Retail price.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const imageList = formData.images
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (editingProduct) {
        await updateProduct(
          editingProduct.id,
          {
            name: formData.name,
            description: formData.description,
            price: priceNum,
            resellerPrice: resellerPriceNum,
            stock: Number(formData.stock) || 0,
            category: formData.category,
            sku: formData.sku,
            images: imageList.length > 0 ? imageList : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
            featured: formData.featured,
            status: formData.status,
          },
          currentUser?.email || 'admin'
        );
        setFeedback({ type: 'success', message: 'Product updated successfully.' });
      } else {
        await createProduct(
          {
            name: formData.name,
            description: formData.description,
            price: priceNum,
            resellerPrice: resellerPriceNum,
            stock: Number(formData.stock) || 0,
            category: formData.category,
            sku: formData.sku,
            images: imageList.length > 0 ? imageList : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
            featured: formData.featured,
            status: formData.status,
            createdAt: new Date().toISOString(),
          },
          currentUser?.email || 'admin'
        );
        setFeedback({ type: 'success', message: 'Product added successfully.' });
      }

      onRefreshProducts();
      setIsModalOpen(false);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save product.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteProduct(productId, name, currentUser?.email || 'admin');
      onRefreshProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Product Management</h2>
          <p className="text-xs text-stone-500">
            Create, update stock, and configure retail and wholesale reseller pricing.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filter Ribbon */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by product name or SKU..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-medium text-stone-700"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Retail Price</th>
                <th className="py-3 px-4">Reseller Price</th>
                <th className="py-3 px-4">Margin</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((p) => {
                const margin = p.price - p.resellerPrice;
                return (
                  <tr key={p.id} className="hover:bg-stone-50/60">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0 bg-stone-100"
                        />
                        <div>
                          <p className="font-bold text-stone-900 line-clamp-1">{p.name}</p>
                          <p className="text-[10px] text-stone-400 font-mono">SKU: {p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-stone-600 font-medium">{p.category}</td>
                    <td className="py-3 px-4 font-bold text-stone-900">
                      {currencySymbol}{p.price.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-700">
                      {currencySymbol}{p.resellerPrice.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-700">
                      +{currencySymbol}{margin.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${p.stock <= 5 ? 'text-red-600' : 'text-stone-700'}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        p.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {p.status || 'active'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Wireless ANC Earbuds"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Retail Price ({currencySymbol}) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="1850"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Reseller Wholesale ({currencySymbol}) *</label>
                  <input
                    type="number"
                    required
                    value={formData.resellerPrice}
                    onChange={(e) => setFormData({ ...formData, resellerPrice: e.target.value })}
                    placeholder="1450"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Stock Units</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    {CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Image URLs (One per line)</label>
                <textarea
                  rows={3}
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl resize-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed specifications, features, warranty..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl resize-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded text-amber-500"
                  />
                  <span className="font-semibold text-stone-800">Mark as Featured</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-stone-700">Status:</span>
                  <select
                    value={formData.status}
                    onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                    className="p-1 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
