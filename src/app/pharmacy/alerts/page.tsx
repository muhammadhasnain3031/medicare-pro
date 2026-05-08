'use client';
import { useEffect, useState } from 'react';

interface Medicine {
  _id: string; name: string; stock: number; minStock: number;
  salePrice: number; expiryDate: string; manufacturer: string; batchNumber: string;
}

export default function PharmacyAlerts() {
  const [lowStock, setLowStock]   = useState<Medicine[]>([]);
  const [expiring, setExpiring]   = useState<Medicine[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/pharmacy/medicines?alert=low').then(r => r.json()),
      fetch('/api/pharmacy/medicines?alert=expiry').then(r => r.json()),
    ]).then(([low, exp]) => {
      setLowStock(low.medicines || []);
      setExpiring(exp.medicines || []);
      setLoading(false);
    });
  }, []);

  const daysLeft = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleRestock = async (id: string, current: number) => {
    const add = prompt('Add units:', '100');
    if (!add) return;
    await fetch(`/api/pharmacy/medicines/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ stock: current + Number(add) }),
    });
    setLowStock(prev => prev.map(m => m._id === id ? { ...m, stock: m.stock + Number(add) } : m));
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">🚨 Pharmacy Alerts</h1>
        <p className="text-gray-500 text-sm mt-1">
          {lowStock.length} low stock · {expiring.length} expiring soon
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-6">

          {/* Low Stock */}
          <div className="bg-white rounded-2xl border border-yellow-200 overflow-hidden">
            <div className="bg-yellow-50 px-4 py-3 border-b border-yellow-200">
              <h3 className="font-bold text-yellow-800">⚠️ Low Stock Medicines ({lowStock.length})</h3>
              <p className="text-xs text-yellow-600 mt-0.5">These medicines need to be restocked</p>
            </div>
            {lowStock.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-2xl mb-1">✅</p><p className="text-sm">All stock levels OK</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {lowStock.map(med => (
                  <div key={med._id} className="flex items-center gap-3 p-4 hover:bg-yellow-50 transition-colors">
                    <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">💊</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900">{med.name}</p>
                      <p className="text-xs text-gray-500">{med.manufacturer} · Batch: {med.batchNumber || 'N/A'}</p>
                    </div>
                    <div className="text-center flex-shrink-0">
                      <p className="font-black text-red-600 text-lg">{med.stock}</p>
                      <p className="text-xs text-gray-400">of {med.minStock} min</p>
                    </div>
                    <button onClick={() => handleRestock(med._id, med.stock)}
                      className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-bold rounded-xl transition-colors flex-shrink-0">
                      Restock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expiry Alert */}
          <div className="bg-white rounded-2xl border border-red-200 overflow-hidden">
            <div className="bg-red-50 px-4 py-3 border-b border-red-200">
              <h3 className="font-bold text-red-800">🚨 Expiring Medicines ({expiring.length})</h3>
              <p className="text-xs text-red-600 mt-0.5">Medicines expiring within 30 days or already expired</p>
            </div>
            {expiring.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-2xl mb-1">✅</p><p className="text-sm">No expiry issues</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {expiring.map(med => {
                  const days = daysLeft(med.expiryDate);
                  return (
                    <div key={med._id} className="flex items-center gap-3 p-4 hover:bg-red-50 transition-colors">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                        days < 0 ? 'bg-red-200' : days < 15 ? 'bg-orange-100' : 'bg-yellow-100'
                      }`}>⏰</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900">{med.name}</p>
                        <p className="text-xs text-gray-500">Exp: {med.expiryDate} · Stock: {med.stock} units</p>
                      </div>
                      <span className={`font-black text-sm px-3 py-1.5 rounded-xl flex-shrink-0 ${
                        days < 0   ? 'bg-red-100 text-red-700'    :
                        days < 15  ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {days < 0 ? '🚨 EXPIRED' : `${days} days`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}