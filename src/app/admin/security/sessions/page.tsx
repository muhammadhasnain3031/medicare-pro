'use client';
import { useEffect, useState } from 'react';

export default function SessionsPage() {
  const [data, setData]     = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/security/sessions')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  const ROLE_COLORS: Record<string, string> = {
    admin:        'bg-purple-100 text-purple-700',
    doctor:       'bg-blue-100 text-blue-700',
    patient:      'bg-green-100 text-green-700',
    receptionist: 'bg-pink-100 text-pink-700',
    nurse:        'bg-teal-100 text-teal-700',
    lab:          'bg-orange-100 text-orange-700',
    pharmacist:   'bg-emerald-100 text-emerald-700',
    superadmin:   'bg-red-100 text-red-700',
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">👥 Login Sessions</h1>
        <p className="text-gray-500 text-sm mt-1">Recent user activity across all roles</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-5">

          {/* Recent Sessions */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-900 text-sm">🔑 Recent Login Sessions</h3>
            </div>
            <div className="space-y-0 divide-y divide-gray-50">
              {(data?.recentLogins || []).map((s: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-4 hover:bg-gray-50">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                    {s._id?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-gray-900">{s._id}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                        ROLE_COLORS[s.userRole] || 'bg-gray-100 text-gray-600'
                      }`}>
                        {s.userRole}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-0.5">
                      <span>🕐 {new Date(s.lastLogin).toLocaleString()}</span>
                      <span className="font-mono">🌐 {s.ipAddress || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900 text-sm">{s.loginCount}</p>
                    <p className="text-xs text-gray-400">logins</p>
                  </div>
                </div>
              ))}
              {(data?.recentLogins || []).length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-3xl mb-2">🔑</p>
                  <p className="text-sm">No sessions recorded</p>
                </div>
              )}
            </div>
          </div>

          {/* Today's Activity */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-blue-50">
              <h3 className="font-bold text-blue-800 text-sm">
                📅 Today's Activity ({data?.todayLogs?.length || 0} actions)
              </h3>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {(data?.todayLogs || []).map((log: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 hover:bg-gray-50">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                    log.status === 'success' ? 'bg-green-100 text-green-700' :
                    log.status === 'failed'  ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {log.status === 'success' ? '✅' : log.status === 'failed' ? '❌' : '⚠️'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      <span className="font-bold">{log.userName}</span> — {log.action}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{log.details}</p>
                  </div>
                  <p className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              ))}
              {(data?.todayLogs || []).length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  <p>No activity today</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}