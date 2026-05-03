'use client';
import { useEffect, useState } from 'react';

interface LabTest {
  _id: string;
  patient: { name: string; phone: string };
  testName: string;
  testType: string;
  price: number;
  status: string;
  priority: string;
  createdAt: string;
}

export default function LabPending() {
  const [tests, setTests]     = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/lab?status=pending')
      .then(r => r.json())
      .then(d => { setTests(d.tests || []); setLoading(false); });
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/lab/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status }),
    });
    const d = await res.json();
    if (d.test) setTests(prev => prev.filter(t => t._id !== id));
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">⏳ Pending Tests</h1>
        <p className="text-gray-500 text-sm mt-1">{tests.length} tests waiting</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full" />
        </div>
      ) : tests.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 text-gray-400">
          <p className="text-4xl mb-2">✅</p>
          <p>No pending tests!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tests.map(test => (
            <div key={test._id} className="bg-white rounded-2xl border border-yellow-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600 font-bold flex-shrink-0">
                  {test.patient?.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-gray-900">{test.patient?.name}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      test.priority === 'emergency' ? 'bg-red-100 text-red-700' :
                      test.priority === 'urgent'    ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {test.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">{test.testName}</p>
                  <p className="text-xs text-gray-400">{test.testType?.toUpperCase()} · PKR {test.price} · {new Date(test.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => updateStatus(test._id, 'processing')}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                    ▶ Start
                  </button>
                  <button onClick={() => updateStatus(test._id, 'cancelled')}
                    className="px-3 py-1.5 bg-red-50 text-red-500 text-xs font-semibold rounded-xl hover:bg-red-100 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}