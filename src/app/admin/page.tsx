'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import StatsCard from '@/components/StatsCard';
import { useAuth } from '@/context/AuthContext';

interface Stats {
  totalPatients:       number;
  totalDoctors:        number;
  totalAppointments:   number;
  pendingAppointments: number;
  todayAppointments:   number;
  revenue:             number;
  last7Days:           { date: string; appointments: number }[];
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats]     = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Good morning, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's what's happening in your hospital today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatsCard title="Total Patients"  value={stats?.totalPatients || 0}       icon="🤒" color="bg-blue-100"   change="+12%" />
        <StatsCard title="Total Doctors"   value={stats?.totalDoctors || 0}        icon="👨‍⚕️" color="bg-purple-100" change="+3%"  />
        <StatsCard title="Today's Appts"   value={stats?.todayAppointments || 0}   icon="📅" color="bg-green-100"  change="+8%"  />
        <StatsCard title="Revenue (PKR)"   value={`${((stats?.revenue||0)/1000).toFixed(0)}K`} icon="💰" color="bg-yellow-100" change="+15%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Chart */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Appointments — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats?.last7Days || []} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '13px' }} />
              <Bar dataKey="appointments" fill="#2563eb" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Stats */}
        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Overview</h3>
          <div className="space-y-4">
            {[
              { label: 'Total Appointments', value: stats?.totalAppointments || 0,  color: 'bg-blue-500'   },
              { label: 'Pending Review',      value: stats?.pendingAppointments || 0, color: 'bg-yellow-500' },
              { label: 'Completed Today',     value: stats?.todayAppointments || 0,  color: 'bg-green-500'  },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 ${s.color} rounded-full`} />
                <span className="text-sm text-gray-600 flex-1">{s.label}</span>
                <span className="text-sm font-bold text-gray-900">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}