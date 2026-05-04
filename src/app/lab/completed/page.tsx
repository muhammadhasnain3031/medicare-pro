'use client';
import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import PaymentModal from '@/components/PaymentModal';

interface LabTest {
  _id:      string;
  patient:  { name: string; phone?: string; bloodGroup?: string };
  testName: string;
  testType: string;
  price:    number;
  status:   string;
  result:   string;
  notes:    string;
  paid:     boolean;
  paymentMethod: string;
  createdAt: string;
}

export default function LabCompleted() {
  const [tests, setTests]           = useState<LabTest[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState<LabTest | null>(null);
  const [paymentTest, setPaymentTest] = useState<LabTest | null>(null);

  const fetchCompleted = async () => {
    setLoading(true);
    // ✅ status filter query use karo
    const res = await fetch('/api/lab?status=completed');
    const d   = await res.json();
    setTests(d.tests || []);
    setLoading(false);
  };

  useEffect(() => { fetchCompleted(); }, []);

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

  const downloadPDF = (test: LabTest) => {
    const doc = new jsPDF();
    doc.setFillColor(234,88,12);
    doc.rect(0,0,220,35,'F');
    doc.setTextColor(255,255,255);
    doc.setFontSize(18);
    doc.setFont('helvetica','bold');
    doc.text('MediCare Pro — Lab Report', 14, 20);
    doc.setFontSize(9);
    doc.setFont('helvetica','normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    doc.setTextColor(0,0,0);
    autoTable(doc, {
      startY: 45,
      head:   [['Field','Details']],
      body:   [
        ['Patient',   test.patient?.name || ''],
        ['Test',      test.testName],
        ['Type',      test.testType?.toUpperCase()],
        ['Date',      new Date(test.createdAt).toLocaleDateString()],
        ['Amount',    `PKR ${test.price}`],
        ['Payment',   test.paid ? `Paid via ${test.paymentMethod}` : 'Pending'],
      ],
      headStyles: { fillColor: [234,88,12], textColor: 255 },
      styles: { fontSize: 9 },
    });
    const y = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont('helvetica','bold');
    doc.text('RESULT:', 14, y);
    doc.setFont('helvetica','normal');
    const lines = doc.splitTextToSize(test.result || 'No result', 180);
    doc.text(lines, 14, y+8);
    doc.save(`report-${test.patient?.name}-${test._id.slice(-4)}.pdf`);
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* List */}
          <div className="space-y-3">
            {tests.map(test => (
              <div key={test._id}
                onClick={() => setSelected(test)}
                className={`bg-white rounded-2xl border-2 p-4 cursor-pointer hover:shadow-md transition-all ${
                  selected?._id === test._id ? 'border-orange-400 shadow-md' : 'border-gray-100'
                }`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 font-bold text-lg flex-shrink-0">
                    {test.patient?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{test.patient?.name}</p>
                    <p className="text-xs text-orange-600 font-medium truncate">{test.testName}</p>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                    ✅ Done
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                  <span>🔬 {test.testType?.toUpperCase()}</span>
                  <span>💰 PKR {test.price}</span>
                  <span className={`font-bold ${test.paid ? 'text-green-600' : 'text-red-500'}`}>
                    {test.paid ? `✅ ${test.paymentMethod}` : '❌ Unpaid'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Detail Panel */}
          {selected ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 h-fit sticky top-6">
              <h3 className="font-bold text-gray-900 mb-4">Report Detail</h3>
              <div className="bg-orange-50 rounded-xl p-3 mb-3">
                <p className="font-semibold text-sm text-gray-900">{selected.testName}</p>
                <p className="text-xs text-gray-500">
                  {selected.patient?.name} · {new Date(selected.createdAt).toLocaleDateString()}
                </p>
              </div>
              {selected.result ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3">
                  <p className="text-xs font-bold text-green-700 mb-2">RESULT</p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {selected.result}
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-3 mb-3 text-center">
                  <p className="text-gray-400 text-sm">No result recorded</p>
                </div>
              )}
              {selected.notes && (
                <div className="bg-yellow-50 rounded-xl p-3 mb-3">
                  <p className="text-xs font-bold text-yellow-700 mb-1">Notes</p>
                  <p className="text-sm text-gray-700">{selected.notes}</p>
                </div>
              )}
              <div className="bg-gray-50 rounded-xl p-3 mb-4 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="font-bold text-lg text-gray-900">PKR {selected.price}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Payment</p>
                  <p className={`font-bold text-sm ${selected.paid ? 'text-green-600' : 'text-red-500'}`}>
                    {selected.paid ? `✅ ${selected.paymentMethod}` : '❌ Pending'}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <button onClick={() => downloadPDF(selected)}
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-sm transition-colors">
                  📄 Download PDF Report
                </button>
                {!selected.paid && (
                  <button onClick={() => setPaymentTest(selected)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors">
                    💳 Pay Now
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
              <p className="text-3xl mb-2">👆</p>
              <p className="text-sm">Select a test to view report</p>
            </div>
          )}
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