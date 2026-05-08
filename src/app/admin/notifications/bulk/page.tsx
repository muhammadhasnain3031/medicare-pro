'use client';
import { useState } from 'react';

export default function BulkNotification() {
  const [form, setForm] = useState({
    role:    'all',
    channel: 'whatsapp',
    message: '',
  });
  const [result, setResult]   = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!form.message) return;
    if (!confirm(`Send to all ${form.role === 'all' ? 'users' : form.role + 's'}?`)) return;

    setLoading(true);
    try {
      const res = await fetch('/api/notifications/bulk', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      setResult(await res.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const inp = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">📢 Bulk Notification</h1>
        <p className="text-gray-500 text-sm mt-1">Send message to multiple users at once</p>
      </div>

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-5">
          <p className="font-bold text-green-800 text-sm mb-1">
            ✅ Bulk send complete!
          </p>
          <div className="grid grid-cols-3 gap-3 mt-2">
            {[
              { label:'Total',  value:result.total  || 0, color:'text-gray-700'  },
              { label:'Sent',   value:result.sent   || 0, color:'text-green-700' },
              { label:'Failed', value:result.failed || 0, color:'text-red-700'   },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl p-2 text-center">
                <p className={`font-black text-xl ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Send To (Role)</label>
            <select value={form.role}
              onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))}
              className={inp}>
              <option value="all">All Users</option>
              <option value="patient">All Patients</option>
              <option value="doctor">All Doctors</option>
              <option value="nurse">All Nurses</option>
              <option value="receptionist">All Receptionists</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Channel</label>
            <select value={form.channel}
              onChange={e => setForm(prev => ({ ...prev, channel: e.target.value }))}
              className={inp}>
              <option value="whatsapp">💬 WhatsApp</option>
              <option value="sms">📱 SMS</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Message * ({form.message.length} chars)
          </label>
          <textarea value={form.message}
            onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
            rows={6}
            placeholder="Type your announcement or notification message..."
            className={`${inp} resize-none`} />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
          <p className="text-xs text-yellow-800 font-semibold">⚠️ Warning</p>
          <p className="text-xs text-yellow-700 mt-1">
            This will send messages to all users with phone numbers. Make sure your message is correct before sending.
          </p>
        </div>

        <button onClick={handleSend}
          disabled={loading || !form.message}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm disabled:opacity-50 transition-colors">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending to all...
            </span>
          ) : `📢 Send Bulk ${form.channel === 'whatsapp' ? 'WhatsApp' : 'SMS'}`}
        </button>
      </div>
    </div>
  );
}