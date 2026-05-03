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
  pending:   'badge-warning',
  confirmed: 'badge-info',
  completed: 'badge-success',
  cancelled: 'badge-danger',
};

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('all');

  useEffect(() => {
    const url = filter === 'all' ? '/api/appointments' : `/api/appointments?status=${filter}`;
    fetch(url)
      .then(r => r.json())
      .then(d => { setAppointments(d.appointments || []); setLoading(false); });
  }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <p className="text-gray-500 mt-1">{appointments.length} total appointments</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {['all','pending','confirmed','completed','cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              filter === f
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Patient','Doctor','Date & Time','Type','Fee','Status','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {appointments.map(apt => (
                <tr key={apt._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-900 text-sm">{apt.patient?.name}</p>
                    <p className="text-xs text-gray-500">{apt.patient?.phone}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-900 text-sm">{apt.doctor?.name}</p>
                    <p className="text-xs text-blue-600">{apt.doctor?.specialization}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-900 text-sm">{apt.date}</p>
                    <p className="text-xs text-gray-500">{apt.time}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="badge-info capitalize">{apt.type}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-semibold text-green-600 text-sm">PKR {apt.fee}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={STATUS_STYLES[apt.status] || 'badge-info'}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {apt.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => updateStatus(apt._id, 'confirmed')}
                          className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100">
                          Confirm
                        </button>
                        <button onClick={() => updateStatus(apt._id, 'cancelled')}
                          className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-medium hover:bg-red-100">
                          Cancel
                        </button>
                      </div>
                    )}
                    {apt.status === 'confirmed' && (
                      <button onClick={() => updateStatus(apt._id, 'completed')}
                        className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg font-medium hover:bg-green-100">
                        Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {appointments.length === 0 && (
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