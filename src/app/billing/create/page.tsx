'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PaymentModal from '@/components/PaymentModal';

interface Item {
  description: string;
  category:    string;
  quantity:    number;
  unitPrice:   number;
  total:       number;
}

const CATEGORIES = ['consultation','medicine','lab','bed','procedure','other'];
const CAT_ICONS: Record<string, string> = {
  consultation:'👨‍⚕️', medicine:'💊', lab:'🧪', bed:'🛏️', procedure:'⚕️', other:'📌',
};

const QUICK_ITEMS = [
  { description:'Consultation Fee',    category:'consultation', unitPrice:1500 },
  { description:'Follow-up Fee',       category:'consultation', unitPrice:800  },
  { description:'Emergency Fee',       category:'consultation', unitPrice:3000 },
  { description:'CBC Blood Test',      category:'lab',          unitPrice:800  },
  { description:'X-Ray Chest',         category:'lab',          unitPrice:1500 },
  { description:'Ultrasound Abdomen',  category:'lab',          unitPrice:2500 },
  { description:'General Ward/Day',    category:'bed',          unitPrice:2000 },
  { description:'Private Room/Day',    category:'bed',          unitPrice:5000 },
  { description:'ICU Charges/Day',     category:'bed',          unitPrice:10000},
  { description:'Dressing & Bandage',  category:'procedure',    unitPrice:500  },
  { description:'Injection Fee',       category:'procedure',    unitPrice:200  },
];

