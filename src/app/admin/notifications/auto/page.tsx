'use client';
import { useState } from 'react';

const AUTO_TYPES = [
  {
    key:     'appointment_reminders',
    title:   'Appointment Reminders',
    desc:    "Send tomorrow's appointment reminders to all patients",
    icon:    '📅',
    color:   'bg-blue-50 border-blue-200',
    btnColor:'bg-blue-600 hover:bg-blue-700',
  },
  {
    key:     'bill_reminders',
    title:   'Bill Due Reminders',
    desc:    'Send payment reminders to patients with outstanding dues',
    icon:    '💰',
    color:   'bg-yellow-50 border-yellow-200',
    btnColor:'bg-yellow-600 hover:bg-yellow-700',
  },
];

export default function AutoNotifications() {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const handleRun = async (type: string) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    try {
      const res = await fetch('/api/notifications/auto', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ type }),
      });
      const data = await res.json();
      setResults(prev => ({ ...prev, [type]: data }));
    } catch (err) { console.error(err); }
    setLoading(prev => ({ ...prev, [type]: false }));
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">⏰ Auto Notifications</h1>
        <p className="text-gray-500 text-sm mt-1">
          Run automated notification campaigns
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
        <p className="font-bold text-blue-800 text-sm mb-1">💡 How it works</p>
        <p className="text-xs text-blue-700 leading-relaxed">
          Click "Run Now" to send automated notifications. For production, set up a cron job to run these automatically at scheduled times (e.g., appointment reminders at 6 PM daily).
        </p>
      </div>

      <div className="space-y-4">
        {AUTO_TYPES.map(t => (
          <div key={t.key} className={`${t.color} border rounded-2xl p-5`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-3xl flex-shrink-0">{t.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900">{t.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{t.desc}</p>
                </div>
              </div>
              <button
                onClick={() => handleRun(t.key)}
                disabled={loading[t.key]}
                className={`${t.btnColor} text-white font-bold px-4 py-2.5 rounded-xl text-sm disabled:opacity-50 transition-colors flex-shrink-0`}>
                {loading[t.key] ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Running...
                  </span>
                ) : '▶ Run Now'}
              </button>
            </div>

            {results[t.key] && (
              <div className="mt-4 bg-white rounded-xl p-3 border border-white/50">
                <p className="text-xs font-bold text-gray-700 mb-2">
                  ✅ Last Run Result:
                </p>
                <div className="flex gap-4 text-xs">
                  <span className="text-green-600 font-bold">✅ Sent: {results[t.key].sent || 0}</span>
                  <span className="text-red-500 font-bold">❌ Failed: {results[t.key].failed || 0}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{results[t.key].message}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}