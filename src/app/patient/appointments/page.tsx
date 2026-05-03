'use client';
import { useEffect, useState } from 'react';

interface Appointment {
  _id:    string;
  doctor: { name: string; specialization: string; fee: number };
  date:   string;
  time:   string;
  status: string;
  type:   string;
  symptoms: string;
}

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('all');

  useEffect(() => {
    fetch('/api/appointments')
      .then(r => r.json())
      .then(d => { setAppointments(d.appointments || []); setLoading(false); });
  }, []);

  const cancel = async (id: string) => {
    if (!confirm('Cancel this appointment?')) return;
    await fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    });
    setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'cancelled' } : a));
  };

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-500 mt-1">{appointments.length} total appointments</p>
      </div>

      <div className="flex gap-2 mb-6">
        {['all','pending','confirmed','completed','cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(apt => (
          <div key={apt._id} className="card p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {apt.doctor?.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{apt.doctor?.name}</p>
                <p className="text-sm text-blue-600 mb-1">{apt.doctor?.specialization}</p>
                <div className="flex gap-3 text-xs text-gray-500">
                  <span>📅 {apt.date}</span>
                  <span>⏰ {apt.time}</span>
                  <span className="capitalize">🏥 {apt.type}</span>
                  <span>💰 PKR {apt.doctor?.fee}</span>
                </div>
                {apt.symptoms && (
                  <p className="text-xs text-gray-400 mt-1 truncate">Symptoms: {apt.symptoms}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  apt.status === 'pending'   ? 'badge-warning' :
                  apt.status === 'confirmed' ? 'badge-info'    :
                  apt.status === 'completed' ? 'badge-success' : 'badge-danger'
                }`}>
                  {apt.status}
                </span>
                {(apt.status === 'pending' || apt.status === 'confirmed') && (
                  <button onClick={() => cancel(apt._id)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && !loading && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📅</p>
            <p>No appointments found</p>
          </div>
        )}
      </div>
    </div>
  );
}