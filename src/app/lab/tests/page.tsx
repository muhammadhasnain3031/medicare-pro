'use client';
import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import PaymentModal from '@/components/PaymentModal';


interface LabTest {
  _id:      string;
  patient:  { name: string; phone: string; bloodGroup: string };
  doctor?:  { name: string; specialization: string };
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

const TEST_CATALOG = [
  { name: 'Complete Blood Count (CBC)',     type: 'blood',      price: 800  },
  { name: 'Blood Glucose Fasting',          type: 'blood',      price: 400  },
  { name: 'Blood Glucose Random',           type: 'blood',      price: 350  },
  { name: 'Lipid Profile',                  type: 'blood',      price: 1200 },
  { name: 'Liver Function Test (LFT)',      type: 'blood',      price: 1500 },
  { name: 'Kidney Function Test (KFT)',     type: 'blood',      price: 1400 },
  { name: 'Thyroid Function Test (TFT)',    type: 'blood',      price: 1800 },
  { name: 'HbA1c',                          type: 'blood',      price: 900  },
  { name: 'Urine Analysis (R/E)',           type: 'urine',      price: 300  },
  { name: 'Urine Culture',                  type: 'urine',      price: 600  },
  { name: 'Chest X-Ray',                    type: 'xray',       price: 1500 },
  { name: 'MRI Brain',                      type: 'mri',        price: 8000 },
  { name: 'Ultrasound Abdomen',             type: 'ultrasound', price: 2500 },
  { name: 'ECG',                            type: 'ecg',        price: 500  },
];

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  completed:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};

const PRIORITY_STYLES: Record<string, string> = {
  normal:    'bg-gray-100 text-gray-600',
  urgent:    'bg-orange-100 text-orange-700',
  emergency: 'bg-red-100 text-red-700',
};

