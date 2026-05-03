'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Appointment {
  _id:    string;
  patient: { name: string; phone: string };
  doctor:  { name: string; specialization: string };
  date:   string;
  time:   string;
  status: string;
  type:   string;
}

export default function ReceptionistDashboard() {
  const { user }  = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    fetch('/api/appointments')
      .then(r => r.json())
      .then(d => { setAppointments(d.appointments || []); setLoading(false); });
  }, []);

  const today   = new Date().toISOString().split('T')[0];
  const todayA  = appointments.filter(a => a.date === today);
  const pending = appointments.filter(a => a.status === 'pending');

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          Welcome, {user?.name?.split(' ')[0]} 💁
        </h1>
        <p className="text-gray-500 text-sm mt-1">Receptionist Dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Today's Appointments", value: todayA.length,       icon: '📅', color: 'bg-pink-50 border-pink-200' },
          { label: 'Pending Confirmation', value: pending.length,      icon: '⏳', color: 'bg-yellow-50 border-yellow-200' },
          { label: 'Total Appointments',   value: appointments.length, icon: '🗓️', color: 'bg-blue-50 border-blue-200' },
          { label: 'Confirmed',            value: appointments.filter(a => a.status==='confirmed').length, icon: '✅', color: 'bg-green-50 border-green-200' },
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
          { label: 'Book Appointment', href: '/receptionist/book',         icon: '➕', color: 'bg-pink-600' },
          { label: 'View Patients',    href: '/receptionist/patients',      icon: '🤒', color: 'bg-blue-600' },
          { label: 'All Appointments', href: '/receptionist/appointments',  icon: '📅', color: 'bg-purple-600' },
          { label: 'Billing',          href: '/receptionist/billing',       icon: '💰', color: 'bg-green-600' },
        ].map(a => (
          <Link key={a.label} href={a.href}
            className={`${a.color} text-white rounded-2xl p-4 text-center hover:opacity-90 transition-opacity`}>
            <p className="text-2xl mb-1">{a.icon}</p>
            <p className="text-xs font-semibold">{a.label}</p>
          </Link>
        ))}
      </div>

      {/* Today's Appointments */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Today's Schedule</h3>
          <Link href="/receptionist/appointments" className="text-sm text-pink-600 font-medium">View all →</Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin w-6 h-6 border-4 border-pink-600 border-t-transparent rounded-full" />
          </div>
        ) : todayA.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-3xl mb-2">📅</p>
            <p className="text-sm">No appointments today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayA.map(apt => (
              <div key={apt._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600 font-bold flex-shrink-0">
                  {apt.patient?.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{apt.patient?.name}</p>
                  <p className="text-xs text-gray-500">Dr. {apt.doctor?.name} · {apt.time}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                  apt.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                  apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>{apt.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}