'use client';
import { useEffect, useState, useCallback } from 'react';

interface Medicine {
  _id:           string;
  name:          string;
  genericName:   string;
  category:      string;
  manufacturer:  string;
  batchNumber:   string;
  expiryDate:    string;
  purchasePrice: number;
  salePrice:     number;
  stock:         number;
  minStock:      number;
  unit:          string;
}

const CATEGORIES = ['antibiotic','painkiller','vitamin','antacid','cardiac','diabetic','antihistamine','other'];
const UNITS      = ['tablets','capsules','ml','mg','strips','bottles','injections','other'];

const CAT_COLORS: Record<string, string> = {
  antibiotic:    'bg-red-100 text-red-700',
  painkiller:    'bg-orange-100 text-orange-700',
  vitamin:       'bg-yellow-100 text-yellow-700',
  antacid:       'bg-green-100 text-green-700',
  cardiac:       'bg-pink-100 text-pink-700',
  diabetic:      'bg-blue-100 text-blue-700',
  antihistamine: 'bg-purple-100 text-purple-700',
  other:         'bg-gray-100 text-gray-600',
};

export default function PharmacyStock() {
  const [medicines, setMedicines]   = useState<Medicine[]>([]);
  const [stats, setStats]           = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [catFilter, setCatFilter]   = useState('');
  const [saving, setSaving]         = useState(false);

  // Modals
  const [showAdd, setShowAdd]           = useState(false);
  const [showEdit, setShowEdit]         = useState<Medicine | null>(null);
  const [showRestock, setShowRestock]   = useState<Medicine | null>(null);
  const [restockQty, setRestockQty]     = useState('');
  const [restockDone, setRestockDone]   = useState(false);

  const emptyForm = {
    name: '', genericName: '', category: 'other', manufacturer: '',
    batchNumber: '', expiryDate: '', purchasePrice: '',
    salePrice: '', stock: '', minStock: '10', unit: 'tablets', description: '',
  };
  const [form, setForm] = useState(emptyForm);

  const fetchMedicines = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search)    params.set('search', search);
    if (catFilter) params.set('category', catFilter);
    const res  = await fetch(`/api/pharmacy/medicines?${params}`);
    const data = await res.json();
    setMedicines(data.medicines || []);
    setStats(data.stats);
    setLoading(false);
  }, [search, catFilter]);

  useEffect(() => { fetchMedicines(); }, [fetchMedicines]);

  // ✅ Add Medicine
  const handleAdd = async () => {
    if (!form.name || !form.salePrice || !form.expiryDate) return;
    setSaving(true);
    const res = await fetch('/api/pharmacy/medicines', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        ...form,
        purchasePrice: Number(form.purchasePrice) || 0,
        salePrice:     Number(form.salePrice),
        stock:         Number(form.stock) || 0,
        minStock:      Number(form.minStock) || 10,
      }),
    });
    const d = await res.json();
    if (d.medicine) {
      setMedicines(prev => [d.medicine, ...prev]);
      setShowAdd(false);
      setForm(emptyForm);
    }
    setSaving(false);
  };

  // ✅ Edit Medicine
  const handleEdit = async () => {
    if (!showEdit) return;
    setSaving(true);
    const res = await fetch(`/api/pharmacy/medicines/${showEdit._id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        name:          form.name,
        genericName:   form.genericName,
        category:      form.category,
        manufacturer:  form.manufacturer,
        batchNumber:   form.batchNumber,
        expiryDate:    form.expiryDate,
        purchasePrice: Number(form.purchasePrice) || 0,
        salePrice:     Number(form.salePrice),
        stock:         Number(form.stock),
        minStock:      Number(form.minStock) || 10,
        unit:          form.unit,
      }),
    });
    const d = await res.json();
    if (d.medicine) {
      setMedicines(prev => prev.map(m => m._id === showEdit._id ? d.medicine : m));
      setShowEdit(null);
      setForm(emptyForm);
    }
    setSaving(false);
  };

  // ✅ Restock — $inc use karo
  const handleRestock = async () => {
    if (!showRestock || !restockQty || Number(restockQty) <= 0) return;
    setSaving(true);

    const res = await fetch(`/api/pharmacy/medicines/${showRestock._id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ restock: Number(restockQty) }), // ✅ restock key
    });
    const d = await res.json();

    if (d.medicine) {
      // Optimistic update with actual DB value
      setMedicines(prev => prev.map(m => m._id === showRestock._id ? d.medicine : m));
      setRestockDone(true);
      setTimeout(() => {
        setShowRestock(null);
        setRestockQty('');
        setRestockDone(false);
      }, 1500);
    }
    setSaving(false);
  };

  // ✅ Delete
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this medicine?')) return;
    await fetch(`/api/pharmacy/medicines/${id}`, { method: 'DELETE' });
    setMedicines(prev => prev.filter(m => m._id !== id));
  };

  const daysLeft = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const inp = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500";

  // Medicine Form (shared for add/edit)
  const MedicineForm = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Medicine Name *</label>
          <input value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
            placeholder="e.g. Amoxicillin 500mg" className={inp} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Generic Name</label>
          <input value={form.genericName}
            onChange={e => setForm({...form, genericName: e.target.value})}
            placeholder="Generic" className={inp} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category</label>
          <select value={form.category}
            onChange={e => setForm({...form, category: e.target.value})} className={inp}>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Manufacturer</label>
          <input value={form.manufacturer}
            onChange={e => setForm({...form, manufacturer: e.target.value})}
            placeholder="Company" className={inp} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Batch Number</label>
          <input value={form.batchNumber}
            onChange={e => setForm({...form, batchNumber: e.target.value})}
            placeholder="Batch" className={inp} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Expiry Date *</label>
          <input type="date" value={form.expiryDate}
            onChange={e => setForm({...form, expiryDate: e.target.value})} className={inp} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Unit</label>
          <select value={form.unit}
            onChange={e => setForm({...form, unit: e.target.value})} className={inp}>
            {UNITS.map(u => (
              <option key={u} value={u}>{u.charAt(0).toUpperCase()+u.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Purchase Price (PKR)</label>
          <input type="number" value={form.purchasePrice}
            onChange={e => setForm({...form, purchasePrice: e.target.value})}
            placeholder="0" className={inp} min="0" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Sale Price (PKR) *</label>
          <input type="number" value={form.salePrice}
            onChange={e => setForm({...form, salePrice: e.target.value})}
            placeholder="0" className={inp} min="0" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Stock Quantity</label>
          <input type="number" value={form.stock}
            onChange={e => setForm({...form, stock: e.target.value})}
            placeholder="0" className={inp} min="0" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Min Stock (Alert)</label>
          <input type="number" value={form.minStock}
            onChange={e => setForm({...form, minStock: e.target.value})}
            placeholder="10" className={inp} min="0" />
        </div>
      </div>
      <div className="flex gap-3 pt-1">
        <button onClick={() => { setShowAdd(false); setShowEdit(null); setForm(emptyForm); }}
          className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">
          Cancel
        </button>
        <button
          onClick={showEdit ? handleEdit : handleAdd}
          disabled={saving || !form.name || !form.salePrice || !form.expiryDate}
          className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-colors">
          {saving ? '⏳ Saving...' : showEdit ? '✅ Update' : '✅ Add Medicine'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">💊 Medicine Stock</h1>
          <p className="text-gray-500 text-sm mt-1">
            {medicines.length} medicines · Value: PKR {((stats?.totalValue||0)/1000).toFixed(1)}K
          </p>
        </div>
        <button onClick={() => { setShowAdd(true); setForm(emptyForm); }}
          className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm transition-colors">
          + Add Medicine
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label:'Total',      value:stats?.total     || 0, color:'bg-blue-50 border-blue-200',    icon:'💊' },
          { label:'Low Stock',  value:stats?.lowStock  || 0, color:'bg-yellow-50 border-yellow-200', icon:'⚠️' },
          { label:'Expiring',   value:stats?.expirySoon|| 0, color:'bg-orange-50 border-orange-200', icon:'⏰' },
          { label:'Expired',    value:stats?.expired   || 0, color:'bg-red-50 border-red-200',       icon:'🚨' },
        ].map(s => (
          <div key={s.label} className={`${s.color} border rounded-2xl p-3`}>
            <p className="text-lg mb-1">{s.icon}</p>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search medicine name..."
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setCatFilter('')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 ${!catFilter ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            All
          </button>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap flex-shrink-0 transition-all ${catFilter===c ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Medicines List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
        </div>
      ) : medicines.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-3">💊</p>
          <p className="text-gray-400 mb-4">No medicines found</p>
          <button onClick={() => setShowAdd(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700">
            + Add First Medicine
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {medicines.map(med => {
            const days       = daysLeft(med.expiryDate);
            const isExpired  = days < 0;
            const isExpiring = days >= 0 && days <= 30;
            const isLow      = med.stock <= med.minStock;
            const stockPct   = Math.min(100, (med.stock / Math.max(med.minStock * 2, 1)) * 100);

            return (
              <div key={med._id} className={`bg-white rounded-2xl border-2 p-4 hover:shadow-md transition-shadow ${
                isExpired  ? 'border-red-300'    :
                isExpiring ? 'border-orange-200' :
                isLow      ? 'border-yellow-200' : 'border-gray-100'
              }`}>
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${
                      isExpired ? 'bg-red-100' : isExpiring ? 'bg-orange-100' : 'bg-green-100'
                    }`}>💊</div>
                    <div className="flex-1 min-w-0">

                      {/* Name + badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-bold text-sm text-gray-900">{med.name}</p>
                        {med.genericName && <p className="text-xs text-gray-400">({med.genericName})</p>}
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${CAT_COLORS[med.category]}`}>
                          {med.category}
                        </span>
                        {isExpired  && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">🚨 EXPIRED</span>}
                        {isExpiring && !isExpired && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">⏰ {days}d left</span>}
                        {isLow && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">⚠️ Low Stock</span>}
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
                        <span>📦 <strong className={isLow ? 'text-red-600' : 'text-gray-900'}>{med.stock} {med.unit}</strong></span>
                        <span>💰 Sale: <strong className="text-green-600">PKR {med.salePrice}</strong></span>
                        {med.purchasePrice > 0 && <span>🛒 Buy: PKR {med.purchasePrice}</span>}
                        {med.manufacturer && <span>🏭 {med.manufacturer}</span>}
                        {med.batchNumber  && <span>📋 {med.batchNumber}</span>}
                        <span>📅 Exp: {med.expiryDate}</span>
                      </div>

                      {/* Stock bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${
                            isLow ? 'bg-red-500' : stockPct < 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`} style={{ width: `${stockPct}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {med.stock}/{med.minStock * 2} units
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-wrap flex-shrink-0">
                    {/* ✅ Restock Button */}
                    <button onClick={() => { setShowRestock(med); setRestockQty(''); setRestockDone(false); }}
                      className="px-3 py-2 bg-green-50 text-green-700 border border-green-200 text-xs font-bold rounded-xl hover:bg-green-100 transition-colors">
                      ➕ Restock
                    </button>
                    <button onClick={() => {
                      setShowEdit(med);
                      setForm({
                        name:          med.name,
                        genericName:   med.genericName || '',
                        category:      med.category,
                        manufacturer:  med.manufacturer || '',
                        batchNumber:   med.batchNumber  || '',
                        expiryDate:    med.expiryDate,
                        purchasePrice: String(med.purchasePrice),
                        salePrice:     String(med.salePrice),
                        stock:         String(med.stock),
                        minStock:      String(med.minStock),
                        unit:          med.unit || 'tablets',
                        description:   '',
                      });
                    }}
                      className="px-3 py-2 bg-blue-50 text-blue-600 border border-blue-200 text-xs font-semibold rounded-xl hover:bg-blue-100 transition-colors">
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(med._id)}
                      className="px-3 py-2 bg-red-50 text-red-500 border border-red-100 text-xs font-semibold rounded-xl hover:bg-red-100 transition-colors">
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ RESTOCK MODAL */}
      {/* RESTOCK MODAL */}
      {showRestock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            {restockDone ? (
              <div className="text-center py-6">
                <p className="text-5xl mb-3">✅</p>
                <p className="font-bold text-green-700 text-lg">
                  Restock Successful!
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  {showRestock.name} updated successfully
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-gray-900 text-lg">
                    ➕ Restock Medicine
                  </h3>
                  <button
                    onClick={() => setShowRestock(null)}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    ✕
                  </button>
                </div>

                {/* Current info */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
                  <p className="font-bold text-sm text-gray-900">
                    {showRestock.name}
                  </p>
                  <div className="flex justify-between mt-3">
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Current</p>
                      <p className="text-xl font-black text-gray-900">{showRestock.stock}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400">After</p>
                      <p className="text-xl font-black text-green-600">
                        {showRestock.stock + (Number(restockQty) || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick buttons */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[10, 20, 50, 100].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setRestockQty(String(qty))}
                      className="py-2 bg-gray-100 hover:bg-green-100 rounded-xl text-sm font-semibold"
                    >
                      +{qty}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <div className="mb-5">
                  <input
                    type="number"
                    value={restockQty}
                    onChange={(e) => setRestockQty(e.target.value)}
                    placeholder="Enter quantity"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRestock(null)}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRestock}
                    disabled={saving || !restockQty}
                    className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold disabled:opacity-50"
                  >
                    {saving ? '...' : 'Confirm'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}