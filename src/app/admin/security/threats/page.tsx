'use client';
import { useEffect, useState } from 'react';

export default function ThreatsPage() {
  const [data, setData]     = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/security/sessions')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  const totalFailed = (data?.failedByIP || []).reduce((s: number, ip: any) => s + ip.attempts, 0);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">🚨 Security Threats</h1>
        <p className="text-gray-500 text-sm mt-1">Failed login attempts and suspicious IPs</p>
      </div>

      {totalFailed > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚨</span>
            <div>
              <p className="font-bold text-red-800">Total Failed Attempts</p>
              <p className="text-2xl font-black text-red-700">{totalFailed} attempts</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-red-100 overflow-hidden">
            <div className="bg-red-50 px-4 py-3 border-b border-red-100">
              <h3 className="font-bold text-red-800 text-sm">
                🔍 Failed Attempts by IP Address
              </h3>
            </div>
            {(data?.failedByIP || []).length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">✅</p>
                <p className="font-bold text-lg">No Threats Detected</p>
                <p className="text-sm mt-1">System is secure</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {(data?.failedByIP || []).map((ip: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-4 hover:bg-red-50 transition-colors">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white flex-shrink-0 ${
                      ip.attempts >= 10 ? 'bg-red-600' : ip.attempts >= 5 ? 'bg-orange-500' : 'bg-yellow-500'
                    }`}>
                      {ip.attempts >= 10 ? '🚨' : ip.attempts >= 5 ? '⚠️' : '!'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono font-bold text-sm text-gray-900">
                        {ip._id || 'Unknown IP'}
                      </p>
                      <p className="text-xs text-gray-400">
                        Last attempt: {new Date(ip.lastAttempt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-black text-xl ${
                        ip.attempts >= 10 ? 'text-red-600' : ip.attempts >= 5 ? 'text-orange-600' : 'text-yellow-600'
                      }`}>
                        {ip.attempts}
                      </p>
                      <p className="text-xs text-gray-400">attempts</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                      ip.attempts >= 10 ? 'bg-red-100 text-red-700'    :
                      ip.attempts >= 5  ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {ip.attempts >= 10 ? '🚨 HIGH RISK' : ip.attempts >= 5 ? '⚠️ MEDIUM' : '⚡ LOW'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}