export default function LabTests() {
  const [tests, setTests]           = useState<LabTest[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('all');
  const [search, setSearch]         = useState('');
  const [showAdd, setShowAdd]       = useState(false);
  const [selected, setSelected]     = useState<LabTest | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [patients, setPatients]     = useState<any[]>([]);
  const [paymentTest, setPaymentTest] = useState<LabTest | null>(null);


  // Add Test Form
  const [addForm, setAddForm] = useState({
    patientId: '', testName: '', testType: 'blood',
    price: 0, priority: 'normal', notes: '',
  });

  // Result Form
  const [resultForm, setResultForm] = useState({
    result: '', notes: '', status: 'completed',
  });

  useEffect(() => {
    fetchTests();
    fetch('/api/admin/users?role=patient')
      .then(r => r.json())
      .then(d => setPatients(d.users || []));
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    const res = await fetch('/api/lab');
    const d   = await res.json();
    setTests(d.tests || []);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!addForm.patientId || !addForm.testName) return;
    const res = await fetch('/api/lab', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        patient:  addForm.patientId,
        testName: addForm.testName,
        testType: addForm.testType,
        price:    addForm.price,
        priority: addForm.priority,
        notes:    addForm.notes,
      }),
    });
    const d = await res.json();
    if (d.test) {
      setTests(prev => [d.test, ...prev]);
      setShowAdd(false);
      setAddForm({ patientId:'', testName:'', testType:'blood', price:0, priority:'normal', notes:'' });
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    const res = await fetch(`/api/lab/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status }),
    });
    const d = await res.json();
    if (d.test) setTests(prev => prev.map(t => t._id === id ? d.test : t));
  };

  const handleAddResult = async () => {
    if (!selected) return;
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
      setTests(prev => prev.map(t => t._id === selected._id ? d.test : t));
      setShowResult(false);
      setSelected(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this test?')) return;
    await fetch(`/api/lab/${id}`, { method: 'DELETE' });
    setTests(prev => prev.filter(t => t._id !== id));
  };

  const handlePayment = async (method: string) => {
  if (!paymentTest) return;
  const res = await fetch(`/api/lab/${paymentTest._id}`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ paid: true, paymentMethod: method }),
  });
  const d = await res.json();
  if (d.test) {
    setTests(prev => prev.map(t => t._id === paymentTest._id ? d.test : t));
    setPaymentTest(null);
  }
};

  const downloadReport = (test: LabTest) => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(234, 88, 12);
    doc.rect(0, 0, 220, 35, 'F');
    doc.setTextColor(255,255,255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('MediCare Pro', 14, 15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Laboratory Report', 14, 23);
    doc.text(`Date: ${new Date(test.createdAt).toLocaleDateString()}`, 140, 23);

    doc.setTextColor(0,0,0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('LAB REPORT', 14, 45);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Patient: ${test.patient?.name}`, 14, 55);
    doc.text(`Test: ${test.testName}`, 14, 62);
    doc.text(`Type: ${test.testType?.toUpperCase()}`, 14, 69);
    doc.text(`Priority: ${test.priority?.toUpperCase()}`, 14, 76);
    doc.text(`Status: ${test.status?.toUpperCase()}`, 14, 83);

    if (test.result) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('RESULT:', 14, 98);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(test.result, 180);
      doc.text(lines, 14, 107);
    }

    if (test.notes) {
      doc.setFont('helvetica', 'bold');
      doc.text('Notes:', 14, 135);
      doc.setFont('helvetica', 'normal');
      doc.text(test.notes, 14, 143);
    }

    // Billing
    doc.setFillColor(240, 253, 244);
    doc.rect(14, 155, 182, 20, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`Total Amount: PKR ${test.price}`, 18, 167);
    doc.text(`Payment: ${test.paid ? `PAID via ${test.paymentMethod}` : 'PENDING'}`, 120, 167);

    doc.setFillColor(245,247,255);
    doc.rect(0, 275, 220, 25, 'F');
    doc.setFontSize(8);
    doc.setTextColor(100,100,100);
    doc.text('MediCare Pro Laboratory — Certified Results', 14, 284);
    doc.text('This is a computer-generated report', 14, 290);

    doc.save(`lab-report-${test.patient?.name}-${test._id.slice(-6)}.pdf`);
  };

  const filtered = tests.filter(t => {
    const matchFilter = filter === 'all' || t.status === filter;
    const matchSearch = t.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
                        t.testName.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const inp    = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500";
  const label  = "block text-xs font-semibold text-gray-600 mb-1.5";

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">🧪 Lab Tests</h1>
          <p className="text-gray-500 text-sm mt-1">
            {tests.length} total · {tests.filter(t=>t.status==='pending').length} pending · {tests.filter(t=>t.status==='completed').length} completed
          </p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="px-4 py-2.5 bg-orange-600 text-white font-semibold rounded-xl text-sm hover:bg-orange-700 transition-colors">
          + Add Lab Test
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label:'Pending',    value:tests.filter(t=>t.status==='pending').length,    color:'bg-yellow-50 border-yellow-200', icon:'⏳' },
          { label:'Processing', value:tests.filter(t=>t.status==='processing').length, color:'bg-blue-50 border-blue-200',    icon:'⚙️' },
          { label:'Completed',  value:tests.filter(t=>t.status==='completed').length,  color:'bg-green-50 border-green-200',  icon:'✅' },
          { label:'Unpaid',     value:tests.filter(t=>!t.paid).length,                color:'bg-red-50 border-red-200',      icon:'💰' },
        ].map(s => (
          <div key={s.label} className={`${s.color} border rounded-2xl p-3`}>
            <p className="text-xl mb-1">{s.icon}</p>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by patient or test name..."
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <div className="flex gap-2 flex-wrap">
          {['all','pending','processing','completed','cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                filter===f ? 'bg-orange-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Tests Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-3">🧪</p>
          <p className="text-gray-400">No tests found</p>
          <button onClick={() => setShowAdd(true)}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700">
            Add First Test
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(test => (
            <div key={test._id} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start gap-3">

                {/* Left Info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-bold text-lg flex-shrink-0">
                    {test.patient?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 items-center mb-1">
                      <p className="font-semibold text-sm text-gray-900">{test.patient?.name}</p>
                      {test.patient?.bloodGroup && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                          {test.patient.bloodGroup}
                        </span>
                      )}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_STYLES[test.priority]}`}>
                        {test.priority}
                      </span>
                    </div>
                    <p className="font-medium text-gray-800 text-sm mb-1">{test.testName}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      <span>🔬 {test.testType?.toUpperCase()}</span>
                      <span>💰 PKR {test.price}</span>
                      <span>📅 {new Date(test.createdAt).toLocaleDateString()}</span>
                      <span className={`font-semibold ${test.paid ? 'text-green-600' : 'text-red-500'}`}>
                        {test.paid ? `✅ Paid via ${test.paymentMethod}` : '❌ Unpaid'}
                      </span>
                    </div>
                    {test.result && (
                      <div className="mt-2 bg-green-50 border border-green-200 rounded-xl p-2.5">
                        <p className="text-xs font-semibold text-green-700 mb-1">Result:</p>
                        <p className="text-xs text-gray-700 line-clamp-2">{test.result}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status + Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full text-center ${STATUS_STYLES[test.status]}`}>
                    {test.status}
                  </span>

                 {/* Status Change Buttons */}
<div className="flex gap-1 flex-wrap">
  {test.status === 'pending' && (
    <button onClick={() => handleStatusChange(test._id, 'processing')}
      className="px-2.5 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100">
      ▶ Start
    </button>
  )}
                     {test.status === 'processing' && (
    <>
      <button onClick={() => {
        setSelected(test);
        setResultForm({ result: test.result||'', notes: test.notes||'', status:'completed' });
        setShowResult(true);
      }}
        className="px-2.5 py-1.5 bg-green-50 text-green-600 text-xs font-semibold rounded-lg hover:bg-green-100">
        ✅ Add Result
      </button>
                    {/* ✅ Direct Complete button bhi */}
      <button onClick={() => handleStatusChange(test._id, 'completed')}
        className="px-2.5 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200">
        Mark Done
      </button>
    </>
  )}
  {/* ✅ Completed pe result edit + PDF */}
  {test.status === 'completed' && (
    <>
      <button onClick={() => {
        setSelected(test);
        setResultForm({ result: test.result||'', notes: test.notes||'', status:'completed' });
        setShowResult(true);
      }}
        className="px-2.5 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100">
        ✏️ Edit Result
      </button>
      <button onClick={() => downloadReport(test)}
        className="px-2.5 py-1.5 bg-purple-50 text-purple-600 text-xs font-semibold rounded-lg hover:bg-purple-100">
        📄 PDF
      </button>
    </>
  )}
                  </div>

                  {/* Payment */}
                  {/* Payment Buttons */}
{!test.paid && (
  <button onClick={() => setPaymentTest(test)}
    className="px-2.5 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700">
    💳 Pay Now
  </button>
)}
                     {test.paid && (
  <span className="px-2.5 py-1.5 bg-green-50 text-green-600 text-xs font-semibold rounded-lg">
    ✅ {test.paymentMethod}
  </span>
)}

<button onClick={() => handleDelete(test._id)}
  className="px-2.5 py-1.5 bg-red-50 text-red-500 text-xs font-semibold rounded-lg hover:bg-red-100">
  🗑 Delete
</button>                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== ADD TEST MODAL ===== */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">Add Lab Test</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={label}>Patient *</label>
                <select value={addForm.patientId} onChange={e => setAddForm({...addForm, patientId: e.target.value})}
                  className={inp}>
                  <option value="">Select patient...</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.name} — {p.phone || p.email}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={label}>Test Name *</label>
                <select value={addForm.testName}
                  onChange={e => {
                    const found = TEST_CATALOG.find(t => t.name === e.target.value);
                    setAddForm({
                      ...addForm,
                      testName: e.target.value,
                      testType: found?.type || 'blood',
                      price:    found?.price || 0,
                    });
                  }}
                  className={inp}>
                  <option value="">Select test...</option>
                  {TEST_CATALOG.map(t => (
                    <option key={t.name} value={t.name}>{t.name} — PKR {t.price}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>Test Type</label>
                  <select value={addForm.testType} onChange={e => setAddForm({...addForm, testType: e.target.value})}
                    className={inp}>
                    {['blood','urine','xray','mri','ultrasound','ecg','other'].map(t => (
                      <option key={t} value={t}>{t.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={label}>Priority</label>
                  <select value={addForm.priority} onChange={e => setAddForm({...addForm, priority: e.target.value})}
                    className={inp}>
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={label}>Price (PKR)</label>
                <input type="number" value={addForm.price}
                  onChange={e => setAddForm({...addForm, price: Number(e.target.value)})}
                  className={inp} />
              </div>

              <div>
                <label className={label}>Notes (optional)</label>
                <textarea value={addForm.notes}
                  onChange={e => setAddForm({...addForm, notes: e.target.value})}
                  rows={2} className={`${inp} resize-none`}
                  placeholder="Special instructions..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleAdd}
                  className="flex-1 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 transition-colors">
                  Add Test
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== ADD RESULT MODAL ===== */}
      {showResult && selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">Add Test Result</h3>
              <button onClick={() => setShowResult(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="bg-orange-50 rounded-xl p-3 mb-4">
              <p className="font-semibold text-sm text-gray-900">{selected.testName}</p>
              <p className="text-xs text-gray-500">Patient: {selected.patient?.name}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className={label}>Test Result *</label>
                <textarea value={resultForm.result}
                  onChange={e => setResultForm({...resultForm, result: e.target.value})}
                  rows={4} className={`${inp} resize-none`}
                  placeholder="Enter test results, values, interpretation..."
                />
              </div>
              <div>
                <label className={label}>Lab Notes</label>
                <textarea value={resultForm.notes}
                  onChange={e => setResultForm({...resultForm, notes: e.target.value})}
                  rows={2} className={`${inp} resize-none`}
                  placeholder="Additional notes..."
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowResult(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold">
                  Cancel
                </button>
                <button onClick={handleAddResult}
                  className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
                  ✅ Save Result
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {paymentTest && (
  <PaymentModal
    amount={paymentTest.price}
    title={`Payment — ${paymentTest.testName}`}
    onPay={handlePayment}
    onClose={() => setPaymentTest(null)}
  />
)}
    </div>
  );
}