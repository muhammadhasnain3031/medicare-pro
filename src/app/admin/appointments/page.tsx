'use client';
import { useEffect, useState } from 'react';

interface Appointment {
  _id:     string;
  patient: { name: string; email: string; phone: string };
  doctor:  { name: string; specialization: string };
  date:    string;
  time:    string;
  status:  string;
  type:    string;
  fee:     number;
}

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('all');
  const [search, setSearch]             = useState('');

  useEffect(() => {
    fetch('/api/appointments')
      .then(r => r.json())
      .then(d => { setAppointments(d.appointments || []); setLoading(false); });
  }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
    await fetch(`/api/appointments/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status }),
    });
  };

  const filtered = appointments.filter(a => {
    const matchF = filter === 'all' || a.status === filter;
    const matchS = !search ||
      a.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor?.name?.toLowerCase().includes(search.toLowerCase());
    return matchF && matchS;
  });

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">📅 Appointments</h1>
        <p className="text-gray-500 text-sm mt-1">{appointments.length} total</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col gap-3 mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search patient or doctor..."
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['all','pending','confirmed','completed','cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all flex-shrink-0 ${
                filter === f ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600'
              }`}>
              {f} ({f === 'all' ? appointments.length : appointments.filter(a => a.status === f).length})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(apt => (
            <div key={apt._id} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow">

              {/* Mobile-first layout */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg flex-shrink-0">
                  {apt.patient?.name?.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Row 1 — names + status */}
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-semibold text-sm text-gray-900">{apt.patient?.name}</p>
                    <span className="text-gray-300 hidden sm:inline">→</span>
                    <p className="text-sm text-blue-600 font-medium">{apt.doctor?.name}</p>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ml-auto ${STATUS_STYLES[apt.status]}`}>
                      {apt.status}
                    </span>
                  </div>

                  {/* Row 2 — meta info */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mb-2">
                    <span>📅 {apt.date}</span>
                    <span>⏰ {apt.time}</span>
                    <span className="capitalize">🏥 {apt.type}</span>
                    <span className="text-blue-600 font-medium">{apt.doctor?.specialization}</span>
                    <span className="text-green-600 font-semibold">PKR {apt.fee}</span>
                    <span className="text-gray-400">{apt.patient?.phone}</span>
                  </div>

                  {/* Row 3 — action buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {apt.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(apt._id, 'confirmed')}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors">
                          ✅ Confirm
                        </button>
                        <button onClick={() => updateStatus(apt._id, 'cancelled')}
                          className="px-3 py-1.5 bg-red-50 text-red-500 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors">
                          ❌ Cancel
                        </button>
                      </>
                    )}
                    {apt.status === 'confirmed' && (
                      <button onClick={() => updateStatus(apt._id, 'completed')}
                        className="px-3 py-1.5 bg-green-50 text-green-600 text-xs font-semibold rounded-lg hover:bg-green-100 transition-colors">
                        ✅ Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
              <p className="text-3xl mb-2">📅</p>
              <p>No appointments found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}