'use client';
import { useEffect, useState } from 'react';

export default function NotificationLogs() {
  const [logs, setLogs]     = useState<any[]>([]);
  const [stats, setStats]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState('');
  const [status, setStatus]   = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (channel) params.set('channel', channel);
    if (status)  params.set('status',  status);
    fetch(`/api/notifications/logs?${params}`)
      .then(r => r.json())
      .then(d => { setLogs(d.logs || []); setStats(d.stats); setLoading(false); });
  }, [channel, status]);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">📋 Notification Logs</h1>
        <p className="text-gray-500 text-sm mt-1">{stats?.total || 0} total notifications</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <select value={channel} onChange={e => setChannel(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Channels</option>
          <option value="whatsapp">💬 WhatsApp</option>
          <option value="sms">📱 SMS</option>
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Status</option>
          <option value="sent">✅ Sent</option>
          <option value="failed">❌ Failed</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                  log.channel === 'whatsapp' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  {log.channel === 'whatsapp' ? '💬' : '📱'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-sm text-gray-900">
                      {log.recipient || 'Unknown'}
                    </p>
                    <span className="text-xs text-gray-400 font-mono">{log.phone}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      log.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {log.status === 'sent' ? '✅ Sent' : '❌ Failed'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{log.type}</p>
                  {log.error && (
                    <p className="text-xs text-red-500 mt-1">Error: {log.error}</p>
                  )}
                </div>
                <p className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
              <p className="text-3xl mb-2">📋</p>
              <p>No notification logs</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}