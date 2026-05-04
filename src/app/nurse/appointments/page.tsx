'use client';
import { useEffect, useState } from 'react';

export default function NurseAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    fetch('/api/appointments')
      .then(r => r.json())
      .then(d => { setAppointments(d.appointments || []); setLoading(false); });
  }, []);

  const today    = new Date().toISOString().split('T')[0];
  const todayApts = appointments.filter(a => a.date === today);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">📅 Appointments</h1>
        <p className="text-gray-500 text-sm mt-1">Today: {todayApts.length} · Total: {appointments.length}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt: any) => (
            <div key={apt._id} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 font-bold flex-shrink-0">
                  {apt.patient?.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900">{apt.patient?.name}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-0.5">
                    <span>👨‍⚕️ Dr. {apt.doctor?.name}</span>
                    <span>📅 {apt.date}</span>
                    <span>⏰ {apt.time}</span>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                  apt.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                  apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {apt.status}
                </span>
              </div>
            </div>
          ))}
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