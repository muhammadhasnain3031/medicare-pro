'use client';
import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import PaymentModal from '@/components/PaymentModal';

interface Medicine { _id: string; name: string; salePrice: number; stock: number; unit: string; }
interface BillItem  { medicine: string; medicineName: string; quantity: number; unitPrice: number; total: number; }

export default function PharmacyBilling() {
  const [medicines, setMedicines]   = useState<Medicine[]>([]);
  const [patients, setPatients]     = useState<any[]>([]);
  const [items, setItems]           = useState<BillItem[]>([]);
  const [selectedMed, setSelectedMed] = useState('');
  const [qty, setQty]               = useState(1);
  const [patientId, setPatientId]   = useState('');
  const [discount, setDiscount]     = useState(0);
  const [notes, setNotes]           = useState('');
  const [savedBill, setSavedBill]   = useState<any>(null);
  const [payModal, setPayModal]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [search, setSearch]         = useState('');

  useEffect(() => {
    fetch('/api/pharmacy/medicines').then(r => r.json()).then(d => setMedicines(d.medicines || []));
    fetch('/api/admin/users?role=patient').then(r => r.json()).then(d => setPatients(d.users || []));
  }, []);

  const addItem = () => {
    const med = medicines.find(m => m._id === selectedMed);
    if (!med || qty <= 0) return;
    const existing = items.find(i => i.medicine === selectedMed);
    if (existing) {
      setItems(prev => prev.map(i =>
        i.medicine === selectedMed
          ? { ...i, quantity: i.quantity + qty, total: (i.quantity + qty) * i.unitPrice }
          : i
      ));
    } else {
      setItems(prev => [...prev, {
        medicine:    med._id,
        medicineName: med.name,
        quantity:    qty,
        unitPrice:   med.salePrice,
        total:       qty * med.salePrice,
      }]);
    }
    setSelectedMed(''); setQty(1);
  };

  const removeItem = (idx: number) => setItems(prev => prev.filter((_,i) => i !== idx));

  const subtotal    = items.reduce((s, i) => s + i.total, 0);
  const taxAmount   = Math.round(subtotal * 0.05); // 5% tax
  const totalAmount = subtotal - discount + taxAmount;

  const handleSaveBill = async (payMethod?: string) => {
    if (items.length === 0) return;
    setSaving(true);
    const res = await fetch('/api/pharmacy/bills', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        patient:       patientId || undefined,
        items,
        subtotal,
        discount,
        tax:           taxAmount,
        totalAmount,
        notes,
        paid:          !!payMethod,
        paymentMethod: payMethod || '',
      }),
    });
    const d = await res.json();
    if (d.bill) {
      setSavedBill(d.bill);
      if (payMethod) downloadBillPDF(d.bill);
    }
    setSaving(false);
  };

  const downloadBillPDF = (bill: any) => {
    const doc = new jsPDF();
    doc.setFillColor(22,163,74);
    doc.rect(0,0,220,35,'F');
    doc.setTextColor(255,255,255);
    doc.setFontSize(18);
    doc.setFont('helvetica','bold');
    doc.text('MediCare Pro — Pharmacy Bill', 14, 18);
    doc.setFontSize(10);
    doc.setFont('helvetica','normal');
    doc.text(`Bill: ${bill.billNumber}`, 14, 27);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 27);
    doc.setTextColor(0,0,0);
    if (bill.patient) {
      doc.text(`Patient: ${bill.patient.name || ''}`, 14, 45);
      doc.text(`Phone: ${bill.patient.phone || ''}`, 14, 52);
    }
    autoTable(doc, {
      startY: bill.patient ? 60 : 45,
      head:   [['Medicine', 'Qty', 'Unit Price', 'Total']],
      body:   bill.items.map((i: any) => [
        i.medicineName, `${i.quantity}`, `PKR ${i.unitPrice}`, `PKR ${i.total}`
      ]),
      headStyles: { fillColor: [22,163,74], textColor: 255 },
      styles: { fontSize: 9 },
    });
    const y = (doc as any).lastAutoTable.finalY + 8;
    doc.setFont('helvetica','normal');
    doc.setFontSize(10);
    doc.text(`Subtotal: PKR ${bill.subtotal}`, 130, y);
    if (bill.discount > 0) doc.text(`Discount: -PKR ${bill.discount}`, 130, y+7);
    doc.text(`Tax (5%): PKR ${bill.tax}`, 130, y+14);
    doc.setFont('helvetica','bold');
    doc.setFontSize(12);
    doc.text(`TOTAL: PKR ${bill.totalAmount}`, 130, y+24);
    doc.setFont('helvetica','normal');
    doc.setFontSize(9);
    doc.text(`Payment: ${bill.paid ? `PAID via ${bill.paymentMethod}` : 'PENDING'}`, 130, y+32);
    doc.save(`pharmacy-bill-${bill.billNumber}.pdf`);
  };

  const filteredMeds = medicines.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) && m.stock > 0
  );

  const inp = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500";

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">💰 Create Pharmacy Bill</h1>
        <p className="text-gray-500 text-sm mt-1">Add medicines and generate bill</p>
      </div>

      {savedBill ? (
        /* Success Screen */
        <div className="bg-white rounded-2xl border border-green-200 p-8 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Bill Created!</h3>
          <p className="text-gray-500 text-sm mb-2">Bill #{savedBill.billNumber}</p>
          <p className="text-2xl font-black text-green-600 mb-6">PKR {savedBill.totalAmount.toLocaleString()}</p>
          <div className="space-y-3">
            <button onClick={() => downloadBillPDF(savedBill)}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm transition-colors">
              📄 Download PDF Bill
            </button>
            <button onClick={() => { setSavedBill(null); setItems([]); setPatientId(''); setDiscount(0); setNotes(''); }}
              className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">
              + Create New Bill
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left — Medicine Selection */}
          <div className="lg:col-span-2 space-y-4">

            {/* Patient Select */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <label className="block text-xs font-semibold text-gray-600 mb-2">👤 Patient (Optional)</label>
              <select value={patientId} onChange={e => setPatientId(e.target.value)} className={inp}>
                <option value="">Walk-in Customer</option>
                {patients.map(p => <option key={p._id} value={p._id}>{p.name} — {p.phone || p.email}</option>)}
              </select>
            </div>

            {/* Add Medicine */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h3 className="font-bold text-gray-900 text-sm mb-3">➕ Add Medicine to Bill</h3>
              <div className="mb-3">
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search medicine..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 mb-2"
                />
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {filteredMeds.map(med => (
                    <button key={med._id}
                      onClick={() => setSelectedMed(med._id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                        selectedMed === med._id
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-50 hover:bg-green-50 text-gray-700'
                      }`}>
                      <span className="font-medium truncate">{med.name}</span>
                      <span className={`text-xs font-semibold flex-shrink-0 ml-2 ${selectedMed === med._id ? 'text-green-100' : 'text-green-600'}`}>
                        PKR {med.salePrice} · {med.stock} {med.unit}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity</label>
                  <input type="number" min="1" value={qty} onChange={e => setQty(Number(e.target.value))}
                    className={inp} />
                </div>
                <div className="flex items-end">
                  <button onClick={addItem} disabled={!selectedMed || qty <= 0}
                    className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm disabled:opacity-50 transition-colors">
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Items Table */}
            {items.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-3 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 text-sm">📋 Bill Items ({items.length})</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{item.medicineName}</p>
                        <p className="text-xs text-gray-500">{item.quantity} × PKR {item.unitPrice}</p>
                      </div>
                      <p className="font-bold text-green-600 text-sm flex-shrink-0">PKR {item.total}</p>
                      <button onClick={() => removeItem(idx)}
                        className="text-red-400 hover:text-red-600 text-lg flex-shrink-0">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <label className="block text-xs font-semibold text-gray-600 mb-2">Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                rows={2} placeholder="Additional notes..."
                className={`${inp} resize-none`} />
            </div>
          </div>

          {/* Right — Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-6">
              <h3 className="font-bold text-gray-900 mb-4">💳 Bill Summary</h3>

              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-3xl mb-2">🛒</p>
                  <p className="text-sm">Add medicines to create bill</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-semibold">PKR {subtotal}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-sm">Discount</span>
                      <input type="number" value={discount} min={0} max={subtotal}
                        onChange={e => setDiscount(Number(e.target.value))}
                        className="flex-1 px-2 py-1 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-1 focus:ring-green-500" />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tax (5%)</span>
                      <span className="font-semibold text-orange-600">+PKR {taxAmount}</span>
                    </div>
                    <div className="border-t border-gray-100 pt-2 flex justify-between">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-black text-xl text-green-600">PKR {totalAmount}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button onClick={() => handleSaveBill()} disabled={saving}
                      className="w-full py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 disabled:opacity-50">
                      💾 Save as Pending
                    </button>
                    <button onClick={() => setPayModal(true)} disabled={saving}
                      className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm disabled:opacity-50 transition-colors">
                      💳 Pay & Generate Bill
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {payModal && (
        <PaymentModal
          amount={totalAmount}
          title="Pharmacy Bill Payment"
          onPay={(method) => { setPayModal(false); handleSaveBill(method); }}
          onClose={() => setPayModal(false)}
        />
      )}
    </div>
  );
}