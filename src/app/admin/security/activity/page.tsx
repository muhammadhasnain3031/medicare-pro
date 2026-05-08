'use client';
import { useEffect, useState } from 'react';

export default function ActivityPage() {
  const [logs, setLogs]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/audit?limit=200')
      .then(r => r.json())
      .then(d => { setLogs(d.logs || []); setLoading(false); });
  }, []);

  const filtered = filter === 'all' ? logs : logs.filter(l => l.status === filter);

  const ACTION_ICONS: Record<string, string> = {
    LOGIN:              '🔑',
    LOGOUT:             '🚪',
    LOGIN_FAILED:       '❌',
    USER_CREATED:       '👤',
    USER_UPDATED:       '✏️',
    USER_DELETED:       '🗑️',
    APPOINTMENT_CREATED:'📅',
    APPOINTMENT_UPDATED:'📝',
    PRESCRIPTION_CREATED:'💊',
    LAB_TEST_CREATED:   '🧪',
    LAB_RESULT_ADDED:   '✅',
    LAB_PAYMENT_MADE:   '💳',
    INVOICE_CREATED:    '📋',
    INVOICE_PAID:       '💰',
    MEDICINE_ADDED:     '💊',
    BILL_CREATED:       '🧾',
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">📊 Activity Timeline</h1>
        <p className="text-gray-500 text-sm mt-1">Real-time system activity feed</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {['all','success','failed','warning'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap flex-shrink-0 transition-all ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
            }`}>
            {f} ({f === 'all' ? logs.length : logs.filter(l => l.status === f).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((log, i) => (
            <div key={log._id} className={`bg-white rounded-2xl border p-3 flex items-start gap-3 hover:shadow-sm transition-shadow ${
              log.status === 'failed'  ? 'border-red-100'    :
              log.status === 'warning' ? 'border-yellow-100' : 'border-gray-100'
            }`}>
              {/* Icon */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                log.status === 'failed'  ? 'bg-red-100'    :
                log.status === 'warning' ? 'bg-yellow-100' : 'bg-green-100'
              }`}>
                {ACTION_ICONS[log.action] || '📌'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <p className="font-bold text-sm text-gray-900">{log.userName || 'System'}</p>
                  <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {log.action}
                  </span>
                  <span className="text-xs text-gray-400">{log.module}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{log.details}</p>
                <div className="flex gap-3 mt-1 text-xs text-gray-400">
                  <span>🌐 {log.ipAddress || 'N/A'}</span>
                  <span>🕐 {new Date(log.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                log.status === 'success' ? 'bg-green-100 text-green-700' :
                log.status === 'failed'  ? 'bg-red-100 text-red-700'    :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {log.status === 'success' ? '✅' : log.status === 'failed' ? '❌' : '⚠️'}
              </span>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📊</p>
              <p>No activity found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}