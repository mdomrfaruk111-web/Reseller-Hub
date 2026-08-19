import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  CheckCircle2,
  AlertTriangle,
  Award,
  Wallet,
  DollarSign,
  TrendingUp,
  UserCheck,
  UserX,
  Edit2
} from 'lucide-react';
import { UserProfile, StoreSettings } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { updateUserRole } from '../../services/storeService';

interface ResellerManagementProps {
  users: UserProfile[];
  storeSettings: StoreSettings;
  onRefreshUsers: () => void;
}

export const ResellerManagement: React.FC<ResellerManagementProps> = ({
  users,
  storeSettings,
  onRefreshUsers,
}) => {
  const { currentUser } = useAuth();
  const currencySymbol = storeSettings.currencySymbol || '৳';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReseller, setSelectedReseller] = useState<UserProfile | null>(null);
  const [customTier, setCustomTier] = useState<'standard' | 'silver' | 'gold' | 'platinum'>('standard');
  const [isUpdating, setIsUpdating] = useState(false);

  const resellers = users.filter((u) => u.role === 'reseller');

  const filtered = resellers.filter((r) => {
    return (
      !searchTerm ||
      (r.displayName && r.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.phone && r.phone.includes(searchTerm)) ||
      (r.resellerCode && r.resellerCode.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleToggleStatus = async (reseller: UserProfile) => {
    const newStatus = reseller.status === 'suspended' ? 'active' : 'suspended';
    try {
      await updateUserRole(reseller.uid, reseller.role, newStatus, currentUser?.email || 'admin');
      onRefreshUsers();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Reseller Partner Management</h2>
          <p className="text-xs text-stone-500">
            Manage registered dropshipping partners, verify accounts, and configure commission tiers.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl text-xs flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-amber-700" />
          <span className="text-stone-600">Active Reseller Partners: </span>
          <strong className="text-amber-900 font-bold">{resellers.length}</strong>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search resellers by name, email, phone, or partner code..."
          className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
        />
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Partner Name & Email</th>
                <th className="py-3 px-4">Partner Code</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Commission Tier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">
                    No resellers registered yet or matching the search.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.uid} className="hover:bg-stone-50/60">
                    <td className="py-3 px-4">
                      <p className="font-bold text-stone-900">{r.displayName || 'Unnamed Reseller'}</p>
                      <p className="text-[11px] text-stone-500">{r.email}</p>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-700">
                      {r.resellerCode || `RES-${r.uid.slice(0, 5).toUpperCase()}`}
                    </td>
                    <td className="py-3 px-4 text-stone-700 font-medium">
                      {r.phone || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase">
                        {r.commissionTier || 'Standard (15%)'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        r.status === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {r.status || 'active'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-500">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(r)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          r.status === 'suspended'
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-700'
                        }`}
                      >
                        {r.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