export default function CreateInvoice() {
  const router = useRouter();
  const [patients, setPatients]   = useState<any[]>([]);
  const [doctors,  setDoctors]    = useState<any[]>([]);
  const [items, setItems]         = useState<Item[]>([]);
  const [payModal, setPayModal]   = useState(false);
  const [saving, setSaving]       = useState(false);

  const [form, setForm] = useState({
    patientId:       '',
    doctorId:        '',
    dueDate:         '',
    discountType:    'fixed',
    discount:        0,
    taxPercent:      0,
    insuranceCompany:'',
    insuranceClaim:  '',
    insuranceAmount: 0,
    notes:           '',
  });

  const [newItem, setNewItem] = useState({
    description: '', category: 'consultation', quantity: 1, unitPrice: 0,
  });

  useEffect(() => {
    fetch('/api/admin/users?role=patient').then(r => r.json()).then(d => setPatients(d.users || []));
    fetch('/api/doctors').then(r => r.json()).then(d => setDoctors(d.doctors || []));
  }, []);

  const addItem = () => {
    if (!newItem.description || newItem.unitPrice <= 0) return;
    setItems(prev => [...prev, {
      ...newItem,
      total: newItem.quantity * newItem.unitPrice,
    }]);
    setNewItem({ description: '', category: 'consultation', quantity: 1, unitPrice: 0 });
  };

  const addQuickItem = (qi: typeof QUICK_ITEMS[0]) => {
    setItems(prev => [...prev, {
      description: qi.description,
      category:    qi.category,
      quantity:    1,
      unitPrice:   qi.unitPrice,
      total:       qi.unitPrice,
    }]);
  };

  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const subtotal     = items.reduce((s, i) => s + i.total, 0);
  const discountAmt  = form.discountType === 'percent'
    ? Math.round(subtotal * form.discount / 100) : form.discount;
  const afterDiscount = subtotal - discountAmt;
  const taxAmt       = Math.round(afterDiscount * form.taxPercent / 100);
  const afterTax     = afterDiscount + taxAmt;
  const insAmt       = form.insuranceAmount || 0;
  const totalAmount  = Math.max(0, afterTax - insAmt);

  const handleSave = async (payMethod?: string) => {
    if (!form.patientId || items.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch('/api/billing/invoices', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          patient:          form.patientId,
          doctor:           form.doctorId || undefined,
          items,
          discountType:     form.discountType,
          discount:         form.discount,
          taxPercent:       form.taxPercent,
          insuranceCompany: form.insuranceCompany,
          insuranceClaim:   form.insuranceClaim,
          insuranceAmount:  insAmt,
          dueDate:          form.dueDate,
          notes:            form.notes,
          paidAmount:       payMethod ? totalAmount : 0,
          paymentMethod:    payMethod || '',
        }),
      });
      const d = await res.json();
      if (d.invoice) router.push(`/billing/invoices/${d.invoice._id}`);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const inp = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">➕ Create Invoice</h1>
        <p className="text-gray-500 text-sm mt-1">Generate professional invoice for patient</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left — Form */}
        <div className="lg:col-span-2 space-y-4">

          {/* Patient + Doctor */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="font-bold text-gray-900 text-sm mb-3">👤 Patient & Doctor</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Patient *</label>
                <select value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})}
                  className={inp}>
                  <option value="">Select patient...</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.name} — {p.phone||p.email}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Doctor (optional)</label>
                <select value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})}
                  className={inp}>
                  <option value="">Select doctor...</option>
                  {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.name} — {d.specialization}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Due Date</label>
                <input type="date" value={form.dueDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm({...form, dueDate: e.target.value})}
                  className={inp} />
              </div>
            </div>
          </div>

          {/* Quick Add Items */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="font-bold text-gray-900 text-sm mb-3">⚡ Quick Add Items</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {QUICK_ITEMS.map((qi, i) => (
                <button key={i} onClick={() => addQuickItem(qi)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-medium transition-colors">
                  {CAT_ICONS[qi.category]} {qi.description}
                  <span className="text-blue-500">PKR {qi.unitPrice}</span>
                </button>
              ))}
            </div>

            {/* Custom Item */}
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-600 mb-2">Or add custom item:</p>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="col-span-2">
                  <input value={newItem.description}
                    onChange={e => setNewItem({...newItem, description: e.target.value})}
                    placeholder="Description" className={inp} />
                </div>
                <div>
                  <select value={newItem.category}
                    onChange={e => setNewItem({...newItem, category: e.target.value})}
                    className={inp}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" value={newItem.quantity} min={1}
                    onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})}
                    placeholder="Qty" className={inp} />
                  <input type="number" value={newItem.unitPrice || ''}
                    onChange={e => setNewItem({...newItem, unitPrice: Number(e.target.value)})}
                    placeholder="Price" className={inp} />
                </div>
              </div>
              <button onClick={addItem} disabled={!newItem.description || newItem.unitPrice <= 0}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs disabled:opacity-50 transition-colors">
                ➕ Add Item
              </button>
            </div>
          </div>

          {/* Items Table */}
          {items.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm">📋 Invoice Items ({items.length})</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3">
                    <span className="text-base flex-shrink-0">{CAT_ICONS[item.category]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{item.description}</p>
                      <p className="text-xs text-gray-400">{item.quantity} × PKR {item.unitPrice}</p>
                    </div>
                    <p className="font-bold text-blue-600 text-sm flex-shrink-0">PKR {item.total.toLocaleString()}</p>
                    <button onClick={() => removeItem(idx)}
                      className="text-red-400 hover:text-red-600 text-xl flex-shrink-0">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insurance */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="font-bold text-gray-900 text-sm mb-3">🏥 Insurance (Optional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Insurance Company</label>
                <input value={form.insuranceCompany}
                  onChange={e => setForm({...form, insuranceCompany: e.target.value})}
                  placeholder="e.g. State Life" className={inp} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Claim Number</label>
                <input value={form.insuranceClaim}
                  onChange={e => setForm({...form, insuranceClaim: e.target.value})}
                  placeholder="Claim #" className={inp} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Insurance Amount (PKR)</label>
                <input type="number" value={form.insuranceAmount || ''}
                  onChange={e => setForm({...form, insuranceAmount: Number(e.target.value)})}
                  placeholder="0" className={inp} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
              rows={2} placeholder="Additional notes..." className={`${inp} resize-none`} />
          </div>
        </div>

        {/* Right — Summary */}
        <div className="lg:col-span-1">
  <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:sticky lg:top-6">
            <h3 className="font-bold text-gray-900 mb-4">💳 Invoice Summary</h3>

            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-3xl mb-2">🧾</p>
                <p className="text-sm">Add items to create invoice</p>
              </div>
            ) : (
              <>
                {/* Discount */}
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Discount</label>
                    <div className="flex gap-2">
                      <select value={form.discountType}
                        onChange={e => setForm({...form, discountType: e.target.value})}
                        className="px-2 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="fixed">PKR</option>
                        <option value="percent">%</option>
                      </select>
                      <input type="number" value={form.discount || ''}
                        onChange={e => setForm({...form, discount: Number(e.target.value)})}
                        placeholder="0"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tax %</label>
                    <input type="number" value={form.taxPercent || ''}
                      onChange={e => setForm({...form, taxPercent: Number(e.target.value)})}
                      placeholder="0" className={inp} />
                  </div>
                </div>

                {/* Calculations */}
                <div className="bg-gray-50 rounded-xl p-3 space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-semibold">PKR {subtotal.toLocaleString()}</span>
                  </div>
                  {discountAmt > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount {form.discountType==='percent' ? `(${form.discount}%)` : ''}</span>
                      <span className="font-semibold">-PKR {discountAmt.toLocaleString()}</span>
                    </div>
                  )}
                  {taxAmt > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span>Tax ({form.taxPercent}%)</span>
                      <span className="font-semibold">+PKR {taxAmt.toLocaleString()}</span>
                    </div>
                  )}
                  {insAmt > 0 && (
                    <div className="flex justify-between text-blue-600">
                      <span>Insurance Cover</span>
                      <span className="font-semibold">-PKR {insAmt.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-black text-base">
                    <span>Patient Pays</span>
                    <span className="text-blue-700">PKR {totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button onClick={() => handleSave()} disabled={saving || !form.patientId}
                    className="w-full py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 disabled:opacity-50">
                    💾 Save as Draft
                  </button>
                  <button onClick={() => setPayModal(true)}
                    disabled={saving || !form.patientId || items.length === 0}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm disabled:opacity-50 transition-colors">
                    💳 Collect Payment
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {payModal && (
        <PaymentModal
          amount={totalAmount}
          title="Invoice Payment"
          onPay={(method) => { setPayModal(false); handleSave(method); }}
          onClose={() => setPayModal(false)}
        />
      )}
    </div>
  );
}