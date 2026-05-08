'use client';
import { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, AreaChart, Area,
} from 'recharts';

interface Analytics {
  overview:    any;
  last7Days:   any[];
  last6Months: any[];
  typeData:    any[];
  topDoctors:  any[];
  newPatients: any[];
}

const COLORS = ['#2563eb','#16a34a','#d97706','#dc2626','#7c3aed','#0891b2'];

const TYPE_COLORS: Record<string, string> = {
  checkup:      '#2563eb',
  followup:     '#16a34a',
  consultation: '#d97706',
  emergency:    '#dc2626',
};

export default function AnalyticsDashboard() {
  const [data, setData]       = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod]   = useState<'7days' | '6months'>('7days');

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading analytics...</p>
      </div>
    </div>
  );

  if (!data) return null;

  const { overview } = data;

  const kpiCards = [
    { label:'Total Revenue',      value:`PKR ${(overview.totalRevenue/1000).toFixed(1)}K`, icon:'💰', color:'bg-green-50 border-green-200', text:'text-green-700',  sub:`Today: PKR ${overview.todayRevenue}` },
    { label:'Total Patients',     value:overview.totalPatients,   icon:'🤒', color:'bg-blue-50 border-blue-200',   text:'text-blue-700',   sub:'Registered'       },
    { label:'Total Appointments', value:overview.totalAppointments,icon:'📅', color:'bg-purple-50 border-purple-200',text:'text-purple-700', sub:`Today: ${overview.todayApts}` },
    { label:'Completion Rate',    value:`${overview.completionRate}%`, icon:'✅', color:'bg-teal-50 border-teal-200',   text:'text-teal-700',   sub:'Appointment rate' },
    { label:'Total Doctors',      value:overview.totalDoctors,    icon:'👨‍⚕️', color:'bg-indigo-50 border-indigo-200',text:'text-indigo-700', sub:'Active staff'     },
    { label:'Prescriptions',      value:overview.totalPrescriptions,icon:'💊', color:'bg-orange-50 border-orange-200',text:'text-orange-700', sub:'Total issued'     },
  ];

  const chartData = period === '7days' ? data.last7Days : data.last6Months;
  const xKey      = period === '7days' ? 'date' : 'month';

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">📊 Analytics Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Hospital performance overview</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPeriod('7days')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              period === '7days' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
            }`}>
            Last 7 Days
          </button>
          <button onClick={() => setPeriod('6months')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              period === '6months' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
            }`}>
            6 Months
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {kpiCards.map(card => (
          <div key={card.label} className={`${card.color} border rounded-2xl p-4`}>
            <p className="text-xl mb-2">{card.icon}</p>
            <p className={`text-xl font-black ${card.text}`}>{card.value}</p>
            <p className="text-xs font-semibold text-gray-700 mt-1">{card.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4 text-sm">
            💰 Revenue — {period === '7days' ? 'Last 7 Days' : 'Last 6 Months'}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={xKey} tick={{ fontSize:11, fill:'#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'12px', fontSize:'12px' }}
                formatter={(val: any) => [`PKR ${val.toLocaleString()}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Appointments Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4 text-sm">
            📅 Appointments — {period === '7days' ? 'Last 7 Days' : 'Last 6 Months'}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={xKey} tick={{ fontSize:11, fill:'#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'12px', fontSize:'12px' }} />
              <Bar dataKey="appointments" fill="#7c3aed" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

        {/* Appointment Types */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4 text-sm">🏥 Appointment Types</h3>
          {data.typeData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400">
              <p className="text-sm">No data yet</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={data.typeData} dataKey="count" nameKey="type"
                    cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                    {data.typeData.map((entry, i) => (
                      <Cell key={i} fill={TYPE_COLORS[entry.type] || COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', fontSize:'12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {data.typeData.map((entry, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: TYPE_COLORS[entry.type] || COLORS[i % COLORS.length] }} />
                    <span className="text-gray-600 capitalize">{entry.type}</span>
                    <span className="font-bold text-gray-900">({entry.count})</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* New Patients */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4 text-sm">👥 New Patients (6 Months)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.newPatients} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'12px', fontSize:'12px' }} />
              <Bar dataKey="count" fill="#16a34a" radius={[6,6,0,0]} name="New Patients" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Appointment Status */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4 text-sm">📊 Appointment Status</h3>
          <div className="space-y-3">
            {[
              { label:'Completed', value:overview.completedApts,  color:'bg-green-500',  pct: overview.totalAppointments > 0 ? (overview.completedApts/overview.totalAppointments)*100 : 0 },
              { label:'Pending',   value:overview.pendingApts,    color:'bg-yellow-500', pct: overview.totalAppointments > 0 ? (overview.pendingApts/overview.totalAppointments)*100 : 0   },
              { label:'Cancelled', value:overview.cancelledApts,  color:'bg-red-500',    pct: overview.totalAppointments > 0 ? (overview.cancelledApts/overview.totalAppointments)*100 : 0  },
            ].map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-600 font-medium">{s.label}</span>
                  <span className="font-bold text-gray-900">{s.value} ({Math.round(s.pct)}%)</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${s.color} rounded-full transition-all duration-700`}
                    style={{ width: `${Math.max(s.pct, s.value > 0 ? 3 : 0)}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Today quick stats */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">Today</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-xl font-black text-blue-700">{overview.todayApts}</p>
                <p className="text-xs text-blue-600 mt-0.5">Appointments</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-lg font-black text-green-700">PKR {(overview.todayRevenue/1000).toFixed(1)}K</p>
                <p className="text-xs text-green-600 mt-0.5">Revenue</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Doctors Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">🏆 Top Performing Doctors</h3>
          <span className="text-xs text-gray-400">By completed appointments</span>
        </div>
        {data.topDoctors.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">👨‍⚕️</p>
            <p className="text-sm">No completed appointments yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {data.topDoctors.map((doc, i) => (
              <div key={i} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0 ${
                  i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-600' : 'bg-blue-500'
                }`}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                  {doc.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{doc.name}</p>
                  <p className="text-xs text-blue-600">{doc.specialization}</p>
                </div>
                <div className="text-center flex-shrink-0">
                  <p className="font-bold text-gray-900 text-sm">{doc.appointments}</p>
                  <p className="text-xs text-gray-400">patients</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-green-600 text-sm">PKR {(doc.revenue/1000).toFixed(1)}K</p>
                  <p className="text-xs text-gray-400">revenue</p>
                </div>
                {/* Performance bar */}
                <div className="w-20 hidden md:block">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${data.topDoctors[0]?.appointments > 0 ? (doc.appointments/data.topDoctors[0].appointments)*100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}