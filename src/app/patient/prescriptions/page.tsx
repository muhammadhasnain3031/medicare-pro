'use client';
import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Medicine {
  name: string; dosage: string; duration: string; instructions: string;
}

interface Prescription {
  _id:        string;
  doctor:     { name: string; specialization: string };
  diagnosis:  string;
  medicines:  Medicine[];
  notes:      string;
  aiGenerated: boolean;
  createdAt:  string;
}

// Medicine prices (demo)
const MEDICINE_PRICES: Record<string, number> = {
  default: 150,
};

const getPrice = (name: string) =>
  MEDICINE_PRICES[name.toLowerCase()] || Math.floor(Math.random() * 200) + 50;

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading]             = useState(true);
  const [selected, setSelected]           = useState<Prescription | null>(null);
  const [showBill, setShowBill]           = useState(false);
  const [paymentDone, setPaymentDone]     = useState(false);
  const [payMethod, setPayMethod]         = useState('');

  useEffect(() => {
    fetch('/api/prescriptions')
      .then(r => r.json())
      .then(d => { setPrescriptions(d.prescriptions || []); setLoading(false); });
  }, []);

  // PDF Download
  const downloadPDF = (rx: Prescription) => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 220, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('MediCare Pro', 14, 15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Hospital Management System', 14, 23);
    doc.text(`Date: ${new Date(rx.createdAt).toLocaleDateString()}`, 140, 23);

    // Patient & Doctor Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('PRESCRIPTION', 14, 45);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Doctor: ${rx.doctor?.name}`, 14, 55);
    doc.text(`Specialization: ${rx.doctor?.specialization}`, 14, 62);
    doc.text(`Diagnosis: ${rx.diagnosis}`, 14, 69);

    // Medicines Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Prescribed Medicines', 14, 82);

    autoTable(doc, {
      startY: 87,
      head: [['Medicine', 'Dosage', 'Duration', 'Instructions']],
      body: rx.medicines.map(m => [m.name, m.dosage, m.duration, m.instructions || 'As directed']),
      headStyles:  { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 255] },
      styles: { fontSize: 9, cellPadding: 4 },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Notes
    if (rx.notes) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text("Doctor's Notes:", 14, finalY);
      doc.setFont('helvetica', 'normal');
      doc.text(rx.notes, 14, finalY + 7);
    }

    // Footer
    doc.setFillColor(245, 247, 255);
    doc.rect(0, 275, 220, 25, 'F');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('MediCare Pro — Your Health, Our Priority', 14, 284);
    doc.text('This is a computer-generated prescription', 14, 290);

    doc.save(`prescription-${rx._id.slice(-6)}.pdf`);
  };

  // Bill PDF
  const downloadBill = (rx: Prescription) => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, 220, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('MediCare Pro', 14, 15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Medicine Bill / Receipt', 14, 23);
    doc.text(`Bill Date: ${new Date().toLocaleDateString()}`, 130, 23);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Diagnosis: ${rx.diagnosis}`, 14, 45);
    doc.text(`Doctor: ${rx.doctor?.name}`, 14, 52);

    const billItems = rx.medicines.map(m => {
      const price = getPrice(m.name);
      return [m.name, m.dosage, m.duration, `PKR ${price}`];
    });

    const total = rx.medicines.reduce((sum, m) => sum + getPrice(m.name), 0);

    autoTable(doc, {
      startY: 60,
      head: [['Medicine', 'Dosage', 'Duration', 'Price']],
      body: billItems,
      headStyles:  { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 255, 250] },
      styles: { fontSize: 9, cellPadding: 4 },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 5;

    // Total Box
    doc.setFillColor(16, 185, 129);
    doc.rect(120, finalY, 75, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Total: PKR ${total}`, 124, finalY + 8);

    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Thank you for choosing MediCare Pro', 14, finalY + 25);

    doc.save(`bill-${rx._id.slice(-6)}.pdf`);
  };

  const getTotalAmount = (rx: Prescription) =>
    rx.medicines.reduce((sum, m) => sum + getPrice(m.name), 0);

  const handlePayment = (method: string) => {
    setPayMethod(method);
    setTimeout(() => {
      setPaymentDone(true);
    }, 1500);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">My Prescriptions</h1>
        <p className="text-gray-500 mt-1 text-sm">{prescriptions.length} prescriptions</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">💊</p>
          <p>No prescriptions yet</p>
        </div>
      ) : (
        <>
          {/* Mobile: List only, Desktop: List + Detail */}
          <div className="block lg:hidden space-y-3">
            {prescriptions.map(rx => (
              <div key={rx._id}
                onClick={() => { setSelected(rx); setShowBill(false); setPaymentDone(false); }}
                className={`bg-white rounded-2xl border-2 p-4 cursor-pointer transition-all ${
                  selected?._id === rx._id ? 'border-blue-500' : 'border-gray-100'
                }`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg flex-shrink-0">
                    {rx.doctor?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900">{rx.doctor?.name}</p>
                    <p className="text-xs text-blue-600">{rx.doctor?.specialization}</p>
                  </div>
                  {rx.aiGenerated && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex-shrink-0">🤖 AI</span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-800 mb-2">{rx.diagnosis}</p>

                {/* Expanded detail on mobile */}
                {selected?._id === rx._id && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-2">MEDICINES</p>
                    <div className="space-y-2 mb-4">
                      {rx.medicines.map((med, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-sm text-gray-900">{med.name}</p>
                              <p className="text-xs text-gray-500">{med.dosage} · {med.duration}</p>
                            </div>
                            <span className="text-xs font-bold text-green-600">PKR {getPrice(med.name)}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-green-50 rounded-xl p-3 mb-3 flex justify-between items-center">
                      <span className="font-semibold text-sm">Total Amount</span>
                      <span className="font-bold text-green-600 text-base">PKR {getTotalAmount(rx)}</span>
                    </div>

                    {/* Action Buttons Mobile */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <button onClick={e => { e.stopPropagation(); downloadPDF(rx); }}
                        className="py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1">
                        📄 Download PDF
                      </button>
                      <button onClick={e => { e.stopPropagation(); downloadBill(rx); }}
                        className="py-2.5 bg-green-600 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1">
                        🧾 Bill PDF
                      </button>
                    </div>

                    {/* Payment */}
                    {!paymentDone ? (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">PAY VIA</p>
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={e => { e.stopPropagation(); handlePayment('JazzCash'); }}
                            className="py-2.5 bg-red-500 text-white text-xs font-semibold rounded-xl">
                            📱 JazzCash
                          </button>
                          <button onClick={e => { e.stopPropagation(); handlePayment('EasyPaisa'); }}
                            className="py-2.5 bg-green-500 text-white text-xs font-semibold rounded-xl">
                            💚 EasyPaisa
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                        <p className="text-2xl mb-1">✅</p>
                        <p className="font-bold text-green-700 text-sm">Payment Successful!</p>
                        <p className="text-xs text-green-600">Paid via {payMethod} · PKR {getTotalAmount(rx)}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop: Side by side */}
          <div className="hidden lg:grid grid-cols-2 gap-5">
            {/* List */}
            <div className="space-y-3">
              {prescriptions.map(rx => (
                <div key={rx._id} onClick={() => { setSelected(rx); setShowBill(false); setPaymentDone(false); }}
                  className={`bg-white rounded-2xl border-2 p-4 cursor-pointer hover:shadow-md transition-all ${
                    selected?._id === rx._id ? 'border-blue-500' : 'border-gray-100'
                  }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg">
                      {rx.doctor?.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900">{rx.doctor?.name}</p>
                      <p className="text-xs text-blue-600">{rx.doctor?.specialization}</p>
                    </div>
                    {rx.aiGenerated && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">🤖 AI</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-800 mb-1">{rx.diagnosis}</p>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{rx.medicines?.length || 0} medicines · PKR {getTotalAmount(rx)}</span>
                    <span>{new Date(rx.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Detail */}
            {selected ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 h-fit sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Prescription Detail</h3>
                  {selected.aiGenerated && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-semibold">
                      🤖 AI Generated
                    </span>
                  )}
                </div>

                <div className="bg-blue-50 rounded-xl p-3 mb-4">
                  <p className="text-xs font-semibold text-blue-600 mb-0.5">Diagnosis</p>
                  <p className="text-sm font-semibold text-gray-900">{selected.diagnosis}</p>
                </div>

                {/* Medicines with prices */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Medicines & Price</p>
                  <div className="space-y-2">
                    {selected.medicines?.map((med, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{med.name}</p>
                          <p className="text-xs text-gray-500">{med.dosage} · {med.duration}</p>
                          {med.instructions && <p className="text-xs text-gray-400">{med.instructions}</p>}
                        </div>
                        <span className="text-sm font-bold text-green-600 flex-shrink-0">
                          PKR {getPrice(med.name)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="font-bold text-green-700 text-lg">PKR {getTotalAmount(selected)}</p>
                  </div>
                  <span className="text-2xl">💊</span>
                </div>

                {/* Download Buttons */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button onClick={() => downloadPDF(selected)}
                    className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5">
                    📄 Download PDF
                  </button>
                  <button onClick={() => downloadBill(selected)}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5">
                    🧾 Bill PDF
                  </button>
                </div>

                {/* Payment */}
                {!paymentDone ? (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Pay Medicine Bill
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => handlePayment('JazzCash')}
                        className="py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
                        📱 JazzCash
                      </button>
                      <button onClick={() => handlePayment('EasyPaisa')}
                        className="py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
                        💚 EasyPaisa
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 text-center">
                    <div className="text-4xl mb-2">✅</div>
                    <p className="font-bold text-green-700 text-base">Payment Successful!</p>
                    <p className="text-sm text-green-600 mt-1">Paid via {payMethod}</p>
                    <p className="text-lg font-bold text-green-700 mt-1">PKR {getTotalAmount(selected)}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Receipt: {new Date().toLocaleString()}
                    </p>
                  </div>
                )}

                {selected.notes && (
                  <div className="bg-yellow-50 rounded-xl p-3 mt-3">
                    <p className="text-xs font-semibold text-yellow-700 mb-1">📝 Doctor's Notes</p>
                    <p className="text-sm text-gray-700">{selected.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 h-fit">
                <p className="text-3xl mb-2">👆</p>
                <p className="text-sm">Select a prescription</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}