import React, { useState } from 'react';
import {
  Users,
  Search,
  ShoppingBag,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  ShieldCheck,
  Ban,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { UserProfile, Order, StoreSettings } from '../../types';
import { updateUserRole } from '../../services/storeService';
import { useAuth } from '../../context/AuthContext';

interface CustomerManagementProps {
  users: UserProfile[];
  orders: Order[];
  storeSettings: StoreSettings;
  onRefresh: () => void;
}

export const CustomerManagement: React.FC<CustomerManagementProps> = ({
  users,
  orders,
  storeSettings,
  onRefresh,
}) => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  const customers = users.filter((u) => u.role === 'customer');

  const handleToggleStatus = async (user: UserProfile) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    const actionName = nextStatus === 'suspended' ? 'suspend' : 'activate';
    if (!window.confirm(`Are you sure you want to ${actionName} customer "${user.displayName || user.email}"?`)) {
      return;
    }
    try {
      await updateUserRole(user.uid, user.role, nextStatus, currentUser?.email || 'admin');
      onRefresh();
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      !searchTerm ||
      c.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const currencySymbol = storeSettings.currencySymbol || '৳';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Customer Accounts & Profiles</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            View registered customer shopping metrics, purchase histories, and manage active status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-100">
            Total Customers: {customers.length}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, email, or phone..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg py-2 pl-10 pr-4 text-xs text-slate-900"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-900 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Orders Placed</th>
                <th className="py-3.5 px-4">Total Spent</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No customers found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const customerOrders = orders.filter(
                    (o) => o.customerId === cust.uid || o.customerEmail?.toLowerCase() === cust.email.toLowerCase()
                  );
                  const totalSpent = customerOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

                  return (
                    <tr key={cust.uid} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                            {(cust.displayName || cust.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{cust.displayName || 'Customer'}</div>
                            <div className="text-[10px] text-slate-400 font-mono">ID: {cust.uid.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-[11px] text-slate-900">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{cust.email}</span>
                          </div>
                          {cust.phone && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-500">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{cust.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-md font-mono">
                          {customerOrders.length} orders
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {currencySymbol}{totalSpent.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            cust.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {cust.status === 'active' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Ban className="w-3 h-3" />
                          )}
                          <span>{cust.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {new Date(cust.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(cust)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                            cust.status === 'active'
                              ? 'bg-red-50 hover:bg-red-100 text-red-700'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {cust.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
