import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Clock,
  User,
  Filter,
  FileText,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { AuditLog } from '../../types';

interface AuditLogsViewProps {
  logs: AuditLog[];
  onRefreshLogs: () => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs, onRefreshLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filtered = logs.filter((log) => {
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesSearch =
      !searchTerm ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.resourceId && log.resourceId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesAction && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Security & Operational Audit Logs</h2>
          <p className="text-xs text-stone-500">
            Immutable system record of administrative changes, product edits, payouts, and order modifications.
          </p>
        </div>

        <button
          onClick={onRefreshLogs}
          className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-xl self-start sm:self-auto transition-all"
        >
          Refresh Logs
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit logs by actor email, action, or target resource..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800"
        >
          <option value="all">All Actions</option>
          <option value="PRODUCT_CREATED">PRODUCT_CREATED</option>
          <option value="PRODUCT_UPDATED">PRODUCT_UPDATED</option>
          <option value="PRODUCT_DELETED">PRODUCT_DELETED</option>
          <option value="ORDER_STATUS_UPDATED">ORDER_STATUS_UPDATED</option>
          <option value="WITHDRAWAL_STATUS_UPDATED">WITHDRAWAL_STATUS_UPDATED</option>
          <option value="SETTINGS_UPDATED">SETTINGS_UPDATED</option>
          <option value="USER_ROLE_UPDATED">USER_ROLE_UPDATED</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Admin / Actor</th>
                <th className="py-3 px-4">Resource Target</th>
                <th className="py-3 px-4">Event Details Snapshot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-stone-400 font-sans text-xs">
                    No audit records matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/60">
                    <td className="py-3 px-4 text-stone-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-900 border border-amber-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-800">
                      {log.actorEmail}
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      <span className="font-bold text-stone-900">{log.resourceType}</span>: {log.resourceId}
                    </td>
                    <td className="py-3 px-4 text-stone-500 max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : '—'}
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
