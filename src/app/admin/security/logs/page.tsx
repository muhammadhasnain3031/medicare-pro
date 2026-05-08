'use client';

import { useEffect, useState, useCallback } from 'react';

interface AuditLog {
  _id:       string;
  userName:  string;
  userRole:  string;
  action:    string;
  module:    string;
  details:   string;
  ipAddress: string;
  status:    string;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  success: 'bg-green-100 text-green-700 border border-green-200',
  failed:  'bg-red-100 text-red-700 border border-red-200',
  warning: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
};

const STATUS_ICONS: Record<string, string> = {
  success: '✅', failed: '❌', warning: '⚠️',
};

const MODULES = [
  'Authentication','User Management','Appointments',
  'Prescriptions','Laboratory','Billing','Pharmacy',
  'Tenant Management','System',
];

export default function AuditLogsPage() {
  const [logs, setLogs]         = useState<AuditLog[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [module, setModule]     = useState('');
  const [status, setStatus]     = useState('');
  const [page, setPage]         = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page:   String(page),
        limit:  '50',
        ...(search ? { search } : {}),
        ...(module ? { module } : {}),
        ...(status ? { status } : {}),
      });
      const res  = await fetch(`/api/audit?${params}`);
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, module, status]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-gray-50/30">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">📋 Audit Logs</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Monitoring {total} system activities</p>
        </div>
        <button onClick={fetchLogs}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-200">
          🔄 Refresh Data
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="relative group">
           <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search logs..."
            className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
          />
        </div>
        <select value={module} onChange={e => { setModule(e.target.value); setPage(1); }}
          className="px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer">
          <option value="">All Modules</option>
          {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer">
          <option value="">Filter Status</option>
          <option value="success">✅ Success</option>
          <option value="failed">❌ Failed</option>
          <option value="warning">⚠️ Warning</option>
        </select>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">Syncing Records...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[2rem] border border-slate-100 text-slate-400 shadow-sm">
          <p className="text-5xl mb-4">📂</p>
          <p className="font-bold">No activity logs found matching your criteria</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    {['Status','Timestamp','User','Role','Module','Action','Details','IP Address'].map(h => (
                      <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.map(log => (
                    <tr key={log._id}
                      onClick={() => setExpanded(expanded === log._id ? null : log._id)}
                      className="hover:bg-blue-50/30 cursor-pointer transition-colors group">
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1.5 w-fit ${STATUS_STYLES[log.status]}`}>
                          {STATUS_ICONS[log.status]} {log.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-slate-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{log.userName || 'System'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg uppercase tracking-tighter">
                          {log.userRole || 'N/A'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs font-bold text-slate-600">{log.module}</td>
                      <td className="px-5 py-4">
                        <span className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded-md text-slate-700 font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 max-w-[180px] truncate">
                        {log.details}
                      </td>
                      {/* Fixed IP Column with Truncate */}
                      <td className="px-5 py-4 max-w-[120px]">
                        <span className="text-[10px] font-mono bg-slate-50 border border-slate-100 px-2 py-1 rounded-md text-slate-500 truncate block group-hover:bg-white transition-colors text-center">
                          {log.ipAddress || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-50">
              {logs.map(log => (
                <div key={log._id}
                  onClick={() => setExpanded(expanded === log._id ? null : log._id)}
                  className="p-5 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className={`text-[9px] font-black px-2 py-1 rounded-full ${STATUS_STYLES[log.status]}`}>
                      {STATUS_ICONS[log.status]}
                    </span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-black text-sm text-slate-900">{log.userName || 'System'}</p>
                      <span className="text-[9px] bg-slate-100 text-slate-600 font-black px-2 py-0.5 rounded uppercase">
                        {log.action}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{log.details}</p>
                  </div>
                  
                  {expanded === log._id && (
                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Module</p>
                        <p className="text-xs font-bold text-slate-700">{log.module}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">IP Source</p>
                        <p className="text-xs font-mono text-blue-600 font-bold">{log.ipAddress || 'N/A'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Trace</p>
                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                          {log.details}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Improved Pagination Controls */}
          {total > 50 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Showing <span className="text-slate-900">{(page-1)*50+1}–{Math.min(page*50, total)}</span> of {total} records
              </p>
              <div className="flex gap-3">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                  className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm">
                  ← Previous
                </button>
                <button onClick={() => setPage(p => p+1)} disabled={page*50 >= total}
                  className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm">
                  Next Page →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}