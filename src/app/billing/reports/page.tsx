'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';

export default function BillingReports() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch('/api/billing/invoices')
      .then(r => r.json())
      .then(d => { setInvoices(d.invoices || []); setLoading(false); });
  }, []);

  const totalAmount  = invoices.reduce((s, i) => s + i.totalAmount, 0);
  const totalPaid    = invoices.reduce((s, i) => s + i.paidAmount,  0);
  const totalDue     = invoices.reduce((s, i) => s + i.dueAmount,   0);
  const collectionRate = totalAmount > 0 ? Math.round((totalPaid/totalAmount)*100) : 0;

  const statusDist = ['paid','partial','overdue','sent','draft'].map(s => ({
    name:  s.charAt(0).toUpperCase() + s.slice(1),
    value: invoices.filter(i => i.status === s).length,
  })).filter(s => s.value > 0);

  const COLORS = ['#16a34a','#2563eb','#dc2626','#d97706','#6b7280'];

  // Monthly revenue last 6 months
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d     = new Date();
    d.setMonth(d.getMonth() - i);
    const month = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    const mInvs = invoices.filter(inv => {
      const invDate = new Date(inv.createdAt);
      return invDate.getMonth() === d.getMonth() && invDate.getFullYear() === d.getFullYear();
    });
    monthlyData.push({
      month,
      invoiced: mInvs.reduce((s, i) => s + i.totalAmount, 0),
      collected: mInvs.reduce((s, i) => s + i.paidAmount, 0),
    });
  }

  const exportExcel = () => {
    const data = invoices.map(inv => ({
      'Invoice #':     inv.invoiceNumber,
      'Patient':       inv.patient?.name,
      'Date':          new Date(inv.createdAt).toLocaleDateString(),
      'Due Date':      inv.dueDate || '',
      'Total (PKR)':   inv.totalAmount,
      'Paid (PKR)':    inv.paidAmount,
      'Due (PKR)':     inv.dueAmount,
      'Status':        inv.status,
      'Insurance':     inv.insuranceCompany || '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch:14 },{ wch:20 },{ wch:12 },{ wch:12 },
      { wch:12 },{ wch:12 },{ wch:12 },{ wch:12 },{ wch:15 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Invoices');
    XLSX.writeFile(wb, `billing-report-${new Date().toLocaleDateString().replace(/\//g,'-')}.xlsx`);
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">📈 Billing Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Financial analytics & insights</p>
        </div>
        <button onClick={exportExcel}
          className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm transition-colors">
          📊 Export Excel
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label:'Total Invoiced',   value:`PKR ${(totalAmount/1000).toFixed(1)}K`,  color:'bg-blue-50 border-blue-200',   text:'text-blue-700',   icon:'📋' },
          { label:'Total Collected',  value:`PKR ${(totalPaid/1000).toFixed(1)}K`,    color:'bg-green-50 border-green-200', text:'text-green-700',  icon:'✅' },
          { label:'Outstanding',      value:`PKR ${(totalDue/1000).toFixed(1)}K`,     color:'bg-red-50 border-red-200',     text:'text-red-700',    icon:'⚠️' },
          { label:'Collection Rate',  value:`${collectionRate}%`,                     color:'bg-purple-50 border-purple-200',text:'text-purple-700', icon:'📊' },
        ].map(s => (
          <div key={s.label} className={`${s.color} border rounded-2xl p-4`}>
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className={`text-xl font-black ${s.text}`}>{s.value}</p>
            <p className="text-xs text-gray-600 font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 text-sm mb-4">💰 Monthly Revenue (6 months)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', fontSize:'12px' }}
                formatter={(val: any) => [`PKR ${val.toLocaleString()}`, '']} />
              <Bar dataKey="invoiced"  fill="#bfdbfe" radius={[4,4,0,0]} name="Invoiced"  />
              <Bar dataKey="collected" fill="#2563eb" radius={[4,4,0,0]} name="Collected" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 justify-center mt-2">
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-3 h-3 rounded bg-blue-200" /><span className="text-gray-500">Invoiced</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-3 h-3 rounded bg-blue-600" /><span className="text-gray-500">Collected</span>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 text-sm mb-4">📊 Invoice Status Distribution</h3>
          {statusDist.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400">
              <p className="text-sm">No invoices yet</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={statusDist} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                    {statusDist.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', fontSize:'12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {statusDist.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                    <span className="text-gray-600">{s.name} ({s.value})</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}