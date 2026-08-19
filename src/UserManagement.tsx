import React, { useState } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  Briefcase,
  User,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Edit2
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { updateUserRole } from '../../services/storeService';
import { useAuth } from '../../context/AuthContext';
import { SUPER_ADMIN_EMAIL } from '../../data/initialData';

interface UserManagementProps {
  users: UserProfile[];
  onRefreshUsers: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ users, onRefreshUsers }) => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('customer');
  const [editStatus, setEditStatus] = useState<'active' | 'suspended'>('active');
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const openEditModal = (u: UserProfile) => {
    setSelectedUser(u);
    setEditRole(u.role);
    setEditStatus(u.status || 'active');
    setFeedback(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (selectedUser.email === SUPER_ADMIN_EMAIL && editRole !== 'admin') {
      setFeedback('Cannot change role of the Primary Administrator account.');
      return;
    }

    setIsUpdating(true);
    try {
      await updateUserRole(selectedUser.uid, editRole, editStatus, currentUser?.email || 'admin');
      setFeedback('User profile updated successfully.');
      onRefreshUsers();
      setTimeout(() => {
        setSelectedUser(null);
      }, 1000);
    } catch (err: any) {
      setFeedback(`Error: ${err.message || 'Failed to update'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const filtered = users.filter((u) => {
    return (
      !searchTerm ||
      (u.displayName && u.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">User Account Management</h2>
          <p className="text-xs text-stone-500">
            Control registered user accounts, RBAC permissions, and access status.
          </p>
        </div>

        <div className="bg-stone-100 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-stone-700">
          Total Registered Users: <strong>{users.length}</strong>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, email, or mobile number..."
          className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
        />
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((u) => (
                <tr key={u.uid} className="hover:bg-stone-50/60">
                  <td className="py-3 px-4">
                    <p className="font-bold text-stone-900">{u.displayName || 'Anonymous User'}</p>
                    {u.email === SUPER_ADMIN_EMAIL && (
                      <span className="text-[10px] text-amber-700 font-extrabold flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Primary Administrator</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-stone-700 font-mono text-[11px]">{u.email}</td>
                  <td className="py-3 px-4 text-stone-600">{u.phone || '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      u.role === 'admin' ? 'bg-stone-900 text-amber-400' :
                      u.role === 'reseller' ? 'bg-amber-100 text-amber-900' :
                      'bg-stone-100 text-stone-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      u.status === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {u.status || 'active'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-stone-500">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recent'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openEditModal(u)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                      title="Edit User Permissions"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900">Edit User Permissions</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-full text-stone-400 hover:bg-stone-100"
              >
                ✕
              </button>
            </div>

            {feedback && (
              <div className="p-3 bg-stone-100 text-stone-800 rounded-xl text-xs">
                {feedback}
              </div>
            )}

            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-1 text-xs">
              <p className="font-bold text-stone-900">{selectedUser.displayName || 'User'}</p>
              <p className="text-stone-500 font-mono text-[11px]">{selectedUser.email}</p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Assign User Role</label>
                <select
                  value={editRole}
                  disabled={selectedUser.email === SUPER_ADMIN_EMAIL}
                  onChange={(e: any) => setEditRole(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                >
                  <option value="customer">Customer (Retail Shopper)</option>
                  <option value="reseller">Reseller (Dropshipping Partner)</option>
                  <option value="admin">Administrator (Full Dashboard Access)</option>
                </select>
                {selectedUser.email === SUPER_ADMIN_EMAIL && (
                  <p className="text-[10px] text-amber-700 mt-1">Super administrator role cannot be altered.</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Account Access Status</label>
                <select
                  value={editStatus}
                  disabled={selectedUser.email === SUPER_ADMIN_EMAIL}
                  onChange={(e: any) => setEditStatus(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                >
                  <option value="active">Active (Full Access)</option>
                  <option value="suspended">Suspended (Blocked from logging in)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save User Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
