'use client';
import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Bill {
  _id:           string;
  billNumber:    string;
  patient?:      { name: string; phone: string };
  items:         { medicineName: string; quantity: number; unitPrice: number; total: number }[];
  subtotal:      number;
  discount:      number;
  tax:           number;
  totalAmount:   number;
  paid:          boolean;
  paymentMethod: string;
  createdAt:     string;
}

export default function PharmacyBills() {
  const [bills, setBills]       = useState<Bill[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<Bill | null>(null);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    fetch('/api/pharmacy/bills')
      .then(r => r.json())
      .then(d => { setBills(d.bills || []); setLoading(false); });
  }, []);

  const totalRevenue = bills.filter(b => b.paid).reduce((s,b) => s + b.totalAmount, 0);
  const pending      = bills.filter(b => !b.paid).length;

  const downloadPDF = (bill: Bill) => {
    const doc = new jsPDF();
    doc.setFillColor(22,163,74);
    doc.rect(0,0,220,35,'F');
    doc.setTextColor(255,255,255);
    doc.setFontSize(16);
    doc.setFont('helvetica','bold');
    doc.text('MediCare Pro — Pharmacy Receipt', 14, 18);
    doc.setFontSize(10);
    doc.setFont('helvetica','normal');
    doc.text(`Bill: ${bill.billNumber}`, 14, 27);
    doc.text(`Date: ${new Date(bill.createdAt).toLocaleDateString()}`, 140, 27);
    doc.setTextColor(0,0,0);
    if (bill.patient) doc.text(`Patient: ${bill.patient.name}`, 14, 45);
    autoTable(doc, {
      startY: bill.patient ? 52 : 45,
      head:   [['Medicine','Qty','Price','Total']],
      body:   bill.items.map(i => [i.medicineName, i.quantity, `PKR ${i.unitPrice}`, `PKR ${i.total}`]),
      headStyles: { fillColor: [22,163,74], textColor: 255 },
      styles: { fontSize: 9 },
    });
    const y = (doc as any).lastAutoTable.finalY + 8;
    doc.setFont('helvetica','bold');
    doc.text(`TOTAL: PKR ${bill.totalAmount}`, 130, y+10);
    doc.setFont('helvetica','normal');
    doc.setFontSize(9);
    doc.text(`Payment: ${bill.paid ? `PAID via ${bill.paymentMethod}` : 'PENDING'}`, 130, y+18);
    doc.save(`receipt-${bill.billNumber}.pdf`);
  };

  const filtered = bills.filter(b =>
    (b.billNumber.toLowerCase().includes(search.toLowerCase())) ||
    (b.patient?.name?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">📋 Pharmacy Bills</h1>
        <p className="text-gray-500 text-sm mt-1">{bills.length} bills · Revenue: PKR {(totalRevenue/1000).toFixed(0)}K · {pending} pending</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label:'Total Bills',  value:bills.length,              color:'bg-blue-50 border-blue-200',   icon:'📋' },
          { label:'Revenue',      value:`PKR ${(totalRevenue/1000).toFixed(0)}K`, color:'bg-green-50 border-green-200', icon:'💰' },
          { label:'Pending',      value:pending,                   color:'bg-yellow-50 border-yellow-200',icon:'⏳' },
        ].map(s => (
          <div key={s.label} className={`${s.color} border rounded-2xl p-3 text-center`}>
            <p className="text-xl mb-1">{s.icon}</p>
            <p className="text-lg font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by bill number or patient..."
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            {filtered.map(bill => (
              <div key={bill._id}
                onClick={() => setSelected(bill)}
                className={`bg-white rounded-2xl border-2 p-4 cursor-pointer hover:shadow-md transition-all ${
                  selected?._id === bill._id ? 'border-green-500' : 'border-gray-100'
                }`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-bold text-sm text-gray-900">#{bill.billNumber}</p>
                    <p className="text-xs text-gray-500">
                      {bill.patient?.name || 'Walk-in'} · {new Date(bill.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-green-600">PKR {bill.totalAmount}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      bill.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {bill.paid ? `✅ ${bill.paymentMethod}` : '❌ Unpaid'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-400">{bill.items.length} items</p>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <p className="text-3xl mb-2">📋</p>
                <p>No bills found</p>
              </div>
            )}
          </div>

          {selected ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 h-fit sticky top-6">
              <h3 className="font-bold text-gray-900 mb-4">Bill Detail</h3>
              <div className="bg-green-50 rounded-xl p-3 mb-4">
                <p className="font-bold text-sm"># {selected.billNumber}</p>
                <p className="text-xs text-gray-500">{selected.patient?.name || 'Walk-in'} · {new Date(selected.createdAt).toLocaleString()}</p>
              </div>
              <div className="space-y-2 mb-4">
                {selected.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-gray-700 truncate">{item.medicineName} ×{item.quantity}</span>
                    <span className="font-semibold text-gray-900 flex-shrink-0 ml-2">PKR {item.total}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-1 mb-4">
                {selected.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discount</span>
                    <span className="text-red-500 font-semibold">-PKR {selected.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="font-semibold">PKR {selected.tax}</span>
                </div>
                <div className="flex justify-between font-black text-base">
                  <span>Total</span>
                  <span className="text-green-600">PKR {selected.totalAmount}</span>
                </div>
              </div>
              <button onClick={() => downloadPDF(selected)}
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm transition-colors">
                📄 Download PDF Receipt
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 h-fit">
              <p className="text-3xl mb-2">👆</p>
              <p className="text-sm">Select a bill to view</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}