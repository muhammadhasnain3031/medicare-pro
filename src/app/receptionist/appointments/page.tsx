'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Appointment {
  _id:      string;
  patient:  { name: string; phone: string };
  doctor:   { name: string; specialization: string };
  date:     string;
  time:     string;
  status:   string;
  type:     string;
  symptoms: string;
  fee:      number;
}

export default function ReceptionistAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('all');
  const [search, setSearch]             = useState('');

  useEffect(() => {
    fetch('/api/appointments')
      .then(r => r.json())
      .then(d => { setAppointments(d.appointments || []); setLoading(false); });
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/appointments/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status }),
    });
    setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
  };

  const filtered = appointments.filter(a => {
    const matchFilter = filter === 'all' || a.status === filter;
    const matchSearch = a.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
                        a.doctor?.name?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 text-sm mt-1">{appointments.length} total</p>
        </div>
        <Link href="/receptionist/book"
          className="px-4 py-2.5 bg-pink-600 text-white font-semibold rounded-xl text-sm hover:bg-pink-700 transition-colors text-center">
          + Book New
        </Link>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search patient or doctor..."
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        <div className="flex gap-2 flex-wrap">
          {['all','pending','confirmed','completed','cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                filter === f ? 'bg-pink-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-pink-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(apt => (
            <div key={apt._id} className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600 font-bold flex-shrink-0">
                {apt.patient?.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 items-center mb-1">
                  <p className="font-semibold text-sm text-gray-900">{apt.patient?.name}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    apt.status==='confirmed' ? 'bg-blue-100 text-blue-700'   :
                    apt.status==='completed' ? 'bg-green-100 text-green-700' :
                    apt.status==='cancelled' ? 'bg-red-100 text-red-700'     :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{apt.status}</span>
                </div>
                <p className="text-xs text-gray-500">
                  Dr. {apt.doctor?.name} · {apt.date} · {apt.time} · PKR {apt.fee}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {apt.status === 'pending' && (
                  <>
                    <button onClick={() => updateStatus(apt._id, 'confirmed')}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100">
                      Confirm
                    </button>
                    <button onClick={() => updateStatus(apt._id, 'cancelled')}
                      className="px-3 py-1.5 bg-red-50 text-red-500 text-xs font-semibold rounded-lg hover:bg-red-100">
                      Cancel
                    </button>
                  </>
                )}
                {apt.status === 'confirmed' && (
                  <button onClick={() => updateStatus(apt._id, 'completed')}
                    className="px-3 py-1.5 bg-green-50 text-green-600 text-xs font-semibold rounded-lg hover:bg-green-100">
                    Complete
                  </button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-3xl mb-2">📅</p>
              <p>No appointments found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}