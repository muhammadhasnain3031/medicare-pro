'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function NurseDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/appointments')
      .then(r => r.json())
      .then(d => setAppointments(d.appointments || []));
  }, []);

  const today   = new Date().toISOString().split('T')[0];
  const todayA  = appointments.filter(a => a.date === today);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          Welcome, {user?.name?.split(' ')[0]} 👩‍⚕️
        </h1>
        <p className="text-gray-500 text-sm mt-1">Nurse Dashboard</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Today's Patients",  value: todayA.length,        icon: '🤒', color: 'bg-teal-50 border-teal-200'   },
          { label: 'Total Patients',    value: appointments.length,  icon: '📋', color: 'bg-blue-50 border-blue-200'   },
          { label: 'Vitals Recorded',   value: 0,                    icon: '💉', color: 'bg-purple-50 border-purple-200'},
          { label: 'Notes Added',       value: 0,                    icon: '📝', color: 'bg-green-50 border-green-200' },
        ].map(s => (
          <div key={s.label} className={`${s.color} border rounded-2xl p-4`}>
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'View Patients',    href: '/nurse/patients',     icon: '🤒', color: 'bg-teal-600'   },
          { label: 'Record Vitals',    href: '/nurse/vitals',       icon: '💉', color: 'bg-blue-600'   },
          { label: 'Appointments',     href: '/nurse/appointments', icon: '📅', color: 'bg-purple-600' },
          { label: 'Nurse Notes',      href: '/nurse/notes',        icon: '📝', color: 'bg-green-600'  },
        ].map(a => (
          <Link key={a.label} href={a.href}
            className={`${a.color} text-white rounded-2xl p-4 text-center hover:opacity-90 transition-opacity`}>
            <p className="text-2xl mb-1">{a.icon}</p>
            <p className="text-xs font-semibold">{a.label}</p>
          </Link>
        ))}
      </div>

      {/* Today's patients */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-bold text-gray-900 mb-4">Today's Patients</h3>
        {todayA.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-3xl mb-2">🏥</p>
            <p className="text-sm">No patients today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayA.map((apt: any) => (
              <div key={apt._id} className="flex items-center gap-3 p-3 bg-teal-50 rounded-xl border border-teal-100">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 font-bold flex-shrink-0">
                  {apt.patient?.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{apt.patient?.name}</p>
                  <p className="text-xs text-gray-500">{apt.time} · {apt.type}</p>
                </div>
                <Link href={`/nurse/vitals?patientId=${apt.patient?._id}`}
                  className="px-3 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700 transition-colors flex-shrink-0">
                  Record Vitals
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}