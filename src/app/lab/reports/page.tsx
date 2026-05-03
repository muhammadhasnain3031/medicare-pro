'use client';
import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface LabTest {
  _id:      string;
  patient:  { name: string; phone: string; bloodGroup: string };
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

export default function LabReports() {
  const [tests, setTests]       = useState<LabTest[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<LabTest | null>(null);

  useEffect(() => {
    fetch('/api/lab')
      .then(r => r.json())
      .then(d => {
        const completed = (d.tests || []).filter((t: LabTest) => t.status === 'completed');
        setTests(completed);
        setLoading(false);
      });
  }, []);

  const downloadPDF = (test: LabTest) => {
    const doc = new jsPDF();
    doc.setFillColor(234, 88, 12);
    doc.rect(0, 0, 220, 35, 'F');
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
      head: [['Field','Details']],
      body: [
        ['Patient',   test.patient?.name || ''],
        ['Test Name', test.testName],
        ['Test Type', test.testType?.toUpperCase()],
        ['Date',      new Date(test.createdAt).toLocaleDateString()],
        ['Status',    'COMPLETED'],
        ['Amount',    `PKR ${test.price}`],
        ['Payment',   test.paid ? `Paid via ${test.paymentMethod}` : 'Pending'],
      ],
      headStyles: { fillColor: [234,88,12], textColor: 255 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
      styles: { fontSize: 9 },
    });

    const y = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont('helvetica','bold');
    doc.setFontSize(11);
    doc.text('RESULT:', 14, y);
    doc.setFont('helvetica','normal');
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(test.result || 'No result recorded', 180);
    doc.text(lines, 14, y+8);

    doc.save(`report-${test.patient?.name}-${test._id.slice(-4)}.pdf`);
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">📋 Lab Reports</h1>
        <p className="text-gray-500 text-sm mt-1">{tests.length} completed reports</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* List */}
          <div className="space-y-3">
            {tests.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-400">
                <p className="text-3xl mb-2">📋</p>
                <p>No completed reports yet</p>
              </div>
            ) : tests.map(test => (
              <div key={test._id}
                onClick={() => setSelected(test)}
                className={`bg-white rounded-2xl border-2 p-4 cursor-pointer hover:shadow-md transition-all ${
                  selected?._id === test._id ? 'border-orange-500' : 'border-gray-100'
                }`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-bold">
                    {test.patient?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900">{test.patient?.name}</p>
                    <p className="text-xs text-orange-600 font-medium">{test.testName}</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                    Completed
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{test.testType?.toUpperCase()} · PKR {test.price}</span>
                  <span className={test.paid ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>
                    {test.paid ? `✅ ${test.paymentMethod}` : '❌ Unpaid'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Detail */}
          {selected ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 h-fit sticky top-6">
              <h3 className="font-bold text-gray-900 mb-4">Report Detail</h3>

              <div className="bg-orange-50 rounded-xl p-3 mb-4">
                <p className="font-semibold text-sm text-gray-900">{selected.testName}</p>
                <p className="text-xs text-orange-600">Patient: {selected.patient?.name}</p>
                <p className="text-xs text-gray-500">{new Date(selected.createdAt).toLocaleDateString()}</p>
              </div>

              {selected.result ? (
                <div className="bg-green-50 rounded-xl p-3 mb-4">
                  <p className="text-xs font-semibold text-green-700 mb-2">RESULT</p>
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{selected.result}</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-3 mb-4 text-center">
                  <p className="text-gray-400 text-sm">No result recorded</p>
                </div>
              )}

              {selected.notes && (
                <div className="bg-yellow-50 rounded-xl p-3 mb-4">
                  <p className="text-xs font-semibold text-yellow-700 mb-1">Notes</p>
                  <p className="text-sm text-gray-700">{selected.notes}</p>
                </div>
              )}

              <div className="flex justify-between items-center bg-gray-50 rounded-xl p-3 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="font-bold text-lg text-gray-900">PKR {selected.price}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Payment</p>
                  <p className={`font-semibold text-sm ${selected.paid ? 'text-green-600' : 'text-red-500'}`}>
                    {selected.paid ? `✅ ${selected.paymentMethod}` : '❌ Pending'}
                  </p>
                </div>
              </div>

              <button onClick={() => downloadPDF(selected)}
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm transition-colors">
                📄 Download PDF Report
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 h-fit">
              <p className="text-3xl mb-2">👆</p>
              <p className="text-sm">Select a report to view</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}