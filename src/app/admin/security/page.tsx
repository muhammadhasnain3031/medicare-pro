'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function SecurityDashboard() {
  const [stats, setStats]         = useState<any>(null);
  const [sessions, setSessions]   = useState<any>(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/audit').then(r => r.json()),
      fetch('/api/security/sessions').then(r => r.json()),
    ]).then(([audit, sec]) => {
      setStats(audit.stats);
      setSessions(sec);
      setLoading(false);
    });
  }, []);

  const moduleData = stats?.moduleStats
    ? Object.entries(stats.moduleStats).map(([name, count]) => ({ name, count }))
    : [];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">🔐 Security Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Monitor all system activity and security events</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label:'Total Actions',    value:stats?.totalLogs    || 0, icon:'📋', color:'bg-blue-50 border-blue-200',   text:'text-blue-700'   },
          { label:'Today Logins',     value:stats?.todayLogins  || 0, icon:'🔑', color:'bg-green-50 border-green-200', text:'text-green-700'  },
          { label:'Failed Attempts',  value:stats?.failedLogins || 0, icon:'⚠️', color:'bg-yellow-50 border-yellow-200',text:'text-yellow-700' },
          { label:'Unique IPs',       value:stats?.uniqueIPs    || 0, icon:'🌐', color:'bg-purple-50 border-purple-200',text:'text-purple-700' },
        ].map(s => (
          <div key={s.label} className={`${s.color} border rounded-2xl p-4`}>
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className={`text-2xl font-black ${s.text}`}>{s.value}</p>
            <p className="text-xs text-gray-600 font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label:'Audit Logs',     href:'/admin/security/logs',     icon:'📋', color:'bg-blue-600'   },
          { label:'Active Sessions',href:'/admin/security/sessions', icon:'👥', color:'bg-green-600'  },
          { label:'Failed Logins',  href:'/admin/security/threats',  icon:'🚨', color:'bg-red-600'    },
          { label:'Activity Log',   href:'/admin/security/activity', icon:'📊', color:'bg-purple-600' },
        ].map(a => (
          <Link key={a.label} href={a.href}
            className={`${a.color} text-white rounded-2xl p-4 text-center hover:opacity-90 transition-opacity`}>
            <p className="text-2xl mb-1">{a.icon}</p>
            <p className="text-xs font-semibold">{a.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Module Activity Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 text-sm mb-4">📊 Activity by Module</h3>
          {moduleData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400">
              <p className="text-sm">No activity yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={moduleData} barSize={24} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize:10, fill:'#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize:10, fill:'#6b7280' }} axisLine={false} tickLine={false} width={100} />
                <Tooltip contentStyle={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', fontSize:'11px' }} />
                <Bar dataKey="count" fill="#2563eb" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Failed Attempts */}
        <div className="bg-white rounded-2xl border border-red-100 overflow-hidden">
          <div className="bg-red-50 px-4 py-3 border-b border-red-100 flex items-center justify-between">
            <h3 className="font-bold text-red-800 text-sm">🚨 Recent Failed Logins</h3>
            <Link href="/admin/security/threats" className="text-xs text-red-700 font-medium">View all →</Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-6 h-6 border-4 border-red-600 border-t-transparent rounded-full" />
            </div>
          ) : (stats?.recentFailed || []).length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-2xl mb-1">✅</p>
              <p className="text-sm">No failed attempts</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {(stats?.recentFailed || []).map((log: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 hover:bg-red-50">
                  <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center text-red-600 flex-shrink-0">
                    ⚠️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{log.details}</p>
                    <p className="text-xs text-gray-400">IP: {log.ipAddress || 'Unknown'}</p>
                  </div>
                  <p className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm">👥 Recent Login Sessions</h3>
            <Link href="/admin/security/sessions" className="text-xs text-blue-600 font-medium">View all →</Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['User','Role','Last Login','IP Address','Login Count'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(sessions?.recentLogins || []).slice(0, 8).map((s: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
                            {s._id?.charAt(0)?.toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{s._id}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-full capitalize">
                          {s.userRole}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(s.lastLogin).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded-lg text-gray-700">
                          {s.ipAddress || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-center">
                        {s.loginCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(sessions?.recentLogins || []).length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-2xl mb-1">🔑</p>
                  <p className="text-sm">No login sessions yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}