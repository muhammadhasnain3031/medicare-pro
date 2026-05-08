'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function BillingDashboard() {
  const [stats, setStats]       = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch('/api/billing/invoices')
      .then(r => r.json())
      .then(d => {
        setStats(d.stats);
        setInvoices(d.invoices || []);
        setLoading(false);
      });
  }, []);

  const recent  = invoices.slice(0, 6);
  const overdue = invoices.filter(i => i.status === 'overdue' || (i.dueAmount > 0 && i.status !== 'paid'));

  const STATUS_COLOR: Record<string, string> = {
    paid:      'bg-green-100 text-green-700',
    partial:   'bg-blue-100 text-blue-700',
    overdue:   'bg-red-100 text-red-700',
    sent:      'bg-yellow-100 text-yellow-700',
    draft:     'bg-gray-100 text-gray-600',
    cancelled: 'bg-gray-100 text-gray-400',
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">💰 Billing Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Complete financial overview</p>
        </div>
        <Link href="/billing/create"
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors text-center">
          + New Invoice
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label:'Total Invoiced', value:`PKR ${((stats?.totalAmount||0)/1000).toFixed(1)}K`, icon:'📋', color:'bg-blue-50 border-blue-200',   text:'text-blue-700'   },
          { label:'Total Collected',value:`PKR ${((stats?.totalPaid||0)/1000).toFixed(1)}K`,   icon:'✅', color:'bg-green-50 border-green-200', text:'text-green-700'  },
          { label:'Outstanding Dues',value:`PKR ${((stats?.totalDue||0)/1000).toFixed(1)}K`,   icon:'⚠️', color:'bg-yellow-50 border-yellow-200',text:'text-yellow-700' },
          { label:'Overdue Invoices',value:stats?.overdueCount || 0,                           icon:'🚨', color:'bg-red-50 border-red-200',     text:'text-red-700'    },
        ].map(s => (
          <div key={s.label} className={`${s.color} border rounded-2xl p-4`}>
            <p className="text-2xl mb-2">{s.icon}</p>
            <p className={`text-xl font-black ${s.text}`}>{s.value}</p>
            <p className="text-xs text-gray-600 font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label:'Create Invoice', href:'/billing/create',   icon:'➕', color:'bg-blue-600'   },
          { label:'All Invoices',   href:'/billing/invoices', icon:'📋', color:'bg-purple-600' },
          { label:'Dues & Overdue', href:'/billing/dues',     icon:'⚠️', color:'bg-red-600'    },
          { label:'Reports',        href:'/billing/reports',  icon:'📈', color:'bg-green-600'  },
        ].map(a => (
          <Link key={a.label} href={a.href}
            className={`${a.color} text-white rounded-2xl p-4 text-center hover:opacity-90 transition-opacity`}>
            <p className="text-2xl mb-1">{a.icon}</p>
            <p className="text-xs font-semibold">{a.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent Invoices */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm">📋 Recent Invoices</h3>
            <Link href="/billing/invoices" className="text-xs text-blue-600 font-medium">View all →</Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : recent.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm mb-3">No invoices yet</p>
              <Link href="/billing/create" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold">
                Create First Invoice
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recent.map(inv => (
                <Link key={inv._id} href={`/billing/invoices/${inv._id}`}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                    {inv.patient?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{inv.patient?.name}</p>
                    <p className="text-xs text-gray-400">{inv.invoiceNumber}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm text-gray-900">PKR {inv.totalAmount?.toLocaleString()}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[inv.status]}`}>
                      {inv.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Overdue Dues */}
        <div className="bg-white rounded-2xl border border-red-100 overflow-hidden">
          <div className="bg-red-50 flex items-center justify-between p-4 border-b border-red-100">
            <h3 className="font-bold text-red-800 text-sm">🚨 Outstanding Dues ({overdue.length})</h3>
            <Link href="/billing/dues" className="text-xs text-red-700 font-medium">View all →</Link>
          </div>
          {overdue.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">✅</p>
              <p className="text-sm">No outstanding dues!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
              {overdue.slice(0, 5).map(inv => (
                <Link key={inv._id} href={`/billing/invoices/${inv._id}`}
                  className="flex items-center gap-3 p-3 hover:bg-red-50 transition-colors">
                  <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center text-red-600 font-bold text-sm flex-shrink-0">
                    {inv.patient?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{inv.patient?.name}</p>
                    <p className="text-xs text-gray-400">Due: {inv.dueDate || 'N/A'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-red-600 text-sm">PKR {inv.dueAmount?.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">due</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}