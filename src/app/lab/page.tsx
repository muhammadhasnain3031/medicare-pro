'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface LabTest {
  _id: string;
  patient: { name: string };
  testName: string;
  status: string;
  priority: string;
  price: number;
  paid: boolean;
  createdAt: string;
}

export default function LabDashboard() {
  const { user }  = useAuth();
  const [tests, setTests]     = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/lab')
      .then(r => r.json())
      .then(d => { setTests(d.tests || []); setLoading(false); });
  }, []);

  const pending    = tests.filter(t => t.status === 'pending');
  const processing = tests.filter(t => t.status === 'processing');
  const completed  = tests.filter(t => t.status === 'completed');
  const unpaid     = tests.filter(t => !t.paid);
  const revenue    = tests.filter(t => t.paid).reduce((s,t) => s + t.price, 0);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">🔬 Lab Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome, {user?.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label:'Total Tests',  value:tests.length,        icon:'🧪', color:'bg-orange-50 border-orange-200' },
          { label:'Pending',      value:pending.length,      icon:'⏳', color:'bg-yellow-50 border-yellow-200' },
          { label:'Processing',   value:processing.length,   icon:'⚙️', color:'bg-blue-50 border-blue-200'   },
          { label:'Completed',    value:completed.length,    icon:'✅', color:'bg-green-50 border-green-200'  },
          { label:'Revenue',      value:`PKR ${(revenue/1000).toFixed(0)}K`, icon:'💰', color:'bg-purple-50 border-purple-200'},
        ].map(s => (
          <div key={s.label} className={`${s.color} border rounded-2xl p-3`}>
            <p className="text-xl mb-1">{s.icon}</p>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label:'All Tests',   href:'/lab/tests',     icon:'🧪', color:'bg-orange-600' },
          { label:'Reports',     href:'/lab/reports',   icon:'📋', color:'bg-blue-600'   },
          { label:'Pending',     href:'/lab/pending',   icon:'⏳', color:'bg-yellow-600' },
          { label:'Completed',   href:'/lab/completed', icon:'✅', color:'bg-green-600'  },
        ].map(a => (
          <Link key={a.label} href={a.href}
            className={`${a.color} text-white rounded-2xl p-4 text-center hover:opacity-90 transition-opacity`}>
            <p className="text-2xl mb-1">{a.icon}</p>
            <p className="text-xs font-semibold">{a.label}</p>
          </Link>
        ))}
      </div>

      {/* Urgent/Emergency Tests */}
      {tests.filter(t => t.priority !== 'normal' && t.status !== 'completed').length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-5">
          <h3 className="font-bold text-red-700 mb-3">🚨 Urgent / Emergency Tests</h3>
          <div className="space-y-2">
            {tests
              .filter(t => t.priority !== 'normal' && t.status !== 'completed')
              .map(test => (
                <div key={test._id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-red-100">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                    test.priority==='emergency' ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'
                  }`}>
                    {test.priority?.toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900">{test.testName}</p>
                    <p className="text-xs text-gray-500">{test.patient?.name}</p>
                  </div>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                    {test.status}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent Tests */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Recent Tests</h3>
          <Link href="/lab/tests" className="text-sm text-orange-600 font-medium">View all →</Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin w-6 h-6 border-4 border-orange-600 border-t-transparent rounded-full" />
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">🧪</p>
            <p className="text-sm mb-3">No tests yet</p>
            <Link href="/lab/tests"
              className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-semibold hover:bg-orange-700 inline-block">
              + Add First Test
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {tests.slice(0, 8).map(test => (
              <div key={test._id} className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">
                  {test.patient?.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{test.testName}</p>
                  <p className="text-xs text-gray-500 truncate">{test.patient?.name}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-semibold text-xs text-green-600">PKR {test.price}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    test.status==='completed'  ? 'bg-green-100 text-green-700'  :
                    test.status==='processing' ? 'bg-blue-100 text-blue-700'   :
                    test.status==='cancelled'  ? 'bg-red-100 text-red-700'     :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {test.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}