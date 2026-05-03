'use client';
import { useEffect, useState } from 'react';

interface Appointment {
  _id:     string;
  patient: { name: string };
  doctor:  { name: string; fee: number };
  date:    string;
  status:  string;
  fee:     number;
}

export default function ReceptionistBilling() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    fetch('/api/appointments')
      .then(r => r.json())
      .then(d => { setAppointments(d.appointments || []); setLoading(false); });
  }, []);

  const totalRevenue    = appointments.filter(a => a.status==='completed').reduce((s,a) => s + (a.fee||0), 0);
  const pendingBilling  = appointments.filter(a => a.status==='confirmed');

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-500 text-sm mt-1">Manage patient billing</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Revenue',  value: `PKR ${totalRevenue.toLocaleString()}`, icon: '💰', color: 'bg-green-50 border-green-200' },
          { label: 'Pending Bills',  value: pendingBilling.length,                  icon: '⏳', color: 'bg-yellow-50 border-yellow-200' },
          { label: 'Completed',      value: appointments.filter(a=>a.status==='completed').length, icon: '✅', color: 'bg-blue-50 border-blue-200' },
        ].map(s => (
          <div key={s.label} className={`${s.color} border rounded-2xl p-4`}>
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-pink-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">All Billing Records</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {appointments.map(apt => (
              <div key={apt._id} className="flex items-center gap-3 p-4 hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{apt.patient?.name}</p>
                  <p className="text-xs text-gray-500">Dr. {apt.doctor?.name} · {apt.date}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                  apt.status==='completed' ? 'bg-green-100 text-green-700' :
                  apt.status==='confirmed' ? 'bg-blue-100 text-blue-700'  :
                  'bg-gray-100 text-gray-600'
                }`}>{apt.status}</span>
                <span className="font-bold text-green-600 text-sm flex-shrink-0">
                  PKR {apt.fee || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}