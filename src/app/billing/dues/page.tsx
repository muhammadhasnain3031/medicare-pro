'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DuesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch('/api/billing/invoices')
      .then(r => r.json())
      .then(d => {
        const dues = (d.invoices || []).filter((i: any) =>
          i.dueAmount > 0 && i.status !== 'cancelled' && i.status !== 'paid'
        );
        setInvoices(dues);
        setLoading(false);
      });
  }, []);

  const totalDue = invoices.reduce((s, i) => s + i.dueAmount, 0);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">⚠️ Dues & Outstanding</h1>
        <p className="text-gray-500 text-sm mt-1">
          {invoices.length} invoices · Total Due: <span className="font-bold text-red-600">PKR {totalDue.toLocaleString()}</span>
        </p>
      </div>

      {invoices.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚨</span>
            <div>
              <p className="font-bold text-red-800">Total Outstanding Amount</p>
              <p className="text-2xl font-black text-red-700">PKR {totalDue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 text-gray-400">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-lg font-bold">No Outstanding Dues!</p>
          <p className="text-sm mt-1">All invoices are fully paid</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map(inv => {
            const isOverdue = inv.dueDate && new Date(inv.dueDate) < new Date();
            return (
              <div key={inv._id} className={`bg-white rounded-2xl border-2 p-4 hover:shadow-md transition-shadow ${
                isOverdue ? 'border-red-300' : 'border-yellow-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${
                    isOverdue ? 'bg-red-500' : 'bg-yellow-500'
                  }`}>
                    {inv.patient?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-bold text-sm text-gray-900">{inv.patient?.name}</p>
                      {isOverdue && (
                        <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          🚨 OVERDUE
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span>{inv.invoiceNumber}</span>
                      <span>Total: PKR {inv.totalAmount?.toLocaleString()}</span>
                      <span>Paid: PKR {inv.paidAmount?.toLocaleString()}</span>
                      {inv.dueDate && <span>Due date: {inv.dueDate}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <p className="font-black text-red-600 text-lg">PKR {inv.dueAmount?.toLocaleString()}</p>
                    <Link href={`/billing/invoices/${inv._id}`}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors">
                      View & Pay →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}