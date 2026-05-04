'use client';
import { useEffect, useState } from 'react';
import PaymentModal from '@/components/PaymentModal';

interface LabTest {
  _id:      string;
  patient:  { name: string; phone: string; bloodGroup?: string };
  testName: string;
  testType: string;
  price:    number;
  status:   string;
  priority: string;
  result:   string;
  notes:    string;
  paid:     boolean;
  paymentMethod: string;
  createdAt: string;
}

export default function LabPending() {
  const [tests, setTests]           = useState<LabTest[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [selected, setSelected]     = useState<LabTest | null>(null);
  const [paymentTest, setPaymentTest] = useState<LabTest | null>(null);
  const [resultForm, setResultForm] = useState({ result: '', notes: '' });
  const [saving, setSaving]         = useState(false);

  const fetchTests = async () => {
    setLoading(true);
    const res = await fetch('/api/lab');
    const d   = await res.json();
    // pending + processing dono dikhao
    setTests((d.tests || []).filter((t: LabTest) =>
      t.status === 'pending' || t.status === 'processing'
    ));
    setLoading(false);
  };

  useEffect(() => { fetchTests(); }, []);

  const updateStatus = async (id: string, status: string) => {
    setTests(prev => prev.map(t => t._id === id ? { ...t, status } : t));
    const res = await fetch(`/api/lab/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status }),
    });
    const d = await res.json();
    if (d.test) setTests(prev => prev.map(t => t._id === id ? d.test : t));
  };

  const handleSaveResult = async () => {
    if (!selected || !resultForm.result.trim()) return;
    setSaving(true);
    // Optimistic
    setTests(prev => prev.map(t =>
      t._id === selected._id
        ? { ...t, result: resultForm.result, status: 'completed' }
        : t
    ));
    const res = await fetch(`/api/lab/${selected._id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        result: resultForm.result,
        notes:  resultForm.notes,
        status: 'completed',
      }),
    });
    const d = await res.json();
    if (d.test) {
      setTests(prev => prev.filter(t => t._id !== selected._id)); // remove from pending
    }
    setShowResult(false);
    setSelected(null);
    setResultForm({ result: '', notes: '' });
    setSaving(false);
  };

  const handlePayment = async (method: string) => {
    if (!paymentTest) return;
    setTests(prev => prev.map(t =>
      t._id === paymentTest._id ? { ...t, paid: true, paymentMethod: method } : t
    ));
    await fetch(`/api/lab/${paymentTest._id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ paid: true, paymentMethod: method }),
    });
    setPaymentTest(null);
  };

  const inp = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500";

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">⏳ Pending & Processing Tests</h1>
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
            <div key={test._id} className={`bg-white rounded-2xl border-2 p-4 transition-shadow hover:shadow-md ${
              test.status === 'processing' ? 'border-blue-200' : 'border-yellow-200'
            }`}>
              <div className="flex flex-col md:flex-row md:items-start gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-bold text-lg flex-shrink-0">
                    {test.patient?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-semibold text-sm text-gray-900">{test.patient?.name}</p>
                      {test.patient?.bloodGroup && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                          {test.patient.bloodGroup}
                        </span>
                      )}
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        test.priority === 'emergency' ? 'bg-red-100 text-red-700' :
                        test.priority === 'urgent'    ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {test.priority}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        test.status === 'processing' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {test.status === 'processing' ? '⚙️ Processing' : '⏳ Pending'}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-800 text-sm mb-1">{test.testName}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span>🔬 {test.testType?.toUpperCase()}</span>
                      <span>💰 PKR {test.price}</span>
                      <span>📅 {new Date(test.createdAt).toLocaleDateString()}</span>
                      <span className={`font-bold ${test.paid ? 'text-green-600' : 'text-red-500'}`}>
                        {test.paid ? `✅ Paid · ${test.paymentMethod}` : '❌ Unpaid'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-row md:flex-col gap-2 flex-wrap md:flex-nowrap flex-shrink-0">
                  {test.status === 'pending' && (
                    <button onClick={() => updateStatus(test._id, 'processing')}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors">
                      ▶ Start Test
                    </button>
                  )}
                  {test.status === 'processing' && (
                    <>
                      <button onClick={() => {
                        setSelected(test);
                        setResultForm({ result: test.result || '', notes: test.notes || '' });
                        setShowResult(true);
                      }}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-colors">
                        ✅ Add Result
                      </button>
                      <button onClick={() => updateStatus(test._id, 'completed')}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors">
                        Mark Done
                      </button>
                    </>
                  )}
                  {!test.paid ? (
                    <button onClick={() => setPaymentTest(test)}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors">
                      💳 Pay
                    </button>
                  ) : (
                    <span className="px-3 py-2 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-xl text-center">
                      ✅ {test.paymentMethod}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Result Modal */}
      {showResult && selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">✅ Add Test Result</h3>
              <button onClick={() => { setShowResult(false); setSelected(null); }}
                className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">✕</button>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4">
              <p className="font-semibold text-sm text-gray-900">{selected.testName}</p>
              <p className="text-xs text-gray-500">Patient: {selected.patient?.name}</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Result *</label>
                <textarea value={resultForm.result}
                  onChange={e => setResultForm({ ...resultForm, result: e.target.value })}
                  rows={5} placeholder="Enter test results..."
                  className={`${inp} resize-none`} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes</label>
                <textarea value={resultForm.notes}
                  onChange={e => setResultForm({ ...resultForm, notes: e.target.value })}
                  rows={2} placeholder="Additional notes..."
                  className={`${inp} resize-none`} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setShowResult(false); setSelected(null); }}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleSaveResult} disabled={saving || !resultForm.result.trim()}
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-colors">
                  {saving ? '⏳ Saving...' : '✅ Save & Complete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {paymentTest && (
        <PaymentModal
          amount={paymentTest.price}
          title={`Pay: ${paymentTest.testName}`}
          onPay={handlePayment}
          onClose={() => setPaymentTest(null)}
        />
      )}
    </div>
  );
}