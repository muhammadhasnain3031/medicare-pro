'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function NotificationsPage() {
  const [stats, setStats]   = useState<any>(null);
  const [logs, setLogs]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications/logs')
      .then(r => r.json())
      .then(d => {
        setStats(d.stats);
        setLogs(d.logs || []);
        setLoading(false);
      });
  }, []);

  const successRate = stats?.total > 0
    ? Math.round((stats.sent / stats.total) * 100) : 0;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">📱 Notifications Center</h1>
          <p className="text-gray-500 text-sm mt-1">WhatsApp & SMS management</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/notifications/send"
            className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm transition-colors">
            📤 Send Message
          </Link>
          <Link href="/admin/notifications/bulk"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors">
            📢 Bulk Send
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label:'Total Sent',    value:stats?.total    || 0, icon:'📱', color:'bg-blue-50 border-blue-200',   text:'text-blue-700'   },
          { label:'Delivered',     value:stats?.sent     || 0, icon:'✅', color:'bg-green-50 border-green-200', text:'text-green-700'  },
          { label:'Failed',        value:stats?.failed   || 0, icon:'❌', color:'bg-red-50 border-red-200',     text:'text-red-700'    },
          { label:'WhatsApp',      value:stats?.whatsapp || 0, icon:'💬', color:'bg-teal-50 border-teal-200',   text:'text-teal-700'   },
          { label:'Success Rate',  value:`${successRate}%`,    icon:'📊', color:'bg-purple-50 border-purple-200',text:'text-purple-700' },
        ].map(s => (
          <div key={s.label} className={`${s.color} border rounded-2xl p-4`}>
            <p className="text-xl mb-1">{s.icon}</p>
            <p className={`text-xl font-black ${s.text}`}>{s.value}</p>
            <p className="text-xs text-gray-600 font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label:'Send Message',    href:'/admin/notifications/send',     icon:'📤', color:'bg-green-600'  },
          { label:'Bulk Send',       href:'/admin/notifications/bulk',     icon:'📢', color:'bg-blue-600'   },
          { label:'Auto Reminders',  href:'/admin/notifications/auto',     icon:'⏰', color:'bg-purple-600' },
          { label:'View Logs',       href:'/admin/notifications/logs',     icon:'📋', color:'bg-gray-600'   },
        ].map(a => (
          <Link key={a.label} href={a.href}
            className={`${a.color} text-white rounded-2xl p-4 text-center hover:opacity-90 transition-opacity`}>
            <p className="text-2xl mb-1">{a.icon}</p>
            <p className="text-xs font-semibold">{a.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Logs */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm">📋 Recent Notifications</h3>
          <Link href="/admin/notifications/logs" className="text-xs text-blue-600 font-medium">View all →</Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">📱</p>
            <p className="text-sm">No notifications sent yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {logs.slice(0, 8).map((log, i) => (
              <div key={i} className="flex items-center gap-3 p-3 hover:bg-gray-50">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                  log.channel === 'whatsapp' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  {log.channel === 'whatsapp' ? '💬' : '📱'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{log.recipient || log.phone}</p>
                  <p className="text-xs text-gray-400 truncate">{log.type} · {log.phone}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    log.status === 'sent'   ? 'bg-green-100 text-green-700' :
                    log.status === 'failed' ? 'bg-red-100 text-red-700'    :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {log.status === 'sent' ? '✅' : log.status === 'failed' ? '❌' : '⏳'}
                    {' '}{log.status}
                  </span>
                  <p className="text-xs text-gray-400">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}