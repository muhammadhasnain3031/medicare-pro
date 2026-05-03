'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import StatsCard from '@/components/StatsCard';
import Link from 'next/link';

interface Appointment {
  _id:      string;
  patient:  { name: string; bloodGroup: string; phone: string };
  date:     string;
  time:     string;
  status:   string;
  type:     string;
  symptoms: string;
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    fetch('/api/appointments')
      .then(r => r.json())
      .then(d => { setAppointments(d.appointments || []); setLoading(false); });
  }, []);

  const today       = new Date().toISOString().split('T')[0];
  const todayApts   = appointments.filter(a => a.date === today);
  const pending     = appointments.filter(a => a.status === 'pending');
  const completed   = appointments.filter(a => a.status === 'completed');

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, Dr. {user?.name?.split(' ').slice(-1)[0]} 👨‍⚕️
        </h1>
        <p className="text-gray-500 mt-1">{user?.specialization || 'General Physician'}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatsCard title="Today's Patients" value={todayApts.length}       icon="📅" color="bg-blue-100"  />
        <StatsCard title="Pending"           value={pending.length}         icon="⏳" color="bg-yellow-100"/>
        <StatsCard title="Completed"         value={completed.length}       icon="✅" color="bg-green-100" />
        <StatsCard title="Total Patients"    value={appointments.length}    icon="🤒" color="bg-purple-100"/>
      </div>

      {/* Today's appointments */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-gray-900">Today's Schedule</h3>
          <Link href="/doctor/appointments" className="text-sm text-blue-600 font-medium hover:underline">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : todayApts.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-3xl mb-2">🎉</p>
            <p className="text-sm">No appointments today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayApts.map(apt => (
              <div key={apt._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg">
                  {apt.patient?.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{apt.patient?.name}</p>
                  <p className="text-xs text-gray-500">{apt.symptoms || 'General checkup'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{apt.time}</p>
                  <p className="text-xs text-gray-500 capitalize">{apt.type}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  apt.status === 'confirmed' ? 'badge-info' :
                  apt.status === 'completed' ? 'badge-success' : 'badge-warning'
                }`}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}