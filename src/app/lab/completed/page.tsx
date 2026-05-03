'use client';
import { useEffect, useState } from 'react';

interface LabTest {
  _id: string;
  patient: { name: string };
  testName: string;
  testType: string;
  price: number;
  result: string;
  paid: boolean;
  paymentMethod: string;
  createdAt: string;
}

export default function LabCompleted() {
  const [tests, setTests]     = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/lab?status=completed')
      .then(r => r.json())
      .then(d => { setTests(d.tests || []); setLoading(false); });
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">✅ Completed Tests</h1>
        <p className="text-gray-500 text-sm mt-1">{tests.length} completed</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full" />
        </div>
      ) : tests.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 text-gray-400">
          <p className="text-4xl mb-2">🧪</p>
          <p>No completed tests yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tests.map(test => (
            <div key={test._id} className="bg-white rounded-2xl border border-green-200 p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 font-bold flex-shrink-0">
                  {test.patient?.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900">{test.patient?.name}</p>
                  <p className="text-sm text-gray-700 font-medium mb-1">{test.testName}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-2">
                    <span>🔬 {test.testType?.toUpperCase()}</span>
                    <span>💰 PKR {test.price}</span>
                    <span>📅 {new Date(test.createdAt).toLocaleDateString()}</span>
                    <span className={`font-semibold ${test.paid ? 'text-green-600' : 'text-red-500'}`}>
                      {test.paid ? `✅ ${test.paymentMethod}` : '❌ Unpaid'}
                    </span>
                  </div>
                  {test.result && (
                    <div className="bg-green-50 rounded-xl p-2.5">
                      <p className="text-xs font-semibold text-green-700 mb-1">Result:</p>
                      <p className="text-xs text-gray-700 line-clamp-3">{test.result}</p>
                    </div>
                  )}
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold flex-shrink-0">
                  ✅ Done
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}