'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Invoice {
  _id: string; invoiceNumber: string;
  patient: { name: string; phone: string };
  doctor?: { name: string };
  totalAmount: number; paidAmount: number; dueAmount: number;
  status: string; dueDate: string; createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  paid:      'bg-green-100 text-green-700',
  partial:   'bg-blue-100 text-blue-700',
  overdue:   'bg-red-100 text-red-700',
  sent:      'bg-yellow-100 text-yellow-700',
  draft:     'bg-gray-100 text-gray-600',
  cancelled: 'bg-gray-100 text-gray-400',
};

export default function AllInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [search, setSearch]     = useState('');

  useEffect(() => {
    fetch('/api/billing/invoices')
      .then(r => r.json())
      .then(d => { setInvoices(d.invoices || []); setLoading(false); });
  }, []);

  const filtered = invoices.filter(inv => {
    const matchF = filter === 'all' || inv.status === filter;
    const matchS = !search ||
      inv.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase());
    return matchF && matchS;
  });

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">📋 All Invoices</h1>
          <p className="text-gray-500 text-sm mt-1">{invoices.length} total</p>
        </div>
        <Link href="/billing/create"
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors text-center">
          + New Invoice
        </Link>
      </div>

      <div className="flex flex-col gap-3 mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by patient name or invoice number..."
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['all','draft','sent','partial','paid','overdue','cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap flex-shrink-0 transition-all ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
              }`}>
              {f} ({f === 'all' ? invoices.length : invoices.filter(i => i.status === f).length})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(inv => (
            <Link key={inv._id} href={`/billing/invoices/${inv._id}`}
              className="block bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-lg flex-shrink-0">
                  {inv.patient?.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-bold text-sm text-gray-900">{inv.patient?.name}</p>
                    <span className="text-xs text-gray-400">{inv.invoiceNumber}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[inv.status]}`}>
                      {inv.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    {inv.doctor && <span>👨‍⚕️ Dr. {inv.doctor.name}</span>}
                    <span>📅 {new Date(inv.createdAt).toLocaleDateString()}</span>
                    {inv.dueDate && <span>⏰ Due: {inv.dueDate}</span>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-gray-900 text-base">PKR {inv.totalAmount?.toLocaleString()}</p>
                  {inv.dueAmount > 0 && (
                    <p className="text-xs font-bold text-red-500">Due: PKR {inv.dueAmount?.toLocaleString()}</p>
                  )}
                  {inv.paidAmount > 0 && inv.status !== 'paid' && (
                    <p className="text-xs font-medium text-green-600">Paid: PKR {inv.paidAmount?.toLocaleString()}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-400">
              <p className="text-3xl mb-2">📋</p>
              <p>No invoices found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}