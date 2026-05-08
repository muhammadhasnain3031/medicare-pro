'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface Stats {
  total: number; lowStock: number;
  expirySoon: number; expired: number; totalValue: number;
}

interface Medicine {
  _id: string; name: string; stock: number;
  minStock: number; salePrice: number; expiryDate: string; category: string;
}

export default function PharmacyDashboard() {
  const { user }  = useAuth();
  const [stats, setStats]     = useState<Stats | null>(null);
  const [lowMeds, setLowMeds] = useState<Medicine[]>([]);
  const [expMeds, setExpMeds] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/pharmacy/medicines?alert=low').then(r => r.json()),
      fetch('/api/pharmacy/medicines?alert=expiry').then(r => r.json()),
    ]).then(([low, exp]) => {
      setStats(low.stats);
      setLowMeds(low.medicines || []);
      setExpMeds(exp.medicines || []);
      setLoading(false);
    });
  }, []);

  const daysUntilExpiry = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">💊 Pharmacy Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome, {user?.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total Medicines', value: stats?.total || 0,           icon: '💊', color: 'bg-green-50 border-green-200'  },
          { label: 'Low Stock',       value: stats?.lowStock || 0,        icon: '⚠️', color: 'bg-yellow-50 border-yellow-200'},
          { label: 'Expiring Soon',   value: stats?.expirySoon || 0,      icon: '📅', color: 'bg-orange-50 border-orange-200'},
          { label: 'Expired',         value: stats?.expired || 0,         icon: '🚨', color: 'bg-red-50 border-red-200'     },
          { label: 'Stock Value',     value: `PKR ${((stats?.totalValue||0)/1000).toFixed(0)}K`, icon: '💰', color: 'bg-blue-50 border-blue-200'},
        ].map(s => (
          <div key={s.label} className={`${s.color} border rounded-2xl p-4`}>
            <p className="text-xl mb-1">{s.icon}</p>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Add Medicine',   href: '/pharmacy/stock',   icon: '➕', color: 'bg-green-600'  },
          { label: 'Create Bill',    href: '/pharmacy/billing', icon: '💰', color: 'bg-blue-600'   },
          { label: 'View Bills',     href: '/pharmacy/bills',   icon: '📋', color: 'bg-purple-600' },
          { label: 'View Alerts',    href: '/pharmacy/alerts',  icon: '🚨', color: 'bg-red-600'    },
        ].map(a => (
          <Link key={a.label} href={a.href}
            className={`${a.color} text-white rounded-2xl p-4 text-center hover:opacity-90 transition-opacity`}>
            <p className="text-2xl mb-1">{a.icon}</p>
            <p className="text-xs font-semibold">{a.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Low Stock Alert */}
        <div className="bg-white rounded-2xl border border-yellow-200 overflow-hidden">
          <div className="bg-yellow-50 px-4 py-3 border-b border-yellow-200 flex items-center justify-between">
            <h3 className="font-bold text-yellow-800 text-sm">⚠️ Low Stock Alert ({lowMeds.length})</h3>
            <Link href="/pharmacy/alerts" className="text-xs text-yellow-700 font-semibold">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-6 h-6 border-4 border-yellow-500 border-t-transparent rounded-full" />
              </div>
            ) : lowMeds.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-2xl mb-1">✅</p>
                <p className="text-xs">All stock levels OK</p>
              </div>
            ) : lowMeds.map(med => (
              <div key={med._id} className="flex items-center gap-3 p-3 hover:bg-yellow-50">
                <div className="w-9 h-9 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600 font-bold text-sm flex-shrink-0">
                  💊
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{med.name}</p>
                  <p className="text-xs text-gray-500">PKR {med.salePrice}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-red-600 text-sm">{med.stock} left</p>
                  <p className="text-xs text-gray-400">Min: {med.minStock}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expiry Alert */}
        <div className="bg-white rounded-2xl border border-red-200 overflow-hidden">
          <div className="bg-red-50 px-4 py-3 border-b border-red-200 flex items-center justify-between">
            <h3 className="font-bold text-red-800 text-sm">🚨 Expiry Alert ({expMeds.length})</h3>
            <Link href="/pharmacy/alerts" className="text-xs text-red-700 font-semibold">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-6 h-6 border-4 border-red-500 border-t-transparent rounded-full" />
              </div>
            ) : expMeds.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-2xl mb-1">✅</p>
                <p className="text-xs">No expiry issues</p>
              </div>
            ) : expMeds.map(med => {
              const days = daysUntilExpiry(med.expiryDate);
              return (
                <div key={med._id} className="flex items-center gap-3 p-3 hover:bg-red-50">
                  <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center text-red-600 font-bold text-sm flex-shrink-0">
                    ⏰
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{med.name}</p>
                    <p className="text-xs text-gray-500">Exp: {med.expiryDate}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-bold text-sm ${days < 0 ? 'text-red-700' : days < 15 ? 'text-orange-600' : 'text-yellow-600'}`}>
                      {days < 0 ? 'Expired!' : `${days}d left`}
                    </p>
                    <p className="text-xs text-gray-400">Stock: {med.stock}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}